/**
 * Which browser origins may call /api/agent. Pure TS.
 * Production: the site (www and apex). Previews: only this deployment's own Vercel hosts, and only when
 * AGENT_ALLOW_PREVIEWS=1. Development: localhost / 127.0.0.1 on any port.
 */

export type OriginPolicy = { allowed: string[]; dev: boolean };

const originOf = (url: string | null | undefined): string | null => {
    if (!url || url === "null") return null;
    try {
        const u = new URL(url);
        if (u.protocol !== "https:" && u.protocol !== "http:") return null;
        return u.origin;
    } catch {
        return null;
    }
};

/** The site's origin plus its www / non-www twin. */
export function siteOrigins(siteUrl: string): string[] {
    const u = new URL(siteUrl);
    const host = u.hostname.startsWith("www.") ? u.hostname.slice(4) : `www.${u.hostname}`;
    return [u.origin, `${u.protocol}//${host}`];
}

export function buildOriginPolicy(
    siteUrl: string,
    env: { NODE_ENV?: string; AGENT_ALLOW_PREVIEWS?: string; VERCEL_URL?: string; VERCEL_BRANCH_URL?: string }
): OriginPolicy {
    const allowed = siteOrigins(siteUrl);
    if (env.AGENT_ALLOW_PREVIEWS === "1") {
        for (const host of [env.VERCEL_URL, env.VERCEL_BRANCH_URL]) {
            if (host && /^[a-z0-9.-]+\.vercel\.app$/i.test(host)) allowed.push(`https://${host.toLowerCase()}`);
        }
    }
    return { allowed, dev: env.NODE_ENV !== "production" };
}

/** Origin header first; if the browser sent none, the Referer's origin. Neither: rejected. */
export function isAllowedOrigin(origin: string | null, referer: string | null, policy: OriginPolicy): boolean {
    const o = originOf(origin) ?? originOf(referer);
    if (!o) return false;
    if (policy.allowed.includes(o)) return true;
    if (policy.dev) {
        const u = new URL(o);
        return u.protocol === "http:" && (u.hostname === "localhost" || u.hostname === "127.0.0.1");
    }
    return false;
}

/** Hostnames the Turnstile token may have been solved on (production check). */
export const allowedHostnames = (policy: OriginPolicy): string[] => policy.allowed.map((o) => new URL(o).hostname);
