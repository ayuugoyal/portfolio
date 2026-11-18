"use client";

import { useEffect, useState } from "react";
import { DEMO, JOINT_SPECS, POSES } from "@/lib/moveo/constants";
import { setJoint } from "@/lib/moveo/motion";
import { cn } from "@/lib/utils";
import { LazyScene } from "@/components/three/lazy-scene";
import { MoveoConsole } from "./moveo-console";
import { MoveoContext, MoveoStore, useMoveoState } from "./moveo-store";

// stable reference: LazyScene re-runs its loader effect when `load` changes
const loadCanvas = () => import("./moveo-canvas");

/** still render of the Moveo in its start pose (same camera as the canvas), shown until the scene draws */
export const MOVEO_POSTER = "/models/moveo-poster.v1.png";

const toDeg = (r: number) => (r * 180) / Math.PI;
const toRad = (d: number) => (d * Math.PI) / 180;
/** slider max in degrees, on the 0.5° grid so the browser can reach it */
const maxDeg = (r: number) => Math.floor(toDeg(r) * 2) / 2;

/**
 * The BCN3D Moveo in 3D: one slider per joint (limits from the real arm's URDF), a pick-and-place demo
 * replaying the arm's own task sequence, and buttons back to its named poses. All in the browser.
 * The pose changes every frame while something plays, so only the small subscribers below re-render;
 * the canvas reads the store directly.
 */
export function MoveoPlayground({ poster = MOVEO_POSTER, className }: { poster?: string; className?: string }) {
    const [store] = useState(() => new MoveoStore());
    useEffect(() => () => store.stop(), [store]);

    return (
        <MoveoContext.Provider value={store}>
            <section
                aria-label="BCN3D Moveo arm demo"
                className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}
            >
                <LazyScene
                    load={loadCanvas}
                    aspect="16 / 11"
                    poster={poster}
                    posterAlt="The BCN3D Moveo robot arm"
                    className="bg-muted/40"
                >
                    <SimBadge store={store} />
                </LazyScene>
                <div className="border-t border-border">
                    <MoveoConsole store={store} />
                </div>
                <MoveoControls store={store} />
                <p className="border-t border-border px-4 py-2 text-[11.5px] text-muted-foreground">
                    simulated in your browser — Claude drives it with tools that mirror the arm&apos;s ROS 2 poses and
                    task sequence; joint limits come from its URDF, motion is sped up
                </p>
            </section>
        </MoveoContext.Provider>
    );
}

function SimBadge({ store }: { store: MoveoStore }) {
    const { playing } = useMoveoState(store);
    return (
        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 font-pixel text-[10px] uppercase tracking-wider text-muted-foreground">
            <span
                aria-hidden
                className={cn(
                    "inline-block h-1.5 w-1.5",
                    playing ? "animate-pulse bg-brand motion-reduce:animate-none" : "bg-muted-foreground/50"
                )}
            />
            moveo · sim
        </div>
    );
}

function MoveoControls({ store }: { store: MoveoStore }) {
    const { pose, label, playing } = useMoveoState(store);
    const goTo = (name: "ready" | "home") => store.play([{ kind: "move", to: POSES[name], label: name }], name);
    return (
        <div className="space-y-4 border-t border-border p-4">
            <fieldset className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                <legend className="sr-only">Joint angles</legend>
                {JOINT_SPECS.map((j, i) => {
                    const deg = toDeg(pose[i]);
                    const id = `moveo-${j.node}`;
                    return (
                        <div key={j.node} className="space-y-1">
                            <label htmlFor={id} className="flex items-baseline justify-between gap-2 text-xs">
                                <span>
                                    <span className="font-mono text-[10px] text-muted-foreground">{j.urdf}</span> {j.label}
                                </span>
                                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                                    {deg.toFixed(0)}° / {maxDeg(j.upper).toFixed(0)}°
                                </span>
                            </label>
                            <input
                                id={id}
                                type="range"
                                min={0}
                                max={maxDeg(j.upper)}
                                step={0.5}
                                value={Math.min(maxDeg(j.upper), Math.round(deg * 2) / 2)}
                                aria-valuetext={`${deg.toFixed(0)} degrees`}
                                onChange={(e) => store.setPose(setJoint(store.get().pose, i, toRad(+e.target.value)))}
                                className="h-4 w-full cursor-pointer accent-brand"
                            />
                        </div>
                    );
                })}
            </fieldset>

            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    className="btn-solid"
                    onClick={() => (playing === "demo" ? store.stop() : store.play(DEMO, "demo"))}
                >
                    {playing === "demo" ? "stop" : "demo: pick & place"}
                </button>
                <button type="button" className="btn-quiet" onClick={() => goTo("ready")}>
                    ready
                </button>
                <button type="button" className="btn-quiet" onClick={() => goTo("home")}>
                    home
                </button>
                <p aria-live="polite" className="min-w-0 basis-full font-mono text-[11px] text-muted-foreground sm:ml-auto sm:basis-auto">
                    {playing && label ? `⏺ ${label}` : " "}
                </p>
            </div>
        </div>
    );
}
