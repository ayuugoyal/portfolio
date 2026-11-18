"use client";

import { createContext, useContext } from "react";
import { JOINT_MAP, type JointMapEntry } from "@/lib/arm/joint-map";
import type { ArmPlayer } from "@/lib/arm/player";
import type { Joint } from "@/lib/arm/types";

/** Shared between the playground (DOM, always rendered) and the lazily loaded canvas. */
export type ArmScene = {
    player: ArmPlayer;
    /** set by the canvas every frame it ticks the player, so the DOM ticker knows to stand down */
    canvasTick: { at: number };
    /** live joint map; `?arm-debug` edits a copy of it */
    map: Record<Joint, JointMapEntry>;
};

export const ArmContext = createContext<ArmScene | null>(null);

export function useArmScene(): ArmScene {
    const ctx = useContext(ArmContext);
    if (!ctx) throw new Error("useArmScene must be used inside <ArmPlayground>");
    return ctx;
}

export const cloneMap = (): Record<Joint, JointMapEntry> =>
    Object.fromEntries(Object.entries(JOINT_MAP).map(([k, v]) => [k, { ...v }])) as Record<Joint, JointMapEntry>;
