import { JOINTS } from "./constants";
import type { Pose, ToolCall } from "./types";

const num = (v: number) => (Number.isInteger(v) ? String(v) : String(Number(v.toFixed(1))));

/** A tool call the way Claude Code prints it, Python-kwargs style: `gesture(name="wave", repeats=3)`. */
export function formatCall(call: ToolCall): string {
    const args = Object.entries(call.args).map(([k, v]) => `${k}=${typeof v === "string" ? JSON.stringify(v) : num(v)}`);
    return `${call.tool}(${args.join(", ")})`;
}

/** so101_core `fmt`: `shoulder_pan=0.0, shoulder_lift=-40.0, …` in joint order. */
export function fmtPose(pose: Partial<Pose>): string {
    return JOINTS.filter((k) => pose[k] !== undefined)
        .map((k) => `${k}=${fix1(pose[k] as number)}`)
        .join(", ");
}

/** Python's `f"{v:.1f}"` (no "-0.0" surprises from float noise). */
export function fix1(v: number): string {
    const s = v.toFixed(1);
    return s === "-0.0" ? "0.0" : s;
}
