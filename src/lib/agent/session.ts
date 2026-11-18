/**
 * The agent session cookie: issued after a passed Turnstile check, HMAC-SHA256 signed, valid 30 minutes and
 * bound to a hash of the client IP (a copied cookie is useless from another network). Node crypto only.
 */
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "agent_sess";
export const SESSION_TTL_S = 30 * 60;
/** The cookie is only sent to the agent routes. */
export const SESSION_PATH = "/api/agent";

export type Session = { sid: string; exp: number };

const b64 = (b: Buffer | string) => Buffer.from(b).toString("base64url");
const mac = (secret: string, data: string) => createHmac("sha256", secret).update(data).digest();

/** Keyed hash of the client IP: never stored or sent in the clear. */
export const ipHash = (secret: string, ip: string): string =>
    createHmac("sha256", secret).update(`ip:${ip}`).digest("base64url").slice(0, 22);

/** Stable id for rate-limit keys (an IP is personal data; Redis gets a hash). */
export const idHash = (secret: string, kind: string, value: string): string =>
    createHash("sha256").update(`${secret}:${kind}:${value}`).digest("base64url").slice(0, 32);

export function signSession(secret: string, ip: string, now = Date.now()): { value: string; session: Session } {
    const session: Session = { sid: randomBytes(16).toString("base64url"), exp: Math.floor(now / 1000) + SESSION_TTL_S };
    const payload = b64(JSON.stringify({ v: 1, sid: session.sid, exp: session.exp, ip: ipHash(secret, ip) }));
    return { value: `${payload}.${b64(mac(secret, payload))}`, session };
}

export function verifySession(secret: string, value: string | null | undefined, ip: string, now = Date.now()): Session | null {
    if (!value || value.length > 512) return null;
    const dot = value.indexOf(".");
    if (dot <= 0 || dot !== value.lastIndexOf(".")) return null;
    const payload = value.slice(0, dot);
    const sig = Buffer.from(value.slice(dot + 1), "base64url");
    const want = mac(secret, payload);
    if (sig.length !== want.length || !timingSafeEqual(sig, want)) return null;
    let data: unknown;
    try {
        data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    } catch {
        return null;
    }
    if (typeof data !== "object" || data === null) return null;
    const { v, sid, exp, ip: iph } = data as Record<string, unknown>;
    if (v !== 1 || typeof sid !== "string" || typeof exp !== "number" || typeof iph !== "string") return null;
    if (exp <= Math.floor(now / 1000)) return null;
    const a = Buffer.from(iph);
    const b = Buffer.from(ipHash(secret, ip));
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return { sid, exp };
}

export function sessionCookie(value: string, secure: boolean): string {
    return [
        `${SESSION_COOKIE}=${value}`,
        `Path=${SESSION_PATH}`,
        `Max-Age=${SESSION_TTL_S}`,
        "HttpOnly",
        "SameSite=Strict",
        ...(secure ? ["Secure"] : []),
    ].join("; ");
}

/** Read one cookie from a Cookie header. */
export function readCookie(header: string | null, name: string): string | null {
    if (!header) return null;
    for (const part of header.split(";")) {
        const i = part.indexOf("=");
        if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
    }
    return null;
}
