import { describe, expect, it } from "vitest";
import { PICK, START_POSE } from "./constants";
import { ArmPlayer } from "./player";
import { type SimState, describeScene, executeToolCall, initialPoses } from "./tools";
import type { ToolCall } from "./types";

const start = (): SimState => ({ pose: { ...START_POSE }, cube: { spot: PICK.spots[0], held: false }, poses: initialPoses() });

/** Run calls one after another, like the agent loop does. */
function runAll(calls: ToolCall[], s = start()) {
    const out: string[] = [];
    const events: string[] = [];
    for (const c of calls) {
        const r = executeToolCall(c, s);
        out.push(r.text);
        for (const st of r.steps) if (st.kind === "event") events.push(`${st.event.type}@${st.event.spot}`);
        s = r.state;
    }
    return { out, events, state: s };
}

const { hover, down } = PICK;
const hoverAt = (pan: number): ToolCall => ({
    tool: "move_joints",
    args: { shoulder_pan: pan, ...hover, gripper: PICK.open },
});
const lower: ToolCall = { tool: "move_joints", args: { ...down, speed: 20 } };
const lift: ToolCall = {
    tool: "move_joints",
    args: { shoulder_lift: hover.shoulder_lift, elbow_flex: hover.elbow_flex, wrist_flex: hover.wrist_flex, speed: 30 },
};

describe("executeToolCall", () => {
    it("returns the real server's strings", () => {
        const g = executeToolCall({ tool: "gesture", args: { name: "wave", repeats: 2 } }, start());
        expect(g.line).toBe('gesture(name="wave", repeats=2)');
        expect(g.text).toMatch(/^Did 'wave' and returned to: shoulder_pan=0\.0, /);
        expect(g.steps[0].kind).toBe("call");
        expect(g.steps[g.steps.length - 1].kind).toBe("result");
        expect(executeToolCall({ tool: "gripper", args: { percent_open: 70 } }, start()).text).toBe("Gripper at 70%");
        expect(executeToolCall({ tool: "go_to_pose", args: { name: "nope" } }, start()).text).toBe(
            "No pose named 'nope'. Saved: rest, ready, hand_up, face_me"
        );
        expect(executeToolCall({ tool: "move_joints", args: {} }, start()).text).toBe("No joint targets given.");
        expect(executeToolCall({ tool: "nudge", args: {} }, start()).text).toBe("No changes given.");
    });

    it("clamps to the joint limits and says so", () => {
        const r = executeToolCall({ tool: "nudge", args: { shoulder_pan: 200 } }, start());
        expect(r.clamped).toEqual(["shoulder_pan 200.0 -> 111.3 (limit)"]);
        expect(r.text).toContain("| Clamped: shoulder_pan 200.0 -> 111.3 (limit)");
        expect(r.state.pose.shoulder_pan).toBeCloseTo(111.3);
    });

    it("saves and lists poses for this visit only", () => {
        const s = start();
        const moved = executeToolCall({ tool: "move_joints", args: { shoulder_pan: 12.34 } }, s).state;
        const saved = executeToolCall({ tool: "save_pose", args: { name: "mine" } }, moved);
        expect(saved.text).toMatch(/^Saved pose 'mine': shoulder_pan=12\.3, /);
        expect(executeToolCall({ tool: "list_poses", args: {} }, saved.state).text).toContain("mine: shoulder_pan=12.3");
        expect(s.poses.mine).toBeUndefined();
        expect(executeToolCall({ tool: "go_to_pose", args: { name: "mine" } }, saved.state).text).toMatch(/^At 'mine'/);
    });

    it("look describes the simulated scene", () => {
        const r = executeToolCall({ tool: "look", args: {} }, start());
        expect(r.line).toBe("look()");
        expect(r.text).toContain("Simulated camera 0");
        expect(r.text).toContain("sits on the table at shoulder_pan -28 (right of the base)");
        expect(r.steps.map((s) => s.kind)).toEqual(["call", "result"]);
        expect(describeScene({ ...start(), cube: { spot: 28, held: true } })).toContain("held between the jaws");
    });

    it("picks the cube up and puts it on the other spot", () => {
        const { events, state, out } = runAll([
            hoverAt(PICK.spots[0]),
            lower,
            { tool: "gripper", args: { percent_open: PICK.grip } },
            lift,
            { tool: "move_joints", args: { shoulder_pan: PICK.spots[1], speed: 30 } },
            lower,
            { tool: "gripper", args: { percent_open: PICK.open } },
            lift,
            { tool: "go_to_pose", args: { name: "ready" } },
        ]);
        expect(events).toEqual(["cube:attach@-28", "cube:release@28"]);
        expect(out[2]).toContain("in the gripper");
        expect(out[6]).toContain("down on the table at shoulder_pan 28 (left of the base)");
        expect(state.cube).toEqual({ spot: 28, held: false });
    });

    it("doesn't grab when the jaws close away from the cube, or were already closed", () => {
        expect(runAll([hoverAt(PICK.spots[1]), lower, { tool: "gripper", args: { percent_open: 8 } }]).events).toEqual([]);
        expect(
            runAll([
                { tool: "gripper", args: { percent_open: 5 } },
                { tool: "move_joints", args: { shoulder_pan: PICK.spots[0], ...down } },
                { tool: "gripper", args: { percent_open: 0 } },
            ]).events
        ).toEqual([]);
    });

    it("dropping the cube elsewhere (or a gesture that opens the jaws) puts it back on its spot", () => {
        const held = runAll([hoverAt(PICK.spots[0]), lower, { tool: "gripper", args: { percent_open: 8 } }, lift]).state;
        const wave = executeToolCall({ tool: "gesture", args: { name: "wave" } }, held);
        expect(wave.steps.filter((s) => s.kind === "event").map((s) => s.kind === "event" && s.event.type)).toEqual(["cube:reset"]);
        expect(wave.text).toContain("the demo put it back at shoulder_pan -28");
        expect(wave.state.cube).toEqual({ spot: -28, held: false });
        const rel = executeToolCall({ tool: "release", args: {} }, held);
        expect(rel.state.cube.held).toBe(false);
        expect(rel.text).toMatch(/^Parked at rest and released \(torque off\)\./);
    });

    it("plays on the ArmPlayer: the result fires only after the motion and the cube event", () => {
        const player = new ArmPlayer();
        const order: string[] = [];
        player.on("callStart", () => order.push("start"));
        player.on("event", (e) => order.push(e.type));
        player.on("callEnd", () => order.push("end"));
        let s = start();
        for (const c of [hoverAt(PICK.spots[0]), lower, { tool: "gripper", args: { percent_open: 8 } } as ToolCall]) {
            const r = executeToolCall(c, s);
            player.enqueue(r.steps);
            s = r.state;
        }
        for (let i = 0; i < 400 && !player.idle; i++) player.tick(0.05);
        expect(order.slice(-3)).toEqual(["start", "cube:attach", "end"]);
        expect(player.cubeNow).toEqual({ spot: -28, held: true });
        expect(player.pose.gripper).toBeCloseTo(PICK.grip);
    });
});

describe("cube anywhere on the arc", () => {
    it("grabs a placed cube at its pan and puts it down wherever the jaws open on the table", () => {
        const placed: SimState = { ...start(), cube: { spot: 61, held: false } };
        const { events, state, out } = runAll(
            [
                hoverAt(61),
                lower,
                { tool: "gripper", args: { percent_open: PICK.grip } },
                lift,
                { tool: "move_joints", args: { shoulder_pan: -45, speed: 30 } },
                lower,
                { tool: "gripper", args: { percent_open: PICK.open } },
            ],
            placed
        );
        expect(events).toEqual(["cube:attach@61", "cube:release@-45"]);
        expect(out[6]).toContain("shoulder_pan -45 (right of the base)");
        expect(state.cube).toEqual({ spot: -45, held: false });
        expect(describeScene({ ...placed, pose: { ...START_POSE } })).toContain("shoulder_pan 61 (left of the base)");
    });

    it("opening past the placeable arc drops it back on its spot", () => {
        const held = runAll([hoverAt(-28), lower, { tool: "gripper", args: { percent_open: 8 } }, lift]).state;
        const far = runAll(
            [{ tool: "move_joints", args: { shoulder_pan: 100, speed: 30 } }, lower, { tool: "gripper", args: { percent_open: 90 } }],
            held
        );
        expect(far.events).toEqual(["cube:reset@-28"]);
    });
});
