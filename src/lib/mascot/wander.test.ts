import { describe, expect, it } from "vitest";
import { computeSegments, createWander, seededRng, type WanderLayout } from "./wander";

const desktop: WanderLayout = {
    strip: { left: 16, right: 1264 },
    blocked: [{ left: 400, right: 880 }],
    gap: 16,
    width: 48,
};

function clock(start = 0) {
    let t = start;
    return { now: () => t, advance: (ms: number) => (t += ms) };
}

/** Runs the wander at 60 fps for `ms`, calling `check` after every frame. */
function run(w: ReturnType<typeof createWander>, c: ReturnType<typeof clock>, ms: number, check?: () => void) {
    for (let i = 0; i < ms / 16; i++) {
        c.advance(16);
        w.tick();
        check?.();
    }
}

function insideAllowed(x: number, layout: WanderLayout) {
    const inStrip = x >= layout.strip.left && x + layout.width <= layout.strip.right;
    const clear = layout.blocked.every(
        (b) => x + layout.width <= b.left - layout.gap || x >= b.right + layout.gap,
    );
    return inStrip && clear;
}

describe("computeSegments", () => {
    it("splits the strip around the dock with the gap", () => {
        expect(computeSegments(desktop)).toEqual([
            { min: 16, max: 400 - 16 - 48 },
            { min: 880 + 16, max: 1264 - 48 },
        ]);
    });

    it("drops sides too narrow for the mascot", () => {
        const s = computeSegments({ ...desktop, strip: { left: 16, right: 940 } });
        expect(s).toEqual([{ min: 16, max: 336 }]);
    });

    it("is the whole strip with no dock (mobile)", () => {
        expect(computeSegments({ ...desktop, blocked: [] })).toEqual([{ min: 16, max: 1216 }]);
    });
});

describe("createWander", () => {
    it("keeps x and every target inside the strip and outside the dock", () => {
        for (const seed of [1, 2, 3, 42, 99]) {
            const c = clock();
            const w = createWander({ layout: desktop, rng: seededRng(seed), now: c.now });
            let moved = false;
            const x0 = w.state.x;
            run(w, c, 120_000, () => {
                expect(insideAllowed(w.state.x, desktop)).toBe(true);
                expect(insideAllowed(w.state.target, desktop)).toBe(true);
                if (w.state.x !== x0) moved = true;
            });
            expect(moved).toBe(true);
        }
    });

    it("never crosses the dock: stays on its starting side", () => {
        for (const start of ["left", "right"] as const) {
            const c = clock();
            const w = createWander({ layout: desktop, rng: seededRng(7), now: c.now, start });
            const side = w.state.x < 400 ? "left" : "right";
            run(w, c, 120_000, () => {
                expect(w.state.x < 400 ? "left" : "right").toBe(side);
            });
        }
    });

    it("pauses 2-6 s at each target and faces the direction of travel", () => {
        const c = clock();
        const w = createWander({ layout: desktop, rng: seededRng(5), now: c.now });
        const pauses: number[] = [];
        let lastStart = -1;
        let prevX = w.state.x;
        run(w, c, 300_000, () => {
            const s = w.state;
            if (s.phase === "pause" && s.pauseStart !== lastStart) {
                lastStart = s.pauseStart;
                pauses.push(s.pauseUntil - s.pauseStart);
            }
            if (s.phase === "walk" && s.x !== prevX) expect(Math.sign(s.x - prevX)).toBe(s.facing);
            prevX = s.x;
        });
        expect(pauses.length).toBeGreaterThan(10);
        for (const p of pauses) {
            expect(p).toBeGreaterThanOrEqual(2000);
            expect(p).toBeLessThanOrEqual(6000);
        }
    });

    it("walks at about 40 px/s", () => {
        const c = clock();
        const w = createWander({ layout: desktop, rng: seededRng(11), now: c.now });
        while (w.state.phase !== "walk") {
            c.advance(16);
            w.tick();
        }
        const x = w.state.x;
        c.advance(100);
        w.tick();
        expect(Math.abs(w.state.x - x)).toBeCloseTo(4, 5);
    });

    it("is frozen while hovered / chat open", () => {
        const c = clock();
        const w = createWander({ layout: desktop, rng: seededRng(3), now: c.now });
        while (w.state.phase !== "walk") {
            c.advance(16);
            w.tick();
        }
        w.setFrozen(true);
        const x = w.state.x;
        run(w, c, 20_000);
        expect(w.state.x).toBe(x);
        expect(w.state.looking).toBe(false);
        w.setFrozen(false);
        expect(w.state.phase).toBe("pause");
        c.advance(16);
        w.tick();
        expect(w.state.x).toBe(x);
    });

    it("re-clamps on resize", () => {
        const c = clock();
        const w = createWander({ layout: desktop, rng: seededRng(9), now: c.now });
        expect(w.state.x).toBe(1216);
        const narrow: WanderLayout = {
            strip: { left: 16, right: 1008 },
            blocked: [{ left: 272, right: 752 }],
            gap: 16,
            width: 48,
        };
        w.setLayout(narrow);
        expect(w.state.x).toBe(1008 - 48);
        expect(insideAllowed(w.state.x, narrow)).toBe(true);
        run(w, c, 60_000, () => expect(insideAllowed(w.state.x, narrow)).toBe(true));
    });

    it("is deterministic for a seed", () => {
        const trace = (seed: number) => {
            const c = clock();
            const w = createWander({ layout: desktop, rng: seededRng(seed), now: c.now });
            const xs: number[] = [];
            run(w, c, 30_000, () => xs.push(Math.round(w.state.x * 100)));
            return xs;
        };
        expect(trace(123)).toEqual(trace(123));
        expect(trace(123)).not.toEqual(trace(124));
    });

    it("sometimes looks up during a pause, never while walking", () => {
        const c = clock();
        const w = createWander({ layout: desktop, rng: seededRng(21), now: c.now });
        let looked = false;
        run(w, c, 300_000, () => {
            if (w.state.looking) {
                looked = true;
                expect(w.state.phase).toBe("pause");
            }
        });
        expect(looked).toBe(true);
    });
});

describe("setX (landing after a drop)", () => {
    it("lands on the nearest allowed spot, never on the dock, and pauses", () => {
        const c = clock();
        const w = createWander({ layout: desktop, now: c.now, rng: seededRng(5), start: "right" });
        w.setX(600); // over the dock: nearest side
        expect(insideAllowed(w.state.x, desktop)).toBe(true);
        expect(w.state.phase).toBe("pause");
        w.setX(-50);
        expect(w.state.x).toBe(16);
        w.setX(5000);
        expect(w.state.x).toBe(1264 - 48);
        w.setX(200);
        expect(w.state.x).toBe(200);
        run(w, c, 20000, () => expect(insideAllowed(w.state.x, desktop)).toBe(true));
    });
});
