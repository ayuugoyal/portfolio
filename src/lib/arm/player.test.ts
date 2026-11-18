import { describe, expect, it } from "vitest";
import { PICK, SETTLE_S, START_POSE } from "./constants";
import { GRIPPER_DEG, toRad } from "./joint-map";
import { SimArm, plan } from "./plan";
import { ArmPlayer, moveDuration } from "./player";

const run = (p: ArmPlayer, seconds: number, dt = 1 / 60) => {
    for (let t = 0; t < seconds - 1e-9; t += dt) p.tick(dt);
};

describe("moveDuration", () => {
    it("is max(1/30, distance/speed) + 0.12", () => {
        expect(moveDuration(START_POSE, { ...START_POSE, shoulder_pan: 40 }, 40)).toEqual({ motion: 1, total: 1 + SETTLE_S });
        expect(moveDuration(START_POSE, START_POSE, 40).motion).toBeCloseTo(1 / 30);
        const d = moveDuration(START_POSE, { ...START_POSE, elbow_flex: -20, wrist_flex: 60 }, 30);
        expect(d.motion).toBe(2);
    });
});

describe("ArmPlayer", () => {
    it("eases with smoothstep, then holds for the settle pause", () => {
        const player = new ArmPlayer(START_POSE);
        const arm = new SimArm(START_POSE);
        arm.run({ tool: "move_joints", args: { shoulder_pan: 40, speed: 40 } });
        player.enqueue(arm.steps);
        expect(player.idle).toBe(false);
        player.tick(0.05);
        for (let i = 0; i < 9; i++) player.tick(0.05); // t = 0.5 s
        expect(player.pose.shoulder_pan).toBeCloseTo(20, 5);
        run(player, 0.5, 0.05); // t = 1.0
        expect(player.pose.shoulder_pan).toBeCloseTo(40, 5);
        expect(player.idle).toBe(false); // settling
        run(player, 0.15, 0.05);
        expect(player.idle).toBe(true);
        expect(player.pose.shoulder_pan).toBe(40);
    });

    it("fires callStart, events and callEnd in order", () => {
        const player = new ArmPlayer(START_POSE);
        const log: string[] = [];
        player.on("callStart", (s) => log.push(`start ${s.line}`));
        player.on("callEnd", (s) => log.push(`end ${s.text}`));
        player.on("event", (e) => log.push(e.type));
        const p = plan("pick up the cube", START_POSE, { cubeSpot: -28 });
        player.enqueue(p.steps);
        expect(log).toEqual([]); // nothing until the first tick
        player.tick(0.01);
        expect(log).toEqual([`start ${p.lines[0]}`]);
        run(player, 60, 0.1);
        expect(log.filter((l) => l.startsWith("start"))).toHaveLength(p.lines.length);
        expect(log.filter((l) => l.startsWith("end"))).toHaveLength(p.lines.length);
        const attach = log.indexOf("cube:attach");
        expect(log[attach - 1]).toBe(`end Gripper at ${PICK.grip}%`);
        expect(log.indexOf("cube:release")).toBeGreaterThan(attach);
        expect(player.pose).toEqual(p.endPose);
        expect(player.cubeSpot).toBe(28);
    });

    it("plannedEndPose chains commands", () => {
        const player = new ArmPlayer(START_POSE);
        const a = plan("left 30", player.plannedEndPose(), { cubeSpot: -28 });
        player.enqueue(a.steps);
        expect(player.plannedEndPose().shoulder_pan).toBe(30);
        const b = plan("left 30", player.plannedEndPose(), { cubeSpot: -28 });
        player.enqueue(b.steps);
        expect(player.plannedEndPose().shoulder_pan).toBe(60);
        run(player, 10, 0.1);
        expect(player.pose.shoulder_pan).toBe(60);
    });

    it("stop clears the queue and holds where it is", () => {
        const player = new ArmPlayer(START_POSE);
        const ends: { text: string; stopped?: boolean }[] = [];
        player.on("callEnd", (s) => ends.push(s));
        player.enqueue(plan("wave", START_POSE, { cubeSpot: -28 }).steps);
        run(player, 0.5, 0.05);
        const held = { ...player.pose };
        expect(held.elbow_flex).toBeLessThan(0);
        expect(held.elbow_flex).toBeGreaterThan(-40);
        player.stop();
        expect(player.idle).toBe(true);
        expect(ends).toEqual([expect.objectContaining({ text: "Stopped. Holding position.", stopped: true })]);
        run(player, 2, 0.1);
        expect(player.pose).toEqual(held);
        expect(player.plannedEndPose()).toEqual(held);
    });

    it("stop while holding the cube puts it back", () => {
        const player = new ArmPlayer(START_POSE);
        const events: string[] = [];
        player.on("event", (e) => events.push(`${e.type}:${e.spot}`));
        player.enqueue(plan("pick up the cube", START_POSE, { cubeSpot: -28 }).steps);
        expect(player.cubeSpot).toBe(28); // planned
        while (!events.includes("cube:attach:-28")) player.tick(0.1);
        expect(player.cubeHeld).toBe(true);
        player.stop();
        expect(events).toEqual(["cube:attach:-28", "cube:reset:-28"]);
        expect(player.cubeSpot).toBe(-28);
    });

    it("caps dt at 0.1 s per tick", () => {
        const player = new ArmPlayer(START_POSE);
        const arm = new SimArm(START_POSE);
        arm.run({ tool: "move_joints", args: { shoulder_pan: 40, speed: 40 } });
        player.enqueue(arm.steps);
        player.tick(5);
        expect(player.pose.shoulder_pan).toBeLessThan(10);
        expect(player.idle).toBe(false);
    });

    it("reports idle changes", () => {
        const player = new ArmPlayer(START_POSE);
        const states: boolean[] = [];
        player.on("idle", (i) => states.push(i));
        player.enqueue(plan("open", START_POSE, { cubeSpot: -28 }).steps);
        run(player, 3, 0.1);
        expect(states).toEqual([false, true]);
    });
});

describe("joint map", () => {
    it("degrees -> radians about local Z, identity signs", () => {
        expect(toRad("shoulder_pan", 90)).toBeCloseTo(Math.PI / 2);
        expect(toRad("elbow_flex", -40)).toBeCloseTo((-40 * Math.PI) / 180);
        expect(toRad("gripper", 0)).toBeCloseTo((GRIPPER_DEG[0] * Math.PI) / 180);
        expect(toRad("gripper", 100)).toBeCloseTo((GRIPPER_DEG[1] * Math.PI) / 180);
    });
});

describe("placeCube", () => {
    it("moves the cube to a clamped spot while idle, then picks from there", () => {
        const player = new ArmPlayer(START_POSE);
        const events: string[] = [];
        player.on("event", (e) => events.push(`${e.type}:${e.spot}`));
        expect(player.placeCube(47.6)).toBe(48);
        expect(player.placeCube(150)).toBe(PICK.panMax);
        expect(events).toEqual(["cube:place:48", `cube:place:${PICK.panMax}`]);
        expect(player.cubeNow).toEqual({ spot: PICK.panMax, held: false });
        const p = plan("pick up the cube", player.plannedEndPose(), { cubeSpot: player.cubeSpot });
        expect(p.lines[0].startsWith(`move_joints(shoulder_pan=${PICK.panMax}, `)).toBe(true);
    });

    it("is ignored while the arm moves or holds the cube", () => {
        const player = new ArmPlayer(START_POSE);
        player.enqueue(plan("pick up the cube", START_POSE, { cubeSpot: player.cubeSpot }).steps);
        expect(player.placeCube(40)).toBeNull();
        while (!player.cubeHeld) player.tick(0.1);
        player.stop();
        expect(player.cubeHeld).toBe(false);
        expect(player.placeCube(40)).toBe(40);
    });
});
