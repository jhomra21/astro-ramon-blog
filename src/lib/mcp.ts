import * as z from "zod/mini";

export interface McpTool {
  name: string;
  description?: string;
}

export type ToolResponse =
  | { kind: "image"; data: string }
  | { kind: "text"; text: string }
  | { kind: "error"; message: string };

export interface McpResponse {
  id: number;
  tools: McpTool[] | null;
  toolResponse: ToolResponse;
}

export function findMcpUrl(contentLines: string[]): string | null {
  const urlLine = contentLines.find((line) => line.toLowerCase().startsWith("mcp url:"));

  return urlLine ? urlLine.slice(urlLine.indexOf(":") + 1).trim() : null;
}

export function createRequestId(): number {
  nextRequestId += 1;

  return nextRequestId;
}

export function parseMcpResponse(raw: string): McpResponse | null {
  const parsed = jsonRpcResponseSchema.safeParse(readJson(raw));

  if (!parsed.success) return null;

  return {
    id: parsed.data.id,
    tools: parsed.data.result?.tools ?? null,
    toolResponse: toToolResponse(parsed.data),
  };
}

export async function requestToolList(url: string, id: number): Promise<void> {
  await postJsonRpc(url, {
    jsonrpc: "2.0",
    id,
    method: "tools/list",
    params: { _meta: { progressToken: id } },
  });
}

export async function requestToolCall(url: string, id: number, toolName: string): Promise<void> {
  await postJsonRpc(url, {
    jsonrpc: "2.0",
    id,
    method: "tools/call",
    params: { name: toolName, arguments: {}, _meta: { progressToken: id } },
  });
}

async function postJsonRpc(url: string, request: JsonRpcRequest): Promise<void> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
}

function readJson(raw: string): JsonValue {
  try {
    return jsonSchema.parse(JSON.parse(raw));
  } catch (error) {
    console.error("Failed to parse MCP message data:", error);

    return null;
  }
}

function toToolResponse(response: JsonRpcResponse): ToolResponse {
  const content = response.result?.content;

  if (content !== undefined && content !== null) return contentToToolResponse(content);

  if (response.error) return { kind: "error", message: response.error.message ?? "Unknown error" };

  if (response.result) return { kind: "text", text: "Tool executed successfully, but returned no content." };

  return { kind: "error", message: "Unexpected response structure." };
}

function contentToToolResponse(content: JsonValue): ToolResponse {
  const items = Array.isArray(content) ? content : [content];
  const image = findImageData(items);

  if (image !== null) return { kind: "image", data: image };

  const text = items.flatMap(readText).join(" ");

  if (text) return { kind: "text", text };

  const rawText = z.string().safeParse(content);

  return { kind: "text", text: rawText.success ? rawText.data : JSON.stringify(content, null, 2) };
}

function findImageData(items: JsonValue[]): string | null {
  for (const item of items) {
    const image = imageContentSchema.safeParse(item);

    if (image.success) return image.data.data;
  }

  return null;
}

function readText(item: JsonValue): string[] {
  const text = textContentSchema.safeParse(item);

  return text.success && text.data.text ? [text.data.text] : [];
}

let nextRequestId = 0;

const jsonSchema = z.json();

const toolSchema = z.object({
  name: z.string(),
  description: z.optional(z.string()),
});

const imageContentSchema = z.object({ type: z.literal("image"), data: z.string() });

const textContentSchema = z.object({ type: z.literal("text"), text: z.string() });

const jsonRpcResponseSchema = z.object({
  jsonrpc: z.literal("2.0"),
  id: z.number(),
  result: z.optional(
    z.object({
      tools: z.optional(z.array(toolSchema)),
      content: z.optional(jsonSchema),
    })
  ),
  error: z.optional(z.object({ message: z.optional(z.string()) })),
});

type JsonValue = z.infer<typeof jsonSchema>;

type JsonRpcResponse = z.infer<typeof jsonRpcResponseSchema>;

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: number;
  method: "tools/list" | "tools/call";
  params: JsonRpcParams;
}

interface JsonRpcParams {
  name?: string;
  arguments?: Record<string, never>;
  _meta: { progressToken: number };
}
