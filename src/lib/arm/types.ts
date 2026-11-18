/** Shared types for the scripted SO-101 arm. Mirrors the real arm in so101-mcp (degrees, 0 = middle of range). */

export type Joint =
    | "shoulder_pan"
    | "shoulder_lift"
    | "elbow_flex"
    | "wrist_flex"
    | "wrist_roll"
    | "gripper";

export type Pose = Record<Joint, number>;

export type Intent =
    | "stop"
    | "release"
    | "teleop"
    | "pick_cube"
    | "garba"
    | "wave"
    | "nod"
    | "shake"
    | "look_around"
    | "face_me"
    | "hand_up"
    | "open"
    | "close"
    | "rest"
    | "ready"
    | "left"
    | "right"
    | "up"
    | "down"
    | "status"
    | "list_poses";

/** Tool names of the real MCP server (so101-mcp/server.py). */
export type ToolName =
    | "gesture"
    | "go_to_pose"
    | "gripper"
    | "nudge"
    | "move_joints"
    | "status"
    | "look"
    | "release"
    | "save_pose"
    | "list_poses";

export type ToolCall = { tool: ToolName; args: Record<string, string | number> };

/** Where a command came from: the arm's own prompt box, one of its chips, or the mascot chat. */
export type ArmSource = "prompt" | "chip" | "mascot";

/** Fired on window as `arm:command` every time the arm accepts a command. */
export type ArmCommandDetail = {
    source: ArmSource;
    text: string;
    intent: Intent | null;
    reply: string;
    /** formatted tool-call lines, e.g. `gesture(name="wave", repeats=3)` */
    calls: string[];
    clamped: boolean;
    stopped: boolean;
};
