import { describe, expect, it } from "vitest";
import { trimHistory } from "./client";
import { ALLOWED_LINKS } from "./prompt";
import type { ClientMessage } from "./protocol";
import { extractUrls, linkify } from "./links";

const ORIGINS = ["https://www.ayuugoyal.tech", "https://ayuugoyal.tech"];
const allowed = new Set(ALLOWED_LINKS);

describe("allowed links", () => {
    it("come from the site content, plus site paths and the email", () => {
        expect(ALLOWED_LINKS).toContain("https://cal.com/ayuugoyal");
        expect(ALLOWED_LINKS).toContain("https://www.ayuugoyal.tech/robotics");
        expect(ALLOWED_LINKS).toContain("https://www.ayuugoyal.tech/#arm");
        expect(ALLOWED_LINKS.some((l) => l.startsWith("mailto:"))).toBe(true);
        expect(extractUrls("see https://x.com/a, and (https://y.dev/b).")).toEqual(["https://x.com/a", "https://y.dev/b"]);
    });
});

describe("linkify", () => {
    it("links allowed URLs, internal ones as site paths", () => {
        const p = linkify("Book at https://cal.com/ayuugoyal. Demo: https://ayuugoyal.tech/robotics!", allowed, ORIGINS);
        expect(p).toEqual([
            { kind: "text", text: "Book at " },
            { kind: "link", text: "https://cal.com/ayuugoyal", href: "https://cal.com/ayuugoyal", internal: false },
            { kind: "text", text: ". Demo: " },
            { kind: "link", text: "https://ayuugoyal.tech/robotics", href: "/robotics", internal: true },
            { kind: "text", text: "!" },
        ]);
    });

    it("leaves made-up URLs and other emails as plain text", () => {
        const text = "Try https://evil.example/login or https://www.ayuugoyal.tech/admin or mail bob@evil.example";
        expect(linkify(text, allowed, ORIGINS)).toEqual([{ kind: "text", text }]);
    });

    it("links the site email as mailto", () => {
        const email = ALLOWED_LINKS.find((l) => l.startsWith("mailto:"))!.slice(7);
        const p = linkify(`email ${email}.`, allowed, ORIGINS);
        expect(p[1]).toEqual({ kind: "link", text: email, href: `mailto:${email}`, internal: false });
    });
});

describe("trimHistory", () => {
    const u = (t: string): ClientMessage => ({ role: "user", text: t, surface: "chat", arm: false, page: "/" });
    const a: ClientMessage = { role: "assistant", content: [{ type: "text", text: "ok" }] };

    it("drops whole old turns from the front until it fits", () => {
        const h = Array.from({ length: 30 }, (_, i) => (i % 2 ? a : u(`q${i}`)));
        const t = trimHistory(h, 24);
        expect(t.length).toBeLessThanOrEqual(24);
        expect(t[0].role).toBe("user");
        expect("text" in t[0]).toBe(true);
        expect(t[t.length - 1]).toBe(h[h.length - 1]);
        expect(trimHistory(h.slice(0, 4), 24)).toHaveLength(4);
    });
});
