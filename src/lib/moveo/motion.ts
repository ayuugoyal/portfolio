/**
 * Keyframe motion for the Moveo demo. Pure TS: no React, no three.
 * A timeline is a list of segments built from steps; sampling it at time t gives the pose to show.
 */
import { DEMO_SPEED, JOINT_SPECS, MIN_MOVE_S, type MoveoPose, type MoveoStep } from "./constants";

/** Clamp every joint to its URDF limits; `clamped` lists the joints that were outside. */
export function clampPose(pose: readonly number[]): { pose: MoveoPose; clamped: string[] } {
    const clamped: string[] = [];
    const out = JOINT_SPECS.map((s, i) => {
        const v = Number.isFinite(pose[i]) ? pose[i] : s.lower;
        if (v < s.lower || v > s.upper || !Number.isFinite(pose[i])) clamped.push(s.urdf);
        return Math.min(s.upper, Math.max(s.lower, v));
    }) as unknown as MoveoPose;
    return { pose: out, clamped };
}

/** One joint set to a value (clamped), the others unchanged. */
export function setJoint(pose: MoveoPose, index: number, value: number): MoveoPose {
    const next = [...pose];
    next[index] = value;
    return clampPose(next).pose;
}

/** smoothstep: zero velocity at both ends */
export const ease = (t: number) => {
    const x = Math.min(1, Math.max(0, t));
    return x * x * (3 - 2 * x);
};

export function lerpPose(a: MoveoPose, b: MoveoPose, t: number): MoveoPose {
    return a.map((v, i) => v + (b[i] - v) * t) as unknown as MoveoPose;
}

/** Seconds for a joint-space move: the largest joint change at `speed` rad/s, at least `min`. */
export function moveSeconds(a: MoveoPose, b: MoveoPose, speed = DEMO_SPEED, min = MIN_MOVE_S): number {
    const d = Math.max(...a.map((v, i) => Math.abs(b[i] - v)));
    return Math.max(min, d / speed);
}

export type Segment = { label: string; from: MoveoPose; to: MoveoPose; t0: number; t1: number };
export type Timeline = { segments: Segment[]; duration: number };

/** Lay steps end to end from `start`. Targets are clamped to the joint limits. */
export function buildTimeline(start: MoveoPose, steps: readonly MoveoStep[], speed = DEMO_SPEED): Timeline {
    const segments: Segment[] = [];
    let at = 0;
    let pose = clampPose(start).pose;
    for (const s of steps) {
        if (s.kind === "dwell") {
            segments.push({ label: s.label, from: pose, to: pose, t0: at, t1: at + s.seconds });
            at += s.seconds;
            continue;
        }
        const to = clampPose(s.to).pose;
        const d = moveSeconds(pose, to, speed);
        segments.push({ label: s.label, from: pose, to, t0: at, t1: at + d });
        at += d;
        pose = to;
    }
    return { segments, duration: at };
}

export type Sample = { pose: MoveoPose; index: number; label: string | null; done: boolean };

/** The pose at time t (seconds from the start of the timeline). */
export function sampleTimeline(tl: Timeline, t: number): Sample {
    const { segments } = tl;
    if (!segments.length) return { pose: [0, 0, 0, 0, 0], index: -1, label: null, done: true };
    if (t >= tl.duration) {
        const last = segments[segments.length - 1];
        return { pose: last.to, index: segments.length - 1, label: last.label, done: true };
    }
    let i = 0;
    while (i < segments.length - 1 && t >= segments[i].t1) i++;
    const s = segments[i];
    const span = s.t1 - s.t0;
    const k = span > 0 ? ease((Math.max(t, 0) - s.t0) / span) : 1;
    return { pose: lerpPose(s.from, s.to, k), index: i, label: s.label, done: false };
}
