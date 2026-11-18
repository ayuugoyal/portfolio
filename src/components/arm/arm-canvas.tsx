"use client";

import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import type { SceneProps } from "@/components/three/lazy-scene";
import { useReducedMotion } from "@/components/three/use-webgl";
import { useArmScene } from "./arm-context";
import { ArmModel } from "./arm-model";

/**
 * Camera: a three-quarter view from the side `face_me` (shoulder_pan -102.5) turns to, so the arm reads in
 * profile at rest and looks at the visitor when asked to face them.
 */
const TARGET: [number, number, number] = [0.1, 0.16, 0];
const CAMERA: [number, number, number] = [0.46, 0.54, -1.07];

export default function ArmCanvas({ inView, onReady }: SceneProps) {
    const scene = useArmScene();
    const reduced = useReducedMotion();
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
            <directionalLight position={[0.6, 1.2, -0.4]} intensity={1.6} />
            <Environment resolution={64} frames={1}>
                <Lightformer form="rect" intensity={2.2} position={[0, 2, 0]} rotation-x={Math.PI / 2} scale={[3, 3, 1]} />
                <Lightformer form="rect" intensity={1.1} position={[2, 0.6, -1.5]} scale={[2, 1, 1]} />
                <Lightformer form="rect" intensity={0.6} position={[-2, 0.5, 1]} scale={[2, 1, 1]} color="#ffe8d6" />
            </Environment>
            <Suspense fallback={null}>
                <ArmModel scene={scene} reduced={reduced} onReady={onReady} />
            </Suspense>
            <ContactShadows position={[0.05, -0.002, 0]} scale={1.1} resolution={256} blur={2.2} opacity={0.4} far={0.5} />
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
