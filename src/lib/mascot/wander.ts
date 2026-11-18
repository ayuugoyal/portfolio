/**
 * Where the mascot walks. Pure TS (no DOM): the component feeds it the measured strip and the dock's
 * rect, calls `tick()` every animation frame and writes `state.x` into a transform.
 *
 * Rules:
 *  - The strip is split into segments around every blocked range (the nav dock) plus a gap.
 *  - Targets are always picked inside the segment the mascot is in, so it never walks through the
 *    dock and never teleports to the other side.
 *  - Walk at `speed` px/s facing the direction of travel, then pause 2-6 s (sometimes looking up).
 *  - Frozen (hovered, focused, chat open) means no movement and no clock: it resumes with a fresh pause.
 *  - `setLayout` re-clamps the position into the new segments (on resize).
 *  - `setX(x)` puts it straight at the nearest allowed spot (after the visitor drags and drops it).
 */

export type Range = { left: number; right: number };

export type WanderLayout = {
    /** usable horizontal strip, viewport px */
    strip: Range;
    /** ranges the mascot must never overlap (the nav dock) */
    blocked: Range[];
    /** clearance kept on each side of a blocked range */
    gap: number;
    /** mascot width in px */
    width: number;
};

/** Allowed values for the mascot's left edge. */
export type Segment = { min: number; max: number };

export type WanderPhase = "walk" | "pause";

export type WanderState = {
    x: number;
    target: number;
    phase: WanderPhase;
    /** 1 = facing right, -1 = facing left */
    facing: 1 | -1;
    pauseStart: number;
    pauseUntil: number;
    /** this pause includes a look-up */
    look: boolean;
    /** currently showing the look-up (first `lookFor` ms of a pause with `look`) */
    looking: boolean;
    frozen: boolean;
    /** total px walked; drives the 2-frame walk cycle */
    walked: number;
};

export type WanderOptions = {
    layout: WanderLayout;
    rng?: () => number;
    now?: () => number;
    /** px per second */
    speed?: number;
    pauseMin?: number;
    pauseMax?: number;
    lookChance?: number;
    lookFor?: number;
    /** shortest leg worth walking, px */
    minStep?: number;
    /** start position: the rightmost or leftmost allowed spot, or an x */
    start?: "right" | "left" | number;
};

export type Wander = {
    tick(): WanderState;
    setLayout(layout: WanderLayout): void;
    setFrozen(frozen: boolean): void;
    /** Put the mascot at x (clamped into the nearest allowed spot, never on the dock) and pause there. */
    setX(x: number): void;
    readonly state: WanderState;
    readonly segments: Segment[];
};

/** Small seeded PRNG (mulberry32) for deterministic tests. */
export function seededRng(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** Free parts of the strip (minus blocked ranges and their gap), as ranges for the mascot's left edge. */
export function computeSegments(layout: WanderLayout): Segment[] {
    let free: Range[] = [{ left: layout.strip.left, right: layout.strip.right }];
    for (const b of layout.blocked) {
        const lo = b.left - layout.gap;
        const hi = b.right + layout.gap;
        const next: Range[] = [];
        for (const f of free) {
            if (hi <= f.left || lo >= f.right) {
                next.push(f);
                continue;
            }
            if (lo > f.left) next.push({ left: f.left, right: lo });
            if (hi < f.right) next.push({ left: hi, right: f.right });
        }
        free = next;
    }
    return free
        .map((f) => ({ min: f.left, max: f.right - layout.width }))
        .filter((s) => s.max >= s.min)
        .sort((a, b) => a.min - b.min);
}

const clamp = (v: number, s: Segment) => Math.min(s.max, Math.max(s.min, v));

/** x moved to the nearest allowed spot (x itself if it is allowed). */
export function nearestAllowed(x: number, segments: Segment[]): number {
    const seg = segmentFor(x, segments);
    return seg ? clamp(x, seg) : x;
}

/** The segment containing x, or the nearest one. */
export function segmentFor(x: number, segments: Segment[]): Segment | null {
    let best: Segment | null = null;
    let bestD = Infinity;
    for (const s of segments) {
        const d = Math.abs(x - clamp(x, s));
        if (d < bestD) {
            best = s;
            bestD = d;
        }
    }
    return best;
}

export function createWander(opts: WanderOptions): Wander {
    const rng = opts.rng ?? Math.random;
    const now = opts.now ?? (() => Date.now());
    const speed = opts.speed ?? 40;
    const pauseMin = opts.pauseMin ?? 2000;
    const pauseMax = opts.pauseMax ?? 6000;
    const lookChance = opts.lookChance ?? 0.35;
    const lookFor = opts.lookFor ?? 1400;
    const minStep = opts.minStep ?? 40;

    let segments = computeSegments(opts.layout);
    let last = now();

    const startX = (): number => {
        if (segments.length === 0) return opts.layout.strip.left;
        if (typeof opts.start === "number") return clamp(opts.start, segmentFor(opts.start, segments)!);
        if (opts.start === "left") return segments[0].min;
        return segments[segments.length - 1].max;
    };

    const x0 = startX();
    const state: WanderState = {
        x: x0,
        target: x0,
        phase: "pause",
        facing: -1,
        pauseStart: last,
        pauseUntil: last,
        look: false,
        looking: false,
        frozen: false,
        walked: 0,
    };

    const enterPause = (t: number) => {
        state.phase = "pause";
        state.target = state.x;
        state.pauseStart = t;
        state.pauseUntil = t + pauseMin + rng() * (pauseMax - pauseMin);
        state.look = rng() < lookChance;
    };

    /** A target on the current side; returns false when there is no room to move. */
    const pickTarget = (): boolean => {
        const seg = segmentFor(state.x, segments);
        if (!seg || seg.max - seg.min < minStep) return false;
        for (let i = 0; i < 6; i++) {
            const t = seg.min + rng() * (seg.max - seg.min);
            if (Math.abs(t - state.x) >= minStep) {
                state.target = t;
                state.facing = t > state.x ? 1 : -1;
                return true;
            }
        }
        // Rare: unlucky draws. Head for the far end of the segment instead.
        const far = state.x - seg.min > seg.max - state.x ? seg.min : seg.max;
        if (Math.abs(far - state.x) < minStep) return false;
        state.target = far;
        state.facing = far > state.x ? 1 : -1;
        return true;
    };

    enterPause(last);

    const tick = (): WanderState => {
        const t = now();
        const dt = Math.min(Math.max((t - last) / 1000, 0), 0.1);
        last = t;
        if (state.frozen || segments.length === 0) {
            state.looking = false;
            return state;
        }
        if (state.phase === "pause" && t >= state.pauseUntil) {
            if (pickTarget()) state.phase = "walk";
            else enterPause(t);
        }
        if (state.phase === "walk") {
            const dir = state.target > state.x ? 1 : -1;
            const step = speed * dt;
            const remaining = Math.abs(state.target - state.x);
            if (step >= remaining) {
                state.walked += remaining;
                state.x = state.target;
                enterPause(t);
            } else {
                state.walked += step;
                state.x += dir * step;
            }
        }
        state.looking = state.phase === "pause" && state.look && t - state.pauseStart < lookFor;
        return state;
    };

    const setLayout = (layout: WanderLayout) => {
        segments = computeSegments(layout);
        const seg = segmentFor(state.x, segments);
        if (!seg) return;
        state.x = clamp(state.x, seg);
        state.target = clamp(state.target, seg);
        if (state.phase === "walk" && state.target === state.x) enterPause(now());
    };

    const setFrozen = (frozen: boolean) => {
        if (frozen === state.frozen) return;
        state.frozen = frozen;
        last = now();
        if (!frozen) enterPause(last);
    };

    const setX = (x: number) => {
        if (segments.length === 0) return;
        state.x = nearestAllowed(x, segments);
        enterPause(now());
    };

    return {
        tick,
        setLayout,
        setFrozen,
        setX,
        get state() {
            return state;
        },
        get segments() {
            return segments;
        },
    };
}
