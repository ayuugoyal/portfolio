/**
 * Real-arm degrees -> rotation of the GLB's joint nodes (local Z, radians).
 *
 * so101_new_calib.urdf is drawn so that 0 rad is the middle of each joint's calibrated range and positive
 * angles turn the same way as the real arm's degrees, so the map is identity. Checked with forward kinematics
 * on the built GLB: ready (all 0) has the upper arm vertical and the forearm pointing forward; elbow_flex -40
 * raises the forearm (hand_up); rest folds the upper arm back with the forearm over it and the gripper up.
 * If something looks mirrored, open the page with `?arm-debug` and flip `sign` / adjust `offsetDeg` here.
 */
import type { Joint } from "./types";

export type JointMapEntry = {
    /** node name in so101.v1.glb */
    node: string;
    sign: 1 | -1;
    offsetDeg: number;
};

export const JOINT_MAP: Record<Joint, JointMapEntry> = {
    shoulder_pan: { node: "shoulder_pan", sign: 1, offsetDeg: 0 },
    shoulder_lift: { node: "shoulder_lift", sign: 1, offsetDeg: 0 },
    elbow_flex: { node: "elbow_flex", sign: 1, offsetDeg: 0 },
    wrist_flex: { node: "wrist_flex", sign: 1, offsetDeg: 0 },
    wrist_roll: { node: "wrist_roll", sign: 1, offsetDeg: 0 },
    gripper: { node: "gripper", sign: 1, offsetDeg: 0 },
};

/** Gripper percent (0 closed, 100 open) -> jaw angle in degrees. URDF jaw range is -10°..100°. */
export const GRIPPER_DEG: readonly [closed: number, open: number] = [0, 100];

export function gripperDeg(percent: number): number {
    const [closed, open] = GRIPPER_DEG;
    return closed + ((open - closed) * percent) / 100;
}

/** Node rotation (radians about local Z) for a joint value in the real arm's units. */
export function toRad(joint: Joint, value: number, map: Record<Joint, JointMapEntry> = JOINT_MAP): number {
    const m = map[joint];
    const deg = joint === "gripper" ? gripperDeg(value) : value;
    return ((m.sign * deg + m.offsetDeg) * Math.PI) / 180;
}
