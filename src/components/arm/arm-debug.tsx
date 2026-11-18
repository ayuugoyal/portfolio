"use client";

import { useEffect, useReducer } from "react";
import { JOINTS, LIMITS, PICK, POSES, START_POSE } from "@/lib/arm/constants";
import { fix1 } from "@/lib/arm/format";
import type { Pose } from "@/lib/arm/types";
import { useArmScene } from "./arm-context";

/**
 * `?arm-debug`: joint sliders, quick poses and a live readout, for tuning JOINT_MAP (sign / offset per joint)
 * and the demo poses. Changes live in memory only; copy the printed JSON into src/lib/arm/joint-map.ts.
 */
export default function ArmDebug() {
    const { player, map } = useArmScene();
    const [, refresh] = useReducer((n: number) => n + 1, 0);

    useEffect(() => {
        const id = setInterval(refresh, 100);
        return () => clearInterval(id);
    }, []);

    const set = (pose: Partial<Pose>) => {
        if (!player.idle) player.stop();
        Object.assign(player.pose, pose);
        refresh();
    };
    const quick: Record<string, Partial<Pose>> = {
        start: START_POSE,
        ...POSES,
        pick_hover: { shoulder_pan: PICK.spots[0], ...PICK.hover },
        pick_down: { shoulder_pan: PICK.spots[0], ...PICK.down },
    };

    return (
        <div className="space-y-3 border-t border-border p-4 font-mono text-[11px]">
            <p className="text-muted-foreground">arm-debug · joint map + poses (in memory only)</p>
            <div className="flex flex-wrap gap-1.5">
                {Object.entries(quick).map(([name, p]) => (
                    <button key={name} type="button" className="btn-quiet" onClick={() => set({ ...START_POSE, ...p })}>
                        {name}
                    </button>
                ))}
            </div>
            {JOINTS.map((j) => {
                const [lo, hi] = LIMITS[j];
                return (
                    <div key={j} className="grid grid-cols-[7.5rem_1fr_3.5rem_auto_4.5rem] items-center gap-2">
                        <label htmlFor={`dbg-${j}`}>{j}</label>
                        <input
                            id={`dbg-${j}`}
                            type="range"
                            min={lo}
                            max={hi}
                            step={0.5}
                            value={player.pose[j]}
                            onChange={(e) => set({ [j]: Number(e.target.value) })}
                        />
                        <span className="text-right">{fix1(player.pose[j])}</span>
                        <button
                            type="button"
                            className="btn-quiet"
                            onClick={() => {
                                map[j].sign = map[j].sign === 1 ? -1 : 1;
                                refresh();
                            }}
                        >
                            sign {map[j].sign > 0 ? "+" : "−"}
                        </button>
                        <input
                            aria-label={`${j} offset (degrees)`}
                            type="number"
                            step={1}
                            value={map[j].offsetDeg}
                            onChange={(e) => {
                                map[j].offsetDeg = Number(e.target.value) || 0;
                                refresh();
                            }}
                            className="w-full rounded border border-border bg-background px-1"
                        />
                    </div>
                );
            })}
            <pre className="overflow-x-auto whitespace-pre rounded bg-muted p-2">
                {`pose: ${JSON.stringify(Object.fromEntries(JOINTS.map((j) => [j, Number(fix1(player.pose[j]))])))}\n`}
                {`map:  ${JSON.stringify(Object.fromEntries(JOINTS.map((j) => [j, [map[j].sign, map[j].offsetDeg]])))}`}
            </pre>
        </div>
    );
}
