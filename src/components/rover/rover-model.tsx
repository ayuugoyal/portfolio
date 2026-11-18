"use client";

import { forwardRef } from "react";
import type { Group } from "three";
import { PUCKS, ROVER } from "@/lib/rover/sim";

/*
 * Low-poly Raftaar, built from the real footprint: 2.19 m long, 2.10 m across the wheels,
 * a skid-steer chassis on four wheels, and two LiDAR pucks at 1.15 m and 0.58 m.
 * Local frame: +x forward, +y up, +z to the rover's right (three.js convention).
 */

const WHEEL_R = 0.32;
const WHEEL_W = 0.22;
const WHEEL_X = 0.72;
const WHEEL_Z = ROVER.halfWidth - WHEEL_W / 2;
const BODY_W = 2 * (WHEEL_Z - WHEEL_W / 2 - 0.04);
const BODY_BOTTOM = 0.36;
const BODY_TOP = 0.95;
const BODY_FRONT = PUCKS[1].forward - 0.12;
const BODY_LEN = BODY_FRONT + ROVER.halfLength;
const BODY_CX = (BODY_FRONT - ROVER.halfLength) / 2;

const PUCK_R = 0.1;
const PUCK_H = 0.08;

const WHEELS: [number, number][] = [
    [WHEEL_X, WHEEL_Z],
    [WHEEL_X, -WHEEL_Z],
    [-WHEEL_X, WHEEL_Z],
    [-WHEEL_X, -WHEEL_Z],
];

export type RoverColors = { body: string; dark: string; accent: string };

export const RoverModel = forwardRef<Group, { colors: RoverColors }>(function RoverModel({ colors }, ref) {
    const [high, low] = PUCKS;
    const mastH = high.height - PUCK_H / 2 - BODY_TOP;
    return (
        <group ref={ref}>
            {/* soft contact shadow */}
            <mesh rotation-x={-Math.PI / 2} position-y={0.012}>
                <planeGeometry args={[ROVER.length + 0.3, ROVER.width + 0.2]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.12} depthWrite={false} />
            </mesh>

            {/* chassis */}
            <mesh position={[BODY_CX, (BODY_BOTTOM + BODY_TOP) / 2, 0]}>
                <boxGeometry args={[BODY_LEN, BODY_TOP - BODY_BOTTOM, BODY_W]} />
                <meshStandardMaterial color={colors.body} roughness={0.85} metalness={0} />
            </mesh>
            {/* clay band along both sides */}
            <mesh position={[BODY_CX, BODY_TOP - 0.16, 0]}>
                <boxGeometry args={[BODY_LEN + 0.01, 0.06, BODY_W + 0.01]} />
                <meshStandardMaterial color={colors.accent} roughness={0.8} />
            </mesh>
            {/* deck */}
            <mesh position={[BODY_CX - 0.05, BODY_TOP + 0.02, 0]}>
                <boxGeometry args={[BODY_LEN - 0.3, 0.04, BODY_W - 0.25]} />
                <meshStandardMaterial color={colors.dark} roughness={0.9} />
            </mesh>

            {/* wheels */}
            {WHEELS.map(([x, z]) => (
                <mesh key={`${x}:${z}`} position={[x, WHEEL_R, z]} rotation-x={Math.PI / 2}>
                    <cylinderGeometry args={[WHEEL_R, WHEEL_R, WHEEL_W, 14]} />
                    <meshStandardMaterial color={colors.dark} roughness={0.95} />
                </mesh>
            ))}

            {/* high LiDAR on a mast, 1.15 m */}
            <mesh position={[high.forward, BODY_TOP + mastH / 2, 0]}>
                <cylinderGeometry args={[0.035, 0.035, mastH, 8]} />
                <meshStandardMaterial color={colors.dark} roughness={0.9} />
            </mesh>
            <mesh position={[high.forward, high.height, 0]}>
                <cylinderGeometry args={[PUCK_R, PUCK_R, PUCK_H, 16]} />
                <meshStandardMaterial color={colors.dark} roughness={0.6} />
            </mesh>
            <mesh position={[high.forward, high.height + PUCK_H / 2 + 0.01, 0]}>
                <cylinderGeometry args={[PUCK_R * 0.7, PUCK_R * 0.7, 0.02, 16]} />
                <meshStandardMaterial color={colors.accent} roughness={0.7} />
            </mesh>

            {/* low LiDAR on a front bracket, 0.58 m */}
            <mesh position={[low.forward - 0.07, low.height - PUCK_H / 2 - 0.02, 0]}>
                <boxGeometry args={[0.2, 0.04, 0.3]} />
                <meshStandardMaterial color={colors.dark} roughness={0.9} />
            </mesh>
            <mesh position={[low.forward, low.height, 0]}>
                <cylinderGeometry args={[PUCK_R, PUCK_R, PUCK_H, 16]} />
                <meshStandardMaterial color={colors.dark} roughness={0.6} />
            </mesh>
            <mesh position={[low.forward, low.height + PUCK_H / 2 + 0.01, 0]}>
                <cylinderGeometry args={[PUCK_R * 0.7, PUCK_R * 0.7, 0.02, 16]} />
                <meshStandardMaterial color={colors.accent} roughness={0.7} />
            </mesh>
        </group>
    );
});
