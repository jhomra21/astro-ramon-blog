import { useEffect, useRef, useState } from "react";
import {
  createRequestId,
  parseMcpResponse,
  requestToolCall,
  requestToolList,
  type McpTool,
  type ToolResponse,
} from "@/lib/mcp";

export type ConnectionStatus = "idle" | "connecting" | "connected" | "error";

export type ToolResult = ToolResponse | { kind: "idle" } | { kind: "loading" };

export function useMcpConnection(sseUrl: string | null) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
  const [sessionPostPath, setSessionPostPath] = useState<string | null>(null);
  const [tools, setTools] = useState<McpTool[]>([]);
  const [isToolListVisible, setIsToolListVisible] = useState(false);
  const [selectedTool, setSelectedTool] = useState<McpTool | null>(null);
  const [toolResult, setToolResult] = useState<ToolResult>(IDLE_RESULT);
  const eventSourceRef = useRef<EventSource | null>(null);
  const visibilityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRequestIdRef = useRef<number | null>(null);
  const baseUrl = sseUrl ? new URL(sseUrl).origin : null;

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();

      if (visibilityTimeoutRef.current) clearTimeout(visibilityTimeoutRef.current);
    };
  }, []);

  const clearVisibilityTimeout = () => {
    if (visibilityTimeoutRef.current) clearTimeout(visibilityTimeoutRef.current);
    visibilityTimeoutRef.current = null;
  };

  const resetSession = () => {
    clearVisibilityTimeout();
    setSessionPostPath(null);
    setTools([]);
    setIsToolListVisible(false);
    setSelectedTool(null);
    setToolResult(IDLE_RESULT);
    pendingRequestIdRef.current = null;
  };

  const closeConnection = (status: ConnectionStatus) => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    setConnectionStatus(status);
    resetSession();
  };

  const disconnect = () => closeConnection("idle");

  const showTools = (nextTools: McpTool[]) => {
    setTools(nextTools);
    clearVisibilityTimeout();
    visibilityTimeoutRef.current = setTimeout(() => setIsToolListVisible(true), 10);
  };

  const handleEndpoint = (event: MessageEvent<string>) => {
    if (!event.data || !baseUrl) {
      console.warn("Received endpoint event with unexpected data format.");
      closeConnection("error");

      return;
    }

    setSessionPostPath(event.data);
    setConnectionStatus("connected");
    requestToolList(`${baseUrl}${event.data}`, createRequestId()).catch((error) => {
      console.error("Failed to send tools/list request:", error);
      closeConnection("error");
    });
  };

  const handleMessage = (event: MessageEvent<string>) => {
    const response = parseMcpResponse(event.data);

    if (!response) return;

    if (response.id === pendingRequestIdRef.current) {
      pendingRequestIdRef.current = null;
      setToolResult(response.toolResponse);

      return;
    }

    if (response.tools) showTools(response.tools);
  };

  const connect = () => {
    if (!sseUrl) {
      console.error("MCP SSE URL not found.");
      setConnectionStatus("error");

      return;
    }

    if (connectionStatus === "connecting" || connectionStatus === "connected") return;

    eventSourceRef.current?.close();
    resetSession();
    setConnectionStatus("connecting");

    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;
    eventSource.onerror = (error) => {
      console.error("MCP SSE Error:", error);
      closeConnection("error");
    };

    eventSource.addEventListener("endpoint", handleEndpoint);
    eventSource.addEventListener("message", handleMessage);
  };

  const runTool = async (tool: McpTool) => {
    setSelectedTool(tool);

    if (!sessionPostPath || !baseUrl || connectionStatus !== "connected") {
      setToolResult({ kind: "error", message: "Not connected to the MCP server." });

      return;
    }

    const requestId = createRequestId();
    pendingRequestIdRef.current = requestId;
    setToolResult(LOADING_RESULT);

    try {
      await requestToolCall(`${baseUrl}${sessionPostPath}`, requestId, tool.name);
    } catch (error) {
      console.error(`Failed to send execute request for tool '${tool.name}':`, error);
      pendingRequestIdRef.current = null;
      setToolResult({
        kind: "error",
        message: `Failed to send request: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  };

  return {
    connectionStatus,
    tools,
    isToolListVisible,
    selectedTool,
    toolResult,
    connect,
    disconnect,
    runTool,
  };
}

const IDLE_RESULT: ToolResult = { kind: "idle" };

const LOADING_RESULT: ToolResult = { kind: "loading" };
