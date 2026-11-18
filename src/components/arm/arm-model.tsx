"use client";

import { Line, useGLTF } from "@react-three/drei";
import { type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { BoxGeometry, Color, type Material, Mesh, MeshStandardMaterial, type Object3D, Quaternion, Vector3 } from "three";
import { JOINTS, PICK, START_POSE, clampSpot } from "@/lib/arm/constants";
import { toRad } from "@/lib/arm/joint-map";
import type { PlayerEvent } from "@/lib/arm/player";
import type { Joint, Pose } from "@/lib/arm/types";
import type { ArmScene } from "./arm-context";

export const MODEL_URL = "/models/so101.v1.glb";
const CUBE = PICK.cubeSize; // m

/** `--brand` is "H S% L%"; three wants "hsl(H, S%, L%)". */
function readBrand(): Color {
    const v = getComputedStyle(document.documentElement).getPropertyValue("--brand").trim();
    const [h, s, l] = v.split(/\s+/);
    return h && s && l ? new Color(`hsl(${h}, ${s}, ${l})`) : new Color("#c96442");
}

/** Slow breathing sway (degrees) layered on the pose while the arm is idle. */
function sway(t: number): Partial<Pose> {
    return {
        shoulder_pan: 2.5 * Math.sin(t * 0.35),
        shoulder_lift: 1.2 * Math.sin(t * 0.5 + 1),
        elbow_flex: 1.8 * Math.sin(t * 0.45 + 2),
        wrist_flex: 3 * Math.sin(t * 0.6),
    };
}

export function ArmModel({ scene, reduced, onReady }: { scene: ArmScene; reduced: boolean; onReady: () => void }) {
    const { player } = scene;
    const gltf = useGLTF(MODEL_URL, false, true);

    const rig = useMemo(() => {
        const root = gltf.scene.clone(true);
        const printed = new MeshStandardMaterial({ color: "#ece6da", roughness: 0.78, metalness: 0 });
        const servo = new MeshStandardMaterial({ color: "#252321", roughness: 0.5, metalness: 0 });
        const accent = new MeshStandardMaterial({ color: "#c96442", roughness: 0.62, metalness: 0 });
        root.traverse((o) => {
            const m = o as Mesh;
            if (!m.isMesh) return;
            const from = (m.material as Material).name;
            m.material = m.name.startsWith("moving_jaw") ? accent : from === "servo" ? servo : printed;
        });
        const nodes = Object.fromEntries(JOINTS.map((j) => [j, root.getObjectByName(scene.map[j].node)])) as Record<
            Joint,
            Object3D | undefined
        >;
        const frame = root.getObjectByName("gripper_frame") ?? root;

        // where the cube sits: between the jaws in the PICK "down" pose, on the table
        const apply = (pose: Pose) => {
            for (const j of JOINTS) nodes[j]?.rotation.set(0, 0, toRad(j, pose[j], scene.map));
            root.updateMatrixWorld(true);
        };
        const measure = (pan: number) => {
            apply({ ...START_POSE, ...PICK.down, shoulder_pan: pan, wrist_roll: PICK.hover.wrist_roll });
            const p = frame.localToWorld(new Vector3(...PICK.cubeOffset));
            const x = new Vector3(1, 0, 0).applyQuaternion(frame.getWorldQuaternion(new Quaternion()));
            return { x: p.x, z: p.z, yaw: Math.atan2(-x.z, x.x) };
        };
        const table = tableArc(measure(-40), measure(0), measure(40), 40);
        apply(player.pose);

        const cube = new Mesh(new BoxGeometry(CUBE, CUBE, CUBE), accent);
        cube.name = "cube";
        root.add(cube);
        return { root, nodes, frame, table, cube, materials: [printed, servo, accent], apply };
    }, [gltf.scene, player, scene.map]);

    // the clay accent follows the site's --brand (and the theme)
    useEffect(() => {
        const accent = rig.materials[2];
        const update = () => accent.color.copy(readBrand());
        update();
        const mo = new MutationObserver(update);
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
        return () => mo.disconnect();
    }, [rig]);

    // cube: start where the player says it is; follow attach/release/reset events after each frame's pose
    const pending = useRef<PlayerEvent[]>([]);
    useEffect(() => {
        const { cube, table, root, frame } = rig;
        const now = player.cubeNow;
        const s = table.spot(now.spot);
        cube.position.copy(s.position);
        cube.rotation.set(0, s.yaw, 0);
        if (now.held) frame.attach(cube);
        const off = player.on("event", (e) => pending.current.push(e));
        return () => {
            off();
            root.attach(cube);
        };
    }, [rig, player]);

    useEffect(
        () => () => {
            rig.materials.forEach((m) => m.dispose());
            rig.cube.geometry.dispose();
        },
        [rig]
    );

    const t = useRef(0);
    const amount = useRef(0);
    const frames = useRef(0);
    const shown = useRef<Pose>({ ...START_POSE });

    useFrame((_, delta) => {
        scene.canvasTick.at = performance.now();
        player.tick(delta);
        const dt = Math.min(delta, 0.1);
        t.current += dt;
        const target = player.idle && !reduced ? 1 : 0;
        amount.current += (target - amount.current) * (1 - Math.exp(-dt * 1.5));
        const s = sway(t.current);
        const p = shown.current;
        for (const j of JOINTS) p[j] = player.pose[j] + (s[j] ?? 0) * amount.current;
        rig.apply(p);

        const { cube, root, frame, table } = rig;
        for (const e of pending.current.splice(0)) {
            if (e.type === "cube:attach") {
                frame.attach(cube);
            } else {
                root.attach(cube);
                if (e.type === "cube:release") {
                    cube.position.y = CUBE / 2;
                    cube.rotation.set(0, cube.rotation.y, 0);
                } else {
                    // reset (dropped) or placed by the visitor
                    const s = table.spot(e.spot);
                    cube.position.copy(s.position);
                    cube.rotation.set(0, s.yaw, 0);
                }
            }
        }

        if (frames.current < 2 && ++frames.current === 2) onReady();
    });

    return (
        <>
            <primitive object={rig.root} />
            <CubePlacer table={rig.table} player={player} color={rig.materials[2].color} />
        </>
    );
}

type Spot = { x: number; z: number; yaw: number };

/**
 * The table arc the pick recipe reaches. shoulder_pan turns everything about the base's vertical axis, so the
 * spots lie on a circle: fit it through three measured spots, then map pan <-> position both ways.
 */
export function tableArc(a: Spot, b: Spot, c: Spot, step: number) {
    // circumcentre of a, b, c in the XZ plane
    const d = 2 * (a.x * (b.z - c.z) + b.x * (c.z - a.z) + c.x * (a.z - b.z));
    const sq = (p: Spot) => p.x * p.x + p.z * p.z;
    const cx = (sq(a) * (b.z - c.z) + sq(b) * (c.z - a.z) + sq(c) * (a.z - b.z)) / d;
    const cz = (sq(a) * (c.x - b.x) + sq(b) * (a.x - c.x) + sq(c) * (b.x - a.x)) / d;
    const radius = Math.hypot(b.x - cx, b.z - cz);
    const wrap = (r: number) => Math.atan2(Math.sin(r), Math.cos(r));
    const a0 = Math.atan2(b.z - cz, b.x - cx);
    // radians of circle angle per degree of pan (sign included), and of cube yaw per degree of pan
    const k = wrap(Math.atan2(c.z - cz, c.x - cx) - a0) / step;
    const ky = wrap(c.yaw - b.yaw) / step;
    return {
        cx,
        cz,
        radius,
        spot(pan: number) {
            const t = a0 + k * pan;
            return { position: new Vector3(cx + radius * Math.cos(t), CUBE / 2, cz + radius * Math.sin(t)), yaw: b.yaw + ky * pan };
        },
        /** the pan whose spot is closest to a point on the table, and how far the point is from the base axis */
        panAt(x: number, z: number) {
            return { pan: wrap(Math.atan2(z - cz, x - cx) - a0) / k, dist: Math.hypot(x - cx, z - cz) };
        },
    };
}
type TableArc = ReturnType<typeof tableArc>;

/** Points along the placeable part of the arc, for the dashed guide. */
function arcPoints(table: TableArc): [number, number, number][] {
    const out: [number, number, number][] = [];
    for (let pan = -PICK.panMax; pan <= PICK.panMax; pan += 4) {
        const p = table.spot(pan).position;
        out.push([p.x, 0.0015, p.z]);
    }
    return out;
}

/**
 * Click (or tap) the table to put the cube there: the click is projected onto the reachable arc. A press that
 * moves more than a few pixels is an orbit drag, not a placement. Ignored while the arm moves or holds the cube.
 */
function CubePlacer({ table, player, color }: { table: TableArc; player: ArmScene["player"]; color: Color }) {
    const gl = useThree((s) => s.gl);
    const points = useMemo(() => arcPoints(table), [table]);
    const [ghost, setGhost] = useState<{ position: Vector3; yaw: number } | null>(null);
    const down = useRef<{ x: number; y: number } | null>(null);

    const panFor = (e: ThreeEvent<PointerEvent>): number | null => {
        const { pan, dist } = table.panAt(e.point.x, e.point.z);
        // too close to the base axis (under the arm) or far off the table: not a placement
        if (dist < table.radius * 0.35 || dist > table.radius * 2.2) return null;
        if (!player.idle || player.cubeHeld) return null;
        return clampSpot(pan);
    };
    const setCursor = (c: string) => {
        gl.domElement.style.cursor = c;
    };

    useEffect(() => () => setCursor(""), []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <group>
            <Line points={points} color={color} lineWidth={1.2} dashed dashSize={0.012} gapSize={0.01} transparent opacity={0.45} />
            <mesh
                rotation-x={-Math.PI / 2}
                position={[table.cx, 0.001, table.cz]}
                onPointerDown={(e) => {
                    down.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY };
                }}
                onPointerMove={(e) => {
                    const pan = e.nativeEvent.pointerType === "mouse" ? panFor(e) : null;
                    if (pan === null) {
                        setGhost(null);
                        setCursor("");
                        return;
                    }
                    setGhost(table.spot(pan));
                    setCursor("pointer");
                }}
                onPointerOut={() => {
                    setGhost(null);
                    setCursor("");
                }}
                onPointerUp={(e) => {
                    const d = down.current;
                    down.current = null;
                    if (!d || Math.hypot(e.nativeEvent.clientX - d.x, e.nativeEvent.clientY - d.y) > 5) return;
                    const pan = panFor(e);
                    if (pan === null) return;
                    player.placeCube(pan);
                    setGhost(null);
                }}
            >
                <circleGeometry args={[table.radius * 2.2, 48]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
            {ghost && (
                <mesh position={ghost.position} rotation-y={ghost.yaw} raycast={() => null}>
                    <boxGeometry args={[CUBE, CUBE, CUBE]} />
                    <meshStandardMaterial color={color} transparent opacity={0.35} depthWrite={false} />
                </mesh>
            )}
        </group>
    );
}

useGLTF.preload(MODEL_URL, false, true);
