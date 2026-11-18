import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Guards the colour tokens in globals.css: every text/background pair the site
 * relies on must pass WCAG AA (4.5:1) in both themes.
 */
const css = readFileSync(
    fileURLToPath(new URL("../app/globals.css", import.meta.url)),
    "utf8"
);

/** Pull `--name: H S% L%;` declarations out of the first block that opens with `selector {`. */
function tokens(selector: string): Record<string, [number, number, number]> {
    const start = css.indexOf(`${selector} {`);
    if (start === -1) throw new Error(`no ${selector} block in globals.css`);
    const body = css.slice(start, css.indexOf("}", start));
    const out: Record<string, [number, number, number]> = {};
    const re = /--([\w-]+):\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*;/g;
    for (const m of Array.from(body.matchAll(re))) {
        out[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
    }
    return out;
}

function hslToRgb([h, s, l]: [number, number, number]): [number, number, number] {
    const sat = s / 100;
    const lig = l / 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = sat * Math.min(lig, 1 - lig);
    const f = (n: number) => lig - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [f(0), f(8), f(4)];
}

function luminance(hsl: [number, number, number]): number {
    const [r, g, b] = hslToRgb(hsl).map((c) =>
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}

const PAIRS: [fg: string, bg: string][] = [
    ["foreground", "background"],
    ["muted-foreground", "background"],
    ["muted-foreground", "muted"],
    ["brand-ink", "background"],
    ["brand-ink", "card"],
];

describe("contrast helpers", () => {
    it("matches known WCAG values", () => {
        expect(contrast([0, 0, 0], [0, 0, 100])).toBeCloseTo(21, 5);
        expect(contrast([0, 0, 50], [0, 0, 50])).toBeCloseTo(1, 5);
    });
});

for (const [theme, selector] of [
    ["light", ":root"],
    ["dark", ".dark"],
] as const) {
    describe(`${theme} theme tokens`, () => {
        const t = tokens(selector);
        for (const [fg, bg] of PAIRS) {
            it(`${fg} on ${bg} passes AA (>= 4.5)`, () => {
                expect(t[fg], `--${fg} missing`).toBeDefined();
                expect(t[bg], `--${bg} missing`).toBeDefined();
                expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
            });
        }
    });
}
