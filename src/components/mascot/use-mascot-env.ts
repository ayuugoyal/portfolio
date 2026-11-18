"use client";

import { useSyncExternalStore } from "react";
import { getArm, subscribeArm } from "@/lib/arm/bridge";

/** True while an arm scene is mounted on this page. */
export function useArmPresent(): boolean {
    return useSyncExternalStore(
        subscribeArm,
        () => getArm() !== null,
        () => false,
    );
}

const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeReduced(cb: () => void): () => void {
    const mq = window.matchMedia(REDUCED);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
}

/** prefers-reduced-motion, false on the server. */
export function useReducedMotionPref(): boolean {
    return useSyncExternalStore(
        subscribeReduced,
        () => window.matchMedia(REDUCED).matches,
        () => false,
    );
}
