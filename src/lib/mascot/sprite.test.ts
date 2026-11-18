import { describe, expect, it } from "vitest";
import { BANG, FRAMES, SIZE, toPaths } from "@/lib/mascot-sprite";

describe("mascot sprite", () => {
    it("every frame is SIZE x SIZE using only c/f/e/.", () => {
        for (const [name, frame] of Object.entries(FRAMES)) {
            expect(frame, name).toHaveLength(SIZE);
            for (const row of frame) expect(row, name).toMatch(new RegExp(`^[cfe.]{${SIZE}}$`));
        }
        for (const row of BANG) expect(row).toMatch(/^[c.]+$/);
    });

    it("idle has two open eyes and a shine; blink half-closes them", () => {
        const count = (f: string[], ch: string) => f.join("").split(ch).length - 1;
        expect(count(FRAMES.idle, "f")).toBe(4);
        expect(count(FRAMES.blink, "f")).toBe(2);
        expect(count(FRAMES.talk, "f")).toBe(6);
        expect(count(FRAMES.idle, "e")).toBe(1);
    });

    it("walk frames differ (leg cycle)", () => {
        expect(FRAMES.walk1).not.toEqual(FRAMES.walk2);
    });

    it("toPaths emits one unit square per pixel, per colour", () => {
        const p = toPaths(["c.", "fe"]);
        expect(p.brand).toBe("M0 0h1v1h-1z");
        expect(p.visor).toBe("M0 1h1v1h-1z");
        expect(p.eye).toBe("M1 1h1v1h-1z");
        const idle = toPaths(FRAMES.idle);
        const pixels = FRAMES.idle.join("").replace(/\./g, "").length;
        expect((idle.brand + idle.visor + idle.eye).match(/M/g)).toHaveLength(pixels);
    });
});

describe("mascot faces (play, drag, drop)", () => {
    const count = (f: string[], ch: string) => f.join("").split(ch).length - 1;
    const faces = ["happy", "wink", "dizzy", "surprised", "surprised2"] as const;

    it("each face differs from idle and keeps the body (shine, legs)", () => {
        for (const n of faces) {
            expect(FRAMES[n], n).not.toEqual(FRAMES.idle);
            expect(count(FRAMES[n], "e"), n).toBe(1);
            expect(FRAMES[n][10], n).toBe(FRAMES.idle[10]);
        }
    });

    it("dizzy has x x eyes (5 dark pixels per eye) and surprised kicks its legs", () => {
        const eyes = FRAMES.dizzy.slice(4, 7).join("");
        expect(eyes.split("f").length - 1).toBe(10);
        expect(FRAMES.surprised).not.toEqual(FRAMES.surprised2);
        expect(FRAMES.surprised.slice(0, 11)).toEqual(FRAMES.surprised2.slice(0, 11));
    });
});
