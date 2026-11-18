"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { START_POSE, type MoveoPose, type MoveoStep } from "@/lib/moveo/constants";
import { buildTimeline, clampPose, sampleTimeline, type Timeline } from "@/lib/moveo/motion";

export type MoveoState = {
    pose: MoveoPose;
    /** label of the step running now, or of the last one */
    label: string | null;
    /** what is playing, or null when the arm is still */
    playing: string | null;
};

/**
 * The Moveo's live pose, shared by the controls (DOM, always rendered) and the lazily loaded canvas.
 * The canvas reads `get().pose` every frame; the controls subscribe. Timelines run on requestAnimationFrame.
 */
export class MoveoStore {
    private state: MoveoState = { pose: START_POSE, label: null, playing: null };
    private listeners = new Set<() => void>();
    private raf = 0;
    /** settles the promise of the timeline playing now */
    private settle: ((r: { stopped: boolean }) => void) | null = null;

    get = () => this.state;

    subscribe = (l: () => void) => {
        this.listeners.add(l);
        return () => {
            this.listeners.delete(l);
        };
    };

    private set(next: Partial<MoveoState>) {
        this.state = { ...this.state, ...next };
        this.listeners.forEach((l) => l());
    }

    /** Set the pose directly (sliders); stops anything playing. */
    setPose(pose: readonly number[]) {
        this.stop();
        this.set({ pose: clampPose(pose).pose, label: null });
    }

    /**
     * Play steps from the current pose; `name` shows while it runs. Resolves when it finishes
     * ({stopped: false}) or is interrupted ({stopped: true}). `speed` is rad/s (default: the demo speed).
     */
    play(steps: readonly MoveoStep[], name: string, speed?: number): Promise<{ stopped: boolean }> {
        this.stop();
        const done = new Promise<{ stopped: boolean }>((resolve) => (this.settle = resolve));
        const tl: Timeline = speed ? buildTimeline(this.state.pose, steps, speed) : buildTimeline(this.state.pose, steps);
        let t = 0;
        let last = performance.now();
        this.set({ playing: name });
        const loop = (now: number) => {
            t += Math.min(0.1, (now - last) / 1000);
            last = now;
            const s = sampleTimeline(tl, t);
            this.set({ pose: s.pose, label: s.label, playing: s.done ? null : name });
            this.raf = s.done ? 0 : requestAnimationFrame(loop);
            if (s.done) this.finish(false);
        };
        this.raf = requestAnimationFrame(loop);
        return done;
    }

    private finish(stopped: boolean) {
        const settle = this.settle;
        this.settle = null;
        settle?.({ stopped });
    }

    stop() {
        if (this.raf) cancelAnimationFrame(this.raf);
        this.raf = 0;
        this.finish(true);
        if (this.state.playing) this.set({ playing: null });
    }
}

export const MoveoContext = createContext<MoveoStore | null>(null);

export function useMoveoStore(): MoveoStore {
    const s = useContext(MoveoContext);
    if (!s) throw new Error("useMoveoStore must be used inside <MoveoPlayground>");
    return s;
}

export function useMoveoState(store: MoveoStore): MoveoState {
    return useSyncExternalStore(store.subscribe, store.get, store.get);
}
