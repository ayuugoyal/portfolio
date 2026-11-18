"use client";

import { useState } from "react";
import { LazyScene } from "@/components/three/lazy-scene";
import { useWebGL } from "@/components/three/use-webgl";
import { cn } from "@/lib/utils";
import { RoverCaption, RoverHud } from "./rover-hud";
import { createRoverStore, RoverStoreContext } from "./rover-store";

// stable reference: LazyScene re-runs its loader effect when `load` changes
const loadRover = () => import("./rover-canvas");

/**
 * Raftaar's obstacle-avoidance hand-off as a small 3D scene: the rover follows a loop in AUTO,
 * an obstacle shows up, the LiDARs flag it, mode flips to GUIDED, it swerves, and AUTO resumes.
 * Scripted steering in the browser, not Nav2.
 */
export function RoverPlayground({
    poster,
    posterAlt = "Low-poly model of the Raftaar rover on a loop with LiDAR rays",
    className,
}: {
    poster?: string;
    posterAlt?: string;
    className?: string;
}) {
    const [store] = useState(() => createRoverStore());
    const webgl = useWebGL();
    return (
        <RoverStoreContext.Provider value={store}>
            <div className={className}>
                <LazyScene
                    load={loadRover}
                    aspect="16 / 9"
                    poster={poster}
                    posterAlt={posterAlt}
                    className={cn("rounded-xl border border-border bg-card")}
                >
                    <RoverHud store={store} />
                </LazyScene>
                <RoverCaption interactive={webgl !== false} />
            </div>
        </RoverStoreContext.Provider>
    );
}
