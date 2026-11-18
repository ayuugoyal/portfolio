/**
 * One model call for the site agent, streamed to the browser as NDJSON events (protocol.ts).
 * The browser runs the arm tools and calls again with the results; this module never runs tools itself.
 */
import Anthropic from "@anthropic-ai/sdk";
import type {
    BetaContentBlock,
    BetaMessage,
    BetaMessageParam,
    BetaMessageStreamParams,
    BetaTool,
} from "@anthropic-ai/sdk/resources/beta/messages/messages";
import { type UsageLike, costUsd } from "./cost";
import { SYSTEM_PROMPT, toApiMessages } from "./prompt";
import { type AgentEvent, type AssistantBlock, type ClientMessage, type ErrorCode, LIMITS, type StopKind } from "./protocol";
import { AGENT_TOOL_DEFS } from "./tools";
import { lastUserText } from "./validate";

export const MAX_TOKENS = { chat: 1536, jd: 3072 } as const;

/** Client tools, in a fixed order. Eager input streaming: inputs are validated by us (tools.ts) before running. */
const TOOLS: BetaTool[] = AGENT_TOOL_DEFS.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.input_schema as BetaTool["input_schema"],
    eager_input_streaming: true,
}));

export function buildParams(model: string, messages: ClientMessage[]): BetaMessageStreamParams {
    const jd = !!lastUserText(messages).jd;
    const opus = model.startsWith("claude-opus-5");
    return {
        model,
        max_tokens: jd ? MAX_TOKENS.jd : MAX_TOKENS.chat,
        // tools render first, then system: this one breakpoint caches both
        system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
        tools: TOOLS,
        tool_choice: { type: "auto" },
        messages: toApiMessages(messages) as BetaMessageParam[],
        // automatic breakpoint for the growing conversation tail
        cache_control: { type: "ephemeral" },
        // thinking is always on for Opus 5.5; effort keeps it (and cost) small
        output_config: { effort: jd ? "medium" : "low" },
        ...(opus
            ? {
                  // short progress notes between tool calls come back as text instead of empty thinking blocks
                  thinking: { type: "adaptive", display: "updates" },
                  // a policy decline is re-run server-side on Anthropic's recommended fallback model
                  fallbacks: "default",
                  betas: ["server-side-fallback-2026-07-01", "thinking-display-updates-2026-08-18"],
              }
            : {}),
    };
}

/** The assistant message the browser appends to history: text + tool_use only, valid for the next request. */
export function finalizeContent(message: Pick<BetaMessage, "content" | "stop_reason">): { stop: StopKind; content: AssistantBlock[] } {
    let blocks: BetaContentBlock[] = message.content;
    // after a mid-output fallback only the text before the last switch point is echoed, plus everything after it
    const fb = blocks.map((b) => b.type).lastIndexOf("fallback");
    if (fb >= 0) blocks = [...blocks.slice(0, fb).filter((b) => b.type === "text"), ...blocks.slice(fb + 1)];

    const content: AssistantBlock[] = [];
    for (const b of blocks) {
        if (b.type === "text") {
            if (b.text.trim()) content.push({ type: "text", text: b.text.slice(0, LIMITS.assistantText) });
        } else if (b.type === "tool_use") {
            const ok =
                typeof b.input === "object" &&
                b.input !== null &&
                !Array.isArray(b.input) &&
                JSON.stringify(b.input).length <= LIMITS.toolResult;
            content.push({ type: "tool_use", id: b.id, name: b.name, input: ok ? (b.input as Record<string, unknown>) : {} });
        }
    }
    const hasTool = content.some((b) => b.type === "tool_use");
    const reason = message.stop_reason;
    let stop: StopKind =
        reason === "tool_use" && hasTool
            ? "tool_use"
            : reason === "end_turn" || reason === "stop_sequence"
              ? "end_turn"
              : reason === "max_tokens"
                ? "max_tokens"
                : reason === "refusal"
                  ? "refusal"
                  : "other";
    if (stop === "refusal") return { stop, content: [] }; // the partial may be cut mid-thought: discard it
    // never hand back a tool call that must not run (truncated at max_tokens, or any non-tool stop)
    const kept = stop === "tool_use" ? content : content.filter((b) => b.type === "text");
    if (stop === "other" && kept.length) stop = "end_turn";
    return { stop, content: kept.slice(0, LIMITS.blocksPerMessage) };
}

export type RunResult = { usage: UsageLike | null; model: string | null; cost: number };

/** Typed SDK errors -> a generic code for the browser; the class name (never the message) for the log. */
function classify(err: unknown): { code: ErrorCode | null; log: string } {
    if (err instanceof Anthropic.APIUserAbortError) return { code: null, log: "aborted" };
    if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError)
        return { code: "unavailable", log: `auth ${err.status}` };
    if (err instanceof Anthropic.RateLimitError) return { code: "upstream", log: "anthropic 429" };
    if (err instanceof Anthropic.BadRequestError) return { code: "upstream", log: "anthropic 400" };
    if (err instanceof Anthropic.APIConnectionError) return { code: "upstream", log: "connection" };
    if (err instanceof Anthropic.APIError) return { code: "upstream", log: `anthropic ${err.status ?? "?"}` };
    return { code: "upstream", log: err instanceof Error ? err.name : "unknown" };
}

/**
 * Stream one model call. Emits text / note / tool_start deltas as they arrive and one `done` (or `error`)
 * at the end. Resolves with the usage seen (also for aborted or failed calls) so the spend can be recorded.
 */
export async function streamTurn(opts: {
    client: Anthropic;
    params: BetaMessageStreamParams;
    signal: AbortSignal;
    emit: (e: AgentEvent) => void;
}): Promise<RunResult> {
    const { client, params, signal, emit } = opts;
    let usage: UsageLike | null = null;
    let model: string | null = null;
    try {
        const stream = client.beta.messages.stream(params, { signal, maxRetries: 1 });
        for await (const ev of stream) {
            switch (ev.type) {
                case "message_start":
                    usage = { ...ev.message.usage };
                    model = ev.message.model;
                    break;
                case "message_delta": {
                    const u = ev.usage as UsageLike;
                    usage = { ...(usage ?? {}) };
                    for (const k of ["input_tokens", "output_tokens", "cache_creation_input_tokens", "cache_read_input_tokens"] as const)
                        if (typeof u[k] === "number") usage[k] = u[k];
                    if (u.iterations) usage.iterations = u.iterations;
                    break;
                }
                case "content_block_start":
                    if (ev.content_block.type === "tool_use")
                        emit({ t: "tool_start", i: ev.index, id: ev.content_block.id, name: ev.content_block.name });
                    break;
                case "content_block_delta":
                    if (ev.delta.type === "text_delta" && ev.delta.text) emit({ t: "text", i: ev.index, d: ev.delta.text });
                    else if (ev.delta.type === "thinking_delta" && ev.delta.thinking)
                        emit({ t: "note", i: ev.index, d: ev.delta.thinking });
                    break;
            }
        }
        const final = await stream.finalMessage();
        usage = final.usage as UsageLike;
        model = final.model;
        emit({ t: "done", ...finalizeContent(final) });
    } catch (err) {
        const { code, log } = classify(err);
        console.error(`[agent] model call failed: ${log}`);
        if (code) emit({ t: "error", code });
    }
    return { usage, model, cost: costUsd(usage, model ?? (params.model as string)) };
}
