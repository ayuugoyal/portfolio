/**
 * The seam between the arm and the rest of the site (the mascot). Pure TS: no React, no three.
 *
 *  - The arm fires `arm:command` on window for every command it runs; anyone can listen.
 *  - The arm playground registers itself while mounted, so the mascot chat can forward text to it.
 */
import type { ArmCommandDetail, ArmSource, ToolCall } from "./types";

export { matchArmIntent } from "./parse";

export const ARM_COMMAND_EVENT = "arm:command";

export function emitArmCommand(detail: ArmCommandDetail): void {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent<ArmCommandDetail>(ARM_COMMAND_EVENT, { detail }));
}

export function onArmCommand(cb: (detail: ArmCommandDetail) => void): () => void {
    if (typeof window === "undefined") return () => {};
    const handler = (e: Event) => cb((e as CustomEvent<ArmCommandDetail>).detail);
    window.addEventListener(ARM_COMMAND_EVENT, handler);
    return () => window.removeEventListener(ARM_COMMAND_EVENT, handler);
}

/** What one structured tool call did on the simulated arm, once its motion has finished. */
export type ArmToolResult = {
    /** the tool_result for Claude: the real server's string plus simulation notes */
    text: string;
    /** formatted call line, e.g. `gesture(name="wave", repeats=3)` */
    line: string;
    /** the visitor pressed stop while it ran */
    stopped: boolean;
};

export type ArmHandle = {
    /** scripted: plain text through the local matcher */
    run(text: string, source: "mascot"): ArmCommandDetail;
    /**
     * live agent: one validated MCP tool call (Claude's). Resolves after the motion has finished.
     * `turn` groups the calls of one chat turn in the arm's transcript.
     */
    runTool(call: ToolCall, source: ArmSource, turn: string): Promise<ArmToolResult>;
};

let current: ArmHandle | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

/** Called by the arm playground on mount; the returned function unregisters it. Last one wins. */
export function registerArm(handle: ArmHandle): () => void {
    current = handle;
    notify();
    return () => {
        if (current === handle) {
            current = null;
            notify();
        }
    };
}

/** The arm on this page, or null when the page has none. */
export function getArm(): ArmHandle | null {
    return current;
}

/** For useSyncExternalStore: `useSyncExternalStore(subscribeArm, () => getArm() !== null, () => false)`. */
export function subscribeArm(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
