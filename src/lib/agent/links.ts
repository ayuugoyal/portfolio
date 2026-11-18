/**
 * Turning a model reply into safe pieces: plain text, and links only to URLs on an allow-list built from the
 * site content (served by GET /api/agent/session). A URL the model made up stays plain text. Pure TS.
 */

const URL_RE = /https?:\/\/[^\s<>"'`)\]]+/g;
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const TRAIL = /[.,;:!?'"]+$/;

/** URLs in a text, without trailing punctuation. */
export function extractUrls(text: string): string[] {
    return (text.match(URL_RE) ?? []).map((u) => u.replace(TRAIL, ""));
}

export type Piece = { kind: "text"; text: string } | { kind: "link"; text: string; href: string; internal: boolean };

const norm = (u: string) => u.replace(/\/$/, "");

/**
 * Split `text` into plain pieces and allowed links. Site URLs (any of `siteOrigins`) become internal links
 * (path + hash); other allowed URLs open in a new tab; an allowed email becomes a mailto link.
 */
export function linkify(text: string, allowed: ReadonlySet<string>, siteOrigins: readonly string[]): Piece[] {
    const allow = new Set(Array.from(allowed, norm));
    const pieces: Piece[] = [];
    const re = new RegExp(`${URL_RE.source}|${EMAIL_RE.source}`, "g");
    let last = 0;
    for (let m = re.exec(text); m; m = re.exec(text)) {
        let raw = m[0];
        const trail = raw.match(TRAIL)?.[0] ?? "";
        raw = raw.slice(0, raw.length - trail.length);
        const start = m.index;
        const end = start + raw.length;
        let piece: Piece | null = null;
        if (raw.includes("://")) {
            let url: URL | null = null;
            try {
                url = new URL(raw);
            } catch {
                url = null;
            }
            if (url) {
                const site = siteOrigins.includes(url.origin);
                const canonical = site ? `${siteOrigins[0]}${url.pathname}${url.hash}` : raw;
                if (allow.has(norm(canonical)) || allow.has(norm(raw)))
                    piece = site
                        ? { kind: "link", text: raw, href: `${url.pathname}${url.hash}` || "/", internal: true }
                        : { kind: "link", text: raw, href: raw, internal: false };
            }
        } else if (allow.has(`mailto:${raw}`)) {
            piece = { kind: "link", text: raw, href: `mailto:${raw}`, internal: false };
        }
        if (!piece) continue;
        if (start > last) pieces.push({ kind: "text", text: text.slice(last, start) });
        pieces.push(piece);
        last = end;
    }
    if (last < text.length) pieces.push({ kind: "text", text: text.slice(last) });
    return pieces;
}
