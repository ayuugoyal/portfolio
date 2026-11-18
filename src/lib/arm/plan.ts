/**
 * Text -> what the real setup would do: the MCP tool calls, their result strings, and the joint moves.
 * `SimArm` is a port of so101_core.Arm running on a virtual pose (no serial bus), so gesture keyframes,
 * clamping and the result strings match the real arm. `plan()` adds the local matcher on top.
 */
import {
    DEFAULT_SPEED,
    GESTURES,
    JOINTS,
    LIMITS,
    MAX_REPEATS,
    MAX_SPEED,
    MIN_SPEED,
    MULTI_NOTE,
    PICK,
    otherSpot,
    POSES,
    RAISED,
    TELEOP_REPLY,
    UNKNOWN_REPLY,
    isGesture,
} from "./constants";
import { fix1, fmtPose, formatCall } from "./format";
import { type Action, parseLocal } from "./parse";
import type { Intent, Joint, Pose, ToolCall } from "./types";

/**
 * `spot` is a shoulder_pan angle on the table arc. attach: picked from it; release: put down on it;
 * reset: put back on it (dropped elsewhere); place: the visitor put the cube there.
 */
export type CubeEvent = { type: "cube:attach" | "cube:release" | "cube:reset" | "cube:place"; spot: number };

export type Step =
    | { kind: "call"; id: number; line: string; call: ToolCall }
    | { kind: "move"; to: Pose; speed: number }
    | { kind: "event"; event: CubeEvent }
    /** text is the tool's result without the " | Clamped: …" tail; the notes are in `clamped` */
    | { kind: "result"; id: number; text: string; clamped: string[] };

export type PlanCtx = {
    /** the shoulder_pan of the spot the cube sits on (after everything already queued) */
    cubeSpot: number;
};

export type Plan = {
    intent: Intent | null;
    reply: string;
    /** extra lines for the transcript (e.g. the multi-intent note) */
    notes: string[];
    calls: ToolCall[];
    /** formatted call lines, same order as `calls` */
    lines: string[];
    steps: Step[];
    endPose: Pose;
    clamped: boolean;
    /** the command was "stop": clear the queue, no tool call */
    stop: boolean;
    cubeSpot: number;
};

let nextCallId = 1;
/** A fresh call id (ids are unique per page, so the transcript can match results to calls). */
export const takeCallId = (): number => nextCallId++;

const clampSpeed = (speed: number) => Math.min(Math.max(speed, MIN_SPEED), MAX_SPEED);

/** The server's result string: text plus the " | Clamped: …" tail when a target was clamped. */
export function serverText(r: { text: string; clamped: string[] }): string {
    return r.text + (r.clamped.length ? ` | Clamped: ${r.clamped.join("; ")}` : "");
}

/** so101_core.Arm on a virtual pose. Every motion appends a `move` step. */
export class SimArm {
    pose: Pose;
    readonly steps: Step[] = [];
    /** saved poses (the real arm's poses.json); `save_pose` writes here */
    readonly poses: Record<string, Partial<Pose>>;

    constructor(from: Pose, poses: Record<string, Partial<Pose>> = { ...POSES }) {
        this.pose = { ...from };
        this.poses = poses;
    }

    clamp(targets: Partial<Pose>): { out: Partial<Pose>; notes: string[] } {
        const out: Partial<Pose> = {};
        const notes: string[] = [];
        for (const [name, value] of Object.entries(targets) as [Joint, number][]) {
            if (!JOINTS.includes(name)) throw new Error(`Unknown joint '${name}'. Joints: ${JOINTS.join(", ")}`);
            const [lo, hi] = LIMITS[name];
            const clamped = Math.min(Math.max(value, lo), hi);
            if (Math.abs(clamped - value) > 0.05) notes.push(`${name} ${fix1(value)} -> ${fix1(clamped)} (limit)`);
            out[name] = clamped;
        }
        return { out, notes };
    }

    /** Ease the given joints to targets (others hold). */
    private mv(targets: Partial<Pose>, speed: number): string[] {
        const { out, notes } = this.clamp(targets);
        const goal: Pose = { ...this.pose, ...out };
        this.steps.push({ kind: "move", to: goal, speed: clampSpeed(speed) });
        this.pose = goal;
        return notes;
    }

    private centered(joint: Joint, amp: number): number {
        const [lo, hi] = LIMITS[joint];
        return Math.min(Math.max(this.pose[joint], lo + amp), hi - amp);
    }

    move(targets: Partial<Pose>, speed = DEFAULT_SPEED) {
        const clamped = this.mv(targets, speed);
        return { text: `Now at: ${fmtPose(this.pose)}`, clamped };
    }

    nudge(deltas: Partial<Pose>, speed = 30) {
        const targets: Partial<Pose> = {};
        for (const [k, d] of Object.entries(deltas) as [Joint, number][]) targets[k] = this.pose[k] + d;
        const clamped = this.mv(targets, speed);
        return { text: `Now at: ${fmtPose(this.pose)}`, clamped };
    }

    gripper(percentOpen: number, speed = 60) {
        const clamped = this.mv({ gripper: percentOpen }, speed);
        return { text: `Gripper at ${this.pose.gripper.toFixed(0)}%`, clamped };
    }

    goToPose(name: string, speed = DEFAULT_SPEED) {
        const pose = this.poses[name];
        if (!pose) return { text: `No pose named '${name}'. Saved: ${Object.keys(this.poses).join(", ")}`, clamped: [] };
        const clamped = this.mv(pose, speed);
        return { text: `At '${name}': ${fmtPose(this.pose)}`, clamped };
    }

    gesture(name: string, repeatsIn = 3) {
        if (!isGesture(name)) return { text: `Unknown gesture. Options: ${GESTURES.join(", ")}.`, clamped: [] };
        const repeats = Math.max(1, Math.min(Math.trunc(repeatsIn), MAX_REPEATS));
        const clamped = repeats !== repeatsIn ? [`repeats ${repeatsIn} -> ${repeats} (limit)`] : [];
        const before = { ...this.pose };
        const mv = (t: Partial<Pose>, s: number) => void this.mv(t, s);
        if (name === "wave") {
            mv({ ...RAISED, gripper: 40.0 }, 35);
            for (let i = 0; i < repeats; i++) {
                mv({ wrist_flex: 30.0 }, 80);
                mv({ wrist_flex: -30.0 }, 80);
            }
            mv({ wrist_flex: 0.0 }, 80);
        } else if (name === "nod" || name === "shake") {
            if (before.shoulder_lift < -60) mv(RAISED, 35); // folded at rest: sit up first so the motion is visible
            const [joint, amp]: [Joint, number] = name === "nod" ? ["wrist_flex", 20.0] : ["shoulder_pan", 15.0];
            const center = this.centered(joint, amp);
            for (let i = 0; i < repeats; i++) {
                mv({ [joint]: center + amp }, 70);
                mv({ [joint]: center - amp }, 70);
            }
            mv({ [joint]: center }, 70);
        } else if (name === "look_around") {
            if (before.shoulder_lift < -60) mv(RAISED, 35);
            const center = this.centered("shoulder_pan", 40);
            for (let i = 0; i < Math.min(repeats, 2); i++) {
                mv({ shoulder_pan: center + 40 }, 30);
                mv({ shoulder_pan: center - 40 }, 30);
            }
            mv({ shoulder_pan: center }, 30);
        } else if (name === "garba") {
            mv({ ...RAISED, gripper: 50.0 }, 35);
            const pan = this.centered("shoulder_pan", 22);
            const roll = Math.min(Math.max(this.pose.wrist_roll, -130.0), 130.0);
            for (let i = 0; i < repeats; i++) {
                for (const side of [1, -1]) {
                    // sway with a bounce and a wrist twirl, then clap the gripper
                    mv(
                        {
                            shoulder_pan: pan + 22 * side,
                            wrist_flex: 15.0 * side,
                            wrist_roll: roll + 40 * side,
                            shoulder_lift: -8.0 * side,
                        },
                        90
                    );
                    mv({ gripper: 10.0 }, 100);
                    mv({ gripper: 50.0 }, 100);
                }
            }
            mv({ shoulder_pan: pan, wrist_flex: 0.0, shoulder_lift: 0.0, wrist_roll: roll + 45 }, 90);
            mv({ wrist_roll: roll - 45 }, 100); // finishing twirl
            mv({ wrist_roll: roll }, 100);
        }
        mv(before, 35);
        return { text: `Did '${name}' and returned to: ${fmtPose(this.pose)}`, clamped };
    }

    release() {
        this.mv(POSES.rest, 35);
        return { text: "Parked at rest and released (torque off).", clamped: [] };
    }

    status() {
        const lines = ["Connected: my_follower (simulated in your browser). Torque on (holding position)."];
        for (const k of JOINTS) {
            const [lo, hi] = LIMITS[k];
            lines.push(`  ${k.padEnd(14)} ${fix1(this.pose[k]).padStart(7)}   range [${lo.toFixed(0)}, ${hi.toFixed(0)}]`);
        }
        lines.push(`Saved poses: ${Object.keys(this.poses).join(", ") || "none"}`);
        return { text: lines.join("\n"), clamped: [] };
    }

    listPoses() {
        const text = Object.entries(this.poses).map(([n, p]) => `${n}: ${fmtPose(p)}`).join("\n");
        return { text: text || "No saved poses.", clamped: [] };
    }

    /** so101_core `save_pose`: the current angles rounded to 0.1, written into `this.poses`. */
    savePose(name: string) {
        const saved = Object.fromEntries(Object.entries(this.pose).map(([k, v]) => [k, Math.round(v * 10) / 10])) as Pose;
        this.poses[name] = saved;
        return { text: `Saved pose '${name}': ${fmtPose(saved)}`, clamped: [] };
    }

    /** One MCP tool call, as server.py would run it. Appends call/move/result steps. */
    run(call: ToolCall): { text: string; clamped: string[] } {
        const id = nextCallId++;
        this.steps.push({ kind: "call", id, line: formatCall(call), call });
        const a = call.args;
        const speed = (d: number) => (typeof a.speed === "number" ? a.speed : d);
        let r: { text: string; clamped: string[] };
        switch (call.tool) {
            case "move_joints":
            case "nudge": {
                const joints: Partial<Pose> = {};
                for (const k of JOINTS) if (typeof a[k] === "number" && (call.tool === "move_joints" || a[k])) joints[k] = a[k] as number;
                if (Object.keys(joints).length === 0)
                    r = { text: call.tool === "nudge" ? "No changes given." : "No joint targets given.", clamped: [] };
                else r = call.tool === "nudge" ? this.nudge(joints, speed(30)) : this.move(joints, speed(DEFAULT_SPEED));
                break;
            }
            case "gripper":
                r = this.gripper(Number(a.percent_open), speed(60));
                break;
            case "go_to_pose":
                r = this.goToPose(String(a.name), speed(DEFAULT_SPEED));
                break;
            case "gesture":
                r = this.gesture(String(a.name), typeof a.repeats === "number" ? a.repeats : 3);
                break;
            case "release":
                r = this.release();
                break;
            case "status":
                r = this.status();
                break;
            case "list_poses":
                r = this.listPoses();
                break;
            case "save_pose":
                r = this.savePose(String(a.name));
                break;
            default:
                r = { text: `${call.tool} isn't available in the browser demo.`, clamped: [] };
        }
        this.steps.push({ kind: "result", id, ...r });
        return r;
    }

    event(event: CubeEvent) {
        this.steps.push({ kind: "event", event });
    }
}

/** The tool calls an action maps to (what the app sends to the MCP tools). */
function toolCalls(action: Action): ToolCall[] {
    switch (action.type) {
        case "gesture":
            return [{ tool: "gesture", args: { name: action.name, repeats: action.repeats } }];
        case "pose":
            return [{ tool: "go_to_pose", args: { name: action.name } }];
        case "gripper":
            return [{ tool: "gripper", args: { percent_open: action.open } }];
        case "nudge":
            return [{ tool: "nudge", args: { [action.joint]: action.deg } }];
        case "release":
            return [{ tool: "release", args: {} }];
        case "status":
            return [{ tool: "status", args: {} }];
        case "list_poses":
            return [{ tool: "list_poses", args: {} }];
        default:
            return [];
    }
}

/** Demo-only: pick the cube up from its spot (a shoulder_pan) and put it down on the default spot across. */
function pickCube(arm: SimArm, spot: number): number {
    const to = otherSpot(spot);
    const { hover, down } = PICK;
    const hoverLift = { shoulder_lift: hover.shoulder_lift, elbow_flex: hover.elbow_flex, wrist_flex: hover.wrist_flex };
    arm.run({ tool: "move_joints", args: { shoulder_pan: spot, ...hover, gripper: PICK.open } });
    arm.run({ tool: "move_joints", args: { ...down, speed: 20 } });
    arm.run({ tool: "gripper", args: { percent_open: PICK.grip } });
    arm.event({ type: "cube:attach", spot });
    arm.run({ tool: "move_joints", args: { shoulder_pan: to, ...hoverLift, speed: 30 } });
    arm.run({ tool: "move_joints", args: { ...down, speed: 20 } });
    arm.run({ tool: "gripper", args: { percent_open: PICK.open } });
    arm.event({ type: "cube:release", spot: to });
    arm.run({ tool: "move_joints", args: { ...hoverLift, speed: 30 } });
    arm.run({ tool: "go_to_pose", args: { name: "ready" } });
    return to;
}

/** What the arm does for a piece of text, starting from `from` (the pose after everything already queued). */
export function plan(text: string, from: Pose, ctx: PlanCtx): Plan {
    const arm = new SimArm(from);
    const parsed = parseLocal(text);
    const base = { notes: [] as string[], stop: false, cubeSpot: ctx.cubeSpot };
    const finish = (p: Partial<Plan> & { intent: Intent | null; reply: string }): Plan => {
        const calls = arm.steps.flatMap((s) => (s.kind === "call" ? [s.call] : []));
        const clamped = arm.steps.some((s) => s.kind === "result" && s.clamped.length > 0);
        return {
            ...base,
            calls,
            lines: calls.map(formatCall),
            steps: arm.steps,
            endPose: arm.pose,
            clamped,
            ...p,
        };
    };
    if (!parsed) return finish({ intent: null, reply: UNKNOWN_REPLY });
    const { intent, reply, actions, multi } = parsed;
    if (multi) base.notes.push(MULTI_NOTE);
    const action = actions[0];
    if (action.type === "stop") return finish({ intent, reply, stop: true });
    if (action.type === "teleop") return finish({ intent, reply: TELEOP_REPLY });
    if (action.type === "pick_cube") {
        const cubeSpot = pickCube(arm, ctx.cubeSpot);
        return finish({ intent, reply, cubeSpot });
    }
    for (const call of toolCalls(action)) arm.run(call);
    return finish({ intent, reply });
}
