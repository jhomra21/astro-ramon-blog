import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Check, Copy, FileText, Loader2, Plug, Server, XCircle, type LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMcpConnection, type ConnectionStatus, type ToolResult } from "@/components/react/useMcpConnection";
import { findMcpUrl, type McpTool } from "@/lib/mcp";
import { cn } from "@/lib/utils";

export const InfoDialog: React.FC<InfoDialogProps> = ({
  triggerText,
  triggerClassName,
  title,
  contentLines,
  dialogClassName,
}) => {
  const mcpSseUrl = findMcpUrl(contentLines);
  const mcp = useMcpConnection(mcpSseUrl);
  const hasTools = mcp.tools.length > 0;

  const handleOpenChange = (open: boolean) => {
    if (!open) mcp.disconnect();
  };

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger className={cn("cursor-pointer", triggerClassName)} asChild={false}>
        <span className="flex items-center gap-2">
          {triggerText}
          <FileText className="w-4 h-4 transition-[color,rotate,scale] duration-200 ease-out group-hover:text-blue-500 group-hover:rotate-3 group-hover:scale-110" />
        </span>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "sm:max-w-lg bg-white dark:bg-zinc-900 transition-[max-width] duration-200 ease-out",
          "overflow-hidden text-wrap",
          "border-t-2 border-t-blue-500 dark:border-t-blue-400",
          mcp.selectedTool && "sm:max-w-5xl",
          dialogClassName
        )}
        style={{ minHeight: hasTools ? "360px" : "200px" }}
      >
        <DialogHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center">
            <span className="relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-blue-500 dark:after:bg-blue-400 after:transform after:translate-y-1">{title}</span>
          </DialogTitle>
          <p className="italic text-xs text-left text-zinc-600 dark:text-zinc-400 pt-4">Connect to my personal MCP Server! Hosted on Cloudflare.</p>
          <DialogDescription asChild className="mt-6 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <div>
              <McpUrlField url={mcpSseUrl} />
            </div>
          </DialogDescription>
        </DialogHeader>

        {hasTools && (
          <ToolsSection
            tools={mcp.tools}
            isVisible={mcp.isToolListVisible}
            selectedTool={mcp.selectedTool}
            toolResult={mcp.toolResult}
            onSelectTool={mcp.runTool}
          />
        )}

        <DialogFooter className="flex-shrink-0 mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
          <ConnectionControls
            status={mcp.connectionStatus}
            isToolListVisible={mcp.isToolListVisible}
            canConnect={mcpSseUrl !== null}
            onConnect={mcp.connect}
            onDisconnect={mcp.disconnect}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function McpUrlField({ url }: McpUrlFieldProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 py-1.5">
      <span className="w-full sm:w-16 shrink-0 text-left sm:text-right text-xs font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">
        MCP URL:
      </span>
      <code className="flex items-center justify-between flex-1 whitespace-pre-wrap break-words rounded bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-xs font-mono text-zinc-800 dark:text-zinc-200 sm:ml-[calc(4rem+0.75rem)] relative border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors w-full">
        <span className="mr-2 break-all">{url ?? "URL not found"}</span>
        {url && <CopyUrlButton url={url} />}
      </code>
    </div>
  );
}

function CopyUrlButton({ url }: CopyUrlButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);

    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      copyTimeoutRef.current = setTimeout(() => {
        setIsCopied(false);
        copyTimeoutRef.current = null;
      }, 2000);
    } catch (error) {
      console.error("Failed to copy URL: ", error);
      setIsCopied(false);
    }
  };

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy URL"
      className="cursor-pointer p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 transition-[background-color,scale] duration-150 ease-out active:scale-90 flex-shrink-0"
    >
      <span className="relative flex items-center justify-center w-3 h-3">
        <Check
          className={cn(
            "absolute transition-[opacity,scale,filter] duration-200 ease-out text-green-600 w-3 h-3",
            isCopied ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-25 blur-xs"
          )}
        />
        <Copy
          className={cn(
            "absolute transition-[opacity,scale,filter] duration-200 ease-out w-3 h-3",
            isCopied ? "opacity-0 scale-25 blur-xs" : "opacity-100 scale-100 blur-0"
          )}
        />
      </span>
    </button>
  );
}

function ToolsSection({ tools, isVisible, selectedTool, toolResult, onSelectTool }: ToolsSectionProps) {
  return (
    <div
      className={cn(
        "flex flex-col flex-1 min-h-0 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700 transition-[opacity,max-height] duration-250 ease-out",
        isVisible ? "opacity-100 max-h-[500px]" : "opacity-0 max-h-0 overflow-hidden"
      )}
      aria-live="polite"
    >
      <div
        className={cn(
          "flex-1 min-h-0",
          selectedTool ? "grid grid-cols-2 gap-6 h-[300px]" : "flex flex-col h-auto"
        )}
      >
        <div className={cn("flex flex-col min-h-0", selectedTool ? "col-span-1" : "flex-1")}>
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 flex-shrink-0">Available Tools</h3>
          <ScrollArea className="h-full w-full pr-3">
            <ul className="space-y-1.5">
              {tools.map((tool, index) => (
                <ToolListItem
                  key={tool.name}
                  tool={tool}
                  index={index}
                  isVisible={isVisible}
                  isSelected={selectedTool?.name === tool.name}
                  onSelect={onSelectTool}
                />
              ))}
            </ul>
          </ScrollArea>
        </div>

        {selectedTool && <ToolResponsePanel tool={selectedTool} result={toolResult} />}
      </div>
    </div>
  );
}

function ToolListItem({ tool, index, isVisible, isSelected, onSelect }: ToolListItemProps) {
  const handleClick = () => {
    onSelect(tool);
  };

  return (
    <li
      className={cn(
        "transition-[opacity,translate] duration-200 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={isSelected}
        className={cn(
          "w-full text-left text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded px-2.5 py-1.5 border border-transparent dark:hover:border-zinc-700 hover:border-zinc-200 cursor-pointer",
          "outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
          "transition-[background-color,border-color,box-shadow,scale] duration-150 ease-out active:scale-[0.98]",
          isSelected && "ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2 dark:ring-offset-zinc-900 bg-blue-50 dark:bg-blue-900/30"
        )}
      >
        {tool.name}
      </button>
    </li>
  );
}

function ToolResponsePanel({ tool, result }: ToolResponsePanelProps) {
  return (
    <div className="col-span-1 flex flex-col min-h-0 border-l border-zinc-200 dark:border-zinc-700 pl-6 animate-in fade-in slide-in-from-left-2 duration-200 ease-out">
      <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 flex-shrink-0 border-b border-zinc-200 dark:border-zinc-700 pb-2">
        Tool: <code className="ml-1 font-normal text-blue-600 dark:text-blue-400">{tool.name}</code>
      </h4>
      <div className="flex-1 min-h-0 overflow-y-auto pr-3">
        <ToolResultView toolName={tool.name} result={result} />
      </div>
    </div>
  );
}

function ToolResultView({ toolName, result }: ToolResultViewProps) {
  switch (result.kind) {
    case "idle":
      return null;
    case "loading":
      return (
        <p className="text-xs text-zinc-500 dark:text-zinc-500 italic flex items-center gap-1.5 animate-in fade-in duration-200">
          <Loader2 className="w-3 h-3 animate-spin" /> Executing...
        </p>
      );
    case "error":
      return (
        <p className="text-xs text-red-500 dark:text-red-400 animate-in fade-in duration-200">
          <span className="font-semibold">Error:</span> {result.message}
        </p>
      );
    case "image":
      return (
        <img
          src={`data:image/jpeg;base64,${result.data}`}
          alt={`Generated image from ${toolName}`}
          className="max-w-full h-auto rounded border border-zinc-200 dark:border-zinc-700 animate-in fade-in duration-200"
        />
      );
    case "text":
      return <pre className="text-xs whitespace-pre-wrap break-words animate-in fade-in duration-200">{result.text}</pre>;
  }
}

function ConnectionControls({ status, isToolListVisible, canConnect, onConnect, onDisconnect }: ConnectionControlsProps) {
  const isDisconnected = status === "idle" || status === "error";

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-5 w-full">
      <div className="flex flex-col items-center text-center gap-1.5 w-full">
        {isDisconnected && (
          <p className="italic text-xs text-zinc-600 dark:text-zinc-400 w-full text-center mb-2">Or Connect directly here:</p>
        )}
        <div className="flex justify-center w-full">
          {isDisconnected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onConnect}
              disabled={!canConnect}
              className="cursor-pointer gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm"
            >
              <Plug className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Connect
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDisconnect}
              className="cursor-pointer gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
            >
              <Plug className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Disconnect
            </Button>
          )}
        </div>
      </div>

      <div className="text-xs text-zinc-500 dark:text-zinc-400 w-full min-h-[20px] flex items-center justify-center pb-1">
        <ConnectionStatusBadge badge={STATUS_BADGES[toStatusBadgeKey(status, isToolListVisible)]} />
      </div>
    </div>
  );
}

function ConnectionStatusBadge({ badge }: ConnectionStatusBadgeProps) {
  const { Icon } = badge;

  return (
    <span className={cn("flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs", badge.className)}>
      <Icon className={cn("w-3 h-3", badge.iconClassName)} /> Status: {badge.label}
    </span>
  );
}

function toStatusBadgeKey(status: ConnectionStatus, isToolListVisible: boolean): StatusBadgeKey {
  if (status !== "connected") return status;

  return isToolListVisible ? "connected" : "loadingTools";
}

const STATUS_BADGES: Record<StatusBadgeKey, StatusBadge> = {
  idle: {
    label: "Idle",
    Icon: XCircle,
    className: "bg-zinc-100 dark:bg-zinc-800",
    iconClassName: "text-gray-400",
  },
  connecting: {
    label: "Connecting...",
    Icon: Loader2,
    className: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    iconClassName: "animate-spin text-blue-500",
  },
  loadingTools: {
    label: "Loading tools...",
    Icon: Loader2,
    className: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    iconClassName: "animate-spin text-blue-500",
  },
  connected: {
    label: "Connected",
    Icon: Server,
    className: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    iconClassName: "text-green-500",
  },
  error: {
    label: "Error",
    Icon: XCircle,
    className: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    iconClassName: "text-red-500",
  },
};

type StatusBadgeKey = ConnectionStatus | "loadingTools";

interface StatusBadge {
  label: string;
  Icon: LucideIcon;
  className: string;
  iconClassName: string;
}

interface InfoDialogProps {
  triggerText: string;
  triggerClassName?: string;
  title: string;
  contentLines: string[];
  dialogClassName?: string;
}

interface McpUrlFieldProps {
  url: string | null;
}

interface CopyUrlButtonProps {
  url: string;
}

interface ToolsSectionProps {
  tools: McpTool[];
  isVisible: boolean;
  selectedTool: McpTool | null;
  toolResult: ToolResult;
  onSelectTool: (tool: McpTool) => void;
}

interface ToolListItemProps {
  tool: McpTool;
  index: number;
  isVisible: boolean;
  isSelected: boolean;
  onSelect: (tool: McpTool) => void;
}

interface ToolResponsePanelProps {
  tool: McpTool;
  result: ToolResult;
}

interface ToolResultViewProps {
  toolName: string;
  result: ToolResult;
}

interface ConnectionControlsProps {
  status: ConnectionStatus;
  isToolListVisible: boolean;
  canConnect: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

interface ConnectionStatusBadgeProps {
  badge: StatusBadge;
}
