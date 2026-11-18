"use client";

import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import type { SceneProps } from "@/components/three/lazy-scene";
import { MoveoModel } from "./moveo-model";
import { useMoveoStore } from "./moveo-store";

/**
 * Camera: side-on to the work area (the Moveo reaches over its base towards +Z for pick / place), so the
 * reach reads in profile. Keep in sync with scripts/render-moveo-poster.mjs, which renders the poster.
 */
const TARGET: [number, number, number] = [0.05, 0.33, 0.12];
const CAMERA: [number, number, number] = [1.55, 0.8, 1.05];

export default function MoveoCanvas({ inView, onReady }: SceneProps) {
    const store = useMoveoStore();
    const [small] = useState(() => window.matchMedia("(max-width: 640px)").matches);
    return (
        <Canvas
            frameloop={inView ? "always" : "never"}
            dpr={[1, 1.5]}
            gl={{ alpha: true, antialias: !small, powerPreference: "high-performance" }}
            camera={{ position: CAMERA, fov: 30, near: 0.02, far: 10 }}
            style={{ touchAction: "pan-y" }}
            aria-hidden
        >
            <ambientLight intensity={0.35} />
            <directionalLight position={[0.8, 1.4, 0.6]} intensity={1.6} />
            <Environment resolution={64} frames={1}>
                <Lightformer form="rect" intensity={2.2} position={[0, 2, 0]} rotation-x={Math.PI / 2} scale={[3, 3, 1]} />
                <Lightformer form="rect" intensity={1.1} position={[1.5, 0.6, 2]} scale={[2, 1, 1]} />
                <Lightformer form="rect" intensity={0.6} position={[-2, 0.5, -1]} scale={[2, 1, 1]} color="#ffe8d6" />
            </Environment>
            <Suspense fallback={null}>
                <MoveoModel store={store} onReady={onReady} />
            </Suspense>
            <ContactShadows position={[0.05, -0.002, 0.12]} scale={1.4} resolution={256} blur={2.2} opacity={0.4} far={0.8} />
            <OrbitControls
                makeDefault
                target={TARGET}
                enableZoom={false}
                enablePan={false}
                enableDamping
                rotateSpeed={0.6}
                minPolarAngle={0.5}
                maxPolarAngle={1.45}
            />
            <KeepPageScroll />
        </Canvas>
    );
}

/** OrbitControls sets touch-action: none on connect; put pan-y back so phones can still scroll the page. */
function KeepPageScroll() {
    const controls = useThree((s) => s.controls) as { domElement?: HTMLElement } | null;
    useEffect(() => {
        const el = controls?.domElement;
        if (el) el.style.touchAction = "pan-y";
    }, [controls]);
    return null;
}
