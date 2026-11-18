import { describe, expect, it } from "vitest";
import { validateToolInput } from "@/lib/agent/tools";
import { POSES, START_POSE } from "./constants";
import { MOVEO_TOOL_DEFS, executeMoveoCall, matchMoveo, type MoveoCall } from "./tools";

const call = (tool: MoveoCall["tool"], args: MoveoCall["args"] = {}): MoveoCall => ({ tool, args });

describe("moveo tools", () => {
    it("are offered to Claude next to the SO-101's, and validate", () => {
        expect(MOVEO_TOOL_DEFS.map((t) => t.name)).toEqual(["moveo_status", "moveo_move_joints", "moveo_go_to_pose", "moveo_run_sequence"]);
        expect(validateToolInput("moveo_go_to_pose", { name: "ready" })).toEqual({
            ok: true,
            call: { tool: "moveo_go_to_pose", args: { name: "ready" } },
        });
        expect(validateToolInput("moveo_move_joints", { j1_base: 90, speed: 40 }).ok).toBe(true);
        expect(validateToolInput("moveo_go_to_pose", { name: "rest" }).ok).toBe(false); // the SO-101's pose
        expect(validateToolInput("moveo_run_sequence", { name: "dance" }).ok).toBe(false);
        expect(validateToolInput("moveo_move_joints", { shoulder_pan: 10 }).ok).toBe(false);
    });

    it("go_to_pose and run_sequence play the arm's own poses and sequence", () => {
        const g = executeMoveoCall(call("moveo_go_to_pose", { name: "home" }), START_POSE);
        expect(g.steps).toEqual([{ kind: "move", to: POSES.home, label: "home" }]);
        expect(g.line).toBe('moveo_go_to_pose(name="home")');
        const s = executeMoveoCall(call("moveo_run_sequence", { name: "pick_and_place" }), START_POSE);
        expect(s.steps.length).toBe(9);
        expect(s.text).toMatch(/no gripper fitted/);
    });

    it("move_joints converts degrees, holds omitted joints and reports clamps", () => {
        const r = executeMoveoCall(call("moveo_move_joints", { j1_base: 90, j3_elbow: 999, speed: 500 }), START_POSE);
        const step = r.steps[0];
        expect(step.kind).toBe("move");
        if (step.kind !== "move") return;
        expect(step.to[0]).toBeCloseTo(Math.PI / 2);
        expect(step.to[1]).toBe(START_POSE[1]);
        expect(step.to[2]).toBeCloseTo(3.4603);
        expect(r.clamped).toEqual(["j3_elbow"]);
        expect(r.text).toMatch(/Clamped to limits: j3_elbow/);
        expect(r.speed).toBeCloseTo((90 * Math.PI) / 180); // speed capped at 90 deg/s
    });

    it("status reports every joint in degrees", () => {
        const r = executeMoveoCall(call("moveo_status"), POSES.home);
        expect(r.steps).toEqual([]);
        expect(r.text).toMatch(/j1_base \(J_1\): 0°/);
        expect(r.text).toMatch(/pick_and_place/);
    });

    it("the scripted matcher maps plain words to calls", () => {
        expect(matchMoveo("pick and place")?.call.tool).toBe("moveo_run_sequence");
        expect(matchMoveo("go home")?.call).toEqual(call("moveo_go_to_pose", { name: "home" }));
        expect(matchMoveo("turn the base to 90")?.call).toEqual(call("moveo_move_joints", { j1_base: 90 }));
        expect(matchMoveo("status")?.call.tool).toBe("moveo_status");
        expect(matchMoveo("write me a poem")).toBeNull();
    });
});
