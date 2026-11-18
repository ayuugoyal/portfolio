/**
 * The browser side of the site agent: status, lazy Turnstile + session, and the tool loop.
 *
 * The browser holds the conversation and runs the arm tools on the simulation; each model call is one POST
 * to /api/agent. Anything going wrong before the first answer means "fall back to the scripted engine",
 * and the agent then stays off for the rest of the page visit (so the on-screen notes stay true).
 */
import { speak } from "@/lib/voice/speech";
import {
    type AgentEvent,
    type AgentStatus,
    type AssistantBlock,
    type ClientMessage,
    type ErrorCode,
    LIMITS,
    type ToolResult,
    type ToolUseBlock,
    type UserTextMessage,
    isUserText,
} from "./protocol";
import { type AgentCall, validateToolInput } from "./tools";

// ─── mode (shared by the mascot chat and the arm console) ──────────────────────────────────────────

export type AgentMode = "unknown" | "live" | "off";

let mode: AgentMode = "unknown";
let status: AgentStatus | null = null;
let statusPromise: Promise<AgentStatus | null> | null = null;
const listeners = new Set<() => void>();

const setMode = (m: AgentMode) => {
    if (mode === m) return;
    mode = m;
    listeners.forEach((l) => l());
};

export const getAgentMode = (): AgentMode => mode;

/** true while the Turnstile check runs (the chat says so instead of showing bare dots) */
let checking = false;
const setChecking = (on: boolean) => {
    if (checking === on) return;
    checking = on;
    listeners.forEach((l) => l());
};
export const isCheckingHuman = (): boolean => checking;
export const getAgentStatus = (): AgentStatus | null => status;

/** For useSyncExternalStore. */
export function subscribeAgentMode(cb: () => void): () => void {
    listeners.add(cb);
    return () => listeners.delete(cb);
}

/** Stop using the live agent for the rest of this page visit. */
export function disableAgent(): void {
    setMode("off");
}

/** Ask the server whether the live agent is on (once per page visit). No Turnstile, no model call. */
export function loadAgentStatus(): Promise<AgentStatus | null> {
    statusPromise ??= (async () => {
        try {
            const res = await fetch("/api/agent/session", { cache: "no-store", credentials: "same-origin" });
            const s = res.ok ? ((await res.json()) as AgentStatus) : null;
            if (!s?.enabled || !s.siteKey) {
                setMode("off");
                return null;
            }
            status = s;
            if (mode === "unknown") setMode("live");
            return s;
        } catch {
            setMode("off");
            return null;
        }
    })();
    return statusPromise;
}

// ─── Turnstile (loaded only when the visitor first uses the agent) ─────────────────────────────────

type Turnstile = {
    render: (el: HTMLElement, opts: Record<string, unknown>) => string | undefined;
    remove: (id: string) => void;
};
declare global {
    interface Window {
        turnstile?: Turnstile;
    }
}

let scriptPromise: Promise<Turnstile> | null = null;

function loadTurnstile(): Promise<Turnstile> {
    scriptPromise ??= new Promise<Turnstile>((resolve, reject) => {
        if (window.turnstile) return resolve(window.turnstile);
        const s = document.createElement("script");
        s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        s.async = true;
        s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile")));
        s.onerror = () => reject(new Error("turnstile"));
        document.head.appendChild(s);
    }).catch((e) => {
        scriptPromise = null;
        throw e;
    });
    return scriptPromise;
}

async function turnstileToken(host: HTMLElement, siteKey: string): Promise<string> {
    const ts = await loadTurnstile();
    const box = document.createElement("div");
    host.appendChild(box);
    let id: string | undefined;
    try {
        return await new Promise<string>((resolve, reject) => {
            // short: a check that hasn't finished by now (blocked domain, stuck widget) won't, and the visitor
            // is waiting on it; give up and let the scripted answer reply instead
            const timer = window.setTimeout(() => reject(new Error("timeout")), 15_000);
            const done = (fn: () => void) => {
                window.clearTimeout(timer);
                fn();
            };
            id = ts.render(box, {
                sitekey: siteKey,
                action: "agent",
                appearance: "interaction-only",
                callback: (token: string) => done(() => resolve(token)),
                "error-callback": () => done(() => reject(new Error("turnstile"))),
                "expired-callback": () => done(() => reject(new Error("expired"))),
                "timeout-callback": () => done(() => reject(new Error("timeout"))),
            });
        });
    } finally {
        if (id) ts.remove(id);
        box.remove();
    }
}

let sessionPromise: Promise<boolean> | null = null;

/** Make sure this browser holds a session cookie: Turnstile -> POST /api/agent/session. */
function ensureSession(host: HTMLElement | null, force = false): Promise<boolean> {
    if (!force && status?.session) return Promise.resolve(true);
    if (force) sessionPromise = null;
    sessionPromise ??= (async () => {
        const s = status ?? (await loadAgentStatus());
        if (!s?.siteKey || !host) return false;
        setChecking(true);
        try {
            const token = await turnstileToken(host, s.siteKey);
            const res = await fetch("/api/agent/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ token }),
            });
            if (res.ok && status) status = { ...status, session: true };
            return res.ok;
        } catch {
            return false;
        } finally {
            setChecking(false);
        }
    })().then((ok) => {
        if (!ok) sessionPromise = null;
        return ok;
    });
    return sessionPromise;
}

/**
 * Run the Turnstile check ahead of the first message (when the chat opens), so a question is answered
 * straight away. If the check fails, live mode goes off for this visit and questions get the scripted
 * answers immediately instead of waiting on a check that will not pass.
 */
export async function warmSession(host: HTMLElement | null): Promise<void> {
    if (mode === "off" || status?.session) return;
    const s = await loadAgentStatus();
    if (!s || s.session) return;
    if (!(await ensureSession(host))) disableAgent();
}

// ─── the tool loop ─────────────────────────────────────────────────────────────────────────────────

/** Keep the request under the server's message cap, dropping whole old turns from the front. */
export function trimHistory(h: ClientMessage[], max: number = LIMITS.messages): ClientMessage[] {
    let out = h;
    while (out.length > max) {
        const next = out.findIndex((m, i) => i > 0 && isUserText(m));
        if (next <= 0) break;
        out = out.slice(next);
    }
    return out;
}

async function* readEvents(res: Response, signal: AbortSignal): AsyncGenerator<AgentEvent> {
    if (!res.body) return;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    const onAbort = () => reader.cancel().catch(() => {});
    signal.addEventListener("abort", onAbort);
    try {
        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            let nl: number;
            while ((nl = buf.indexOf("\n")) >= 0) {
                const line = buf.slice(0, nl).trim();
                buf = buf.slice(nl + 1);
                if (!line) continue;
                try {
                    yield JSON.parse(line) as AgentEvent;
                } catch {
                    /* skip a malformed line */
                }
            }
        }
    } finally {
        signal.removeEventListener("abort", onAbort);
    }
}

export type ToolOutcome = { content: string; is_error?: boolean };

export type TurnHooks = {
    /** a text delta of block `i` of model call `round` */
    text?: (round: number, i: number, d: string) => void;
    /** a progress note delta (between tool calls) */
    note?: (round: number, i: number, d: string) => void;
    /** a tool call started streaming */
    toolStart?: (id: string, name: string) => void;
    /**
     * Run one tool call (already validated; `call` is null when the input was invalid and `error` says why).
     * Resolve once the arm has finished the motion.
     */
    runTool: (block: ToolUseBlock, call: AgentCall | null, error: string | null) => Promise<ToolOutcome>;
};

/**
 * How a turn ended. `fallback`: the agent couldn't answer at all (answer with the scripted engine);
 * `stopped`: the visitor pressed stop; `steps`: too many tool rounds; `error`: it failed after answering.
 */
export type TurnEnd = "done" | "fallback" | "stopped" | "steps" | "refusal" | "truncated" | "error";

const NOT_RUN = "Not run: the visitor pressed stop.";

export async function runAgentTurn(opts: {
    history: ClientMessage[];
    user: UserTextMessage;
    signal: AbortSignal;
    /** where Turnstile may render (only if it needs the visitor to click) */
    turnstileHost: () => HTMLElement | null;
    hooks: TurnHooks;
}): Promise<{ history: ClientMessage[]; end: TurnEnd; code?: ErrorCode }> {
    const { user, signal, hooks } = opts;
    const before = opts.history;
    let h: ClientMessage[] = [...before, user];
    let answered = false;

    /** never leave a typed message without an answer in history (the next request would be invalid) */
    const finish = (end: TurnEnd, code?: ErrorCode) => {
        if (end === "fallback") return { history: before, end, code };
        if (isUserText(h[h.length - 1])) h = h.slice(0, -1);
        return { history: h, end, code };
    };

    if (mode === "off") return finish("fallback", "unavailable");
    if (!(await loadAgentStatus())) return finish("fallback", "unavailable");
    if (!(await ensureSession(opts.turnstileHost()))) {
        disableAgent();
        return finish("fallback", "turnstile");
    }

    for (let round = 0; ; round++) {
        if (signal.aborted) return finish("stopped");
        if (round >= LIMITS.toolRounds) return finish("steps", "steps");
        h = trimHistory(h);

        let res: Response | null = null;
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                res = await fetch("/api/agent", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "same-origin",
                    body: JSON.stringify({ messages: h }),
                    signal,
                });
            } catch {
                if (signal.aborted) return finish("stopped");
                res = null;
            }
            // the session expired or the network changed: one fresh Turnstile check, then retry
            if (res?.status === 401 && attempt === 0 && (await ensureSession(opts.turnstileHost(), true))) continue;
            break;
        }
        if (!res || !res.ok) {
            let code: ErrorCode = "upstream";
            try {
                code = ((await res?.json()) as { error?: ErrorCode })?.error ?? "upstream";
            } catch {
                /* keep generic */
            }
            if (code === "steps") return finish("steps", code);
            disableAgent();
            return finish(answered ? "error" : "fallback", code);
        }

        let done: Extract<AgentEvent, { t: "done" }> | null = null;
        let failed: ErrorCode | null = null;
        let streamed = false;
        try {
            for await (const ev of readEvents(res, signal)) {
                if (ev.t === "text") {
                    streamed = true;
                    hooks.text?.(round, ev.i, ev.d);
                } else if (ev.t === "note") hooks.note?.(round, ev.i, ev.d);
                else if (ev.t === "tool_start") hooks.toolStart?.(ev.id, ev.name);
                else if (ev.t === "done") done = ev;
                else if (ev.t === "error") failed = ev.code;
            }
        } catch {
            failed = "upstream";
        }
        if (signal.aborted) return finish("stopped");
        if (!done) {
            disableAgent();
            return finish(answered || streamed ? "error" : "fallback", failed ?? "upstream");
        }
        const content: AssistantBlock[] = done.content;
        // voice mode: Claude says each part of its answer as it completes (later rounds queue behind earlier ones)
        const said = content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join(" ");
        if (said) speak(said, { queue: answered });
        answered = true;
        if (content.length) h = [...h, { role: "assistant", content }];
        if (done.stop === "refusal") return finish("refusal");
        if (done.stop === "max_tokens") return finish("truncated");
        if (done.stop !== "tool_use") return finish("done");

        // run the calls in order; each resolves after its motion has finished
        const results: ToolResult[] = [];
        for (const b of content) {
            if (b.type !== "tool_use") continue;
            if (signal.aborted) {
                results.push({ tool_use_id: b.id, content: NOT_RUN, is_error: true });
                continue;
            }
            const v = validateToolInput(b.name, b.input);
            let out: ToolOutcome;
            try {
                out = v.ok
                    ? await hooks.runTool(b, v.call, null)
                    : await hooks.runTool(b, null, v.error).then(() => ({ content: JSON.stringify({ error: v.error }), is_error: true }));
            } catch {
                out = { content: "The simulation could not run this call.", is_error: true };
            }
            results.push({
                tool_use_id: b.id,
                content: (out.content || "(no output)").slice(0, LIMITS.toolResult),
                ...(out.is_error ? { is_error: true } : {}),
            });
        }
        h = [...h, { role: "user", results }];
        if (signal.aborted) return finish("stopped");
    }
}
