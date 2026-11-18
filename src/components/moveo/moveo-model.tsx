"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { BufferGeometry, Color, Mesh, MeshStandardMaterial, type Object3D, PlaneGeometry, Vector3 } from "three";
import { JOINTS, POSES, type MoveoPose } from "@/lib/moveo/constants";
import type { MoveoStore } from "./moveo-store";

export const MOVEO_MODEL_URL = "/models/moveo.v1.glb";
const PAD = 0.055; // m, side of the pick / place markers

/** `--brand` is "H S% L%"; three wants "hsl(H, S%, L%)". */
function readBrand(): Color {
    const v = getComputedStyle(document.documentElement).getPropertyValue("--brand").trim();
    const [h, s, l] = v.split(/\s+/);
    return h && s && l ? new Color(`hsl(${h}, ${s}, ${l})`) : new Color("#c96442");
}

/** Lowest point of a mesh in world space: the tool end of link_5 when the wrist points down. */
function lowestPoint(mesh: Mesh): Vector3 {
    const pos = (mesh.geometry as BufferGeometry).attributes.position;
    const v = new Vector3();
    const low = new Vector3(0, Infinity, 0);
    for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
        if (v.y < low.y) low.copy(v);
    }
    return low;
}

export function MoveoModel({ store, onReady }: { store: MoveoStore; onReady: () => void }) {
    const gltf = useGLTF(MOVEO_MODEL_URL, false, true);

    const rig = useMemo(() => {
        const root = gltf.scene.clone(true);
        const printed = new MeshStandardMaterial({ color: "#ece6da", roughness: 0.78, metalness: 0 });
        const base = new MeshStandardMaterial({ color: "#252321", roughness: 0.5, metalness: 0 });
        const accent = new MeshStandardMaterial({ color: "#c96442", roughness: 0.62, metalness: 0 });
        const pad = new MeshStandardMaterial({ color: "#c96442", roughness: 0.9, metalness: 0, transparent: true, opacity: 0.45 });
        root.traverse((o) => {
            const m = o as Mesh;
            if (!m.isMesh) return;
            m.material = m.name === "base_link_mesh" ? base : m.name === "link_5_mesh" ? accent : printed;
        });
        const nodes = JOINTS.map((j) => root.getObjectByName(j)) as (Object3D | undefined)[];
        const apply = (pose: MoveoPose) => {
            nodes.forEach((n, i) => n?.rotation.set(0, 0, pose[i]));
            root.updateMatrixWorld(true);
        };

        // pick / place markers on the table, under where the wrist ends up
        const tool = root.getObjectByName("link_5_mesh") as Mesh | undefined;
        const padGeo = new PlaneGeometry(PAD, PAD).rotateX(-Math.PI / 2);
        const pads = tool
            ? [POSES.pick, POSES.place].map((p) => {
                  apply(p);
                  const at = lowestPoint(tool);
                  const m = new Mesh(padGeo, pad);
                  m.position.set(at.x, 0.001, at.z);
                  root.add(m);
                  return m;
              })
            : [];
        apply(store.get().pose);
        return { root, apply, materials: [printed, base, accent, pad], padGeo, pads };
    }, [gltf.scene, store]);

    // the clay accent follows the site's --brand (and the theme)
    useEffect(() => {
        const [, , accent, pad] = rig.materials;
        const update = () => {
            const c = readBrand();
            accent.color.copy(c);
            pad.color.copy(c);
        };
        update();
        const mo = new MutationObserver(update);
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
        return () => mo.disconnect();
    }, [rig]);

    useEffect(
        () => () => {
            rig.materials.forEach((m) => m.dispose());
            rig.padGeo.dispose();
        },
        [rig]
    );

    const frames = useRef(0);
    useFrame(() => {
        rig.apply(store.get().pose);
        if (frames.current < 2 && ++frames.current === 2) onReady();
    });

    return <primitive object={rig.root} />;
}

useGLTF.preload(MOVEO_MODEL_URL, false, true);
