"use client" // Necessary for Radix UI components which use context/state

import * as React from "react"
import { useState, useRef, useEffect } from "react" // Import hooks
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger, // Import DialogClose if you want an explicit close button
  DialogFooter, // Need Footer for buttons  // Need Close for buttons
} from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button" // No longer needed here
import { cn } from "@/lib/utils" // For combining class names
import { Copy, Check, Loader2, XCircle, Server, Plug, FileText } from "lucide-react" // Added FileText, BookText, and File icons
import { Button } from "@/components/ui/button" // Need Button component
import { ScrollArea } from "@/components/ui/scroll-area" // Import ScrollArea

// Interface for a discovered tool
interface McpTool {
  name: string;
  description?: string;
  inputSchema?: any; // Added from inspector output
}

interface InfoDialogProps {
  // children: React.ReactNode; // Removed children
  triggerText: string; // Text for the trigger button
  triggerClassName?: string; // Classes for the trigger button
  title: string; // The title shown in the dialog header
  contentLines: string[]; // An array of strings to display as content
  dialogClassName?: string; // Renamed className for clarity
}

// Helper to generate unique IDs
let messageIdCounter = 0;
const generateMessageId = () => ++messageIdCounter;

export const InfoDialog: React.FC<InfoDialogProps> = ({ 
  // children, // Removed children
  triggerText,
  triggerClassName,
  title, 
  contentLines,
  dialogClassName // Use the renamed prop
}) => {
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false); // State to track URL copy status
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref for timeout
  
  // State for MCP connection & tools
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [sessionPostPath, setSessionPostPath] = useState<string | null>(null); // For the /message?sessionId=... path
  const [discoveredTools, setDiscoveredTools] = useState<McpTool[]>([]);
  const [isToolListVisible, setIsToolListVisible] = useState<boolean>(false); // <-- New State
  const visibilityTimeoutRef = useRef<NodeJS.Timeout | null>(null); // <-- Ref for visibility timeout
  const eventSourceRef = useRef<EventSource | null>(null);
  const mcpUrlLine = contentLines.find(line => line.toLowerCase().startsWith('mcp url:'));
  const mcpSseUrl = mcpUrlLine ? mcpUrlLine.substring(mcpUrlLine.indexOf(':') + 1).trim() : null; // SSE URL
  const baseUrl = mcpSseUrl ? new URL(mcpSseUrl).origin : null; // Get base URL (origin)

  // --- New State for Tool Execution ---
  const [selectedTool, setSelectedTool] = useState<McpTool | null>(null);
  const [toolStatus, setToolStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [toolResponse, setToolResponse] = useState<any | null>(null); 
  const [ ,setPendingToolRequestId] = useState<number | null>(null);
  // Refs/State for line drawing (will add later)
  // const toolListRef = useRef<HTMLUListElement>(null);
  // const responsePanelRef = useRef<HTMLDivElement>(null);
  // const [lineCoords, setLineCoords] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  // --- End New State ---

  // Add ref to track pendingToolRequestId to avoid closure issues in SSE listener
  const pendingToolRequestIdRef = useRef<number | null>(null);

  // Cleanup copy timeout and SSE connection
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current); // <-- Cleanup visibility timeout
      }
      disconnectFromMcp(); // Ensure disconnect on unmount
    };
  }, []);

  const handleCopyUrl = async (url: string) => {
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      copyTimeoutRef.current = setTimeout(() => {
        setCopiedUrl(false);
        copyTimeoutRef.current = null;
      }, 2000); 
    } catch (err) {
      console.error("Failed to copy URL: ", err);
      setCopiedUrl(false); 
    }
  };

  const disconnectFromMcp = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setConnectionStatus('idle');
    setSessionPostPath(null);
    setDiscoveredTools([]);
    setIsToolListVisible(false); 
    if (visibilityTimeoutRef.current) clearTimeout(visibilityTimeoutRef.current); 
    setSelectedTool(null); 
    setToolStatus('idle'); 
    setToolResponse(null); 
    setPendingToolRequestId(null);
    pendingToolRequestIdRef.current = null; // Clear ref too
    // setLineCoords(null); 
  };

  const connectToMcp = () => {
    if (!mcpSseUrl) {
      console.error("MCP SSE URL not found.");
      setConnectionStatus('error');
      return;
    }
    if (eventSourceRef.current) {
      // If already connected/connecting, maybe just disconnect first? Or do nothing.
      // For now, let's prevent reconnecting if already trying/connected.
      if (connectionStatus === 'connecting' || connectionStatus === 'connected') return;
      // If error/idle but ref exists somehow, disconnect before reconnecting
      disconnectFromMcp(); 
    }

    // Reset state before connecting
    setDiscoveredTools([]); 
    setSessionPostPath(null);
    setIsToolListVisible(false); 
    setSelectedTool(null); 
    setToolStatus('idle'); 
    setToolResponse(null); 
    setPendingToolRequestId(null);
    pendingToolRequestIdRef.current = null;
    if (visibilityTimeoutRef.current) clearTimeout(visibilityTimeoutRef.current);
    setConnectionStatus('connecting');

    const es = new EventSource(mcpSseUrl);
    eventSourceRef.current = es;


    es.onerror = (error) => {
      console.error("MCP SSE Error:", error);
      setConnectionStatus('error');
      disconnectFromMcp(); 
    };

    // --- SSE Event Handlers --- 
    
    // Handle the 'endpoint' event to get the session-specific POST path
    es.addEventListener('endpoint', (event: MessageEvent) => {
        if (event.data && typeof event.data === 'string') {
            const path = event.data;
            setSessionPostPath(path); 
            setConnectionStatus('connected'); 
            requestToolsList(path); 
        } else {
            console.warn("Received endpoint event with unexpected data format.");
            setConnectionStatus('error'); 
            disconnectFromMcp();
        }
    });

    // Handle generic 'message' events (for server info, tool list response, etc.)
    es.addEventListener('message', (event: MessageEvent) => {
        let data;
        try {
            data = JSON.parse(event.data);
            if (data?.jsonrpc !== "2.0") {
                return; // Ignore non-JSONRPC
            }
        } catch (e) {
            console.error("Failed to parse MCP message data:", e);
            return; // Can't parse, exit
        }

        const messageId = data.id;
        
        const isToolListResponse = messageId > 0 && messageId !== pendingToolRequestIdRef.current && data.result?.tools;
        const isToolExecutionResponse = messageId === pendingToolRequestIdRef.current; // Use ref instead of state
        const isInitialCapabilities = messageId === 0 && data.result?.capabilities?.tools;

        // Handle Tool List Response
        if (isToolListResponse) {
            const tools: McpTool[] = data.result.tools;
            setDiscoveredTools(tools);
            if (visibilityTimeoutRef.current) clearTimeout(visibilityTimeoutRef.current);
            visibilityTimeoutRef.current = setTimeout(() => {
                setIsToolListVisible(true);
            }, 10);
            return; // Handled, exit
        }

        // Handle Tool Execution Response
        if (isToolExecutionResponse) {
            if (data.result?.content) {
                // --- Start Modification ---
                const content = data.result.content;
                let responseToShow: any = null; // Variable to hold what we'll set in state

                if (Array.isArray(content)) {
                    // Find the first image object in the array
                    const imageItem = content.find(item => typeof item === 'object' && item !== null && item.type === 'image' && typeof item.data === 'string');
                    
                    if (imageItem) {
                        responseToShow = imageItem; // Prioritize the image object
                    } else {
                        // Fallback: Join text content if no image found
                        const textContent = content
                            .filter(item => typeof item === 'object' && item !== null && item.type === "text" && item.text) // Ensure item is object before accessing type/text
                            .map(item => item.text)
                            .join(" ");
                        // If text found, use it. Otherwise, keep original content (might be array of other things).
                        responseToShow = textContent || content; 
                    }
                } else if (typeof content === 'object' && content !== null && content.type === 'image' && typeof content.data === 'string') {
                     // Handle case where content is the image object directly
                    responseToShow = content;
                } else {
                    // Fallback for non-array, non-image content (e.g., simple string, other object type)
                    responseToShow = content; 
                }
                
                setToolResponse(responseToShow); // Set the extracted image object or fallback
                // --- End Modification ---
                setToolStatus('success');
            } else if (data.error) {
                console.error("Tool execution error:", data.error);
                setToolResponse(data.error); // Store error object
                setToolStatus('error'); // Sets status to 'error'
            } else {
                // Handle cases where result exists but content is missing/null/unexpected
                // This could happen for tools that don't return content on success
                if (data.result && !data.result.content) {
                    setToolResponse("Tool executed successfully, but returned no content.");
                    setToolStatus('success');
                } else {
                    console.warn("Unexpected response structure for tool request:", data);
                    setToolResponse({ message: "Unexpected response structure." });
                    setToolStatus('error');
                }
            }
            setPendingToolRequestId(null); // Clear pending ID state
            pendingToolRequestIdRef.current = null; // Also clear ref
            return; // Handled, exit
        }

        // Handle Initial Capabilities Announcement
        if (isInitialCapabilities) {
            const initialTools: McpTool[] = data.result.capabilities.tools;
            if (initialTools.length > 0) {
                setDiscoveredTools(prev => {
                    const newTools = [...prev];
                    initialTools.forEach(t => {
                        if (!newTools.some(et => et.name === t.name)) newTools.push(t);
                    });
                    return newTools;
                });
                if (visibilityTimeoutRef.current) clearTimeout(visibilityTimeoutRef.current);
                visibilityTimeoutRef.current = setTimeout(() => setIsToolListVisible(true), 10);
            }
             return; // Handled, exit
        }

    }); // End of listener

    // --- End SSE Event Handlers ---
  };

  const requestToolsList = async (path: string) => {
    if (!baseUrl) {
      console.error("Cannot request tools: base URL missing.");
      return;
    }
  
    const postUrl = `${baseUrl}${path}`; // Combine origin + path
    const requestId = generateMessageId();

    try {
      const response = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: "tools/list",
          params: { _meta: { progressToken: requestId } },
          jsonrpc: "2.0",
          id: requestId, 
        }),
      });

      if (!response.ok && response.status !== 202) {
           throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Response comes back over SSE.

    } catch (error) {
      console.error("Failed to send tools/list request:", error);
      // Optionally set status to 'error' or show a specific UI error
      setConnectionStatus('error'); // Indicate error happened during interaction
      setDiscoveredTools([]); // Clear tools on error
    }
  };

  // Reset state when dialog is closed 
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      disconnectFromMcp(); // Disconnect SSE and reset all state including visibility
    }
  };

  // --- New Function: executeTool ---
  const executeTool = async (tool: McpTool) => {
    if (!sessionPostPath || !baseUrl || connectionStatus !== 'connected') {
      console.error("Cannot execute tool: Not connected or session path missing.");
      setToolStatus('error');
      setToolResponse(null);
      return;
    }

    // Reset previous response/status
    setToolStatus('loading');
    setToolResponse(null);
    const requestId = generateMessageId();
    setPendingToolRequestId(requestId); // Track this request in state
    pendingToolRequestIdRef.current = requestId; // ALSO track in ref for SSE listener access
    
    const postUrl = `${baseUrl}${sessionPostPath}`;

    try {
      const response = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: requestId,
          method: "tools/call",
          params: {
             name: tool.name,
             arguments: {},
             _meta: {
               progressToken: requestId
             }
          }
        }),
      });

      // Expecting 202 Accepted, result comes via SSE
      if (!response.ok && response.status !== 202) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

    } catch (error) {
      console.error(`Failed to send execute request for tool '${tool.name}':`, error);
      setToolStatus('error');
      setToolResponse({ message: `Failed to send request: ${error instanceof Error ? error.message : String(error)}` });
      setPendingToolRequestId(null); // Clear pending ID on send error
    }
  };


  return (
    <Dialog onOpenChange={handleOpenChange}>
      {/* Apply classes directly to DialogTrigger, pass text as children */}
      <DialogTrigger 
        className={cn(triggerClassName)} // Apply classes here
        asChild={false} // Ensure it renders a button
      >
        <span className="flex items-center gap-2">
          {triggerText} {/* Text goes here */}
          {/* Single icon that animates on hover, positioned on the right */}
          <FileText className="w-4 h-4 transition-all duration-300 ease-in-out group-hover:text-blue-500 group-hover:rotate-3 group-hover:scale-110" />
        </span>
      </DialogTrigger>
      <DialogContent className={cn(
        "sm:max-w-lg bg-white dark:bg-zinc-900 transition-all duration-300 ease-in-out",
        "overflow-hidden text-wrap will-change-[height,width,max-height,max-width]", // Add these properties
        "border-t-2 border-t-blue-500 dark:border-t-blue-400", // Add accent border at top
        selectedTool && "sm:max-w-5xl", 
        dialogClassName
      )}
      style={{
        // Add a min-height to prevent jarring collapse when switching states
        minHeight: discoveredTools.length > 0 ? "360px" : "200px",
      }}>
        <DialogHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center">
            <span className="relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-blue-500 dark:after:bg-blue-400 after:transform after:translate-y-1">{title}</span>
          </DialogTitle>
          <p className="italic text-xs text-left text-zinc-600 dark:text-zinc-400 pt-4">Connect to my personal MCP Server! Hosted on Cloudflare.</p>
          <DialogDescription asChild className="mt-6 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            {/* Use a div wrapper for DialogDescription content when using asChild */}
            <div>
              <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 py-1.5">
                 <span className="w-full sm:w-16 shrink-0 text-left sm:text-right text-xs font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">
                   MCP URL:
                 </span>
                 <code className={`flex items-center justify-between flex-1 whitespace-pre-wrap break-words rounded bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-xs font-mono text-zinc-800 dark:text-zinc-200 sm:ml-[calc(4rem+0.75rem)] relative border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors w-full`}>
                   <span className="mr-2 break-all">{mcpSseUrl || 'URL not found'}</span> 
                   {mcpSseUrl && ( // Only show copy button if URL is valid
                     <button
                       onClick={() => handleCopyUrl(mcpSseUrl)} 
                       aria-label="Copy URL"
                       className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 transition-colors duration-150 flex-shrink-0"
                     >
                       {/* Container for smooth icon transition - Use flex center */}
                       <span className="relative flex items-center justify-center w-3 h-3">
                         {/* Check Icon - Position absolutely */}
                         <Check className={cn(
                           "absolute transition-all duration-300 ease-in-out text-green-600 w-3 h-3",
                           copiedUrl ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-50 blur-sm"
                         )} />
                         {/* Copy Icon - Position absolutely */}
                         <Copy className={cn(
                           "absolute transition-all duration-300 ease-in-out w-3 h-3",
                           copiedUrl ? "opacity-0 scale-50 blur-sm" : "opacity-100 scale-100 blur-0"
                         )} />
                       </span>
                     </button>
                   )}
                 </code>
               </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* Dynamic Tools Section - Render when tools array has items, visibility controlled by state */} 
        {discoveredTools.length > 0 && (
            <div 
                className={cn(
                    "flex flex-col flex-1 min-h-0 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700 transition-all duration-300 ease-in-out",
                    isToolListVisible ? "opacity-100 max-h-[500px]" : "opacity-0 max-h-0 overflow-hidden"
                )}
                aria-live="polite"
            >
                {/* Conditional Grid Layout */}
                <div className={cn(
                    "flex-1 min-h-0 transition-all duration-300 ease-in-out", 
                    selectedTool ? "grid grid-cols-2 gap-6 h-[300px]" : "flex flex-col h-auto"
                )}>
                    {/* Tools List Column/Section */}
                    <div className={cn("flex flex-col min-h-0", selectedTool ? "col-span-1" : "flex-1")}> 
                        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 flex-shrink-0">Available Tools</h3>
                        <ScrollArea className="h-full w-full pr-3"> 
                            <ul className="space-y-1.5"> 
                                {discoveredTools.map((tool, index) => (
                                <li 
                                    key={tool.name}
                                    onClick={() => {
                                        setSelectedTool(tool); // Set the selected tool state
                                        executeTool(tool);    // Execute the tool
                                    }}
                                    className={cn(
                                        "text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded px-2.5 py-1.5 border border-transparent dark:hover:border-zinc-700 hover:border-zinc-200 cursor-pointer",
                                        "transform transition-all duration-300 ease-in-out", 
                                        isToolListVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
                                        selectedTool?.name === tool.name ? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2 dark:ring-offset-zinc-900 bg-blue-50 dark:bg-blue-900/30' : '' 
                                    )}
                                    style={{ transitionDelay: `${index * 50}ms` }} 
                                >
                                    {tool.name}
                                </li>
                                ))}
                            </ul>
                        </ScrollArea>
                    </div>

                    {/* Response Panel Column (Conditional) */}
                    {selectedTool && (
                         <div 
                            className="col-span-1 flex flex-col min-h-0 border-l border-zinc-200 dark:border-zinc-700 pl-6 animate-in fade-in slide-in-from-left duration-300"
                         >
                             <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 flex-shrink-0 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                                Tool: <code className="ml-1 font-normal text-blue-600 dark:text-blue-400">{selectedTool.name}</code>
                             </h4>
                             <div className="flex-1 min-h-0 overflow-y-auto pr-3 transition-all duration-300 ease-in-out">
                                {toolStatus === 'loading' && (
                                    <p className="text-xs text-zinc-500 dark:text-zinc-500 italic flex items-center gap-1.5 animate-in fade-in duration-300">
                                        <Loader2 className="w-3 h-3 animate-spin"/> Executing...
                                    </p>
                                )}
                                {toolStatus === 'error' && (
                                    <p className="text-xs text-red-500 dark:text-red-400 animate-in fade-in duration-300">
                                        <span className="font-semibold">Error:</span> {toolResponse?.message || 'Unknown error'}
                                    </p>
                                )}
                                {toolStatus === 'success' && (
                                    <>
                                        {typeof toolResponse === 'object' && toolResponse !== null && toolResponse.type === 'image' && typeof toolResponse.data === 'string' ? (
                                            <img 
                                                src={`data:image/jpeg;base64,${toolResponse.data}`}
                                                alt={`Generated image from ${selectedTool?.name || 'tool'}`} 
                                                className="max-w-full h-auto rounded border border-zinc-200 dark:border-zinc-700 animate-in fade-in duration-300" 
                                            />
                                        ) : (
                                            <pre className="text-xs whitespace-pre-wrap break-words animate-in fade-in duration-300">
                                                {typeof toolResponse === 'string' 
                                                    ? toolResponse 
                                                    : JSON.stringify(toolResponse, null, 2)}
                                            </pre>
                                        )}
                                    </>
                                )}
                             </div>
                         </div>
                    )}
                </div>
            </div>
        )}

        {/* Footer - Simplified, layout handled by inner wrapper */}
        <DialogFooter className="flex-shrink-0 mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700"> 
          {/* Wrapper div to control layout */} 
          <div className="flex flex-col items-center gap-4 sm:gap-5 w-full">
            
            {/* Connect/Disconnect Section (Order 1 implicitly) */}
            <div className="flex flex-col items-center text-center gap-1.5 w-full"> 
              {/* Conditional <p> - Center text */}
              {(connectionStatus === 'idle' || connectionStatus === 'error') && (
                <p className="italic text-xs text-zinc-600 dark:text-zinc-400 w-full text-center mb-2">Or Connect directly here:</p> 
              )}
              {/* Button div - Center button */} 
              <div className="flex justify-center w-full"> 
                {connectionStatus === 'idle' || connectionStatus === 'error' ? (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={connectToMcp}
                    disabled={!mcpSseUrl}
                    className="gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-zinc-300 dark:border-zinc-700 transition-all duration-200 text-xs sm:text-sm"
                  >
                    <Plug className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-all group-hover:text-blue-500"/>
                    Connect
                  </Button>
                ) : (
                  <Button 
                    variant="destructive"
                    size="sm"
                    onClick={disconnectFromMcp}
                    className="gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
                  >
                     <Plug className="w-3 h-3 sm:w-3.5 sm:h-3.5"/> 
                    Disconnect
                  </Button>
                )}
              </div>
            </div>

            {/* Status Container (Order 2 implicitly) - Center text, full width */}
            <div className="text-xs text-zinc-500 dark:text-zinc-400 w-full min-h-[20px] flex items-center justify-center pb-1"> 
              
              {/* Conditionally Render ONE Status Span */}
              {connectionStatus === 'idle' && (
                <span className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2 sm:px-3 py-1 rounded-full text-xs"> 
                  <XCircle className="w-3 h-3 text-gray-400"/> Status: Idle
                </span>
              )}
              {connectionStatus === 'connecting' && (
                <span className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 sm:px-3 py-1 rounded-full text-xs"> 
                  <Loader2 className="w-3 h-3 animate-spin text-blue-500"/> Status: Connecting...
                </span>
              )}
              {connectionStatus === 'connected' && !isToolListVisible && ( // Loading tools state
                <span className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 sm:px-3 py-1 rounded-full text-xs"> 
                   <Loader2 className="w-3 h-3 animate-spin text-blue-500"/> Status: Loading tools...
                </span>
              )}
               {connectionStatus === 'connected' && isToolListVisible && ( // Connected state
                <span className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 sm:px-3 py-1 rounded-full text-xs"> 
                   <Server className="w-3 h-3 text-green-500"/> Status: Connected
                </span>
              )}
              {connectionStatus === 'error' && (
                <span className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 sm:px-3 py-1 rounded-full text-xs"> 
                   <XCircle className="w-3 h-3 text-red-500"/> Status: Error
                </span>
              )}
            </div>
          </div> 
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 