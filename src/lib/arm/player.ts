/**
 * Plays planned steps in real time: each move eases (smoothstep) to its target at the capped speed, then
 * holds 0.12 s, like so101_core `_move`. Call/result/event steps fire listeners as they are reached.
 * Driven by `tick(dt)` from the render loop (or a plain rAF ticker when there is no canvas).
 */
import { FPS, PICK, SETTLE_S, START_POSE, clampSpot } from "./constants";
import type { CubeEvent, Step } from "./plan";
import type { Joint, Pose } from "./types";

type CallStep = Extract<Step, { kind: "call" }>;
type ResultStep = Extract<Step, { kind: "result" }>;

export type PlayerEvent = CubeEvent;

type Listeners = {
    callStart: (step: CallStep) => void;
    callEnd: (step: ResultStep & { stopped?: boolean }) => void;
    event: (event: PlayerEvent) => void;
    idle: (idle: boolean) => void;
};

const MAX_DT = 0.1;

/** How long a move takes: the furthest joint at `speed` deg/s (at least one frame), plus the settle pause. */
export function moveDuration(from: Pose, to: Pose, speed: number): { motion: number; total: number } {
    let dist = 0;
    for (const k of Object.keys(to) as Joint[]) dist = Math.max(dist, Math.abs(to[k] - from[k]));
    const motion = Math.max(1 / FPS, dist / speed);
    return { motion, total: motion + SETTLE_S };
}

const smoothstep = (a: number) => a * a * (3 - 2 * a);

export class ArmPlayer {
    /** the pose the arm is in right now */
    pose: Pose;
    private queue: Step[] = [];
    private active: { from: Pose; to: Pose; motion: number; total: number; t: number } | null = null;
    private openCall: CallStep | null = null;
    /** spot = the shoulder_pan of the cube's table spot */
    private cube: { spot: number; held: boolean } = { spot: PICK.spots[0], held: false };
    private plannedSpot: number = PICK.spots[0];
    private listeners: { [K in keyof Listeners]: Set<Listeners[K]> } = {
        callStart: new Set(),
        callEnd: new Set(),
        event: new Set(),
        idle: new Set(),
    };
    private wasIdle = true;

    constructor(start: Pose = START_POSE) {
        this.pose = { ...start };
    }

    on<K extends keyof Listeners>(type: K, cb: Listeners[K]): () => void {
        this.listeners[type].add(cb);
        return () => this.listeners[type].delete(cb);
    }

    private emit<K extends keyof Listeners>(type: K, ...args: Parameters<Listeners[K]>) {
        this.listeners[type].forEach((cb) => (cb as (...a: Parameters<Listeners[K]>) => void)(...args));
    }

    /**
     * The visitor puts the cube on the table at `pan` (clamped to the placeable arc). Only while the arm is
     * idle and not holding it; returns the spot, or null when ignored.
     */
    placeCube(pan: number): number | null {
        if (!this.idle || this.cube.held) return null;
        const spot = clampSpot(pan);
        this.cube = { spot, held: false };
        this.plannedSpot = spot;
        this.emit("event", { type: "cube:place", spot });
        return spot;
    }

    /** Which spot (shoulder_pan) the cube will be on once everything queued has run. */
    get cubeSpot(): number {
        return this.plannedSpot;
    }

    /** Whether the cube is in the gripper right now. */
    get cubeHeld(): boolean {
        return this.cube.held;
    }

    /** Where the cube is right now: its spot (the one it was picked from while held) and whether it is held. */
    get cubeNow(): { spot: number; held: boolean } {
        return { ...this.cube };
    }

    enqueue(steps: Step[]): void {
        for (const s of steps) if (s.kind === "event" && s.event.type !== "cube:attach") this.plannedSpot = s.event.spot;
        this.queue.push(...steps);
        if (steps.length) this.setIdle(false);
    }

    /** The pose at the end of everything queued (where the next command starts from). */
    plannedEndPose(): Pose {
        for (let i = this.queue.length - 1; i >= 0; i--) {
            const s = this.queue[i];
            if (s.kind === "move") return { ...s.to };
        }
        return { ...(this.active ? this.active.to : this.pose) };
    }

    get idle(): boolean {
        return this.active === null && this.queue.length === 0;
    }

    /** Halt now and hold where the arm is. The running call reports "Stopped. Holding position." */
    stop(): void {
        this.queue = [];
        this.active = null;
        if (this.openCall) {
            const call = this.openCall;
            this.openCall = null;
            this.emit("callEnd", { kind: "result", id: call.id, text: "Stopped. Holding position.", clamped: [], stopped: true });
        }
        if (this.cube.held) {
            this.cube.held = false;
            this.emit("event", { type: "cube:reset", spot: this.cube.spot });
        }
        this.plannedSpot = this.cube.spot;
        this.setIdle(true);
    }

    tick(dtIn: number): void {
        let dt = Math.min(Math.max(dtIn, 0), MAX_DT);
        while (dt > 0 || (this.active === null && this.queue.length > 0)) {
            if (!this.active) {
                this.drain();
                if (!this.active) break;
            }
            const m = this.active;
            const used = Math.min(dt, m.total - m.t);
            m.t += used;
            dt -= used;
            const a = smoothstep(Math.min(1, m.t / m.motion));
            for (const k of Object.keys(m.to) as Joint[]) this.pose[k] = m.from[k] + (m.to[k] - m.from[k]) * a;
            if (m.t >= m.total - 1e-9) {
                this.pose = { ...m.to };
                this.active = null;
                this.drain();
            } else break;
        }
        if (this.idle) this.setIdle(true);
    }

    /** Run instant steps until the next move starts (or the queue is empty). */
    private drain(): void {
        while (!this.active && this.queue.length) {
            const s = this.queue.shift() as Step;
            if (s.kind === "move") {
                const from = { ...this.pose };
                const to = { ...from, ...s.to };
                const { motion, total } = moveDuration(from, to, s.speed);
                this.active = { from, to, motion, total, t: 0 };
            } else if (s.kind === "call") {
                this.openCall = s;
                this.emit("callStart", s);
            } else if (s.kind === "result") {
                if (this.openCall?.id === s.id) this.openCall = null;
                this.emit("callEnd", s);
            } else {
                this.cube = { spot: s.event.spot, held: s.event.type === "cube:attach" };
                this.emit("event", s.event);
            }
        }
    }

    private setIdle(idle: boolean) {
        if (idle === this.wasIdle) return;
        this.wasIdle = idle;
        this.emit("idle", idle);
    }
}
