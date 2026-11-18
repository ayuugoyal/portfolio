/**
 * The wire format between the browser and /api/agent. Shared by both sides; pure TS.
 *
 * The browser keeps the conversation (the API is stateless) in a simpler shape than the Messages API:
 * a user turn carries its page context as fields, and the server renders them into the same text every
 * time, so the prompt prefix stays byte-identical between requests (prompt caching).
 */

/** Hard caps. The server enforces them; the client keeps under them. */
export const LIMITS = {
    bodyBytes: 64 * 1024,
    messages: 24,
    userText: 1_000,
    jdText: 8_000,
    toolResult: 2_000,
    assistantText: 8_000,
    blocksPerMessage: 12,
    /** model calls (tool rounds) after one typed message */
    toolRounds: 8,
    pagePath: 80,
} as const;

/** the mascot chat, the SO-101 console, or the BCN3D Moveo console */
export type Surface = "chat" | "arm" | "moveo";

/** What the visitor typed, plus where they typed it. */
export type UserTextMessage = {
    role: "user";
    text: string;
    /** the mascot chat or the arm console */
    surface: Surface;
    /** a 3D arm is mounted on the page, so arm tools can run */
    arm: boolean;
    /** the 3D BCN3D Moveo is on the page, so moveo_* tools can run (omitted = no) */
    moveo?: boolean;
    /** pathname, e.g. "/robotics" */
    page: string;
    /** the visitor pasted a job description (mascot chat only) */
    jd?: boolean;
};

export type TextBlock = { type: "text"; text: string };
export type ToolUseBlock = { type: "tool_use"; id: string; name: string; input: Record<string, unknown> };
export type AssistantBlock = TextBlock | ToolUseBlock;

export type AssistantMessage = { role: "assistant"; content: AssistantBlock[] };

export type ToolResult = { tool_use_id: string; content: string; is_error?: boolean };
/** The browser ran the tools of the previous assistant message; one result per tool_use, same order. */
export type ToolResultsMessage = { role: "user"; results: ToolResult[] };

export type ClientMessage = UserTextMessage | AssistantMessage | ToolResultsMessage;

export type AgentRequest = { messages: ClientMessage[] };

export const isUserText = (m: ClientMessage): m is UserTextMessage => m.role === "user" && "text" in m;
export const isResults = (m: ClientMessage): m is ToolResultsMessage => m.role === "user" && "results" in m;

/** Why the model stopped, as the browser needs it. */
export type StopKind = "end_turn" | "tool_use" | "max_tokens" | "refusal" | "other";

/** Generic error codes. Never carry details (no stack traces, env values, upstream messages). */
export type ErrorCode =
    | "unavailable" // agent off (no key / config) or kill switch
    | "origin"
    | "session" // missing / expired / wrong-IP session cookie: run Turnstile again
    | "turnstile"
    | "bad_request"
    | "too_large"
    | "limit" // per-IP or per-session rate limit
    | "budget" // global daily spend cap reached
    | "steps" // too many tool rounds for one typed message
    | "upstream"; // Anthropic API / network error

/**
 * One NDJSON line of the /api/agent response stream.
 *  - text / note deltas carry the content-block index, so the browser can group them
 *  - note = a short progress update the model writes between tool calls (thinking display "updates")
 *  - done carries the assistant message to append to history (text + validated tool_use blocks only)
 */
export type AgentEvent =
    | { t: "text"; i: number; d: string }
    | { t: "note"; i: number; d: string }
    | { t: "tool_start"; i: number; id: string; name: string }
    | { t: "done"; stop: StopKind; content: AssistantBlock[] }
    | { t: "error"; code: ErrorCode };

/**
 * GET /api/agent/session. `links`: every URL the agent may link to (from the site content), for the renderer;
 * `origins`: the site's own origins, canonical first (their links open in the same tab).
 */
export type AgentStatus = { enabled: boolean; siteKey: string | null; session: boolean; links: string[]; origins: string[] };
