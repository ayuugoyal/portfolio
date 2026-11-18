/**
 * The BCN3D Moveo as built in github.com/ayuugoyal/bcn3d_ws (src/moveo_description/urdf/moveo.urdf @ cee7021).
 * Angles are URDF radians. Every joint homes onto its MIN limit switch, so every joint is [0, upper] and
 * `home` (all zero) sits on the lower bound of all five; `ready` is mid-travel (both from moveo.srdf).
 *
 * GLB node names (scripts/build-moveo-glb.mjs): J_1 … J_5 -> joint_1 … joint_5, each turning about its local +Z.
 */

export const JOINTS = ["joint_1", "joint_2", "joint_3", "joint_4", "joint_5"] as const;
export type MoveoJoint = (typeof JOINTS)[number];

/** One angle per joint, in JOINTS order (radians). */
export type MoveoPose = readonly [number, number, number, number, number];

export type JointSpec = {
    node: MoveoJoint;
    /** name in the URDF / ros2_control */
    urdf: string;
    label: string;
    lower: number;
    upper: number;
};

/** limits copied from moveo.urdf <limit lower upper> */
export const JOINT_SPECS: readonly JointSpec[] = [
    { node: "joint_1", urdf: "J_1", label: "base", lower: 0, upper: 2.0708 },
    { node: "joint_2", urdf: "J_2", label: "shoulder", lower: 0, upper: 3.5967 },
    { node: "joint_3", urdf: "J_3", label: "elbow", lower: 0, upper: 3.4603 },
    { node: "joint_4", urdf: "J_4", label: "wrist roll", lower: 0, upper: 3.3077 },
    { node: "joint_5", urdf: "J_5", label: "wrist pitch", lower: 0, upper: 2.747 },
];

/**
 * Named poses. `home` / `ready` from moveo.srdf; `pick_above` / `place_above` from moveo_tasks/config/poses.yaml
 * (work area on the far side of the base, reached by leaning over on J_2). `pick` / `place` are not taught on
 * the real arm yet; here they lean J_2 a little further, which drops the wrist about 4 cm.
 */
export const POSES = {
    home: [0, 0, 0, 0, 0],
    ready: [1.04, 1.8, 1.73, 1.69, 1.37],
    pick_above: [0.15, 2.94, 0.378, 0.75, 1.925],
    pick: [0.15, 3.05, 0.378, 0.75, 1.925],
    place_above: [0.85, 2.94, 0.378, 0.75, 1.925],
    place: [0.85, 3.05, 0.378, 0.75, 1.925],
} as const satisfies Record<string, MoveoPose>;
export type PoseName = keyof typeof POSES;

/** what the scene shows first (and what the poster shows) */
export const START_POSE: MoveoPose = POSES.ready;

/**
 * Demo speed. The real arm is slow (J_1 sweeps its 119° in about 34 s); the browser version moves every joint
 * at up to this many rad/s so the demo takes seconds, not minutes.
 */
export const DEMO_SPEED = 1.1;
export const MIN_MOVE_S = 0.45;

export type MoveoStep =
    | { kind: "move"; to: MoveoPose; label: string }
    | { kind: "dwell"; seconds: number; label: string };

const move = (name: PoseName): MoveoStep => ({ kind: "move", to: POSES[name], label: name });

/**
 * A pick-and-place cycle, after `pick_and_place` in moveo_tasks/config/sequences.yaml. There is no gripper on
 * the arm yet, so the gripper steps are just pauses (the real sequencer only logs them too).
 */
export const DEMO: readonly MoveoStep[] = [
    move("pick_above"),
    move("pick"),
    { kind: "dwell", seconds: 0.6, label: "gripper: close (no gripper fitted, logged)" },
    move("pick_above"),
    move("place_above"),
    move("place"),
    { kind: "dwell", seconds: 0.6, label: "gripper: open (no gripper fitted, logged)" },
    move("place_above"),
    move("ready"),
];
