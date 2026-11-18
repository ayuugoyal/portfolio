/**
 * Constants of the real SO-101 setup, ported from so101-mcp (so101_core.py, commands.py, poses.json).
 * Degrees, 0 = middle of the calibrated range; the gripper is 0 (closed) to 100 (open).
 */
import type { Intent, Joint, Pose } from "./types";

export const JOINTS: readonly Joint[] = [
    "shoulder_pan",
    "shoulder_lift",
    "elbow_flex",
    "wrist_flex",
    "wrist_roll",
    "gripper",
];

/** Calibrated range of the real arm (read from its LeRobot calibration). */
export const LIMITS: Record<Joint, readonly [number, number]> = {
    shoulder_pan: [-111.3, 111.3],
    shoulder_lift: [-103.1, 103.1],
    elbow_flex: [-97.9, 97.9],
    wrist_flex: [-103.7, 103.7],
    wrist_roll: [-180, 180],
    gripper: [0, 100],
};

export const FPS = 30;
/** deg/s for the joint that travels furthest */
export const DEFAULT_SPEED = 40;
export const MIN_SPEED = 5;
export const MAX_SPEED = 100;
/** Pause after every move, as on the real arm (so101_core `_move`). */
export const SETTLE_S = 0.12;
export const MAX_REPEATS = 8;

export const RAISED: Partial<Pose> = { shoulder_lift: 0, elbow_flex: -40, wrist_flex: 0 };

export const GESTURES = ["wave", "nod", "shake", "look_around", "garba"] as const;
export type Gesture = (typeof GESTURES)[number];
export const isGesture = (s: string): s is Gesture => (GESTURES as readonly string[]).includes(s);

/** so101-mcp/poses.json (the "test" pose left out). */
export const POSES: Record<string, Partial<Pose>> = {
    rest: {
        shoulder_pan: 74.0,
        shoulder_lift: -102.3,
        elbow_flex: 97.9,
        wrist_flex: -103.2,
        wrist_roll: -85.1,
        gripper: 8.5,
    },
    ready: { shoulder_lift: 0.0, elbow_flex: 0.0, wrist_flex: 0.0 },
    hand_up: { shoulder_lift: 0.0, elbow_flex: -40.0, wrist_flex: 0.0 },
    face_me: { shoulder_pan: -102.5 },
};

/** Where the arm starts on the page: upright, gripper half open. */
export const START_POSE: Pose = {
    shoulder_pan: 0,
    shoulder_lift: 0,
    elbow_flex: 0,
    wrist_flex: 0,
    wrist_roll: 0,
    gripper: 30,
};

/**
 * Demo-only "pick up the cube". Found by forward kinematics on the URDF and checked in renders: `down` puts the
 * jaw tips just above the table 22 cm in front of the base, pointing straight down; `hover` is ~8 cm higher.
 * Those joints only set how far out the jaws reach, so every shoulder_pan gives a spot on one arc in front of
 * the base: a cube spot is just a shoulder_pan angle. It starts on `spots[0]` (right); visitors can place it
 * anywhere on the arc within ±`panMax`, and "pick up the cube" carries it to the default spot on the other side.
 * `grip` is where the moving jaw meets a 2.4 cm cube; `cubeOffset` is the cube centre in gripper_frame
 * coordinates (metres).
 */
export const PICK = {
    hover: { shoulder_lift: -6, elbow_flex: 1, wrist_flex: 92, wrist_roll: 0 },
    down: { shoulder_lift: 4, elbow_flex: 25, wrist_flex: 60 },
    spots: [-28, 28] as const, // [right, left]; starts on the right, so "put it on the left" works first try
    /** placeable spots: shoulder_pan within ±panMax (clear of the joint limit and the camera side) */
    panMax: 80,
    open: 90,
    grip: 8,
    cubeSize: 0.024,
    cubeOffset: [-0.016, 0, -0.008] as const,
};

/**
 * Keyword -> intent, ported from commands.py `_INTENTS` (same order: the first group that matches wins).
 * teleop_on/teleop_off are one "teleop" intent here; pick_cube, hand_up, status and list_poses are demo additions.
 * Keywords are matched as substrings of ` ${text.toLowerCase().trim()} `, exactly like the original.
 */
export const INTENTS: ReadonlyArray<readonly [Intent, readonly string[]]> = [
    ["stop", ["stop", "ruko", "ruk ja", "rukk", "freeze", "रुको", "रुक", "बस करो", "ruk jao"]],
    ["release", ["release", "torque off", "chhodo", "chodo", "छोड़ो", "relax", "limp"]],
    [
        "teleop",
        ["start teleop", "teleop on", "teleop start", "leader se", "follow the leader", "stop teleop", "teleop off", "end teleop"],
    ],
    ["garba", ["garba", "garbha", "dandiya", "dance", "naach", "nach", "गरबा", "डरबा", "डांस", "नाचो", "नाच"]],
    [
        "wave",
        ["wave", "hello", "hi ", "hey", "bye", "haath hila", "hath hila", "हाथ हिला", "हेलो", "नमस्ते", "namaste", "टाटा", "tata"],
    ],
    ["nod", ["nod", "yes", "haan", "han ", "हाँ", "हां", "sir hila"]],
    ["shake", ["shake", "say no", "nahi", "nahin", "mana kar", "नहीं", "मना"]],
    ["look_around", ["look around", "idhar udhar", "around", "scan", "चारों ओर", "इधर उधर"]],
    [
        "face_me",
        ["face me", "turn to me", "look at me", "meri taraf", "mere taraf", "मेरी तरफ", "मेरी तरफ़", "idhar dekho"],
    ],
    ["open", ["open", "kholo", "khol", "खोलो", "खोल"]],
    ["pick_cube", ["pick up the cube", "pick the cube", "pick up cube", "pick cube", "grab the cube", "cube", "block", "उठाओ"]],
    ["close", ["close", "grab", "band kar", "pakdo", "पकड़ो", "बंद"]],
    ["rest", ["rest", "sleep", "park", "so jao", "fold", "aaram", "सो जाओ", "आराम"]],
    ["ready", ["ready", "stand up", "utho", "uth ja", "खड़े", "उठो", "सीधे"]],
    ["left", ["left", "baaye", "baye", "bayen", "बाएं", "बाएँ", "बाये"]],
    ["right", ["right", "daaye", "daye", "dayen", "दाएं", "दाएँ", "दाये"]],
    ["hand_up", ["hand up", "raise your hand", "raise hand", "haath upar", "hath upar", "हाथ ऊपर"]],
    ["up", [" up", "upar", "raise", "lift", "ऊपर", "उपर"]],
    ["down", ["down", "neeche", "niche", "lower", "नीचे"]],
    ["status", ["status", "where are you", "joint angles", "how are you"]],
    ["list_poses", ["list poses", "poses", "saved poses"]],
];

/**
 * Intents whose matched keyword is cut out of the text before later groups are checked, so the words inside
 * "pick up the cube" or "raise your hand" don't also count as `up` / `close` (demo addition; the original
 * app has no such phrases).
 */
export const MASKING: ReadonlySet<Intent> = new Set<Intent>(["pick_cube", "hand_up"]);

/** commands.py `_REPLIES`, plus the demo additions. */
export const REPLIES: Record<Intent, string> = {
    stop: "Stopping.",
    release: "Parking and turning the motors off.",
    teleop: "Starting teleop.",
    garba: "Garba time!",
    wave: "Waving!",
    nod: "Nodding yes.",
    shake: "Shaking no.",
    look_around: "Looking around.",
    face_me: "Turning to face you.",
    open: "Opening the gripper.",
    close: "Closing the gripper.",
    rest: "Going to rest.",
    ready: "Standing up.",
    left: "Turning left.",
    right: "Turning right.",
    up: "Raising the arm.",
    down: "Lowering the arm.",
    pick_cube: "Picking up the cube.",
    hand_up: "Hand up!",
    status: "Here's where I am.",
    list_poses: "These are my saved poses.",
};

export const TELEOP_REPLY =
    "Teleop needs the leader arm plugged in next to the real one, so it only works on the desk, not in the browser.";
export const UNKNOWN_REPLY =
    "In this demo I can only wave, nod, shake, look around, dance garba, pick up the cube, open or close the gripper, " +
    "go to rest or ready, face you, or turn left/right/up/down (add degrees, like \"left 30\").";
export const MULTI_NOTE = "one thing at a time here — the real app hands multi-step requests to Claude";

/**
 * Strict mode (the mascot chat): keywords that can only mean the arm. No "hi", "hey", "yes", "right", "open"…
 * `rest`, `ready` and `stop` also count, but only when the text mentions the arm or robot.
 */
export const STRONG: Partial<Record<Intent, readonly string[]>> = {
    garba: ["garba", "garbha", "dandiya", "dance", "naach", "nachoo", "गरबा", "डांस", "नाचो"],
    wave: ["wave", "haath hila", "hath hila", "हाथ हिला"],
    nod: ["nod", "sir hila"],
    shake: ["shake your head", "shake", "say no"],
    look_around: ["look around", "idhar udhar", "इधर उधर", "चारों ओर"],
    face_me: ["face me", "turn to me", "look at me", "meri taraf", "मेरी तरफ"],
    pick_cube: ["pick up the cube", "pick the cube", "pick up cube", "pick cube", "grab the cube", "the cube"],
    hand_up: ["raise your hand", "hand up", "haath upar"],
};
export const ARM_GATED: ReadonlySet<Intent> = new Set<Intent>(["rest", "ready", "stop"]);
export const ARM_WORDS = /\b(arm|robot|so-?101)\b/;

/** A cube spot from any shoulder_pan: clamped to the placeable arc, rounded to a whole degree. */
export function clampSpot(pan: number): number {
    const v = Number.isFinite(pan) ? pan : PICK.spots[0];
    return Math.round(Math.min(PICK.panMax, Math.max(-PICK.panMax, v)));
}

/** Where "pick up the cube" carries the cube from `pan`: the default spot on the other side. */
export const otherSpot = (pan: number): number => (pan >= 0 ? Math.min(...PICK.spots) : Math.max(...PICK.spots));

/** "left" / "right" / "straight ahead" for a spot (positive shoulder_pan is the arm's left). */
export const spotSide = (pan: number): string => (pan >= 5 ? "left" : pan <= -5 ? "right" : "straight ahead");
