/**
 * A small, deterministic 2D simulation of the Raftaar rover's obstacle-avoidance hand-off.
 *
 * The real rover runs ROS 2 + Nav2 (MPPI) + MAVROS on ArduPilot: two LiDARs watch the
 * path, hand control AUTO → GUIDED when something is in the way, Nav2 steers around it,
 * and the GPS mission resumes (back to AUTO). This file is a scripted illustration of that
 * state machine (debounce, cooldown, stuck watchdog), with simple steering, not Nav2.
 *
 * Pure TypeScript: no React, no three.js. World units are metres, x right / y up on the
 * ground plane, yaw in radians counter-clockwise from +x.
 */

export type Mode = "AUTO" | "GUIDED";

export type Pose = { x: number; y: number; yaw: number };

export type ObstacleKind = "barrel" | "cone";

export type Obstacle = {
    id: number;
    x: number;
    y: number;
    r: number;
    /** height in metres; a puck only sees obstacles at least as tall as it is mounted */
    h: number;
    kind: ObstacleKind;
    /** seconds since it appeared */
    age: number;
    /** set once the rover has driven past it; it is removed shortly after */
    passedAt: number | null;
};

export type ModeEvent = { t: number; from: Mode; to: Mode; reason: string };

export type Puck = {
    /** mount height on the real rover, metres */
    height: number;
    /** forward offset from the chassis centre, metres */
    forward: number;
};

export type Timers = {
    /** continuous forward-cone detection, seconds (debounce counts this up) */
    seen: number;
    /** seconds left before GUIDED may be entered again */
    cooldown: number;
    /** seconds spent in the current GUIDED episode */
    guided: number;
    /** seconds in GUIDED since the rover last made progress along the route */
    sinceProgress: number;
};

export type Guided = {
    obstacleId: number;
    /** +1 = pass on the left of the route, -1 = pass on the right */
    side: 1 | -1;
    /** the obstacle's position along the route (unwrapped, same frame as `odometer`) */
    obstacleS: number;
    /** lateral offset (left +) the rover aims for while passing */
    offset: number;
    /** offset waypoint beside the obstacle, for drawing */
    target: { x: number; y: number };
    /** odometer value at the last progress mark */
    progressMark: number;
};

export type Lidar = {
    pucks: readonly Puck[];
    raysPerPuck: number;
    range: number;
    /** per-ray distance, puck-major (puck 0 rays then puck 1 rays); `range` when nothing is hit */
    dist: Float32Array;
    /** per-ray obstacle id that was hit, or -1 */
    hit: Int32Array;
    /** world-space ray origins, [x0, y0, x1, y1] per puck */
    origin: Float32Array;
};

export type SimState = {
    t: number;
    pose: Pose;
    speed: number;
    mode: Mode;
    /** route waypoints, closed loop, flat [x0, y0, x1, y1, ...] */
    path: Float32Array;
    pathLength: number;
    obstacles: Obstacle[];
    timers: Timers;
    guided: Guided | null;
    lidar: Lidar;
    /** distance along the route, unwrapped (keeps growing lap after lap) */
    odometer: number;
    /** true while the forward cone sees something within the trigger range */
    detecting: boolean;
    /** true when a safety stop is holding the rover still this step */
    blocked: boolean;
    events: ModeEvent[];
    lastReason: string;
};

export type Rng = () => number;

export type SimOptions = {
    rng?: Rng;
    /** seconds before the first auto-spawned obstacle (default 3) */
    firstSpawn?: number;
    /** turn off auto-spawning (tests) */
    autoSpawn?: boolean;
    /** start pose; defaults to the start of the route */
    pose?: Pose;
};

/* ---------- constants, from the real rover where they exist ---------- */

export const ROVER = {
    length: 2.19,
    width: 2.1,
    halfLength: 2.19 / 2,
    halfWidth: 2.1 / 2,
} as const;

/** circle that contains the whole chassis footprint */
export const ROVER_BOUND = Math.hypot(ROVER.halfLength, ROVER.halfWidth);

export const SAFETY = {
    debounce: 0.5,
    cooldown: 2,
    watchdog: 8,
    commandTimeout: 0.5,
} as const;

export const PUCKS: readonly Puck[] = [
    { height: 1.15, forward: 0.2 },
    { height: 0.58, forward: 1.0 },
];

export const RAYS_PER_PUCK = 48;
export const LIDAR_RANGE = 8;
export const CONE_HALF_ANGLE = (30 * Math.PI) / 180;
export const TRIGGER_RANGE = 3.5;
export const AVOID_MARGIN = 0.8;
export const MAX_DT = 0.1;
export const MAX_OBSTACLES = 3;
export const LOOP = { width: 16, height: 10, corner: 3 } as const;
/** ground area where obstacles may be dropped */
export const BOUNDS = { x: 12, y: 8.5 } as const;

const AUTO_SPEED = 1.2;
const GUIDED_SPEED = 0.8;
const ACCEL = 1.5;
const MAX_YAW_RATE = 1.2;
const HEADING_GAIN = 2.2;
const LOOKAHEAD = 3;
const GUIDED_LOOKAHEAD = 1.8;
/** chassis-to-obstacle gap below which the safety stop refuses motion that closes it further */
const STOP_GAP = 0.15;
const RAMP = 2.5;
const PROGRESS_STEP = 0.5;
const SPAWN_MIN = 8;
const SPAWN_JITTER = 4;
const PASSED_LINGER = 3;
const MAX_AGE = 40;
const BLOCKED_BEFORE_RECOVERY = 0.6;
const RECOVERY_TIME = 1.2;
const BACKUP_SPEED = 0.4;
/** recovery options as [speed sign, turn sign] pairs: reverse, turn in place, reverse while turning */
const ESCAPES = [-1, 0, 0, 1, 0, -1, -1, 1, -1, -1] as const;
const MAX_EVENTS = 20;

/* ---------- small helpers ---------- */

/** Seeded PRNG (mulberry32), so a run can be replayed exactly. */
export function mulberry32(seed: number): Rng {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function clamp(v: number, lo: number, hi: number) {
    return v < lo ? lo : v > hi ? hi : v;
}

function wrapAngle(a: number) {
    while (a > Math.PI) a -= 2 * Math.PI;
    while (a < -Math.PI) a += 2 * Math.PI;
    return a;
}

function smoothstep(e0: number, e1: number, x: number) {
    const t = clamp((x - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
}

/** Rounded-rectangle loop, counter-clockwise, sampled about every `step` metres. */
export function buildLoop(
    width: number = LOOP.width,
    height: number = LOOP.height,
    corner: number = LOOP.corner,
    step = 0.5
): Float32Array {
    const hw = width / 2 - corner;
    const hh = height / 2 - corner;
    const pts: number[] = [];
    const straight = (x0: number, y0: number, x1: number, y1: number) => {
        const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / step));
        for (let i = 0; i < n; i++) pts.push(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n);
    };
    const arc = (cx: number, cy: number, a0: number) => {
        const n = Math.max(2, Math.round((corner * Math.PI) / 2 / step));
        for (let i = 0; i < n; i++) {
            const a = a0 + ((Math.PI / 2) * i) / n;
            pts.push(cx + corner * Math.cos(a), cy + corner * Math.sin(a));
        }
    };
    // bottom edge, left → right, then corners counter-clockwise
    straight(-hw, -hh - corner, hw, -hh - corner);
    arc(hw, -hh, -Math.PI / 2);
    straight(hw + corner, -hh, hw + corner, hh);
    arc(hw, hh, 0);
    straight(hw, hh + corner, -hw, hh + corner);
    arc(-hw, hh, Math.PI / 2);
    straight(-hw - corner, hh, -hw - corner, -hh);
    arc(-hw, -hh, Math.PI);
    return Float32Array.from(pts);
}

/** Cumulative arc length at each waypoint (closed loop); last entry is the full length. */
function cumulative(path: Float32Array): Float32Array {
    const n = path.length / 2;
    const out = new Float32Array(n + 1);
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        out[i + 1] = out[i] + Math.hypot(path[2 * j] - path[2 * i], path[2 * j + 1] - path[2 * i + 1]);
    }
    return out;
}

/**
 * Distance from a point to the rover's rectangular footprint (0 when inside).
 * Exported so tests can check that nothing ever overlaps the chassis.
 */
export function footprintDistance(pose: Pose, x: number, y: number): number {
    const dx = x - pose.x;
    const dy = y - pose.y;
    const c = Math.cos(pose.yaw);
    const s = Math.sin(pose.yaw);
    const lx = Math.abs(dx * c + dy * s) - ROVER.halfLength;
    const ly = Math.abs(-dx * s + dy * c) - ROVER.halfWidth;
    return Math.hypot(Math.max(lx, 0), Math.max(ly, 0));
}

/* ---------- the simulation ---------- */

export type RoverSim = {
    readonly state: SimState;
    step(dt: number): void;
    /** Drop an obstacle; returns it, or null when the spot is under the rover or off the ground. */
    addObstacle(x: number, y: number, opts?: { r?: number; kind?: ObstacleKind }): Obstacle | null;
    /** Route point and tangent at arc length s (wraps). Writes into `out` to avoid allocations. */
    pointAt(s: number, out: { x: number; y: number; tx: number; ty: number }): void;
    reset(): void;
};

export function createSim(options: SimOptions = {}): RoverSim {
    const rng = options.rng ?? Math.random;
    const autoSpawn = options.autoSpawn ?? true;
    const path = buildLoop();
    const cum = cumulative(path);
    const nPts = path.length / 2;
    const pathLength = cum[nPts];
    const nRays = RAYS_PER_PUCK * PUCKS.length;

    // relative ray angles, precomputed once
    const rayCos = new Float32Array(RAYS_PER_PUCK);
    const raySin = new Float32Array(RAYS_PER_PUCK);
    const rayRel = new Float32Array(RAYS_PER_PUCK);
    for (let i = 0; i < RAYS_PER_PUCK; i++) {
        const a = wrapAngle((2 * Math.PI * i) / RAYS_PER_PUCK);
        rayRel[i] = a;
        rayCos[i] = Math.cos(a);
        raySin[i] = Math.sin(a);
    }

    // scratch objects reused every step (no per-frame allocations in the hot path)
    const pt = { x: 0, y: 0, tx: 0, ty: 0 };
    const proj = { s: 0, lat: 0 };
    const trial: Pose = { x: 0, y: 0, yaw: 0 };

    let nextId = 1;
    let spawnTimer = 0;
    let spawnAt = 0;
    let blockedFor = 0;
    let recover = 0;

    const startPose = (): Pose => {
        if (options.pose) return { ...options.pose };
        pointAt(0, pt);
        return { x: pt.x, y: pt.y, yaw: Math.atan2(pt.ty, pt.tx) };
    };

    const state: SimState = {
        t: 0,
        pose: { x: 0, y: 0, yaw: 0 },
        speed: 0,
        mode: "AUTO",
        path,
        pathLength,
        obstacles: [],
        timers: { seen: 0, cooldown: 0, guided: 0, sinceProgress: 0 },
        guided: null,
        lidar: {
            pucks: PUCKS,
            raysPerPuck: RAYS_PER_PUCK,
            range: LIDAR_RANGE,
            dist: new Float32Array(nRays),
            hit: new Int32Array(nRays),
            origin: new Float32Array(PUCKS.length * 2),
        },
        odometer: 0,
        detecting: false,
        blocked: false,
        events: [],
        lastReason: "following the route",
    };

    function pointAt(s: number, out: { x: number; y: number; tx: number; ty: number }) {
        let u = s % pathLength;
        if (u < 0) u += pathLength;
        // binary search for the segment
        let lo = 0;
        let hi = nPts - 1;
        while (lo < hi) {
            const mid = (lo + hi + 1) >> 1;
            if (cum[mid] <= u) lo = mid;
            else hi = mid - 1;
        }
        const i = lo;
        const j = (i + 1) % nPts;
        const segLen = cum[i + 1] - cum[i];
        const f = segLen > 0 ? (u - cum[i]) / segLen : 0;
        const dx = path[2 * j] - path[2 * i];
        const dy = path[2 * j + 1] - path[2 * i + 1];
        out.x = path[2 * i] + dx * f;
        out.y = path[2 * i + 1] + dy * f;
        out.tx = segLen > 0 ? dx / segLen : 1;
        out.ty = segLen > 0 ? dy / segLen : 0;
    }

    /** Project a point onto the route: arc length and signed lateral offset (left +). */
    function project(x: number, y: number, out: { s: number; lat: number }) {
        let best = Infinity;
        for (let i = 0; i < nPts; i++) {
            const j = (i + 1) % nPts;
            const ax = path[2 * i];
            const ay = path[2 * i + 1];
            const dx = path[2 * j] - ax;
            const dy = path[2 * j + 1] - ay;
            const len2 = dx * dx + dy * dy;
            const f = len2 > 0 ? clamp(((x - ax) * dx + (y - ay) * dy) / len2, 0, 1) : 0;
            const px = ax + dx * f;
            const py = ay + dy * f;
            const d2 = (x - px) * (x - px) + (y - py) * (y - py);
            if (d2 < best) {
                best = d2;
                const len = Math.sqrt(len2) || 1;
                out.s = cum[i] + f * len;
                out.lat = (dx * (y - ay) - dy * (x - ax)) / len;
            }
        }
    }

    /** Signed difference a - b on the loop, in (-L/2, L/2]. */
    function loopDelta(a: number, b: number) {
        let d = (a - b) % pathLength;
        if (d > pathLength / 2) d -= pathLength;
        if (d <= -pathLength / 2) d += pathLength;
        return d;
    }

    /** Smallest chassis-to-obstacle gap at pose `p`. */
    function minGap(p: Pose) {
        let m = Infinity;
        for (const o of state.obstacles) m = Math.min(m, footprintDistance(p, o.x, o.y) - o.r);
        return m;
    }

    /** Normal driving, with a safety stop that refuses motion closing in on an obstacle inside STOP_GAP. */
    function drive(yawRate: number, dt: number) {
        const { pose } = state;
        trial.x = pose.x;
        trial.y = pose.y;
        trial.yaw = wrapAngle(pose.yaw + yawRate * dt);
        if (closing(trial)) trial.yaw = pose.yaw; // turning would swing a corner in: hold heading
        trial.x = pose.x + Math.cos(trial.yaw) * state.speed * dt;
        trial.y = pose.y + Math.sin(trial.yaw) * state.speed * dt;
        state.blocked = closing(trial);
        if (state.blocked) {
            state.speed = 0;
            trial.x = pose.x;
            trial.y = pose.y;
        }
        pose.x = trial.x;
        pose.y = trial.y;
        pose.yaw = trial.yaw;
    }

    /** Recovery move: of a few slow reverse / turn-in-place options, take the one that opens the gap most. */
    function escape(dt: number) {
        const { pose } = state;
        const now = minGap(pose);
        let best = now;
        let bestV = 0;
        let bestW = 0;
        for (let k = 0; k < ESCAPES.length; k += 2) {
            const v = ESCAPES[k] * BACKUP_SPEED;
            const w = ESCAPES[k + 1] * MAX_YAW_RATE * 0.6;
            trial.yaw = wrapAngle(pose.yaw + w * dt);
            trial.x = pose.x + Math.cos(trial.yaw) * v * dt;
            trial.y = pose.y + Math.sin(trial.yaw) * v * dt;
            const g = minGap(trial);
            if (g > best + 1e-6) {
                best = g;
                bestV = v;
                bestW = w;
            }
        }
        state.speed = bestV;
        state.blocked = best <= now;
        pose.yaw = wrapAngle(pose.yaw + bestW * dt);
        pose.x += Math.cos(pose.yaw) * bestV * dt;
        pose.y += Math.sin(pose.yaw) * bestV * dt;
    }

    /** Would moving to `p` put the chassis inside the stop gap of an obstacle and closer than now? */
    function closing(p: Pose) {
        for (const o of state.obstacles) {
            const after = footprintDistance(p, o.x, o.y) - o.r;
            if (after < STOP_GAP && after < footprintDistance(state.pose, o.x, o.y) - o.r - 1e-9) return true;
        }
        return false;
    }

    function setMode(to: Mode, reason: string) {
        const from = state.mode;
        state.lastReason = reason;
        if (from === to) return;
        state.mode = to;
        state.events.push({ t: state.t, from, to, reason });
        if (state.events.length > MAX_EVENTS) state.events.shift();
    }

    function findObstacle(id: number): Obstacle | null {
        for (const o of state.obstacles) if (o.id === id) return o;
        return null;
    }

    function castRays() {
        const { pose, lidar, obstacles } = state;
        const c = Math.cos(pose.yaw);
        const s = Math.sin(pose.yaw);
        for (let p = 0; p < PUCKS.length; p++) {
            const puck = PUCKS[p];
            const ox = pose.x + c * puck.forward;
            const oy = pose.y + s * puck.forward;
            lidar.origin[2 * p] = ox;
            lidar.origin[2 * p + 1] = oy;
            for (let i = 0; i < RAYS_PER_PUCK; i++) {
                const dx = c * rayCos[i] - s * raySin[i];
                const dy = s * rayCos[i] + c * raySin[i];
                let best = LIDAR_RANGE;
                let hitId = -1;
                for (let k = 0; k < obstacles.length; k++) {
                    const o = obstacles[k];
                    if (o.h < puck.height) continue; // too low for this puck to see
                    const fx = ox - o.x;
                    const fy = oy - o.y;
                    const b = fx * dx + fy * dy;
                    const cc = fx * fx + fy * fy - o.r * o.r;
                    const disc = b * b - cc;
                    if (disc < 0) continue;
                    let t = -b - Math.sqrt(disc);
                    if (t < 0) {
                        if (cc > 0) continue; // circle is behind the ray
                        t = 0; // origin inside the circle
                    }
                    if (t < best) {
                        best = t;
                        hitId = o.id;
                    }
                }
                lidar.dist[p * RAYS_PER_PUCK + i] = best;
                lidar.hit[p * RAYS_PER_PUCK + i] = hitId;
            }
        }
    }

    /** Nearest obstacle seen in the ±30° forward cone within the trigger range, or -1. */
    function forwardThreat(): number {
        const { lidar } = state;
        let best = TRIGGER_RANGE;
        let id = -1;
        for (let p = 0; p < PUCKS.length; p++) {
            for (let i = 0; i < RAYS_PER_PUCK; i++) {
                if (Math.abs(rayRel[i]) > CONE_HALF_ANGLE + 1e-6) continue;
                const k = p * RAYS_PER_PUCK + i;
                if (lidar.hit[k] >= 0 && lidar.dist[k] <= best) {
                    best = lidar.dist[k];
                    id = lidar.hit[k];
                }
            }
        }
        return id;
    }

    /** Mean free distance seen on one side (relative angles 20°..100°), both pucks. */
    function freeSpace(side: 1 | -1) {
        const { lidar } = state;
        let sum = 0;
        let n = 0;
        for (let p = 0; p < PUCKS.length; p++) {
            for (let i = 0; i < RAYS_PER_PUCK; i++) {
                const a = rayRel[i] * side;
                if (a < 0.35 || a > 1.75) continue;
                sum += lidar.dist[p * RAYS_PER_PUCK + i];
                n++;
            }
        }
        return n ? sum / n : 0;
    }

    function enterGuided(o: Obstacle) {
        project(o.x, o.y, proj);
        const obstacleS = state.odometer + loopDelta(proj.s, state.odometer % pathLength);
        const obsLat = proj.lat;
        // prefer the side with more free space; an obstacle already left of the route pushes us right
        const score = freeSpace(1) - freeSpace(-1) - 3 * obsLat;
        const side: 1 | -1 = score >= 0 ? 1 : -1;
        const clearance = o.r + ROVER.halfWidth + AVOID_MARGIN;
        const offset = obsLat + side * clearance;
        pointAt(obstacleS, pt);
        state.guided = {
            obstacleId: o.id,
            side,
            obstacleS,
            offset,
            target: { x: pt.x - pt.ty * offset, y: pt.y + pt.tx * offset },
            progressMark: state.odometer,
        };
        state.timers.guided = 0;
        state.timers.sinceProgress = 0;
        setMode("GUIDED", `obstacle ${state.timers.seen.toFixed(1)} s in view → passing ${side > 0 ? "left" : "right"}`);
    }

    function exitGuided(reason: string) {
        state.guided = null;
        state.timers.guided = 0;
        state.timers.sinceProgress = 0;
        state.timers.cooldown = SAFETY.cooldown;
        state.timers.seen = 0;
        setMode("AUTO", reason);
    }

    /** Lateral offset to aim for at route position s (only non-zero in GUIDED). */
    function offsetAt(s: number) {
        const g = state.guided;
        if (!g) return 0;
        const o = findObstacle(g.obstacleId);
        const half = (o ? o.r : 0.5) + ROVER.halfLength + 0.6;
        const u = s - g.obstacleS;
        const w = smoothstep(-half - RAMP, -half, u) * (1 - smoothstep(half, half + RAMP, u));
        return g.offset * w;
    }

    function spawn() {
        const ahead = 9 + rng() * 2;
        pointAt(state.odometer + ahead, pt);
        const lat = (rng() - 0.5) * 1.2;
        const cone = rng() < 0.4;
        addObstacle(pt.x - pt.ty * lat, pt.y + pt.tx * lat, {
            kind: cone ? "cone" : "barrel",
            r: cone ? 0.35 + rng() * 0.1 : 0.4 + rng() * 0.2,
        });
    }

    function addObstacle(x: number, y: number, opts: { r?: number; kind?: ObstacleKind } = {}) {
        const kind: ObstacleKind = opts.kind ?? "barrel";
        const r = clamp(opts.r ?? (kind === "cone" ? 0.4 : 0.5), 0.2, 1.2);
        if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
        if (Math.abs(x) > BOUNDS.x || Math.abs(y) > BOUNDS.y) return null;
        // reject anything under (or touching) the rover, so the chassis never overlaps an obstacle
        if (Math.hypot(x - state.pose.x, y - state.pose.y) < r + ROVER_BOUND + 0.1) return null;
        const o: Obstacle = {
            id: nextId++,
            x,
            y,
            r,
            h: kind === "cone" ? 0.8 : 1.3,
            kind,
            age: 0,
            passedAt: null,
        };
        state.obstacles.push(o);
        while (state.obstacles.length > MAX_OBSTACLES) state.obstacles.shift(); // drop the oldest
        spawnTimer = 0;
        return o;
    }

    function step(rawDt: number) {
        if (!(rawDt > 0)) return;
        const dt = Math.min(rawDt, MAX_DT);
        state.t += dt;
        const { pose, timers } = state;

        // obstacle housekeeping: age, remove passed / stale ones (never the one being avoided)
        for (let i = state.obstacles.length - 1; i >= 0; i--) {
            const o = state.obstacles[i];
            o.age += dt;
            const isTarget = state.guided?.obstacleId === o.id;
            const passedLong = o.passedAt !== null && state.t - o.passedAt > PASSED_LINGER;
            if (!isTarget && (passedLong || o.age > MAX_AGE)) state.obstacles.splice(i, 1);
        }
        if (state.guided && !findObstacle(state.guided.obstacleId)) exitGuided("obstacle removed");

        // auto-spawn a new obstacle ahead when the ground is clear
        if (autoSpawn && state.obstacles.length === 0 && state.mode === "AUTO") {
            if (spawnAt === 0) spawnAt = options.firstSpawn ?? 3;
            spawnTimer += dt;
            if (spawnTimer >= spawnAt) {
                spawn();
                spawnTimer = 0;
                spawnAt = SPAWN_MIN + rng() * SPAWN_JITTER;
            }
        }

        // sense
        castRays();
        const threat = forwardThreat();
        state.detecting = threat >= 0;
        timers.seen = state.detecting ? timers.seen + dt : 0;
        timers.cooldown = Math.max(0, timers.cooldown - dt);

        // decide
        if (state.mode === "AUTO") {
            if (state.detecting && timers.seen >= SAFETY.debounce && timers.cooldown <= 0) {
                const o = findObstacle(threat);
                if (o) enterGuided(o);
            }
        } else if (state.guided) {
            const g = state.guided;
            timers.guided += dt;
            timers.sinceProgress += dt;
            if (state.odometer - g.progressMark >= PROGRESS_STEP) {
                g.progressMark = state.odometer;
                timers.sinceProgress = 0;
            }
            const o = findObstacle(g.obstacleId);
            const r = o ? o.r : 0;
            const behind = state.odometer > g.obstacleS + r + ROVER.halfLength + 0.4;
            if (timers.sinceProgress >= SAFETY.watchdog) {
                exitGuided("watchdog: no progress for 8 s");
            } else if (behind && (!state.detecting || threat !== g.obstacleId)) {
                if (o) o.passedAt = state.t;
                if (state.detecting) exitGuided("passed; another obstacle ahead");
                else exitGuided("obstacle behind and clear → mission resumes");
            }
        }

        // steer: chase a look-ahead point on the (possibly offset) route
        const look = state.mode === "GUIDED" ? GUIDED_LOOKAHEAD : LOOKAHEAD;
        const sT = state.odometer + look;
        pointAt(sT, pt);
        const off = offsetAt(sT);
        const tx = pt.x - pt.ty * off;
        const ty = pt.y + pt.tx * off;
        const alpha = wrapAngle(Math.atan2(ty - pose.y, tx - pose.x) - pose.yaw);
        const yawRate = clamp(HEADING_GAIN * alpha, -MAX_YAW_RATE, MAX_YAW_RATE);
        const vMax = state.mode === "GUIDED" ? GUIDED_SPEED : AUTO_SPEED;
        // skid-steer: slow down for sharp turns, turn in place when facing away
        const want = Math.abs(alpha) > 1.2 ? 0 : vMax * clamp(Math.cos(alpha), 0.3, 1);

        if (recover > 0) {
            // recovery: held by the safety stop for a while, so back off / turn away to make room
            recover -= dt;
            escape(dt);
        } else {
            state.speed += clamp(want - state.speed, -ACCEL * 2 * dt, ACCEL * dt);
            drive(yawRate, dt);
            blockedFor = state.blocked ? blockedFor + dt : 0;
            if (blockedFor > BLOCKED_BEFORE_RECOVERY) {
                recover = RECOVERY_TIME;
                blockedFor = 0;
            }
        }

        // track progress along the route
        project(pose.x, pose.y, proj);
        state.odometer += loopDelta(proj.s, state.odometer % pathLength);
    }

    function reset() {
        state.t = 0;
        Object.assign(state.pose, startPose());
        state.speed = 0;
        state.mode = "AUTO";
        state.obstacles.length = 0;
        state.timers.seen = 0;
        state.timers.cooldown = 0;
        state.timers.guided = 0;
        state.timers.sinceProgress = 0;
        state.guided = null;
        project(state.pose.x, state.pose.y, proj);
        state.odometer = proj.s;
        state.detecting = false;
        state.blocked = false;
        state.events.length = 0;
        state.lastReason = "following the route";
        spawnTimer = 0;
        spawnAt = 0;
        blockedFor = 0;
        recover = 0;
        nextId = 1;
        castRays();
    }

    reset();

    return { state, step, addObstacle, pointAt, reset };
}
