import { describe, expect, it } from "vitest";
import {
    createSim,
    footprintDistance,
    MAX_OBSTACLES,
    mulberry32,
    SAFETY,
    type RoverSim,
} from "./sim";

const DT = 1 / 60;

/** Rover starts at (-5, -5) facing +x along the bottom straight of the loop. */
function quietSim(): RoverSim {
    return createSim({ rng: mulberry32(1), autoSpawn: false });
}

function run(sim: RoverSim, seconds: number, each?: (sim: RoverSim) => void) {
    const n = Math.round(seconds / DT);
    for (let i = 0; i < n; i++) {
        sim.step(DT);
        each?.(sim);
    }
}

describe("rover sim", () => {
    it("starts on the route in AUTO", () => {
        const sim = quietSim();
        expect(sim.state.mode).toBe("AUTO");
        expect(sim.state.pose.x).toBeCloseTo(-5, 3);
        expect(sim.state.pose.y).toBeCloseTo(-5, 3);
        expect(sim.state.lidar.dist).toHaveLength(96);
    });

    it("debounces: no GUIDED before 0.5 s of continuous detection", () => {
        const sim = quietSim();
        sim.addObstacle(1, -5);
        let firstSeen = -1;
        let guidedAt = -1;
        run(sim, 10, (s) => {
            if (firstSeen < 0 && s.state.detecting) firstSeen = s.state.t;
            if (s.state.detecting === false && guidedAt < 0) firstSeen = -1; // must be continuous
            if (guidedAt < 0 && s.state.mode === "GUIDED") guidedAt = s.state.t;
        });
        expect(firstSeen).toBeGreaterThan(0);
        expect(guidedAt).toBeGreaterThan(0);
        expect(guidedAt - firstSeen).toBeGreaterThanOrEqual(SAFETY.debounce - DT);
        expect(guidedAt - firstSeen).toBeLessThan(SAFETY.debounce + 2 * DT);
    });

    it("a brief glimpse shorter than the debounce does not trigger GUIDED", () => {
        const sim = quietSim();
        const o = sim.addObstacle(1, -5)!;
        let detectedFor = 0;
        for (let i = 0; i < 600 && sim.state.mode === "AUTO"; i++) {
            sim.step(DT);
            if (sim.state.detecting) detectedFor += DT;
            if (detectedFor >= 0.3) {
                // obstacle is taken away before the debounce elapses
                sim.state.obstacles.splice(sim.state.obstacles.indexOf(o), 1);
                break;
            }
        }
        run(sim, 3);
        expect(sim.state.events.find((e) => e.to === "GUIDED")).toBeUndefined();
    });

    it("goes AUTO → GUIDED → AUTO around an obstacle without touching it", () => {
        for (const [x, y, r] of [
            [1, -5, 0.5],
            [1, -4.6, 0.6],
            [2, -5.4, 0.4],
            [0, -5, 1],
        ]) {
            const sim = quietSim();
            const o = sim.addObstacle(x, y, { r })!;
            let minGap = Infinity;
            run(sim, 20, (s) => {
                minGap = Math.min(minGap, footprintDistance(s.state.pose, o.x, o.y) - o.r);
            });
            const modes = sim.state.events.map((e) => e.to);
            expect(modes.slice(0, 2)).toEqual(["GUIDED", "AUTO"]);
            expect(sim.state.events[1].reason).toMatch(/behind and clear/);
            expect(minGap).toBeGreaterThan(0);
            // and it is back on the route afterwards
            expect(Math.abs(sim.state.pose.y - -5) < 0.6 || sim.state.pose.x > 4).toBe(true);
        }
    });

    it("cooldown blocks immediate re-entry into GUIDED", () => {
        const sim = quietSim();
        sim.addObstacle(1, -5);
        run(sim, 30, (s) => {
            if (s.state.events.length === 2 && s.state.timers.cooldown === SAFETY.cooldown) {
                // right after returning to AUTO, put a second obstacle straight ahead
                const { x, y, yaw } = s.state.pose;
                s.addObstacle(x + Math.cos(yaw) * 4, y + Math.sin(yaw) * 4);
            }
        });
        const back = sim.state.events[1];
        const again = sim.state.events[2];
        expect(back.to).toBe("AUTO");
        expect(again?.to).toBe("GUIDED");
        expect(again.t - back.t).toBeGreaterThanOrEqual(SAFETY.cooldown - DT);
    });

    it("stuck watchdog forces AUTO after 8 s in GUIDED without progress", () => {
        const sim = quietSim();
        // boxed in: a wall of obstacles ahead and on both sides
        sim.addObstacle(-2.2, -5, { r: 1 });
        sim.addObstacle(-3.2, -2.6, { r: 1.2 });
        sim.addObstacle(-3.2, -7.4, { r: 1.2 });
        run(sim, 20);
        const guided = sim.state.events.find((e) => e.to === "GUIDED");
        const dog = sim.state.events.find((e) => e.reason.startsWith("watchdog"));
        expect(guided).toBeDefined();
        expect(dog).toBeDefined();
        expect(dog!.t - guided!.t).toBeGreaterThanOrEqual(SAFETY.watchdog - DT);
        expect(dog!.t - guided!.t).toBeLessThan(SAFETY.watchdog + 0.5);
        expect(dog!.to).toBe("AUTO");
    });

    it("keeps at most 3 obstacles, dropping the oldest", () => {
        const sim = quietSim();
        const ids = [
            sim.addObstacle(5, 5)!.id,
            sim.addObstacle(-5, 5)!.id,
            sim.addObstacle(0, 3)!.id,
            sim.addObstacle(6, 0)!.id,
        ];
        expect(sim.state.obstacles).toHaveLength(MAX_OBSTACLES);
        expect(sim.state.obstacles.map((o) => o.id)).toEqual(ids.slice(1));
    });

    it("refuses to drop an obstacle under the rover or off the ground", () => {
        const sim = quietSim();
        const { x, y } = sim.state.pose;
        expect(sim.addObstacle(x, y)).toBeNull();
        expect(sim.addObstacle(x + 1, y + 0.5)).toBeNull();
        expect(sim.addObstacle(100, 0)).toBeNull();
        expect(sim.addObstacle(Number.NaN, 0)).toBeNull();
        expect(sim.state.obstacles).toHaveLength(0);
        expect(sim.addObstacle(x + 5, y)).not.toBeNull();
    });

    it("auto-spawns obstacles ahead and keeps avoiding them", () => {
        const sim = createSim({ rng: mulberry32(3) });
        let minGap = Infinity;
        run(sim, 90, (s) => {
            for (const o of s.state.obstacles)
                minGap = Math.min(minGap, footprintDistance(s.state.pose, o.x, o.y) - o.r);
        });
        const guided = sim.state.events.filter((e) => e.to === "GUIDED").length;
        expect(guided).toBeGreaterThanOrEqual(3);
        expect(sim.state.events.some((e) => e.reason.startsWith("watchdog"))).toBe(false);
        expect(minGap).toBeGreaterThan(0);
    });

    it("caps dt at 0.1 s", () => {
        const sim = quietSim();
        sim.step(5);
        expect(sim.state.t).toBeCloseTo(0.1, 6);
    });

    it("is deterministic for a given seed", () => {
        const a = createSim({ rng: mulberry32(42) });
        const b = createSim({ rng: mulberry32(42) });
        run(a, 40);
        run(b, 40);
        expect(a.state.pose).toEqual(b.state.pose);
        expect(a.state.events).toEqual(b.state.events);
        expect(a.state.obstacles).toEqual(b.state.obstacles);
        expect(Array.from(a.state.lidar.dist)).toEqual(Array.from(b.state.lidar.dist));
    });
});
