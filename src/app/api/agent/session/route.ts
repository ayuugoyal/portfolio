import { agentEnv, clientIp, fail, isJson, json, originOk, readCapped } from "@/lib/agent/http";
import { RULES } from "@/lib/agent/limits";
import { ALLOWED_LINKS } from "@/lib/agent/prompt";
import { allowedHostnames, siteOrigins } from "@/lib/agent/origin";
import type { AgentStatus } from "@/lib/agent/protocol";
import { SESSION_COOKIE, idHash, readCookie, sessionCookie, signSession, verifySession } from "@/lib/agent/session";
import { verifyTurnstile } from "@/lib/agent/turnstile";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Is the live agent on, which Turnstile site key to use, and does this browser already hold a session? */
export async function GET(req: Request) {
    const { cfg } = agentEnv();
    if (!cfg.enabled) return json({ enabled: false, siteKey: null, session: false, links: [], origins: [] } satisfies AgentStatus);
    const session = verifySession(cfg.sessionSecret, readCookie(req.headers.get("cookie"), SESSION_COOKIE), clientIp(req));
    return json({
        enabled: true,
        siteKey: cfg.turnstile.siteKey,
        session: session !== null,
        links: ALLOWED_LINKS,
        origins: siteOrigins(SITE.url),
    } satisfies AgentStatus);
}

/** Exchange a Turnstile token for a 30-minute session cookie bound to this IP. */
export async function POST(req: Request) {
    const { cfg, store } = agentEnv();
    if (!cfg.enabled || !store) return fail("unavailable");
    if (!originOk(req, cfg)) return fail("origin");
    if (!isJson(req)) return fail("bad_request");
    const raw = await readCapped(req, 4096);
    if (raw === null) return fail("too_large");
    let token: unknown;
    try {
        token = (JSON.parse(raw) as { token?: unknown }).token;
    } catch {
        return fail("bad_request");
    }
    if (typeof token !== "string" || !token || token.length > 2048) return fail("bad_request");

    const ip = clientIp(req);
    try {
        if (!(await store.hit(RULES.sessionCreate, idHash(cfg.sessionSecret, "ip", ip)))) return fail("limit");
    } catch {
        console.error("[agent] store unavailable");
        return fail("unavailable");
    }
    const ok = await verifyTurnstile({
        secret: cfg.turnstile.secret,
        token,
        ip,
        hostnames: cfg.turnstile.test ? undefined : allowedHostnames(cfg.origins),
    });
    if (!ok) return fail("turnstile");

    const { value } = signSession(cfg.sessionSecret, ip);
    return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(value, cfg.secureCookies) });
}
