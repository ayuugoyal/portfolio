"use client";

import { useSyncExternalStore } from "react";
import { getArm, subscribeArm } from "@/lib/arm/bridge";

/** Whether this page has an arm playground mounted (the mascot forwards arm commands to it). */
export function useArmPresent(): boolean {
    return useSyncExternalStore(subscribeArm, () => getArm() !== null, () => false);
}
