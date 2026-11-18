import { describe, expect, it } from "vitest";
import { chunks, toSpeakable } from "@/lib/voice/speech";

describe("voice text", () => {
    it("drops tool lines, links and markdown", () => {
        const t = toSpeakable('Sure.\n⏺ gesture(name="wave")\n⎿ Did it\nSee **[robots](https://ayuugoyal.tech/robotics)** or https://x.y/z.');
        expect(t).toBe("Sure. See robots or");
    });

    it("splits long text into sentence-sized pieces", () => {
        const long = "word ".repeat(100).trim() + ". Short one.";
        const parts = chunks(long, 180);
        expect(parts.every((p) => p.length <= 180)).toBe(true);
        expect(parts[parts.length - 1]).toBe("Short one.");
    });
});
