/**
 * The site mascot: a chunky little clay-orange pixel creature, in the cute Claude Code spirit but
 * drawn as our own character (rounded body, shine pixel, two stubby legs, side nubs).
 * Pure data so the same sprite can be drawn by the client component and by OG image routes.
 *
 * 12x12 grid. 'c' = brand clay, 'f' = dark (eyes, mouth), 'e' = cream shine, '.' = empty.
 * The sprite faces right (eyes sit one pixel ahead when walking); the component mirrors it.
 */

export const SIZE = 12;

export type FrameName =
    | "idle"
    | "blink"
    | "talk"
    | "walk1"
    | "walk2"
    | "look"
    | "happy"
    | "wink"
    | "dizzy"
    | "surprised"
    | "surprised2";

const TOP = "...cccccc...";
const TOP_SHINE = "...eccccc...";
const SHINE = "..cecccccc..";
const PLAIN = "..cccccccc..";
const EYES = "..ccfccfcc..";
const EYES_AHEAD = "..cccfccfc..";
const ARMS = ".cccccccccc.";
const MOUTH = ".ccccffcccc.";
const BOTTOM = "...cccccc...";
const LEGS = "...c....c...";
const STEP_A = "..c....c....";
const STEP_B = "....c....c..";
const EMPTY = "............";

// faces for play, drag and drop
const HAPPY_EYES_TOP = "..ccfcccfc.."; // ^ ^
const HAPPY_EYES_LOW = "..cfcfcfcf..";
const SMILE_TOP = ".cccfccfccc.";
const SMILE_LOW = "..cccffccc..";
const WINK_TOP = "..ccfccccc..";
const WINK_LOW = "..ccfcfffc.."; // one eye open, the other a closed line
const X_EYES_A = "..cfcffcfc.."; // x x, three rows
const X_EYES_B = "..ccfccfcc..";
const X_EYES_C = ".ccfcffcfcc.";
const WOBBLY = "..ccfcfccc..";
const WIDE_EYES = "..cffccffc.."; // O O
const O_MOUTH_TOP = ".ccccffcccc.";
const O_MOUTH_LOW = "..cccffccc..";

export const FRAMES: Record<FrameName, string[]> = {
    idle: [EMPTY, EMPTY, TOP, SHINE, EYES, EYES, ARMS, ARMS, PLAIN, BOTTOM, LEGS, LEGS],
    blink: [EMPTY, EMPTY, TOP, SHINE, PLAIN, EYES, ARMS, ARMS, PLAIN, BOTTOM, LEGS, LEGS],
    talk: [EMPTY, EMPTY, TOP, SHINE, EYES, EYES, ARMS, MOUTH, PLAIN, BOTTOM, LEGS, LEGS],
    walk1: [EMPTY, EMPTY, TOP, SHINE, EYES_AHEAD, EYES_AHEAD, ARMS, ARMS, PLAIN, BOTTOM, LEGS, STEP_A],
    walk2: [EMPTY, EMPTY, TOP, SHINE, EYES_AHEAD, EYES_AHEAD, ARMS, ARMS, PLAIN, BOTTOM, LEGS, STEP_B],
    look: [EMPTY, EMPTY, TOP_SHINE, EYES, EYES, PLAIN, ARMS, ARMS, PLAIN, BOTTOM, LEGS, LEGS],
    happy: [EMPTY, EMPTY, TOP, SHINE, HAPPY_EYES_TOP, HAPPY_EYES_LOW, ARMS, SMILE_TOP, SMILE_LOW, BOTTOM, LEGS, LEGS],
    wink: [EMPTY, EMPTY, TOP, SHINE, WINK_TOP, WINK_LOW, ARMS, SMILE_TOP, SMILE_LOW, BOTTOM, LEGS, LEGS],
    dizzy: [EMPTY, EMPTY, TOP, SHINE, X_EYES_A, X_EYES_B, X_EYES_C, ARMS, WOBBLY, BOTTOM, LEGS, LEGS],
    // held up by the cursor: wide eyes, open mouth, legs kicking (two frames)
    surprised: [EMPTY, EMPTY, TOP, SHINE, WIDE_EYES, WIDE_EYES, ARMS, O_MOUTH_TOP, O_MOUTH_LOW, BOTTOM, LEGS, STEP_A],
    surprised2: [EMPTY, EMPTY, TOP, SHINE, WIDE_EYES, WIDE_EYES, ARMS, O_MOUTH_TOP, O_MOUTH_LOW, BOTTOM, LEGS, STEP_B],
};

/** A small "!" (4 wide x 6 tall), drawn above the mascot when the arm runs a command. */
export const BANG: string[] = [
    ".cc.",
    ".cc.",
    ".cc.",
    ".cc.",
    "....",
    ".cc.",
];

/** SVG path data for one frame: one unit square per pixel, merged per colour. */
export function toPaths(frame: string[]): { brand: string; visor: string; eye: string } {
    let brand = "";
    let visor = "";
    let eye = "";
    frame.forEach((row, y) => {
        for (let x = 0; x < row.length; x++) {
            const d = `M${x} ${y}h1v1h-1z`;
            const ch = row[x];
            if (ch === "c") brand += d;
            else if (ch === "f") visor += d;
            else if (ch === "e") eye += d;
        }
    });
    return { brand, visor, eye };
}
