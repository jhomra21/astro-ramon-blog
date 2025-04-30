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
import { Copy, Check, Loader2, XCircle, Server, Plug } from "lucide-react" // Remove ListTree, RefreshCw
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
  const [pendingToolRequestId, setPendingToolRequestId] = useState<number | null>(null);
  // Refs/State for line drawing (will add later)
  // const toolListRef = useRef<HTMLUListElement>(null);
  // const responsePanelRef = useRef<HTMLDivElement>(null);
  // const [lineCoords, setLineCoords] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  // --- End New State ---

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
      console.log("MCP SSE Connection Closed");
      eventSourceRef.current = null;
    }
    setConnectionStatus('idle');
    setSessionPostPath(null);
    setDiscoveredTools([]);
    setIsToolListVisible(false); // <-- Reset visibility
    if (visibilityTimeoutRef.current) clearTimeout(visibilityTimeoutRef.current); // <-- Clear pending timeout
    setSelectedTool(null); // <-- Reset
    setToolStatus('idle'); // <-- Reset
    setToolResponse(null); // <-- Reset
    setPendingToolRequestId(null); // <-- Reset
    // setLineCoords(null); // <-- Reset later
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

    console.log(`Connecting to MCP SSE: ${mcpSseUrl}`);
    // Reset state before connecting
    setDiscoveredTools([]); 
    setSessionPostPath(null);
    setIsToolListVisible(false); 
    setSelectedTool(null); 
    setToolStatus('idle'); 
    setToolResponse(null); 
    setPendingToolRequestId(null);
    if (visibilityTimeoutRef.current) clearTimeout(visibilityTimeoutRef.current);
    setConnectionStatus('connecting');

    const es = new EventSource(mcpSseUrl);
    eventSourceRef.current = es;

    es.onopen = () => {
      console.log("MCP SSE Connection Opened");
    };

    es.onerror = (error) => {
      console.error("MCP SSE Error:", error);
      setConnectionStatus('error');
      disconnectFromMcp(); 
    };

    // --- SSE Event Handlers --- 
    
    // Handle the 'endpoint' event to get the session-specific POST path
    es.addEventListener('endpoint', (event: MessageEvent) => {
        console.log("Received endpoint event:", event.data);
        if (event.data && typeof event.data === 'string') {
            const path = event.data;
            setSessionPostPath(path); 
            setConnectionStatus('connected'); 
            console.log("Connection established... Requesting tools...");
            requestToolsList(path); 
        } else {
            console.warn("Received endpoint event with unexpected data format.");
            setConnectionStatus('error'); 
            disconnectFromMcp();
        }
    });

    // Handle generic 'message' events (for server info, tool list response, etc.)
    es.addEventListener('message', (event: MessageEvent) => {
        console.log("Received message event:", event.data);
        try {
            const data = JSON.parse(event.data);
            if (data?.jsonrpc !== "2.0") return; // Ignore non-JSONRPC messages

            // Check if it's the response to our tools/list request (id > 0, NOT matching pendingToolRequestId)
            if (data.id > 0 && data.id !== pendingToolRequestId && data.result?.tools) {
                const tools: McpTool[] = data.result.tools;
                console.log("Discovered tools:", tools);
                setDiscoveredTools(tools);
                if (visibilityTimeoutRef.current) clearTimeout(visibilityTimeoutRef.current);
                visibilityTimeoutRef.current = setTimeout(() => {
                    setIsToolListVisible(true);
                }, 10); 
            } 
            // Check if it's the response to our pending tool execution request
            else if (data.id === pendingToolRequestId) {
                 console.log("Received response for tool request ID:", data.id);
                 if (data.result?.content) {
                     setToolResponse(data.result.content);
                     setToolStatus('success');
                     console.log("Tool response content:", data.result.content);
                 } else if (data.error) {
                     console.error("Tool execution error:", data.error);
                     setToolResponse(data.error); // Store error object
                     setToolStatus('error');
                 } else {
                    // Unexpected response structure for tool execution
                    console.warn("Unexpected response for tool request:", data);
                    setToolResponse({ message: "Unexpected response structure." });
                    setToolStatus('error');
                 }
                 setPendingToolRequestId(null); // Clear pending ID
             } 
            // Check for initial capabilities announcement (id 0)
            else if (data.id === 0 && data.result?.capabilities?.tools) {
                 const initialTools: McpTool[] = data.result.capabilities.tools;
                 if (initialTools.length > 0) {
                     console.log("Received initial tools announcement:", initialTools);
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
             } 
            else {
                console.log("Received other message:", data);
            }
        } catch (e) {
            console.error("Failed to parse MCP message data:", e);
        }
    });

    // --- End SSE Event Handlers ---
  };

  const requestToolsList = async (path: string) => {
    if (!baseUrl) {
      console.error("Cannot request tools: base URL missing.");
      return;
    }
  
    const postUrl = `${baseUrl}${path}`; // Combine origin + path
    const requestId = generateMessageId();

    console.log(`Requesting tools list via POST to: ${postUrl}`);

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
       console.log(`Tools request sent successfully (Status ${response.status}).`);
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
      setToolResponse({ message: "Connection error." });
      return;
    }

    // Reset previous response/status
    setToolStatus('loading');
    setToolResponse(null);
    const requestId = generateMessageId();
    setPendingToolRequestId(requestId); // Track this request

    const postUrl = `${baseUrl}${sessionPostPath}`;
    console.log(`Executing tool '${tool.name}' via POST to: ${postUrl} (Req ID: ${requestId})`);

    try {
      const response = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: requestId,
          method: "request.dispatch", // Standard MCP method
          params: {
             tool_name: tool.name,
             // Assuming method name is same as tool name for these simple tools
             // And assuming no parameters are needed (empty object)
             method_name: tool.name, 
             params: {} 
          }
        }),
      });

      // Expecting 202 Accepted, result comes via SSE
      if (!response.ok && response.status !== 202) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log(`Tool execution request for '${tool.name}' sent successfully (Status ${response.status}).`);

    } catch (error) {
      console.error(`Failed to send execute request for tool '${tool.name}':`, error);
      setToolStatus('error');
      setToolResponse({ message: `Failed to send request: ${error instanceof Error ? error.message : String(error)}` });
      setPendingToolRequestId(null); // Clear pending ID on send error
    }
  };
  // --- End executeTool ---

  return (
    <Dialog onOpenChange={handleOpenChange}>
      {/* Apply classes directly to DialogTrigger, pass text as children */}
      <DialogTrigger 
        className={cn(triggerClassName)} // Apply classes here
        asChild={false} // Ensure it renders a button
      >
        {triggerText} {/* Text goes here */} 
        {/* Icon would need to be handled here too if re-added */}
      </DialogTrigger>
      <DialogContent className={cn("sm:max-w-lg bg-white dark:bg-zinc-900 transition-[max-width] duration-300 ease-in-out", selectedTool && "sm:max-w-3xl", dialogClassName)}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title} [WIP]</DialogTitle>
          <DialogDescription asChild className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            {/* Use a div wrapper for DialogDescription content when using asChild */}
            <div>
              <div className="flex items-start gap-3 py-1.5">
                 <span className="w-16 shrink-0 text-right text-xs font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">
                   MCP URL:
                 </span>
                 <code className={`flex items-center justify-between flex-1 whitespace-pre-wrap break-words rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-xs font-mono text-zinc-800 dark:text-zinc-200 ml-[calc(4rem+0.75rem)]`}>
                   <span className="mr-2">{mcpSseUrl || 'URL not found'}</span> 
                   {mcpSseUrl && ( // Only show copy button if URL is valid
                     <button
                       onClick={() => handleCopyUrl(mcpSseUrl)} 
                       aria-label="Copy URL"
                       className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 transition-colors duration-150"
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
                    // Remove entrance animation from the container
                    "flex flex-col flex-1 min-h-0 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700", // Removed animate-in fade-in duration-300
                )}
                aria-live="polite"
            >
                {/* Conditional Grid Layout */}
                <div className={cn("flex-1 min-h-0", selectedTool ? "grid grid-cols-2 gap-6" : "flex flex-col")}> 
                    {/* Tools List Column/Section */}
                    <div className={cn("flex flex-col min-h-0", selectedTool ? "col-span-1" : "flex-1")}> 
                        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 flex-shrink-0">Available Tools</h3>
                        <ScrollArea className="h-full w-full pr-3"> 
                            <ul className="space-y-1.5"> 
                                {discoveredTools.map((tool, index) => (
                                <li 
                                    key={tool.name}
                                    onClick={() => executeTool(tool)} // <-- Add onClick
                                    className={cn(
                                        "text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded px-2.5 py-1.5 border border-transparent dark:hover:border-zinc-700 hover:border-zinc-200 cursor-pointer", // Added cursor-pointer
                                        "transition-opacity duration-300 ease-in-out", 
                                        isToolListVisible ? "opacity-100" : "opacity-0",
                                        selectedTool?.name === tool.name ? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2 dark:ring-offset-zinc-900 bg-blue-50 dark:bg-blue-900/30' : '' // Highlight selected
                                    )}
                                    style={{ transitionDelay: `${index * 75}ms` }} 
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
                            // ref={responsePanelRef} // Add ref later for line
                            className="col-span-1 flex flex-col min-h-0 border-l border-zinc-200 dark:border-zinc-700 pl-6 animate-in fade-in duration-300"
                         >
                             <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 flex-shrink-0 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                                Response: <code className="ml-1 font-normal text-blue-600 dark:text-blue-400">{selectedTool.name}</code>
                             </h4>
                             <div className="flex-1 min-h-0 overflow-y-auto pr-3">
                                {toolStatus === 'loading' && (
                                    <p className="text-xs text-zinc-500 dark:text-zinc-500 italic flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin"/> Executing...</p>
                                )}
                                {toolStatus === 'error' && (
                                    <p className="text-xs text-red-500 dark:text-red-400"><span className="font-semibold">Error:</span> {toolResponse?.message || 'Unknown error'}</p>
                                )}
                                {toolStatus === 'success' && (
                                    <pre className="text-xs whitespace-pre-wrap break-words">
                                        {toolResponse ? JSON.stringify(toolResponse, null, 2) : 'No content received.'}
                                    </pre>
                                )}
                             </div>
                         </div>
                    )}
                </div>
            </div>
        )}

        {/* Footer - Apply smooth transitions to status text */}
        <DialogFooter className="flex-shrink-0 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700 sm:justify-between items-center gap-2">
          {/* Status Container - Revert text content inside spans */}
          <div className="relative text-xs text-zinc-500 dark:text-zinc-400 flex items-center order-1 sm:order-none min-h-[20px] w-40"> {/* Adjusted width slightly */}
            {/* Wrapper for absolute positioning of status messages */}
            <div className="absolute inset-0 flex items-center">
              {/* Idle State */}
              <span className={cn("absolute inset-0 flex items-center gap-1.5 transition-opacity duration-300 ease-in-out", connectionStatus === 'idle' ? "opacity-100" : "opacity-0 pointer-events-none")}>
                <XCircle className="w-3 h-3 text-gray-400"/> Status: Idle
              </span>
              {/* Connecting State */}
              <span className={cn("absolute inset-0 flex items-center gap-1.5 transition-opacity duration-300 ease-in-out", connectionStatus === 'connecting' ? "opacity-100" : "opacity-0 pointer-events-none")}>
                <Loader2 className="w-3 h-3 animate-spin text-blue-500"/> Status: Connecting...
              </span>
              {/* Loading Tools State */}
              <span className={cn("absolute inset-0 flex items-center gap-1.5 transition-opacity duration-300 ease-in-out", connectionStatus === 'connected' && !isToolListVisible ? "opacity-100" : "opacity-0 pointer-events-none")}>
                <Loader2 className="w-3 h-3 animate-spin text-blue-500"/> Status: Loading tools...
              </span>
              {/* Connected State */}
              <span className={cn("absolute inset-0 flex items-center gap-1.5 transition-opacity duration-300 ease-in-out", connectionStatus === 'connected' && isToolListVisible ? "opacity-100" : "opacity-0 pointer-events-none")}>
                 <Server className="w-3 h-3 text-green-500"/> Status: Connected
              </span>
              {/* Error State */}
              <span className={cn("absolute inset-0 flex items-center gap-1.5 transition-opacity duration-300 ease-in-out", connectionStatus === 'error' ? "opacity-100" : "opacity-0 pointer-events-none")}>
                 <XCircle className="w-3 h-3 text-red-500"/> Status: Error
              </span>
            </div>
          </div>

          {/* Connect/Disconnect Buttons */}
          <div className="flex gap-2 order-2 sm:order-none">
            {connectionStatus === 'idle' || connectionStatus === 'error' ? (
              <Button 
                variant="outline"
                size="sm"
                onClick={connectToMcp}
                disabled={!mcpSseUrl}
                className="gap-1.5"
              >
                <Plug className="w-3 h-3"/>
                Connect
              </Button>
            ) : (
              <Button 
                variant="destructive"
                size="sm"
                onClick={disconnectFromMcp}
                className="gap-1.5"
              >
                 <Plug className="w-3 h-3"/> 
                Disconnect
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 