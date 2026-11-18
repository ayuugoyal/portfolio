/** Server-side Cloudflare Turnstile verification. */

export const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
/** Cloudflare's documented always-pass test keys (development only). */
export const TEST_SITE_KEY = "1x00000000000000000000AA";
export const TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

type Fetch = (input: string, init: RequestInit) => Promise<Response>;

/**
 * True only when Cloudflare says the token is valid (and, outside test mode, was solved on one of our
 * hostnames). Any network or parse problem is a failure.
 */
export async function verifyTurnstile(
    opts: { secret: string; token: string; ip?: string; hostnames?: string[] },
    fetchImpl: Fetch = fetch
): Promise<boolean> {
    if (!opts.token || opts.token.length > 2048) return false;
    const form = new URLSearchParams({ secret: opts.secret, response: opts.token });
    if (opts.ip && opts.ip !== "unknown") form.set("remoteip", opts.ip);
    try {
        const res = await fetchImpl(SITEVERIFY, {
            method: "POST",
            body: form,
            signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) return false;
        const data = (await res.json()) as { success?: unknown; hostname?: unknown };
        if (data.success !== true) return false;
        if (opts.hostnames && (typeof data.hostname !== "string" || !opts.hostnames.includes(data.hostname))) return false;
        return true;
    } catch {
        return false;
    }
}
