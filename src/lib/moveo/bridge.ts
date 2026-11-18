/**
 * The seam between the BCN3D Moveo demo and the rest of the site (the mascot chat, the page context).
 * The Moveo playground registers itself while mounted. Pure TS.
 */
import type { MoveoCall } from "./tools";

export type MoveoToolResult = { text: string; line: string; stopped: boolean; error?: boolean };

export type MoveoHandle = {
    /** one validated moveo_* call (Claude's). Resolves after the motion has finished. */
    runTool(call: MoveoCall): Promise<MoveoToolResult>;
};

let current: MoveoHandle | null = null;
const listeners = new Set<() => void>();

export function registerMoveo(handle: MoveoHandle): () => void {
    current = handle;
    listeners.forEach((l) => l());
    return () => {
        if (current !== handle) return;
        current = null;
        listeners.forEach((l) => l());
    };
}

export const getMoveo = (): MoveoHandle | null => current;

export function subscribeMoveo(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export const NO_MOVEO =
    "The BCN3D Moveo isn't on this page. Its 3D demo is on /robotics (the BCN3D Moveo tab) and on the home page's robots section.";
