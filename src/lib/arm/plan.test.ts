import { describe, expect, it } from "vitest";
import { LIMITS, MULTI_NOTE, PICK, POSES, START_POSE, TELEOP_REPLY, UNKNOWN_REPLY, clampSpot, spotSide } from "./constants";
import { fmtPose, formatCall } from "./format";
import { type Plan, SimArm, plan, serverText } from "./plan";
import type { Pose } from "./types";

const ctx = { cubeSpot: PICK.spots[0] };
const moves = (p: Plan) => p.steps.filter((s) => s.kind === "move");
const results = (p: Plan) => p.steps.flatMap((s) => (s.kind === "result" ? [s] : []));
const REST: Pose = { ...START_POSE, ...POSES.rest } as Pose;

describe("formatCall / fmtPose", () => {
    it("prints Python-kwargs call lines", () => {
        expect(formatCall({ tool: "gesture", args: { name: "wave", repeats: 3 } })).toBe('gesture(name="wave", repeats=3)');
        expect(formatCall({ tool: "nudge", args: { shoulder_pan: -15 } })).toBe("nudge(shoulder_pan=-15)");
        expect(formatCall({ tool: "go_to_pose", args: { name: "face_me" } })).toBe('go_to_pose(name="face_me")');
        expect(formatCall({ tool: "gripper", args: { percent_open: 12.345 } })).toBe("gripper(percent_open=12.3)");
        expect(formatCall({ tool: "release", args: {} })).toBe("release()");
    });

    it("formats poses like so101_core.fmt", () => {
        expect(fmtPose({ elbow_flex: -40, shoulder_lift: 0 })).toBe("shoulder_lift=0.0, elbow_flex=-40.0");
    });
});

describe("plan: gestures (port of Arm.gesture)", () => {
    it("wave: raise, 3 x (+30/-30), straighten, return", () => {
        const p = plan("wave", START_POSE, ctx);
        expect(p.intent).toBe("wave");
        expect(p.reply).toBe("Waving!");
        expect(p.lines).toEqual(['gesture(name="wave", repeats=3)']);
        const m = moves(p);
        expect(m).toHaveLength(9);
        expect(m[0].kind === "move" && m[0].to).toMatchObject({ shoulder_lift: 0, elbow_flex: -40, wrist_flex: 0, gripper: 40 });
        expect(m[0].kind === "move" && m[0].speed).toBe(35);
        expect(m[1].kind === "move" && m[1].to.wrist_flex).toBe(30);
        expect(m[2].kind === "move" && m[2].to.wrist_flex).toBe(-30);
        expect(m[8].kind === "move" && m[8].to).toEqual(START_POSE);
        expect(p.endPose).toEqual(START_POSE);
        expect(results(p)[0].text).toBe(`Did 'wave' and returned to: ${fmtPose(START_POSE)}`);
    });

    it("segment counts follow the original loops", () => {
        expect(moves(plan("garba", START_POSE, ctx))).toHaveLength(1 + 4 * 2 * 3 + 3 + 1);
        expect(moves(plan("nod", START_POSE, ctx))).toHaveLength(2 * 3 + 1 + 1);
        expect(moves(plan("nod", REST, ctx))).toHaveLength(1 + 2 * 3 + 1 + 1); // sits up first when folded
        expect(moves(plan("shake 2", START_POSE, ctx))).toHaveLength(2 * 2 + 1 + 1);
        expect(moves(plan("look around 5", START_POSE, ctx))).toHaveLength(2 * 2 + 1 + 1); // min(repeats, 2)
    });

    it("centres swings inside the range (_centered)", () => {
        const p = plan("shake", { ...START_POSE, shoulder_pan: 110 }, ctx);
        const pans = moves(p).map((s) => (s.kind === "move" ? Math.round(s.to.shoulder_pan * 10) / 10 : NaN));
        expect(Math.max(...pans)).toBe(LIMITS.shoulder_pan[1]);
        expect(pans).toEqual([111.3, 81.3, 111.3, 81.3, 111.3, 81.3, 96.3, 110]);
    });

    it("clamps repeats to 1..8 with a note", () => {
        const p = plan("wave 20 times", START_POSE, ctx);
        expect(p.lines).toEqual(['gesture(name="wave", repeats=20)']);
        expect(moves(p)).toHaveLength(1 + 8 * 2 + 1 + 1);
        expect(results(p)[0].clamped).toEqual(["repeats 20 -> 8 (limit)"]);
        expect(p.clamped).toBe(true);
    });
});

describe("plan: moves, poses, gripper", () => {
    it("clamps targets with the original note format", () => {
        const p = plan("left 200", START_POSE, ctx);
        expect(p.lines).toEqual(["nudge(shoulder_pan=200)"]);
        expect(p.clamped).toBe(true);
        const r = results(p)[0];
        expect(r.clamped).toEqual(["shoulder_pan 200.0 -> 111.3 (limit)"]);
        expect(serverText(r)).toBe(
            `Now at: ${fmtPose({ ...START_POSE, shoulder_pan: 111.3 })} | Clamped: shoulder_pan 200.0 -> 111.3 (limit)`
        );
        expect(p.endPose.shoulder_pan).toBe(111.3);
    });

    it("negative clamp notes keep one decimal", () => {
        const r = results(plan("right 174", { ...START_POSE, shoulder_pan: 0 }, ctx))[0];
        expect(r.clamped).toEqual(["shoulder_pan -174.0 -> -111.3 (limit)"]);
    });

    it("nudges relative to the planned pose", () => {
        const p = plan("down 10", { ...START_POSE, shoulder_lift: 20 }, ctx);
        expect(p.endPose.shoulder_lift).toBe(10);
        expect(moves(p)[0].kind === "move" && moves(p)[0]).toMatchObject({ speed: 30 });
        expect(p.clamped).toBe(false);
    });

    it("go_to_pose uses poses.json and the server string", () => {
        const p = plan("face me", START_POSE, ctx);
        expect(p.lines).toEqual(['go_to_pose(name="face_me")']);
        expect(p.endPose.shoulder_pan).toBe(-102.5);
        expect(results(p)[0].text).toBe(`At 'face_me': ${fmtPose(p.endPose)}`);
        expect(plan("rest", START_POSE, ctx).endPose).toMatchObject(POSES.rest);
        expect(plan("raise your hand", START_POSE, ctx).lines).toEqual(['go_to_pose(name="hand_up")']);
    });

    it("gripper open/close", () => {
        const p = plan("open", START_POSE, ctx);
        expect(p.lines).toEqual(["gripper(percent_open=90)"]);
        expect(results(p)[0].text).toBe("Gripper at 90%");
        expect(plan("close", START_POSE, ctx).endPose.gripper).toBe(5);
    });

    it("release parks at rest first", () => {
        const p = plan("release", START_POSE, ctx);
        expect(p.lines).toEqual(["release()"]);
        expect(p.endPose).toMatchObject(POSES.rest);
        expect(results(p)[0].text).toBe("Parked at rest and released (torque off).");
    });

    it("status and list_poses", () => {
        const s = results(plan("status", START_POSE, ctx))[0].text;
        expect(s).toContain("shoulder_pan");
        expect(s).toContain("range [-111, 111]");
        expect(moves(plan("status", START_POSE, ctx))).toHaveLength(0);
        expect(results(plan("list poses", START_POSE, ctx))[0].text).toContain("face_me: shoulder_pan=-102.5");
    });

    it("caps speed to 5..100 deg/s", () => {
        const arm = new SimArm(START_POSE);
        arm.run({ tool: "move_joints", args: { elbow_flex: 20, speed: 500 } });
        arm.run({ tool: "move_joints", args: { elbow_flex: 10, speed: 1 } });
        const speeds = arm.steps.flatMap((s) => (s.kind === "move" ? [s.speed] : []));
        expect(speeds).toEqual([100, 5]);
    });

    it("rejects unknown gestures with the server's message", () => {
        const arm = new SimArm(START_POSE);
        expect(arm.run({ tool: "gesture", args: { name: "moonwalk" } }).text).toBe(
            "Unknown gesture. Options: wave, nod, shake, look_around, garba."
        );
    });
});

describe("plan: the rest", () => {
    it("stop: no tool call, clears the queue", () => {
        const p = plan("stop", START_POSE, ctx);
        expect(p.stop).toBe(true);
        expect(p.calls).toEqual([]);
        expect(p.reply).toBe("Stopping.");
    });

    it("teleop needs the leader arm", () => {
        const p = plan("start teleop", START_POSE, ctx);
        expect(p.intent).toBe("teleop");
        expect(p.reply).toBe(TELEOP_REPLY);
        expect(p.calls).toEqual([]);
    });

    it("multi-intent runs the first and says so", () => {
        const p = plan("wave and then open the gripper", START_POSE, ctx);
        expect(p.lines).toEqual(['gesture(name="wave", repeats=3)']);
        expect(p.notes).toEqual([MULTI_NOTE]);
    });

    it("unknown text gets the friendly reply and no calls", () => {
        const p = plan("make me a sandwich", START_POSE, ctx);
        expect(p.intent).toBeNull();
        expect(p.reply).toBe(UNKNOWN_REPLY);
        expect(p.calls).toEqual([]);
        expect(p.steps).toEqual([]);
    });

    it("pick up the cube: scripted calls, attach then release, alternating spots", () => {
        const p = plan("pick up the cube", START_POSE, ctx);
        expect(p.intent).toBe("pick_cube");
        expect(p.lines[0]).toMatch(/^move_joints\(shoulder_pan=-28, /);
        expect(p.lines).toContain(`gripper(percent_open=${PICK.grip})`);
        expect(p.lines.at(-1)).toBe('go_to_pose(name="ready")');
        const events = p.steps.flatMap((s) => (s.kind === "event" ? [s.event] : []));
        expect(events).toEqual([
            { type: "cube:attach", spot: -28 },
            { type: "cube:release", spot: 28 },
        ]);
        expect(p.cubeSpot).toBe(28);
        const again = plan("pick up the cube", p.endPose, { cubeSpot: p.cubeSpot });
        expect(again.lines[0]).toMatch(/^move_joints\(shoulder_pan=28, /);
        expect(again.cubeSpot).toBe(-28);
        // the attach happens right after the gripper closes
        const i = p.steps.findIndex((s) => s.kind === "event");
        expect(p.steps[i - 1]).toMatchObject({ kind: "result", text: `Gripper at ${PICK.grip}%` });
    });

    it("every call has a matching result, in order", () => {
        const p = plan("pick up the cube", START_POSE, ctx);
        const ids = p.steps.flatMap((s) => (s.kind === "call" ? [`c${s.id}`] : s.kind === "result" ? [`r${s.id}`] : []));
        for (let i = 0; i < ids.length; i += 2) expect(ids[i + 1]).toBe(ids[i].replace("c", "r"));
    });
});

describe("cube placed by the visitor", () => {
    it("picks from any spot on the arc and carries it to the default spot across", () => {
        const p = plan("pick up the cube", START_POSE, { cubeSpot: 55 });
        expect(p.lines[0]).toMatch(/^move_joints\(shoulder_pan=55, /);
        const events = p.steps.flatMap((s) => (s.kind === "event" ? [s.event] : []));
        expect(events).toEqual([
            { type: "cube:attach", spot: 55 },
            { type: "cube:release", spot: -28 },
        ]);
        expect(plan("pick up the cube", START_POSE, { cubeSpot: -70 }).cubeSpot).toBe(28);
    });

    it("clampSpot keeps spots on the placeable arc", () => {
        expect(clampSpot(42.4)).toBe(42);
        expect(clampSpot(170)).toBe(PICK.panMax);
        expect(clampSpot(-170)).toBe(-PICK.panMax);
        expect(clampSpot(Number.NaN)).toBe(PICK.spots[0]);
        expect(spotSide(30)).toBe("left");
        expect(spotSide(-30)).toBe("right");
        expect(spotSide(2)).toBe("straight ahead");
    });
});
