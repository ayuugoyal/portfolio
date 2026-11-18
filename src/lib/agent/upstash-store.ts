/** Production store: Upstash Redis (sliding-window limits via @upstash/ratelimit, spend via INCRBYFLOAT). */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { AgentStore, Rule } from "./limits";

const PREFIX = "agent";

export class UpstashStore implements AgentStore {
    private redis: Redis;
    private limiters = new Map<string, Ratelimit>();

    constructor(url: string, token: string) {
        this.redis = new Redis({ url, token });
    }

    private limiter(rule: Rule): Ratelimit {
        let rl = this.limiters.get(rule.name);
        if (!rl) {
            rl = new Ratelimit({
                redis: this.redis,
                limiter: Ratelimit.slidingWindow(rule.max, `${Math.round(rule.windowMs / 1000)} s`),
                prefix: `${PREFIX}:rl:${rule.name}`,
                analytics: false,
                // fail closed: a Redis timeout counts as over the limit, not as a free pass
                timeout: 0,
            });
            this.limiters.set(rule.name, rl);
        }
        return rl;
    }

    async hit(rule: Rule, id: string): Promise<boolean> {
        const r = await this.limiter(rule).limit(id);
        return r.success;
    }

    async addSpend(day: string, usd: number): Promise<void> {
        const key = `${PREFIX}:spend:${day}`;
        await this.redis.incrbyfloat(key, usd);
        await this.redis.expire(key, 3 * 24 * 3600);
    }

    async getSpend(day: string): Promise<number> {
        const v = await this.redis.get<number | string>(`${PREFIX}:spend:${day}`);
        const n = typeof v === "number" ? v : Number(v ?? 0);
        return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
    }
}
