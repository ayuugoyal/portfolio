"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, type ThreeEvent, useFrame } from "@react-three/fiber";
import { type ElementRef, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
    BufferAttribute,
    BufferGeometry,
    Color,
    DynamicDrawUsage,
    type Group,
    type LineSegments,
    type Mesh,
} from "three";
import type { SceneProps } from "@/components/three/lazy-scene";
import { BOUNDS, MAX_OBSTACLES, PUCKS, RAYS_PER_PUCK } from "@/lib/rover/sim";
import { RoverModel } from "./rover-model";
import { createRoverStore, type RoverStore, RoverStoreContext } from "./rover-store";

/*
 * World mapping: sim (x, y) on the ground → three (x, 0, -y); sim yaw → rotation.y.
 */

type Palette = { brand: string; ground: string; line: string; body: string; dark: string };

/** "15 56% 52%" (shadcn-style HSL triplet) → "hsl(15, 56%, 52%)" for three.Color. */
function cssHsl(name: string, fallback: string): string {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (!raw) return fallback;
    const parts = raw.replace(/\s*\/.*$/, "").split(/[\s,]+/).filter(Boolean);
    return parts.length === 3 ? `hsl(${parts[0]}, ${parts[1]}, ${parts[2]})` : fallback;
}

function readPalette(): Palette {
    const dark = document.documentElement.classList.contains("dark");
    return {
        brand: cssHsl("--brand", "hsl(15, 56%, 52%)"),
        ground: cssHsl("--muted", dark ? "hsl(40, 5%, 15%)" : "hsl(40, 24%, 89%)"),
        line: cssHsl("--muted-foreground", "hsl(38, 8%, 39%)"),
        body: dark ? "#d9d3c5" : "#ece6d8",
        dark: dark ? "#33302b" : "#3a3631",
    };
}

/** Colours from the site tokens; follows light/dark switches on <html>. */
function usePalette(): Palette | null {
    const [palette, setPalette] = useState<Palette | null>(null);
    useEffect(() => {
        const update = () => setPalette(readPalette());
        update();
        const mo = new MutationObserver(update);
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
        return () => mo.disconnect();
    }, []);
    return palette;
}

const RAY_COUNT = RAYS_PER_PUCK * PUCKS.length;

function Rays({ store, palette }: { store: RoverStore; palette: Palette }) {
    const ref = useRef<LineSegments>(null);
    const hitColor = useMemo(() => new Color(palette.brand), [palette.brand]);
    const faintColor = useMemo(
        () => new Color(palette.line).lerp(new Color(palette.ground), 0.55),
        [palette.line, palette.ground]
    );
    const geometry = useMemo(() => {
        const g = new BufferGeometry();
        const pos = new BufferAttribute(new Float32Array(RAY_COUNT * 2 * 3), 3);
        const col = new BufferAttribute(new Float32Array(RAY_COUNT * 2 * 3), 3);
        pos.setUsage(DynamicDrawUsage);
        col.setUsage(DynamicDrawUsage);
        g.setAttribute("position", pos);
        g.setAttribute("color", col);
        return g;
    }, []);
    const rel = useMemo(() => {
        const c = new Float32Array(RAYS_PER_PUCK);
        const s = new Float32Array(RAYS_PER_PUCK);
        for (let i = 0; i < RAYS_PER_PUCK; i++) {
            c[i] = Math.cos((2 * Math.PI * i) / RAYS_PER_PUCK);
            s[i] = Math.sin((2 * Math.PI * i) / RAYS_PER_PUCK);
        }
        return { c, s };
    }, []);

    useEffect(() => () => geometry.dispose(), [geometry]);

    useFrame(() => {
        const { pose, lidar } = store.sim.state;
        const pos = geometry.attributes.position as BufferAttribute;
        const col = geometry.attributes.color as BufferAttribute;
        const p = pos.array as Float32Array;
        const c = col.array as Float32Array;
        const cy = Math.cos(pose.yaw);
        const sy = Math.sin(pose.yaw);
        for (let k = 0; k < PUCKS.length; k++) {
            const ox = lidar.origin[2 * k];
            const oy = lidar.origin[2 * k + 1];
            const h = PUCKS[k].height;
            for (let i = 0; i < RAYS_PER_PUCK; i++) {
                const r = k * RAYS_PER_PUCK + i;
                const d = lidar.dist[r];
                const dx = cy * rel.c[i] - sy * rel.s[i];
                const dy = sy * rel.c[i] + cy * rel.s[i];
                const v = r * 6;
                p[v] = ox;
                p[v + 1] = h;
                p[v + 2] = -oy;
                p[v + 3] = ox + dx * d;
                p[v + 4] = h;
                p[v + 5] = -(oy + dy * d);
                const color = lidar.hit[r] >= 0 ? hitColor : faintColor;
                c[v] = c[v + 3] = color.r;
                c[v + 1] = c[v + 4] = color.g;
                c[v + 2] = c[v + 5] = color.b;
            }
        }
        pos.needsUpdate = true;
        col.needsUpdate = true;
    });

    return (
        <lineSegments ref={ref} geometry={geometry} frustumCulled={false}>
            <lineBasicMaterial vertexColors transparent opacity={0.85} depthWrite={false} />
        </lineSegments>
    );
}

/** A fixed pool of obstacle meshes (barrel + cone per slot), shown/hidden from the sim each frame. */
function Obstacles({ store, palette }: { store: RoverStore; palette: Palette }) {
    const barrels = useRef<(Mesh | null)[]>([]);
    const cones = useRef<(Mesh | null)[]>([]);
    useFrame(() => {
        const list = store.sim.state.obstacles;
        for (let i = 0; i < MAX_OBSTACLES; i++) {
            const o = list[i];
            const b = barrels.current[i];
            const c = cones.current[i];
            if (!b || !c) continue;
            const grow = o ? Math.min(1, o.age * 4) : 0;
            const fade = o && o.passedAt !== null ? Math.max(0, 1 - (store.sim.state.t - o.passedAt) / 3) : 1;
            const k = grow * fade;
            b.visible = !!o && o.kind === "barrel" && k > 0.01;
            c.visible = !!o && o.kind === "cone" && k > 0.01;
            if (!o) continue;
            const m = o.kind === "cone" ? c : b;
            m.position.set(o.x, (o.h * k) / 2, -o.y);
            m.scale.set(o.r * k, o.h * k, o.r * k);
        }
    });
    return (
        <>
            {Array.from({ length: MAX_OBSTACLES }, (_, i) => (
                <group key={i}>
                    <mesh ref={(m) => void (barrels.current[i] = m)} visible={false}>
                        <cylinderGeometry args={[1, 1, 1, 18]} />
                        <meshStandardMaterial color={palette.line} roughness={0.9} />
                    </mesh>
                    <mesh ref={(m) => void (cones.current[i] = m)} visible={false}>
                        <coneGeometry args={[1, 1, 18]} />
                        <meshStandardMaterial color={palette.brand} roughness={0.85} />
                    </mesh>
                </group>
            ))}
        </>
    );
}

function Route({ store, palette }: { store: RoverStore; palette: Palette }) {
    const geometry = useMemo(() => {
        const path = store.sim.state.path;
        const n = path.length / 2;
        const arr = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) {
            arr[3 * i] = path[2 * i];
            arr[3 * i + 1] = 0.02;
            arr[3 * i + 2] = -path[2 * i + 1];
        }
        const g = new BufferGeometry();
        g.setAttribute("position", new BufferAttribute(arr, 3));
        return g;
    }, [store]);
    useEffect(() => () => geometry.dispose(), [geometry]);
    return (
        <lineLoop geometry={geometry}>
            <lineBasicMaterial color={palette.line} transparent opacity={0.45} />
        </lineLoop>
    );
}

/** Ring on the ground at the offset waypoint while GUIDED. */
function GuidedMarker({ store, palette }: { store: RoverStore; palette: Palette }) {
    const ref = useRef<Mesh>(null);
    useFrame(() => {
        const m = ref.current;
        const g = store.sim.state.guided;
        if (!m) return;
        m.visible = !!g;
        if (g) m.position.set(g.target.x, 0.025, -g.target.y);
    });
    return (
        <mesh ref={ref} rotation-x={-Math.PI / 2} visible={false}>
            <ringGeometry args={[0.28, 0.4, 24]} />
            <meshBasicMaterial color={palette.brand} transparent opacity={0.8} depthWrite={false} />
        </mesh>
    );
}

function Scene({ store, palette, onReady }: { store: RoverStore; palette: Palette; onReady: () => void }) {
    const rover = useRef<Group>(null);
    const controls = useRef<ElementRef<typeof OrbitControls>>(null);
    const frames = useRef(0);

    // OrbitControls sets touch-action: none; let phones scroll the page vertically through the scene.
    useEffect(() => {
        const el = controls.current?.domElement as HTMLElement | undefined;
        if (el) el.style.touchAction = "pan-y";
    }, []);

    // step the sim before anything reads it this frame (negative priority keeps auto-rendering on)
    useFrame((_, delta) => store.step(delta), -2);

    useFrame(() => {
        const { pose } = store.sim.state;
        const g = rover.current;
        if (g) {
            g.position.set(pose.x, 0, -pose.y);
            g.rotation.y = pose.yaw;
        }
        if (frames.current < 2 && ++frames.current === 2) onReady();
    });

    const drop = (e: ThreeEvent<MouseEvent>) => {
        if (e.delta > 6) return; // that was an orbit drag, not a tap
        e.stopPropagation();
        store.addObstacle(e.point.x, -e.point.z);
    };

    return (
        <>
            <hemisphereLight args={["#fff8ec", "#8a7f70", 1.1]} />
            <directionalLight position={[6, 12, 5]} intensity={1.6} />
            <directionalLight position={[-8, 6, -6]} intensity={0.35} />

            <mesh rotation-x={-Math.PI / 2} onClick={drop}>
                <planeGeometry args={[BOUNDS.x * 2 + 8, BOUNDS.y * 2 + 8]} />
                <meshStandardMaterial color={palette.ground} roughness={1} />
            </mesh>

            <Route store={store} palette={palette} />
            <GuidedMarker store={store} palette={palette} />
            <Obstacles store={store} palette={palette} />
            <Rays store={store} palette={palette} />
            <RoverModel ref={rover} colors={{ body: palette.body, dark: palette.dark, accent: palette.brand }} />

            <OrbitControls
                ref={controls}
                target={[0, 0, 0.5]}
                enableZoom={false}
                enablePan={false}
                rotateSpeed={0.5}
                minPolarAngle={0.45}
                maxPolarAngle={1.15}
            />
        </>
    );
}

export default function RoverCanvas({ inView, onReady }: SceneProps) {
    const shared = useContext(RoverStoreContext);
    const [fallback] = useState(() => (shared ? null : createRoverStore()));
    const store = shared ?? fallback!;
    const palette = usePalette();
    if (!palette) return null;
    return (
        <Canvas
            frameloop={inView ? "always" : "never"}
            dpr={[1, 1.5]}
            gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
            camera={{ position: [0, 11, 13.5], fov: 38, near: 0.5, far: 120 }}
            style={{ touchAction: "pan-y" }}
            aria-label="3D rover: follows a loop, swerves around obstacles"
        >
            <Scene store={store} palette={palette} onReady={onReady} />
        </Canvas>
    );
}
