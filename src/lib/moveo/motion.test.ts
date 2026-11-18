import { describe, expect, it } from "vitest";
import { DEMO, JOINT_SPECS, POSES, START_POSE, type MoveoPose } from "./constants";
import { buildTimeline, clampPose, ease, lerpPose, moveSeconds, sampleTimeline, setJoint } from "./motion";

const near = (a: readonly number[], b: readonly number[]) => a.forEach((v, i) => expect(v).toBeCloseTo(b[i], 9));

describe("limits", () => {
    it("match the URDF and every named pose sits inside them", () => {
        expect(JOINT_SPECS.map((s) => s.urdf)).toEqual(["J_1", "J_2", "J_3", "J_4", "J_5"]);
        expect(JOINT_SPECS.map((s) => s.upper)).toEqual([2.0708, 3.5967, 3.4603, 3.3077, 2.747]);
        for (const [name, pose] of Object.entries(POSES)) expect(clampPose(pose).clamped, name).toEqual([]);
    });
});

describe("clampPose", () => {
    it("clamps each joint to [lower, upper] and reports which", () => {
        const { pose, clamped } = clampPose([-1, 10, 1, 3.3077, 2.8]);
        expect(pose).toEqual([0, 3.5967, 1, 3.3077, 2.747]);
        expect(clamped).toEqual(["J_1", "J_2", "J_5"]);
    });
    it("treats NaN as the lower limit", () => {
        expect(clampPose([NaN, 1, 1, 1, 1])).toEqual({ pose: [0, 1, 1, 1, 1], clamped: ["J_1"] });
    });
    it("setJoint changes one joint, clamped", () => {
        expect(setJoint(START_POSE, 0, 5)).toEqual([2.0708, ...START_POSE.slice(1)]);
        expect(setJoint(START_POSE, 2, 1.5)[2]).toBe(1.5);
    });
});

describe("interpolation", () => {
    it("ease is smoothstep, clamped to [0, 1]", () => {
        expect(ease(-1)).toBe(0);
        expect(ease(0)).toBe(0);
        expect(ease(0.5)).toBe(0.5);
        expect(ease(1)).toBe(1);
        expect(ease(2)).toBe(1);
    });
    it("lerpPose hits both end states exactly", () => {
        near(lerpPose(POSES.home, POSES.ready, 0), POSES.home);
        near(lerpPose(POSES.home, POSES.ready, 1), POSES.ready);
        near(lerpPose(POSES.home, POSES.ready, 0.5), POSES.ready.map((v) => v / 2));
    });
    it("move time is the largest joint change over the speed, with a floor", () => {
        expect(moveSeconds(POSES.home, POSES.ready, 1, 0)).toBeCloseTo(1.8);
        expect(moveSeconds(POSES.home, POSES.home, 1, 0.45)).toBe(0.45);
    });
});

describe("timeline", () => {
    const tl = buildTimeline(START_POSE, DEMO);

    it("keeps the steps in order, back to back", () => {
        expect(tl.segments.map((s) => s.label)).toEqual(DEMO.map((s) => s.label));
        expect(tl.segments[0].t0).toBe(0);
        for (let i = 1; i < tl.segments.length; i++) {
            expect(tl.segments[i].t0).toBe(tl.segments[i - 1].t1);
            near(tl.segments[i].from, tl.segments[i - 1].to);
        }
        expect(tl.duration).toBe(tl.segments[tl.segments.length - 1].t1);
    });

    it("visits the labels in order when sampled forward", () => {
        const seen: string[] = [];
        for (let t = 0; t <= tl.duration + 0.1; t += 1 / 60) {
            const s = sampleTimeline(tl, t);
            if (s.label && seen[seen.length - 1] !== s.label) seen.push(s.label);
        }
        expect(seen).toEqual(DEMO.map((s) => s.label));
    });

    it("starts at the start pose, reaches each target at its segment end, and ends done", () => {
        near(sampleTimeline(tl, 0).pose, START_POSE);
        for (const s of tl.segments) near(sampleTimeline(tl, s.t1 - 1e-9).pose, s.to);
        const end = sampleTimeline(tl, tl.duration);
        expect(end.done).toBe(true);
        near(end.pose, POSES.ready);
        expect(sampleTimeline(tl, tl.duration / 2).done).toBe(false);
    });

    it("holds still through a dwell", () => {
        const dwell = tl.segments.find((s) => s.label.startsWith("gripper: close"))!;
        near(sampleTimeline(tl, dwell.t0 + 0.01).pose, POSES.pick);
        near(sampleTimeline(tl, dwell.t1 - 0.01).pose, POSES.pick);
    });

    it("clamps targets outside the limits", () => {
        const bad: MoveoPose = [9, -1, 1, 1, 1];
        const t = buildTimeline(POSES.home, [{ kind: "move", to: bad, label: "bad" }]);
        expect(t.segments[0].to).toEqual([2.0708, 0, 1, 1, 1]);
    });

    it("an empty timeline is done immediately", () => {
        const t = buildTimeline(START_POSE, []);
        expect(t.duration).toBe(0);
        expect(sampleTimeline(t, 0).done).toBe(true);
    });
});
