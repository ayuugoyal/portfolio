import Anthropic from "@anthropic-ai/sdk";
import { agentEnv, clientIp, fail, isJson, originOk, readCapped } from "@/lib/agent/http";
import { gateModelCall, recordSpend } from "@/lib/agent/limits";
import { type AgentEvent, LIMITS } from "@/lib/agent/protocol";
import { buildParams, streamTurn } from "@/lib/agent/run";
import { SESSION_COOKIE, idHash, readCookie, verifySession } from "@/lib/agent/session";
import { checkRequest, toolRounds } from "@/lib/agent/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Upper bound for one model call; the stream is aborted after this. */
const CALL_TIMEOUT_MS = 55_000;

let client: Anthropic | null = null;

/**
 * One model call for the site agent. The browser holds the conversation and runs the arm tools itself;
 * every round of a tool loop is a new request here, and each one passes every check below.
 */
export async function POST(req: Request) {
    const { cfg, store } = agentEnv();
    if (!cfg.enabled || !store) return fail("unavailable");
    if (!originOk(req, cfg)) return fail("origin");
    if (!isJson(req)) return fail("bad_request");

    const ip = clientIp(req);
    const session = verifySession(cfg.sessionSecret, readCookie(req.headers.get("cookie"), SESSION_COOKIE), ip);
    if (!session) return fail("session");

    const raw = await readCapped(req, LIMITS.bodyBytes);
    if (raw === null) return fail("too_large");
    let body: unknown;
    try {
        body = JSON.parse(raw);
    } catch {
        return fail("bad_request");
    }
    const checked = checkRequest(body);
    if (!checked.ok) return fail("bad_request");
    const { messages } = checked.req;
    if (toolRounds(messages) >= LIMITS.toolRounds) return fail("steps");

    try {
        const gate = await gateModelCall(
            store,
            { ip: idHash(cfg.sessionSecret, "ip", ip), session: session.sid },
            cfg.budgetUsd
        );
        if (!gate.ok) return fail(gate.code);
    } catch {
        console.error("[agent] store unavailable");
        return fail("unavailable"); // fail closed
    }

    client ??= new Anthropic({ apiKey: cfg.apiKey, timeout: CALL_TIMEOUT_MS });
    const params = buildParams(cfg.model, messages);
    const upstream = new AbortController();
    const abort = () => upstream.abort();
    req.signal?.addEventListener("abort", abort);
    const timer = setTimeout(abort, CALL_TIMEOUT_MS);
    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            let open = true;
            const emit = (e: AgentEvent) => {
                if (!open) return;
                try {
                    controller.enqueue(encoder.encode(`${JSON.stringify(e)}\n`));
                } catch {
                    open = false;
                }
            };
            const result = await streamTurn({ client: client as Anthropic, params, signal: upstream.signal, emit });
            clearTimeout(timer);
            req.signal?.removeEventListener("abort", abort);
            try {
                await recordSpend(store, result.cost);
            } catch {
                console.error("[agent] could not record spend");
            }
            if (open) {
                open = false;
                try {
                    controller.close();
                } catch {
                    /* already closed by a disconnect */
                }
            }
        },
        cancel() {
            // the browser went away: stop paying for tokens nobody will read
            abort();
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "application/x-ndjson; charset=utf-8",
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
            "X-Accel-Buffering": "no",
        },
    });
}
