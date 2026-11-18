/** Request helpers for the agent route handlers (standard Request/Response only). */
import { readConfig, type AgentConfig } from "./config";
import { MemoryStore, type AgentStore } from "./limits";
import { isAllowedOrigin } from "./origin";
import type { ErrorCode } from "./protocol";
import { UpstashStore } from "./upstash-store";

const NO_STORE = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json; charset=utf-8", ...NO_STORE, ...headers },
    });
}

const STATUS: Record<ErrorCode, number> = {
    unavailable: 503,
    origin: 403,
    session: 401,
    turnstile: 403,
    bad_request: 400,
    too_large: 413,
    limit: 429,
    budget: 503,
    steps: 429,
    upstream: 502,
};
export const fail = (code: ErrorCode) => json({ error: code }, STATUS[code]);

/**
 * The client IP. On Vercel the edge overwrites x-forwarded-for / x-real-ip with the real client address,
 * so they can't be spoofed there. Locally there is no proxy: everything is one "local" client.
 */
export function clientIp(req: Request): string {
    const real = req.headers.get("x-real-ip")?.trim();
    if (real) return real;
    const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    return fwd || "local";
}

export const originOk = (req: Request, cfg: Extract<AgentConfig, { enabled: true }>) =>
    isAllowedOrigin(req.headers.get("origin"), req.headers.get("referer"), cfg.origins);

export const isJson = (req: Request) => (req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json");

/** Read at most `max` bytes of the body; null when it is larger (checked before and while reading). */
export async function readCapped(req: Request, max: number): Promise<string | null> {
    const declared = Number(req.headers.get("content-length") ?? "0");
    if (declared > max) return null;
    if (!req.body) return "";
    const reader = req.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > max) {
            await reader.cancel().catch(() => {});
            return null;
        }
        chunks.push(value);
    }
    return new TextDecoder().decode(Buffer.concat(chunks));
}

let cached: { cfg: AgentConfig; store: AgentStore | null } | null = null;

/** Config + store, built once per server instance. Logs (names only) why the agent is off. */
export function agentEnv(): { cfg: AgentConfig; store: AgentStore | null } {
    if (cached) return cached;
    const cfg = readConfig();
    if (!cfg.enabled) {
        console.warn(`[agent] disabled: ${cfg.reason}`);
        cached = { cfg, store: null };
    } else {
        cached = { cfg, store: cfg.upstash ? new UpstashStore(cfg.upstash.url, cfg.upstash.token) : new MemoryStore() };
    }
    return cached;
}

/** Tests only. */
export function resetAgentEnv(): void {
    cached = null;
}
