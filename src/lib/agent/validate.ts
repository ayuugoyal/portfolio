/**
 * Strict validation of the untrusted request body. Builds fresh objects with only the known fields, so
 * nothing the client adds (extra keys, other roles, other block types, thinking blocks, images…) reaches
 * the API. Pure TS.
 */
import { stripTags } from "./prompt";
import {
    type AgentRequest,
    type AssistantBlock,
    type ClientMessage,
    LIMITS,
    type ToolResult,
    type UserTextMessage,
    isUserText,
} from "./protocol";
import { isToolName } from "./tools";

export type Checked = { ok: true; req: AgentRequest } | { ok: false; why: string };

const ID = /^[A-Za-z0-9_-]{1,128}$/;
const PAGE = /^\/[A-Za-z0-9\-._~/]*$/;

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const fail = (why: string): Checked => ({ ok: false, why });

function userText(m: Record<string, unknown>): UserTextMessage | string {
    const { text, surface, arm, moveo, page, jd } = m;
    if (typeof text !== "string") return "text";
    if (surface !== "chat" && surface !== "arm" && surface !== "moveo") return "surface";
    if (typeof arm !== "boolean") return "arm";
    if (moveo !== undefined && typeof moveo !== "boolean") return "moveo";
    if (typeof page !== "string" || page.length > LIMITS.pagePath || !PAGE.test(page)) return "page";
    if (jd !== undefined && typeof jd !== "boolean") return "jd";
    if (jd && surface !== "chat") return "jd surface";
    const max = jd ? LIMITS.jdText : LIMITS.userText;
    if (text.length > max) return "text length";
    if (!stripTags(text).trim()) return "empty text";
    const out: UserTextMessage = { role: "user", text, surface, arm, page };
    if (moveo) out.moveo = true;
    if (jd) out.jd = true;
    return out;
}

function assistantBlocks(content: unknown): AssistantBlock[] | string {
    if (!Array.isArray(content) || content.length === 0 || content.length > LIMITS.blocksPerMessage) return "content";
    const out: AssistantBlock[] = [];
    for (const b of content) {
        if (!isObj(b)) return "block";
        if (b.type === "text") {
            if (typeof b.text !== "string" || !b.text.trim() || b.text.length > LIMITS.assistantText) return "text block";
            out.push({ type: "text", text: b.text });
        } else if (b.type === "tool_use") {
            if (typeof b.id !== "string" || !ID.test(b.id)) return "tool id";
            if (!isToolName(b.name)) return "tool name";
            if (!isObj(b.input) || JSON.stringify(b.input).length > LIMITS.toolResult) return "tool input";
            out.push({ type: "tool_use", id: b.id, name: b.name, input: JSON.parse(JSON.stringify(b.input)) });
        } else return "block type";
    }
    return out;
}

function toolResults(results: unknown): ToolResult[] | string {
    if (!Array.isArray(results) || results.length === 0 || results.length > LIMITS.blocksPerMessage) return "results";
    const out: ToolResult[] = [];
    for (const r of results) {
        if (!isObj(r)) return "result";
        if (typeof r.tool_use_id !== "string" || !ID.test(r.tool_use_id)) return "result id";
        if (typeof r.content !== "string" || !r.content || r.content.length > LIMITS.toolResult) return "result content";
        if (r.is_error !== undefined && typeof r.is_error !== "boolean") return "is_error";
        out.push({ tool_use_id: r.tool_use_id, content: r.content, ...(r.is_error ? { is_error: true } : {}) });
    }
    return out;
}

/**
 * The conversation must be one the API accepts and that this site could have produced:
 * user text first; assistant after a user turn; every tool_use answered, in order, by the next results
 * message; results only after tool_use; ends on a user turn; at most two pasted JDs.
 */
export function checkRequest(body: unknown): Checked {
    if (!isObj(body) || !Array.isArray(body.messages)) return fail("shape");
    const raw = body.messages;
    if (raw.length === 0 || raw.length > LIMITS.messages) return fail("message count");

    const messages: ClientMessage[] = [];
    let pending: string[] | null = null; // tool_use ids awaiting results
    const seen = new Set<string>();
    let jds = 0;
    for (let i = 0; i < raw.length; i++) {
        const m = raw[i];
        if (!isObj(m)) return fail("message");
        const prev = messages[messages.length - 1];
        if (m.role === "assistant") {
            if (!prev || prev.role !== "user") return fail("order");
            const blocks = assistantBlocks(m.content);
            if (typeof blocks === "string") return fail(blocks);
            const ids = blocks.flatMap((b) => (b.type === "tool_use" ? [b.id] : []));
            for (const id of ids) {
                if (seen.has(id)) return fail("duplicate tool id");
                seen.add(id);
            }
            pending = ids.length ? ids : null;
            messages.push({ role: "assistant", content: blocks });
        } else if (m.role === "user" && "results" in m) {
            if (!pending || prev?.role !== "assistant") return fail("results order");
            const results = toolResults(m.results);
            if (typeof results === "string") return fail(results);
            if (results.length !== pending.length || results.some((r, k) => r.tool_use_id !== pending![k]))
                return fail("results mismatch");
            pending = null;
            messages.push({ role: "user", results });
        } else if (m.role === "user" && "text" in m) {
            if (pending) return fail("unanswered tool_use");
            if (prev && isUserText(prev)) return fail("two user texts");
            const u = userText(m);
            if (typeof u === "string") return fail(u);
            if (u.jd && ++jds > 2) return fail("too many jds");
            messages.push(u);
        } else return fail("role");
    }
    if (!isUserText(messages[0])) return fail("first message");
    if (messages[messages.length - 1].role !== "user" || pending) return fail("last message");
    return { ok: true, req: { messages } };
}

/** Model calls already made for the latest typed message (assistant turns after it). */
export function toolRounds(messages: ClientMessage[]): number {
    let n = 0;
    for (let i = messages.length - 1; i >= 0; i--) {
        const m = messages[i];
        if (isUserText(m)) break;
        if (m.role === "assistant") n++;
    }
    return n;
}

/** The latest typed message (sets max_tokens / effort: a JD report gets more room). */
export function lastUserText(messages: ClientMessage[]): UserTextMessage {
    for (let i = messages.length - 1; i >= 0; i--) {
        const m = messages[i];
        if (isUserText(m)) return m;
    }
    throw new Error("no user text");
}
