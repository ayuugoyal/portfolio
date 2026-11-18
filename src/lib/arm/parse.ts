/**
 * Text -> arm action. A port of so101-mcp/commands.py `parse_local` (English, Hinglish, Hindi).
 * Pure TS: no React, no three (the mascot chat imports this).
 */
import { ARM_GATED, ARM_WORDS, INTENTS, MASKING, REPLIES, STRONG, type Gesture, isGesture } from "./constants";
import type { Intent, Joint } from "./types";

export type Action =
    | { type: "gesture"; name: Gesture; repeats: number }
    | { type: "pose"; name: string }
    | { type: "gripper"; open: number }
    | { type: "nudge"; joint: Joint; deg: number }
    | { type: "release" }
    | { type: "stop" }
    | { type: "teleop"; on: boolean }
    | { type: "pick_cube" }
    | { type: "status" }
    | { type: "list_poses" };

export type Parsed = {
    intent: Intent;
    reply: string;
    actions: Action[];
    /** every intent the text matched, in INTENTS order */
    hits: Intent[];
    /**
     * Two different movement intents ("wave and then open"). The original returns None here so Claude can
     * sequence them; the demo runs the first one and says so.
     */
    multi: boolean;
};

const NUM = /(\d+)\s*(?:times|x|baar|bar|बार)?/;

const pad = (text: string) => ` ${text.toLowerCase().trim()} `;

/** Intents matched by `t` in INTENTS order (demo: masking intents cut their phrase out for later groups). */
function intentHits(t: string): Intent[] {
    const hits: Intent[] = [];
    for (const [intent, words] of INTENTS) {
        const w = words.find((word) => t.includes(word));
        if (w === undefined) continue;
        hits.push(intent);
        if (MASKING.has(intent)) t = t.replace(w, " ");
    }
    return hits;
}

/** Reply and actions for a simple command, or null when nothing matched. */
export function parseLocal(text: string): Parsed | null {
    const t = pad(text);
    const hits = intentHits(t);
    if (hits.length === 0) return null;
    const intent = hits[0];
    const multi = new Set(hits.filter((h) => h !== "stop")).size > 1 && intent !== "stop";
    const m = NUM.exec(t);
    const n = m ? parseInt(m[1], 10) : null;
    let actions: Action[];
    if (isGesture(intent)) {
        actions = [{ type: "gesture", name: intent, repeats: n || (intent === "garba" ? 4 : 3) }];
    } else if (intent === "stop") {
        actions = [{ type: "stop" }];
    } else if (intent === "release") {
        actions = [{ type: "release" }];
    } else if (intent === "teleop") {
        actions = [{ type: "teleop", on: !/teleop off|end teleop|stop teleop/.test(t) }];
    } else if (intent === "face_me" || intent === "hand_up") {
        actions = [{ type: "pose", name: intent }];
    } else if (intent === "open" || intent === "close") {
        actions = [{ type: "gripper", open: intent === "open" ? 90 : 5 }];
    } else if (intent === "rest" || intent === "ready") {
        actions = [{ type: "pose", name: intent }];
    } else if (intent === "pick_cube" || intent === "status" || intent === "list_poses") {
        actions = [{ type: intent }];
    } else {
        // directional nudge; n = degrees if given
        const deg = n || 15;
        const [joint, sign] = (
            {
                left: ["shoulder_pan", 1],
                right: ["shoulder_pan", -1],
                up: ["shoulder_lift", 1],
                down: ["shoulder_lift", -1],
            } as const
        )[intent];
        actions = [{ type: "nudge", joint, deg: sign * deg }];
    }
    return { intent, reply: REPLIES[intent], actions, hits, multi };
}

/**
 * Which arm intent a piece of text asks for, if any.
 * strict: only unambiguous keywords (wave, garba, nod, shake, look around, pick up the cube, face me…);
 * rest/ready/stop only when the arm or robot is mentioned; words like "hi", "yes", "right", "open" never count.
 * The mascot chat uses strict mode.
 */
export function matchArmIntent(text: string, opts?: { strict?: boolean }): Intent | null {
    if (!opts?.strict) return parseLocal(text)?.intent ?? null;
    const t = pad(text);
    const armMentioned = ARM_WORDS.test(t);
    for (const [intent, words] of INTENTS) {
        if (STRONG[intent]?.some((w) => hasWord(t, w))) return intent;
        if (ARM_GATED.has(intent) && armMentioned && words.some((w) => hasWord(t, w))) return intent;
    }
    return null;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Whole-word match for Latin keywords ("nod" is not in "nodes", "rest" not in "interesting"). */
function hasWord(t: string, w: string): boolean {
    const word = w.trim();
    if (!/[a-z]/.test(word)) return t.includes(word);
    return new RegExp(`(?<![a-z])${escape(word)}(?![a-z])`).test(t);
}
