/**
 * Claude's tools for the BCN3D Moveo twin. Pure TS: no React, no three.
 *
 * They follow the real arm's ROS 2 stack (github.com/ayuugoyal/bcn3d_ws): joint targets in the URDF's own
 * frame (every joint homes onto its MIN limit switch, so 0° is the switch and angles only go up), the named
 * poses from moveo.srdf / moveo_tasks/config/poses.yaml, and the pick_and_place sequence from sequences.yaml.
 * Angles are degrees on the wire (easier for a model than radians); the sim runs in radians.
 *
 * The defs live here (not in agent/tools.ts) so the SO-101 file stays a mirror of its MCP server.
 */
import { DEMO, JOINT_SPECS, POSES, type MoveoPose, type MoveoStep, type PoseName } from "./constants";
import { clampPose } from "./motion";

export const MOVEO_TOOL_NAMES = ["moveo_status", "moveo_move_joints", "moveo_go_to_pose", "moveo_run_sequence"] as const;
export type MoveoToolName = (typeof MOVEO_TOOL_NAMES)[number];
export type MoveoCall = { tool: MoveoToolName; args: Record<string, string | number> };

/** Argument names for the five joints, in JOINT_SPECS order. */
export const MOVEO_ARGS = ["j1_base", "j2_shoulder", "j3_elbow", "j4_wrist_roll", "j5_wrist_pitch"] as const;

export const SEQUENCES = { pick_and_place: DEMO } as const;
export type SequenceName = keyof typeof SEQUENCES;

const toDeg = (r: number) => (r * 180) / Math.PI;
const toRad = (d: number) => (d * Math.PI) / 180;
const deg0 = (r: number) => Math.round(toDeg(r));
const POSE_NAMES = Object.keys(POSES) as PoseName[];

/** "J_1 base 0-119°, J_2 shoulder 0-206°, …" */
export const moveoLimitsLine = (): string =>
    JOINT_SPECS.map((s, i) => `${MOVEO_ARGS[i]} 0-${Math.floor(toDeg(s.upper))}`).join(", ");

type JsonSchema = Record<string, unknown>;
const num = (description: string): JsonSchema => ({ type: "number", description });
const obj = (properties: Record<string, JsonSchema>, required: string[] = []): JsonSchema => ({
    type: "object",
    properties,
    required,
    additionalProperties: false,
});

export const MOVEO_TOOL_DEFS: readonly { name: MoveoToolName; description: string; input_schema: JsonSchema }[] = [
    {
        name: "moveo_status",
        description:
            "Report the BCN3D Moveo's five joint angles (degrees above each joint's home limit switch), their limits, and its named poses.",
        input_schema: obj({}),
    },
    {
        name: "moveo_move_joints",
        description: `Move the BCN3D Moveo's joints to absolute angles in degrees, measured up from each joint's home limit switch (0 = home). Omitted joints hold still. Limits: ${moveoLimitsLine()}; targets outside are clamped. speed is deg/s for the joint that travels furthest (10-90, default 60).`,
        input_schema: obj({
            ...Object.fromEntries(MOVEO_ARGS.map((a, i) => [a, num(`${JOINT_SPECS[i].label} target (degrees)`)])),
            speed: num("deg/s for the joint that travels furthest (10-90, default 60)"),
        }),
    },
    {
        name: "moveo_go_to_pose",
        description:
            "Move the BCN3D Moveo to a named pose: home (all joints on their limit switches), ready (mid-travel), pick_above / pick and place_above / place (its taught work area).",
        input_schema: obj({ name: { type: "string", enum: POSE_NAMES, description: "pose name" } }, ["name"]),
    },
    {
        name: "moveo_run_sequence",
        description:
            "Run a task sequence on the BCN3D Moveo, as its ROS 2 sequencer does. pick_and_place: pick_above, pick, close gripper, lift, place_above, place, open gripper, lift, ready. No gripper is fitted yet, so gripper steps are logged pauses.",
        input_schema: obj({ name: { type: "string", enum: Object.keys(SEQUENCES), description: "sequence name" } }, ["name"]),
    },
];

export const isMoveoToolName = (s: unknown): s is MoveoToolName =>
    typeof s === "string" && (MOVEO_TOOL_NAMES as readonly string[]).includes(s);
export const isMoveoCall = (c: { tool: string }): c is MoveoCall => isMoveoToolName(c.tool);

/** One call line for the transcript, e.g. `moveo_go_to_pose(name="ready")`. */
export function formatMoveoCall(call: MoveoCall): string {
    const args = Object.entries(call.args)
        .map(([k, v]) => `${k}=${typeof v === "string" ? JSON.stringify(v) : v}`)
        .join(", ");
    return `${call.tool}(${args})`;
}

function statusText(pose: MoveoPose): string {
    const joints = JOINT_SPECS.map((s, i) => `${MOVEO_ARGS[i]} (${s.urdf}): ${deg0(pose[i])}° of 0-${Math.floor(toDeg(s.upper))}°`);
    return [
        "BCN3D Moveo (simulated twin), 5 joints, no gripper fitted.",
        ...joints,
        `Named poses: ${POSE_NAMES.join(", ")}. Sequences: ${Object.keys(SEQUENCES).join(", ")}.`,
    ].join("\n");
}

export type MoveoExec = {
    /** what to play on the sim (may be empty) */
    steps: MoveoStep[];
    /** the tool_result for Claude */
    text: string;
    line: string;
    /** joints whose targets were outside their limits */
    clamped: string[];
    /** rad/s for the moves, when the call set a speed */
    speed?: number;
    error?: boolean;
};

/** Run one validated call against the current pose: what to play and what to tell Claude. */
export function executeMoveoCall(call: MoveoCall, pose: MoveoPose): MoveoExec {
    const line = formatMoveoCall(call);
    const a = call.args;
    switch (call.tool) {
        case "moveo_status":
            return { steps: [], text: statusText(pose), line, clamped: [] };
        case "moveo_go_to_pose": {
            const name = String(a.name) as PoseName;
            if (!(name in POSES)) return { steps: [], text: `Unknown pose. Options: ${POSE_NAMES.join(", ")}.`, line, clamped: [], error: true };
            return { steps: [{ kind: "move", to: POSES[name], label: name }], text: `At pose '${name}'.`, line, clamped: [] };
        }
        case "moveo_run_sequence": {
            const name = String(a.name) as SequenceName;
            const seq = SEQUENCES[name];
            if (!seq) return { steps: [], text: `Unknown sequence. Options: ${Object.keys(SEQUENCES).join(", ")}.`, line, clamped: [], error: true };
            return {
                steps: [...seq],
                text: `Sequence '${name}' done (${seq.length} steps; gripper steps logged, no gripper fitted). Now at 'ready'.`,
                line,
                clamped: [],
            };
        }
        case "moveo_move_joints": {
            const target = [...pose];
            let moved = false;
            MOVEO_ARGS.forEach((k, i) => {
                if (typeof a[k] === "number") {
                    target[i] = toRad(a[k] as number);
                    moved = true;
                }
            });
            if (!moved) return { steps: [], text: "No joints given; holding still.", line, clamped: [] };
            const { pose: to, clamped } = clampPose(target);
            const names = clamped.map((u) => MOVEO_ARGS[JOINT_SPECS.findIndex((s) => s.urdf === u)]);
            const speedDeg = typeof a.speed === "number" ? Math.min(90, Math.max(10, a.speed)) : undefined;
            const at = MOVEO_ARGS.map((k, i) => `${k}=${deg0(to[i])}`).join(", ");
            return {
                steps: [{ kind: "move", to, label: "move_joints" }],
                text: `Moved. Joints now: ${at}.${names.length ? ` Clamped to limits: ${names.join(", ")}.` : ""}`,
                line,
                clamped: names,
                ...(speedDeg ? { speed: toRad(speedDeg) } : {}),
            };
        }
    }
}

/**
 * The scripted fallback (no live agent): plain words to one call. Returns null when nothing matches.
 * English plus a little Hindi, like the SO-101's matcher.
 */
export function matchMoveo(text: string): { call: MoveoCall; reply: string } | null {
    const t = text.toLowerCase().trim();
    const call = (tool: MoveoToolName, args: Record<string, string | number> = {}): MoveoCall => ({ tool, args });
    if (/pick|place|demo|sequence|uthao|rakho/.test(t))
        return { call: call("moveo_run_sequence", { name: "pick_and_place" }), reply: "running the pick-and-place sequence" };
    if (/\b(home|park|ghar)\b/.test(t)) return { call: call("moveo_go_to_pose", { name: "home" }), reply: "back to the limit switches" };
    if (/\bready|start|taiyar\b/.test(t)) return { call: call("moveo_go_to_pose", { name: "ready" }), reply: "ready pose" };
    if (/status|where|angles|joints|kaha/.test(t)) return { call: call("moveo_status"), reply: "here's where every joint is" };
    const turn = t.match(/\b(?:turn|rotate|base|ghumao)\b.*?(\d{1,3})/);
    if (turn) return { call: call("moveo_move_joints", { j1_base: +turn[1] }), reply: `turning the base to ${turn[1]}°` };
    if (/\b(left|baaye|baen)\b/.test(t)) return { call: call("moveo_move_joints", { j1_base: 110 }), reply: "turning left" };
    if (/\b(right|daaye|daen)\b/.test(t)) return { call: call("moveo_move_joints", { j1_base: 10 }), reply: "turning right" };
    return null;
}

export const MOVEO_HELP = "try pick and place, ready, home, status, or turn the base to 90";
