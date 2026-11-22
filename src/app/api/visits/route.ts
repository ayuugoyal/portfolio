import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import { clientIp, json } from "@/lib/agent/http";
import { buildOriginPolicy, isAllowedOrigin } from "@/lib/agent/origin";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COUNT_KEY = "visits:home";
const DAY = 60 * 60 * 24;

let redis: Redis | null | undefined;
function getRedis(): Redis | null {
    if (redis !== undefined) return redis;
    // Upstash installed through the Vercel Marketplace names these KV_REST_API_*
    const url = (process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL)?.trim();
    const token = (process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN)?.trim();
    redis = url && token ? new Redis({ url, token }) : null;
    return redis;
}

const unavailable = () => json({ count: null }, 503);

/** The current count. */
export async function GET() {
    const r = getRedis();
    if (!r) return unavailable();
    try {
        return json({ count: Number((await r.get<number>(COUNT_KEY)) ?? 0) });
    } catch {
        return unavailable();
    }
}

/** Count this visitor (once per IP per day, so reloads and scripted calls can't inflate it), then return the count. */
export async function POST(req: Request) {
    const r = getRedis();
    if (!r) return unavailable();
    const policy = buildOriginPolicy(SITE.url, process.env);
    if (!isAllowedOrigin(req.headers.get("origin"), req.headers.get("referer"), policy)) return json({ count: null }, 403);

    // an IP is personal data: Redis only ever sees a salted hash of it
    const salt = process.env.AGENT_SESSION_SECRET ?? "visits";
    const id = createHash("sha256").update(`${salt}:${clientIp(req)}`).digest("hex").slice(0, 32);
    try {
        const fresh = await r.set(`visits:seen:${id}`, 1, { nx: true, ex: DAY });
        const count = fresh ? await r.incr(COUNT_KEY) : Number((await r.get<number>(COUNT_KEY)) ?? 0);
        return json({ count });
    } catch {
        return unavailable();
    }
}
