/**
 * The arm tools Claude gets: the same names, arguments and descriptions as the real MCP server
 * (so101-mcp/server.py), so the simulated twin is driven exactly like the arm on the desk.
 * Shared by the server (tool list, history validation) and the browser (validates every call before it runs).
 */
import { GESTURES, JOINTS } from "@/lib/arm/constants";
import type { Joint, ToolCall, ToolName } from "@/lib/arm/types";
import { MOVEO_TOOL_DEFS, type MoveoCall, type MoveoToolName } from "@/lib/moveo/tools";

type JsonSchema = Record<string, unknown>;
export type ToolDef = { name: ToolName; description: string; input_schema: JsonSchema };

const num = (description: string): JsonSchema => ({ type: "number", description });

const jointProps = (what: string): Record<Joint, JsonSchema> =>
    Object.fromEntries(JOINTS.map((j) => [j, num(j === "gripper" ? `gripper ${what} (0-100)` : `${j} ${what} (degrees)`)])) as Record<
        Joint,
        JsonSchema
    >;

const obj = (properties: Record<string, JsonSchema>, required: string[] = []): JsonSchema => ({
    type: "object",
    properties,
    required,
    additionalProperties: false,
});

/** Deterministic order (it is part of the cached prompt prefix). Descriptions are the server.py docstrings. */
export const TOOL_DEFS: readonly ToolDef[] = [
    {
        name: "status",
        description:
            "Connect if needed and report joint angles (degrees; gripper 0-100), joint limits, motor temperatures and supply voltage.",
        input_schema: obj({}),
    },
    {
        name: "move_joints",
        description:
            "Move joints to absolute targets (degrees; gripper 0-100). Omitted joints hold still. speed is deg/s for the joint that travels furthest (5-100, default 40). Targets outside a joint's calibrated range are clamped.",
        input_schema: obj({ ...jointProps("target"), speed: num("deg/s for the joint that travels furthest (5-100, default 40)") }),
    },
    {
        name: "nudge",
        description: "Move joints by relative amounts (degrees; gripper in 0-100 units) from where they are now.",
        input_schema: obj({ ...jointProps("change"), speed: num("deg/s (default 30)") }),
    },
    {
        name: "gripper",
        description: "Open or close the gripper: 0 = closed, 100 = fully open.",
        input_schema: obj({ percent_open: num("0 = closed, 100 = fully open"), speed: num("deg/s (default 60)") }, ["percent_open"]),
    },
    {
        name: "go_to_pose",
        description:
            "Move to a saved pose by name (see list_poses). 'rest' is the folded parking pose, 'face_me' turns toward the user.",
        input_schema: obj({ name: { type: "string", description: "pose name" }, speed: num("deg/s (default 40)") }, ["name"]),
    },
    {
        name: "save_pose",
        description: "Save the arm's current joint angles under a name, for go_to_pose later.",
        input_schema: obj({ name: { type: "string", description: "pose name" } }, ["name"]),
    },
    {
        name: "list_poses",
        description: "List saved poses and their joint angles.",
        input_schema: obj({}),
    },
    {
        name: "gesture",
        description:
            "Play a gesture, then return to the pose the arm was in before. Gestures: wave (raise arm, wave the wrist), nod (yes), shake (no), look_around (slow base sweep), garba (sway, bounce, wrist twirls and gripper claps).",
        input_schema: obj(
            {
                name: { type: "string", enum: [...GESTURES], description: "gesture name" },
                repeats: { type: "integer", description: "how many times (1-8, default 3)" },
            },
            ["name"]
        ),
    },
    {
        name: "release",
        description: "Park the arm at its rest pose and turn torque off (motors go limp). Call this when done.",
        input_schema: obj({}),
    },
    {
        name: "look",
        description:
            "Take a photo with a camera (OpenCV index, usually 0 or 1) to see the arm and its surroundings. If SO-101 Studio is showing a live camera, that camera's latest frame is used.",
        input_schema: obj({ camera: { type: "integer", description: "camera index (default 0)" } }),
    },
];

/** Everything Claude gets: the SO-101's MCP tools, then the BCN3D Moveo's (lib/moveo/tools.ts). Fixed order. */
export const AGENT_TOOL_DEFS: readonly { name: ToolName | MoveoToolName; description: string; input_schema: JsonSchema }[] = [
    ...TOOL_DEFS,
    ...MOVEO_TOOL_DEFS,
];

export const TOOL_NAMES: ReadonlySet<string> = new Set(AGENT_TOOL_DEFS.map((t) => t.name));
export const isToolName = (s: unknown): s is ToolName | MoveoToolName => typeof s === "string" && TOOL_NAMES.has(s);

/** A validated call for either robot (`isMoveoCall` tells them apart). */
export type AgentCall = ToolCall | MoveoCall;
export type Validated = { ok: true; call: AgentCall } | { ok: false; error: string };

const finite = (v: unknown, lo: number, hi: number): v is number =>
    typeof v === "number" && Number.isFinite(v) && v >= lo && v <= hi;

/**
 * Check one tool_use input against its schema. Model output is untrusted (eager input streaming means the API
 * no longer validates it, and a tolerant JSON parser can hand back a truncated object), so nothing runs unless
 * this passes. Returns the call in the arm engine's shape.
 */
export function validateToolInput(name: unknown, input: unknown): Validated {
    if (!isToolName(name)) return { ok: false, error: "unknown tool" };
    if (typeof input !== "object" || input === null || Array.isArray(input)) return { ok: false, error: "input must be an object" };
    const def = AGENT_TOOL_DEFS.find((t) => t.name === name)!;
    const props = (def.input_schema.properties ?? {}) as Record<string, JsonSchema>;
    const required = (def.input_schema.required ?? []) as string[];
    const args: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
        const p = props[k];
        if (!p) return { ok: false, error: `unexpected argument '${k}'` };
        if (v === null || v === undefined) continue;
        if (p.type === "number") {
            // joint targets/deltas are clamped later; this only rejects garbage
            if (!finite(v, -10_000, 10_000)) return { ok: false, error: `'${k}' must be a number` };
            if (k === "speed" && !(v > 0)) return { ok: false, error: "'speed' must be positive" };
            args[k] = v;
        } else if (p.type === "integer") {
            if (!finite(v, -1_000, 1_000) || !Number.isInteger(v)) return { ok: false, error: `'${k}' must be an integer` };
            args[k] = v;
        } else {
            if (typeof v !== "string") return { ok: false, error: `'${k}' must be a string` };
            const s = v.trim();
            if (!/^[A-Za-z0-9_ -]{1,32}$/.test(s)) return { ok: false, error: `'${k}' must be 1-32 letters, digits, _ or -` };
            if (Array.isArray(p.enum) && !(p.enum as string[]).includes(s)) {
                const what = k === "name" && name === "gesture" ? "gesture" : k;
                return { ok: false, error: `Unknown ${what}. Options: ${(p.enum as string[]).join(", ")}.` };
            }
            args[k] = s;
        }
    }
    for (const r of required) if (!(r in args)) return { ok: false, error: `missing '${r}'` };
    return { ok: true, call: { tool: name, args } as AgentCall };
}
