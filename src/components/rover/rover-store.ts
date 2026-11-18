"use client";

import { createContext } from "react";
import { createSim, mulberry32, type Mode, type RoverSim } from "@/lib/rover/sim";

/** What the DOM HUD shows; rebuilt at most ~10 times a second (and on every mode change). */
export type HudSnapshot = {
    mode: Mode;
    seen: number;
    cooldown: number;
    sinceProgress: number;
    reason: string;
    detecting: boolean;
    obstacles: number;
};

export type RoverStore = {
    sim: RoverSim;
    /** advance the sim; called from the canvas render loop */
    step(dt: number): void;
    /** drop an obstacle at a ground point; false when the sim refuses the spot */
    addObstacle(x: number, y: number): boolean;
    subscribe(listener: () => void): () => void;
    getSnapshot(): HudSnapshot;
};

const HUD_INTERVAL = 0.1;

function snapshotOf(sim: RoverSim): HudSnapshot {
    const s = sim.state;
    return {
        mode: s.mode,
        seen: s.timers.seen,
        cooldown: s.timers.cooldown,
        sinceProgress: s.mode === "GUIDED" ? s.timers.sinceProgress : 0,
        reason: s.lastReason,
        detecting: s.detecting,
        obstacles: s.obstacles.length,
    };
}

export function createRoverStore(seed = 7): RoverStore {
    const sim = createSim({ rng: mulberry32(seed) });
    const listeners = new Set<() => void>();
    let snap = snapshotOf(sim);
    let acc = 0;

    const publish = () => {
        acc = 0;
        snap = snapshotOf(sim);
        listeners.forEach((l) => l());
    };

    return {
        sim,
        step(dt) {
            const before = sim.state.mode;
            sim.step(dt);
            acc += dt;
            if (sim.state.mode !== before || acc >= HUD_INTERVAL) publish();
        },
        addObstacle(x, y) {
            const ok = sim.addObstacle(x, y) !== null;
            if (ok) publish();
            return ok;
        },
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        getSnapshot: () => snap,
    };
}

/** Shares one sim between the lazily loaded canvas and the HUD overlay. */
export const RoverStoreContext = createContext<RoverStore | null>(null);
