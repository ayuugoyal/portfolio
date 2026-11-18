"use client";

import { useSyncExternalStore } from "react";
import { SAFETY } from "@/lib/rover/sim";
import { cn } from "@/lib/utils";
import type { HudSnapshot, RoverStore } from "./rover-store";

const s1 = (v: number) => v.toFixed(1);

function Timer({ label, value, limit, active }: { label: string; value: string; limit: string; active: boolean }) {
    return (
        <div className="flex items-baseline justify-between gap-3">
            <span className="text-muted-foreground">{label}</span>
            <span className={cn("tabular-nums", active ? "text-brand-ink" : "text-foreground")}>
                {value}
                <span className="text-muted-foreground"> / {limit} s</span>
            </span>
        </div>
    );
}

/** DOM overlay above the canvas: mode, the real safety values with live timers, last reason. */
export function RoverHud({ store }: { store: RoverStore }) {
    const snap: HudSnapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
    const guided = snap.mode === "GUIDED";
    return (
        <div className="pointer-events-none absolute inset-0 flex items-start justify-between gap-2 p-2 font-mono text-[10px] leading-tight sm:p-3 sm:text-xs">
            <div className="flex min-w-0 flex-col items-start gap-1">
                <span
                    className={cn(
                        "rounded border px-2 py-0.5 font-semibold tracking-wider",
                        guided
                            ? "border-brand bg-brand text-brand-foreground"
                            : "border-border bg-card text-foreground"
                    )}
                >
                    {snap.mode}
                </span>
                <span className="max-w-[16rem] truncate rounded bg-background/80 px-1.5 py-0.5 text-muted-foreground">
                    {snap.reason}
                </span>
            </div>
            <div className="w-36 shrink-0 space-y-0.5 rounded border border-border bg-card/85 px-2 py-1.5 sm:w-44">
                <Timer
                    label="debounce"
                    value={s1(Math.min(snap.seen, SAFETY.debounce))}
                    limit={String(SAFETY.debounce)}
                    active={snap.detecting && !guided}
                />
                <Timer
                    label="cooldown"
                    value={s1(snap.cooldown)}
                    limit={String(SAFETY.cooldown)}
                    active={snap.cooldown > 0}
                />
                <Timer
                    label="watchdog"
                    value={s1(snap.sinceProgress)}
                    limit={String(SAFETY.watchdog)}
                    active={guided}
                />
            </div>
        </div>
    );
}

/** One quiet line under the scene: how to interact, and what this is (and is not). */
export function RoverCaption({ interactive }: { interactive: boolean }) {
    return (
        <p className="mt-2 font-mono text-[11px] text-muted-foreground sm:text-xs">
            {interactive ? "tap the ground to drop an obstacle · drag to orbit · " : "3D view needs WebGL · "}
            debounce {SAFETY.debounce} s · cooldown {SAFETY.cooldown} s · watchdog {SAFETY.watchdog} s ·{" "}
            <span className="text-foreground">scripted steering, not Nav2</span>
        </p>
    );
}
