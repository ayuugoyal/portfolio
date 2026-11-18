import { describe, expect, it } from "vitest";
import { readConfig } from "./config";
import { costUsd, priceOf } from "./cost";
import { MemoryStore, RULES, dayKey, gateModelCall, recordSpend } from "./limits";
import { buildOriginPolicy, isAllowedOrigin, siteOrigins } from "./origin";
import { SESSION_TTL_S, readCookie, sessionCookie, signSession, verifySession } from "./session";
import { TEST_SECRET_KEY, verifyTurnstile } from "./turnstile";

const SITE = "https://www.ayuugoyal.tech";

describe("origin check", () => {
    const prod = buildOriginPolicy(SITE, { NODE_ENV: "production" });
    const dev = buildOriginPolicy(SITE, { NODE_ENV: "development" });

    it("allows the site, www and apex", () => {
        expect(siteOrigins(SITE)).toEqual(["https://www.ayuugoyal.tech", "https://ayuugoyal.tech"]);
        expect(isAllowedOrigin("https://www.ayuugoyal.tech", null, prod)).toBe(true);
        expect(isAllowedOrigin("https://ayuugoyal.tech", null, prod)).toBe(true);
        expect(isAllowedOrigin(null, "https://ayuugoyal.tech/robotics?x=1", prod)).toBe(true);
    });

    it("rejects everything else in production", () => {
        for (const o of [
            "https://evil.example",
            "https://www.ayuugoyal.tech.evil.example",
            "http://www.ayuugoyal.tech",
            "http://localhost:3000",
            "https://ayuugoyal-git-x.vercel.app",
            "null",
        ])
            expect(isAllowedOrigin(o, null, prod)).toBe(false);
        expect(isAllowedOrigin(null, null, prod)).toBe(false);
        // a bad Origin is not rescued by a good Referer
        expect(isAllowedOrigin("https://evil.example", "https://www.ayuugoyal.tech/", prod)).toBe(false);
    });

    it("allows localhost only in development", () => {
        expect(isAllowedOrigin("http://localhost:3140", null, dev)).toBe(true);
        expect(isAllowedOrigin("http://127.0.0.1:3000", null, dev)).toBe(true);
        expect(isAllowedOrigin("http://192.168.1.5:3000", null, dev)).toBe(false);
    });

    it("allows this deployment's Vercel hosts only when previews are on", () => {
        const env = { NODE_ENV: "production", VERCEL_URL: "portfolio-abc123.vercel.app", VERCEL_BRANCH_URL: "portfolio-git-x.vercel.app" };
        expect(isAllowedOrigin("https://portfolio-abc123.vercel.app", null, buildOriginPolicy(SITE, env))).toBe(false);
        const on = buildOriginPolicy(SITE, { ...env, AGENT_ALLOW_PREVIEWS: "1" });
        expect(isAllowedOrigin("https://portfolio-abc123.vercel.app", null, on)).toBe(true);
        expect(isAllowedOrigin("https://portfolio-git-x.vercel.app", null, on)).toBe(true);
        expect(isAllowedOrigin("https://someone-else.vercel.app", null, on)).toBe(false);
    });
});

describe("cost", () => {
    it("prices Opus 5.5 input, cache write, cache read and output", () => {
        const usd = costUsd(
            { input_tokens: 1_000_000, cache_creation_input_tokens: 1_000_000, cache_read_input_tokens: 1_000_000, output_tokens: 1_000_000 },
            "claude-opus-5-5"
        );
        expect(usd).toBeCloseTo(4 + 5 + 0.2 + 20, 6);
    });

    it("prices Haiku and Sonnet 5.5, and unknown models at the worst case", () => {
        expect(costUsd({ input_tokens: 1e6, output_tokens: 1e6 }, "claude-haiku-5-5")).toBeCloseTo(0.6, 6);
        expect(costUsd({ input_tokens: 1e6, output_tokens: 1e6 }, "claude-sonnet-5-5")).toBeCloseTo(12, 6);
        expect(priceOf("claude-mystery-9")).toEqual(priceOf(null));
        expect(costUsd({ input_tokens: 1e6 }, "claude-mystery-9")).toBeCloseTo(5, 6);
        expect(costUsd(null, "claude-opus-5-5")).toBe(0);
    });

    it("prices each iteration at its own model when a fallback ran", () => {
        const usd = costUsd(
            {
                input_tokens: 2e6,
                output_tokens: 2e6,
                iterations: [
                    { type: "message", model: "claude-opus-5-5", input_tokens: 1e6, output_tokens: 0 },
                    { type: "fallback_message", model: "claude-opus-4-8", input_tokens: 1e6, output_tokens: 1e6 },
                ],
            },
            "claude-opus-5-5"
        );
        expect(usd).toBeCloseTo(4 + 5 + 25, 6);
    });
});

describe("rate limits and budget", () => {
    it("sliding window per id, independent ids, reopens after the window", async () => {
        let now = 0;
        const store = new MemoryStore(() => now);
        const rule = { name: "t", max: 3, windowMs: 1000 };
        for (let i = 0; i < 3; i++) expect(await store.hit(rule, "a")).toBe(true);
        expect(await store.hit(rule, "a")).toBe(false);
        expect(await store.hit(rule, "b")).toBe(true);
        now = 1001;
        expect(await store.hit(rule, "a")).toBe(true);
    });

    it("blocks after 12 calls per IP in 10 minutes", async () => {
        let now = Date.UTC(2026, 10, 18, 12);
        const store = new MemoryStore(() => now);
        let ok = 0;
        for (let i = 0; i < 20; i++) if ((await gateModelCall(store, { ip: "ip1", session: `s${i}` }, 1.5, now)).ok) ok++;
        expect(ok).toBe(RULES.ipBurst.max);
        now += RULES.ipBurst.windowMs + 1;
        expect((await gateModelCall(store, { ip: "ip1", session: "s" }, 1.5, now)).ok).toBe(true);
    });

    it("refuses every call once today's spend reaches the budget, and resets the next UTC day", async () => {
        const day = Date.UTC(2026, 10, 18, 23, 59);
        const store = new MemoryStore(() => day);
        await recordSpend(store, 1.2, day);
        expect((await gateModelCall(store, { ip: "a", session: "s" }, 1.5, day)).ok).toBe(true);
        await recordSpend(store, 0.31, day);
        expect(await store.getSpend(dayKey(day))).toBeCloseTo(1.51, 6);
        expect(await gateModelCall(store, { ip: "b", session: "t" }, 1.5, day)).toEqual({ ok: false, code: "budget" });
        const tomorrow = day + 2 * 60_000;
        expect(dayKey(tomorrow)).toBe("2026-11-19");
        expect((await gateModelCall(store, { ip: "b", session: "t" }, 1.5, tomorrow)).ok).toBe(true);
    });

    it("ignores bogus spend values", async () => {
        const store = new MemoryStore();
        await recordSpend(store, Number.NaN);
        await recordSpend(store, -1);
        expect(await store.getSpend(dayKey())).toBe(0);
    });
});

describe("session cookie", () => {
    const secret = "s".repeat(40);
    const t0 = Date.UTC(2026, 10, 18, 12);

    it("verifies a fresh cookie from the same IP", () => {
        const { value, session } = signSession(secret, "1.2.3.4", t0);
        expect(verifySession(secret, value, "1.2.3.4", t0 + 1000)).toEqual(session);
    });

    it("rejects another IP, expiry, tampering and a different secret", () => {
        const { value } = signSession(secret, "1.2.3.4", t0);
        expect(verifySession(secret, value, "5.6.7.8", t0)).toBeNull();
        expect(verifySession(secret, value, "1.2.3.4", t0 + SESSION_TTL_S * 1000)).toBeNull();
        expect(verifySession("x".repeat(40), value, "1.2.3.4", t0)).toBeNull();
        const [payload, sig] = value.split(".");
        const forged = Buffer.from(
            JSON.stringify({ ...JSON.parse(Buffer.from(payload, "base64url").toString()), exp: 9_999_999_999 })
        ).toString("base64url");
        expect(verifySession(secret, `${forged}.${sig}`, "1.2.3.4", t0)).toBeNull();
        for (const bad of [null, "", "abc", "a.b.c", `${payload}.`, "x".repeat(600)])
            expect(verifySession(secret, bad, "1.2.3.4", t0)).toBeNull();
    });

    it("sets HttpOnly, SameSite=Strict, a narrow path, and Secure in production", () => {
        const c = sessionCookie("v", true);
        expect(c).toContain("HttpOnly");
        expect(c).toContain("SameSite=Strict");
        expect(c).toContain("Path=/api/agent");
        expect(c).toContain("Max-Age=1800");
        expect(c).toContain("Secure");
        expect(sessionCookie("v", false)).not.toContain("Secure");
        expect(readCookie("a=1; agent_sess=xyz.abc; b=2", "agent_sess")).toBe("xyz.abc");
        expect(readCookie(null, "agent_sess")).toBeNull();
    });
});

describe("config fails closed", () => {
    const full = {
        NODE_ENV: "production",
        CLAUDE_API_KEY: "k",
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: "site",
        TURNSTILE_SECRET_KEY: "secret",
        AGENT_SESSION_SECRET: "z".repeat(32),
        UPSTASH_REDIS_REST_URL: "https://x.upstash.io",
        UPSTASH_REDIS_REST_TOKEN: "t",
    };

    it("is on in production only with everything set", () => {
        const cfg = readConfig(full);
        expect(cfg.enabled).toBe(true);
        if (cfg.enabled) {
            expect(cfg.model).toBe("claude-opus-5-5");
            expect(cfg.budgetUsd).toBe(1.5);
            expect(cfg.secureCookies).toBe(true);
            expect(cfg.turnstile.test).toBe(false);
        }
        for (const k of ["CLAUDE_API_KEY", "TURNSTILE_SECRET_KEY", "NEXT_PUBLIC_TURNSTILE_SITE_KEY", "AGENT_SESSION_SECRET", "UPSTASH_REDIS_REST_URL"]) {
            expect(readConfig({ ...full, [k]: undefined }).enabled).toBe(false);
        }
        expect(readConfig({ ...full, AGENT_SESSION_SECRET: "short" }).enabled).toBe(false);
        expect(readConfig({ ...full, TURNSTILE_SECRET_KEY: TEST_SECRET_KEY }).enabled).toBe(false);
        expect(readConfig({ ...full, AGENT_DISABLED: "1" }).enabled).toBe(false);
        expect(readConfig({ ...full, CLAUDE_MODEL: "gpt; rm -rf" }).enabled).toBe(false);
    });

    it("fills development gaps with test keys and memory", () => {
        const cfg = readConfig({ NODE_ENV: "development", CLAUDE_API_KEY: "k", AGENT_DAILY_BUDGET_USD: "0.5", CLAUDE_MODEL: "claude-haiku-5-5" });
        expect(cfg.enabled).toBe(true);
        if (cfg.enabled) {
            expect(cfg.turnstile.test).toBe(true);
            expect(cfg.upstash).toBeNull();
            expect(cfg.budgetUsd).toBe(0.5);
            expect(cfg.model).toBe("claude-haiku-5-5");
            expect(cfg.secureCookies).toBe(false);
        }
        expect(readConfig({ NODE_ENV: "development" }).enabled).toBe(false);
    });
});

describe("turnstile", () => {
    const reply = (body: unknown, ok = true) => async () => new Response(JSON.stringify(body), { status: ok ? 200 : 500 });

    it("passes only on success from Cloudflare (and our hostname outside test mode)", async () => {
        expect(await verifyTurnstile({ secret: "s", token: "t" }, reply({ success: true }))).toBe(true);
        expect(await verifyTurnstile({ secret: "s", token: "t" }, reply({ success: false }))).toBe(false);
        expect(await verifyTurnstile({ secret: "s", token: "t" }, reply({ success: true }, false))).toBe(false);
        expect(
            await verifyTurnstile({ secret: "s", token: "t", hostnames: ["www.ayuugoyal.tech"] }, reply({ success: true, hostname: "evil.example" }))
        ).toBe(false);
        expect(
            await verifyTurnstile({ secret: "s", token: "t", hostnames: ["www.ayuugoyal.tech"] }, reply({ success: true, hostname: "www.ayuugoyal.tech" }))
        ).toBe(true);
        expect(await verifyTurnstile({ secret: "s", token: "" }, reply({ success: true }))).toBe(false);
        expect(
            await verifyTurnstile({ secret: "s", token: "t" }, async () => {
                throw new Error("network");
            })
        ).toBe(false);
    });
});
