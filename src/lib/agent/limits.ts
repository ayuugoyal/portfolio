/**
 * Rate limits and the global daily spend cap, over a small store interface:
 * Upstash Redis in production (upstash-store.ts), an in-memory store in development and tests.
 */

export type Rule = { name: string; max: number; windowMs: number };

export interface AgentStore {
    /** Count one hit for `id` under `rule`; false when the sliding window is already full. */
    hit(rule: Rule, id: string): Promise<boolean>;
    /** Add to a day's spend (USD). */
    addSpend(day: string, usd: number): Promise<void>;
    /** A day's spend so far (USD). */
    getSpend(day: string): Promise<number>;
}

const MIN = 60_000;
export const RULES = {
    /** per IP: each model call counts, including every round of a tool loop */
    ipBurst: { name: "ip10m", max: 12, windowMs: 10 * MIN },
    ipDay: { name: "ipday", max: 60, windowMs: 24 * 60 * MIN },
    /** per session cookie (30 minutes) */
    session: { name: "sess", max: 40, windowMs: 30 * MIN },
    /** new sessions (Turnstile verifications) per IP */
    sessionCreate: { name: "mksess", max: 6, windowMs: 10 * MIN },
} as const satisfies Record<string, Rule>;

/** UTC day key, e.g. "2026-11-18". */
export const dayKey = (now = Date.now()): string => new Date(now).toISOString().slice(0, 10);

export type Gate = { ok: true } | { ok: false; code: "limit" | "budget" };

/**
 * Before a model call: refuse when today's spend has reached the budget, then count the call against the
 * per-IP and per-session windows (all are counted, so a refused call still uses a slot).
 */
export async function gateModelCall(
    store: AgentStore,
    ids: { ip: string; session: string },
    budgetUsd: number,
    now = Date.now()
): Promise<Gate> {
    if ((await store.getSpend(dayKey(now))) >= budgetUsd) return { ok: false, code: "budget" };
    const results = await Promise.all([
        store.hit(RULES.ipBurst, ids.ip),
        store.hit(RULES.ipDay, ids.ip),
        store.hit(RULES.session, ids.session),
    ]);
    return results.every(Boolean) ? { ok: true } : { ok: false, code: "limit" };
}

/** After a model call: add its cost to today's total. */
export async function recordSpend(store: AgentStore, usd: number, now = Date.now()): Promise<void> {
    if (usd > 0 && Number.isFinite(usd)) await store.addSpend(dayKey(now), usd);
}

/** Sliding-window log in memory. Development / tests only (one serverless instance would not share it). */
export class MemoryStore implements AgentStore {
    private hits = new Map<string, number[]>();
    private spend = new Map<string, number>();

    constructor(private clock: () => number = Date.now) {}

    async hit(rule: Rule, id: string): Promise<boolean> {
        const key = `${rule.name}:${id}`;
        const now = this.clock();
        const log = (this.hits.get(key) ?? []).filter((t) => t > now - rule.windowMs);
        const ok = log.length < rule.max;
        if (ok) log.push(now);
        this.hits.set(key, log);
        return ok;
    }

    async addSpend(day: string, usd: number): Promise<void> {
        this.spend.set(day, (this.spend.get(day) ?? 0) + usd);
    }

    async getSpend(day: string): Promise<number> {
        return this.spend.get(day) ?? 0;
    }
}
