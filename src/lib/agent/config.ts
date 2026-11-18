/**
 * Agent configuration from the environment. Fails closed: in production every piece (API key, Turnstile,
 * session secret, Upstash) must be set or the agent is off and the site uses its scripted fallback.
 * Development fills gaps with Cloudflare's test keys, a per-process secret and an in-memory store.
 */
import { randomBytes } from "node:crypto";
import { SITE } from "@/lib/site";
import { type OriginPolicy, buildOriginPolicy } from "./origin";
import { TEST_SECRET_KEY, TEST_SITE_KEY } from "./turnstile";

export const DEFAULT_MODEL = "claude-opus-5-5";

export type AgentConfig =
    | {
          enabled: true;
          apiKey: string;
          model: string;
          turnstile: { siteKey: string; secret: string; test: boolean };
          sessionSecret: string;
          upstash: { url: string; token: string } | null;
          budgetUsd: number;
          origins: OriginPolicy;
          secureCookies: boolean;
      }
    | { enabled: false; reason: string };

type Env = Record<string, string | undefined>;

let devSecret: string | null = null;

export function readConfig(env: Env = process.env): AgentConfig {
    const prod = env.NODE_ENV === "production";
    const off = (reason: string): AgentConfig => ({ enabled: false, reason });

    if (env.AGENT_DISABLED === "1") return off("AGENT_DISABLED=1");
    const apiKey = env.CLAUDE_API_KEY?.trim();
    if (!apiKey) return off("CLAUDE_API_KEY missing");

    const model = env.CLAUDE_MODEL?.trim() || DEFAULT_MODEL;
    if (!/^claude-[a-z0-9.-]{1,60}$/.test(model)) return off("CLAUDE_MODEL invalid");

    let siteKey = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
    let secret = env.TURNSTILE_SECRET_KEY?.trim() ?? "";
    let test = false;
    if (!siteKey || !secret) {
        if (prod) return off("Turnstile keys missing");
        siteKey = TEST_SITE_KEY;
        secret = TEST_SECRET_KEY;
        test = true;
    }
    if (secret === TEST_SECRET_KEY) {
        if (prod) return off("Turnstile test secret in production");
        test = true;
    }

    let sessionSecret = env.AGENT_SESSION_SECRET?.trim() ?? "";
    if (sessionSecret.length < 32) {
        if (prod) return off("AGENT_SESSION_SECRET missing or shorter than 32 characters");
        sessionSecret = devSecret ??= randomBytes(32).toString("hex");
    }

    // Upstash installed through the Vercel Marketplace names these KV_REST_API_*
    const url = (env.UPSTASH_REDIS_REST_URL ?? env.KV_REST_API_URL)?.trim();
    const token = (env.UPSTASH_REDIS_REST_TOKEN ?? env.KV_REST_API_TOKEN)?.trim();
    const upstash = url && token ? { url, token } : null;
    if (!upstash && prod) return off("Upstash Redis missing");

    const budget = Number(env.AGENT_DAILY_BUDGET_USD ?? "1.5");
    const budgetUsd = Number.isFinite(budget) && budget >= 0 ? budget : 1.5;

    return {
        enabled: true,
        apiKey,
        model,
        turnstile: { siteKey, secret, test },
        sessionSecret,
        upstash,
        budgetUsd,
        origins: buildOriginPolicy(SITE.url, env),
        secureCookies: prod,
    };
}
