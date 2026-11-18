/**
 * One structured MCP tool call (from Claude) -> what the simulated arm does and what the real server would
 * return. Pure TS: the browser enqueues the steps on the ArmPlayer and hands `text` back to Claude as the
 * tool_result once the motion has finished.
 *
 * The cube is physical-ish: closing the jaws around it in the pick-down pose grabs it, opening them in the
 * pick-down pose puts it down on the table there (any shoulder_pan within ±PICK.panMax), opening them anywhere
 * else drops it back onto its spot. A spot is a shoulder_pan angle.
 */
import { JOINTS, LIMITS, PICK, POSES, spotSide } from "./constants";
import { fix1, fmtPose, formatCall } from "./format";
import { SimArm, type CubeEvent, type Step, serverText, takeCallId } from "./plan";
import type { Pose, ToolCall } from "./types";

/** spot: the shoulder_pan of the cube's table spot */
export type CubeState = { spot: number; held: boolean };

export type SimState = {
    pose: Pose;
    cube: CubeState;
    /** saved poses for this page visit (starts as the real arm's poses.json) */
    poses: Record<string, Partial<Pose>>;
};

export type ToolExec = {
    /** formatted call line, e.g. `gesture(name="wave", repeats=3)` */
    line: string;
    steps: Step[];
    /** the tool_result text, as the real server words it (clamp tail included) plus simulation notes */
    text: string;
    clamped: string[];
    /** simulation notes (cube grabbed / put down / dropped), also appended to `text` */
    notes: string[];
    /** the state after the call */
    state: SimState;
};

/** Jaws at or below this are closed on the cube; above it the cube slips out. */
const CLOSED = 30;

export const initialPoses = (): Record<string, Partial<Pose>> =>
    Object.fromEntries(Object.entries(POSES).map(([k, v]) => [k, { ...v }]));

/** The jaws are down on the table at `pan` (the PICK "down" pose, give or take). */
export function nearDown(p: Pose, pan: number): boolean {
    const { down } = PICK;
    return (
        Math.abs(p.shoulder_pan - pan) <= 6 &&
        Math.abs(p.shoulder_lift - down.shoulder_lift) <= 8 &&
        Math.abs(p.elbow_flex - down.elbow_flex) <= 10 &&
        Math.abs(p.wrist_flex - down.wrist_flex) <= 12 &&
        Math.abs(p.wrist_roll - PICK.hover.wrist_roll) <= 25
    );
}

/** The table spot (shoulder_pan) the jaws are down on, or null when they aren't down on the table arc. */
function spotAt(p: Pose): number | null {
    if (Math.abs(p.shoulder_pan) > PICK.panMax || !nearDown(p, p.shoulder_pan)) return null;
    return Math.round(p.shoulder_pan);
}

const spotLabel = (spot: number) => `shoulder_pan ${spot} (${spotSide(spot)} of the base)`;

/** What the simulated camera "sees": the text `look` returns in the browser demo. */
export function describeScene(state: SimState, camera = 0): string {
    const { pose, cube } = state;
    const named = Object.entries(state.poses).find(([, p]) =>
        (Object.entries(p) as [keyof Pose, number][]).every(([k, v]) => Math.abs(pose[k] - v) < 1.5)
    );
    const lines = [
        `Simulated camera ${camera} (browser demo: a description of the 3D scene instead of a photo).`,
        `Arm: ${fmtPose(pose)}${named ? ` (at '${named[0]}')` : ""}. Gripper ${fix1(pose.gripper)}% open.`,
        cube.held
            ? "Cube: a 2.4 cm cube is held between the jaws."
            : `Cube: a 2.4 cm cube sits on the table at ${spotLabel(cube.spot)}.`,
        `Table: the pick recipe reaches any spot on the arc in front of the base from shoulder_pan -${PICK.panMax} to ${PICK.panMax}; the usual spots are left (shoulder_pan ${Math.max(...PICK.spots)}) and right (shoulder_pan ${Math.min(...PICK.spots)}).`,
    ];
    return lines.join("\n");
}

/**
 * Run one validated tool call on a virtual copy of the arm. Never throws for model input: unknown names
 * and bad values come back as the server's own error strings.
 */
export function executeToolCall(call: ToolCall, state: SimState): ToolExec {
    const poses = { ...state.poses };
    const arm = new SimArm(state.pose, poses);
    let cube: CubeState = { ...state.cube };
    const notes: string[] = [];
    let r: { text: string; clamped: string[] };

    if (call.tool === "look") {
        const camera = typeof call.args.camera === "number" ? call.args.camera : 0;
        r = { text: describeScene({ pose: arm.pose, cube, poses }, camera), clamped: [] };
        const id = takeCallId();
        arm.steps.push({ kind: "call", id, line: formatCall(call), call }, { kind: "result", id, ...r });
    } else {
        r = arm.run(call);
    }
    const callStep = arm.steps.find((s) => s.kind === "call") as Extract<Step, { kind: "call" }>;

    // cube physics on every motion step of this call
    const steps: Step[] = [];
    let prev: Pose = { ...state.pose };
    const event = (e: CubeEvent) => steps.push({ kind: "event", event: e });
    for (const s of arm.steps) {
        if (s.kind === "result") {
            if (call.tool === "release" && cube.held) {
                // torque off: the jaws go limp and the cube drops; the demo puts it back on its spot
                cube = { spot: cube.spot, held: false };
                event({ type: "cube:reset", spot: cube.spot });
                notes.push(`the cube dropped when the motors went limp; it is back at ${spotLabel(cube.spot)}`);
            }
            steps.push(s);
            continue;
        }
        steps.push(s);
        if (s.kind !== "move") continue;
        const to = s.to;
        if (!cube.held && prev.gripper > CLOSED && to.gripper <= CLOSED && nearDown(to, cube.spot)) {
            cube = { spot: cube.spot, held: true };
            event({ type: "cube:attach", spot: cube.spot });
            notes.push("the jaws closed on the cube: it is in the gripper");
        } else if (cube.held && to.gripper > CLOSED) {
            const at = spotAt(to);
            if (at !== null) {
                cube = { spot: at, held: false };
                event({ type: "cube:release", spot: at });
                notes.push(`the cube is down on the table at ${spotLabel(at)}`);
            } else {
                cube = { spot: cube.spot, held: false };
                event({ type: "cube:reset", spot: cube.spot });
                notes.push(
                    `the gripper opened away from the table, so the cube fell; the demo put it back at ${spotLabel(cube.spot)}`
                );
            }
        }
        prev = to;
    }

    const text = serverText(r) + (notes.length ? `\n(sim: ${notes.join("; ")})` : "");
    return {
        line: callStep.line,
        steps,
        text,
        clamped: r.clamped,
        notes,
        state: { pose: { ...arm.pose }, cube, poses },
    };
}

/** Joint limits as a compact line (for prompts and docs). */
export const limitsLine = (): string =>
    JOINTS.filter((j) => j !== "gripper")
        .map((j) => `${j} ±${Math.round(LIMITS[j][1])}`)
        .join(", ");
