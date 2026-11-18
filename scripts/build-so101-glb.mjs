#!/usr/bin/env node
/**
 * Build public/models/so101.v1.glb from the official SO-101 URDF + STLs (TheRobotStudio/SO-ARM100, Apache-2.0).
 *
 *   pnpm build:so101                 fetch (cached in scripts/.cache/so101) and build
 *   pnpm build:so101 --src <dir>     use a local copy (a folder holding so101_new_calib.urdf, assets/*.stl, LICENSE)
 *
 * Node tree (URDF frames, root turned -90° about X so Z-up becomes three's Y-up):
 *   so101 > base_link > shoulder_pan_origin > shoulder_pan > shoulder_link > shoulder_lift_origin > shoulder_lift > …
 * Every `<joint>` node rotates about its local Z (all SO-101 joint axes are 0 0 1). `gripper_frame` marks the
 * grasp point. One mesh per STL file; visuals keep their URDF origins.
 *
 * The URDF -> GLB conversion lives in scripts/lib/urdf-to-glb.mjs (shared with build-moveo-glb.mjs).
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildGlb, parseUrdf } from "./lib/urdf-to-glb.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REPO = "TheRobotStudio/SO-ARM100";
const SHA = "5f6d2b876a53a4872e405b991dd925556c9e38a4";
const RAW = `https://raw.githubusercontent.com/${REPO}/${SHA}`;
const URDF_PATH = "Simulation/SO101/so101_new_calib.urdf";
const OUT_DIR = join(ROOT, "public", "models");
const OUT = join(OUT_DIR, "so101.v1.glb");
const MAX_BYTES = 2 * 1024 * 1024;
const JOINT_NODES = ["shoulder_pan", "shoulder_lift", "elbow_flex", "wrist_flex", "wrist_roll", "gripper"];
const RATIO = 0.12;
const ERROR = 0.001;
const CREASE_DEG = 40;

// ------------------------------------------------------------------ args + fetch
const argv = process.argv.slice(2);
const srcArg = argv.includes("--src") ? argv[argv.indexOf("--src") + 1] : null;
const SRC = srcArg ? resolve(srcArg) : join(ROOT, "scripts", ".cache", "so101");

async function download(url, file) {
    if (existsSync(file)) return;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
    console.log(`  fetched ${url.replace(RAW + "/", "")}`);
}

async function loadSources() {
    const urdfFile = join(SRC, "so101_new_calib.urdf");
    if (!srcArg) {
        console.log(`source: ${REPO}@${SHA} (cache ${SRC})`);
        await download(`${RAW}/${URDF_PATH}`, urdfFile);
        await download(`${RAW}/LICENSE`, join(SRC, "LICENSE"));
    } else {
        console.log(`source: ${SRC} (--src)`);
    }
    const { urdf, meshes } = parseUrdf(await readFile(urdfFile, "utf8"));
    if (!srcArg) await Promise.all(meshes.map((m) => download(`${RAW}/Simulation/SO101/${m}`, join(SRC, m))));
    return { urdf, meshes };
}

// ------------------------------------------------------------------ names
/** Node/mesh names: lowercase [a-z_] only (three.js keeps them as-is). */
function partName(file) {
    const base = file.split("/").pop().replace(/\.stl$/i, "").toLowerCase();
    if (base.startsWith("sts3215")) return base.includes("no_horn") ? "servo_no_horn" : "servo";
    return base.replace(/_so101/g, "").replace(/_v\d+$/, "").replace(/[^a-z_]/g, "").replace(/_+/g, "_").replace(/^_|_$/g, "");
}
const linkName = (l) => l.replace(/_so101/g, "").replace(/_v\d+/g, "").replace(/[^a-z_]/g, "").replace(/_+/g, "_");

// ------------------------------------------------------------------ build
async function build() {
    const { urdf, meshes: meshFiles } = await loadSources();
    const { doc, glb, rawTris, tris, names } = await buildGlb({
        urdf,
        meshFiles,
        readMesh: (file) => readFile(join(SRC, file)),
        // servo STLs dark, printed parts warm white
        materials: [
            ["printed", { color: [0.92, 0.89, 0.83, 1], roughness: 0.8 }],
            ["servo", { color: [0.07, 0.07, 0.07, 1], roughness: 0.55 }],
        ],
        materialFor: (part) => (part.startsWith("servo") ? "servo" : "printed"),
        partName,
        linkName,
        fixedName: (j) => j.replace(/_joint$/, ""),
        rootName: "arm_root",
        sceneName: "arm",
        extras: { source: `https://github.com/${REPO}/tree/${SHA}/Simulation/SO101`, license: "Apache-2.0" },
        ratio: RATIO,
        error: ERROR,
        creaseDeg: CREASE_DEG,
        requiredNodes: [...JOINT_NODES, "gripper_frame"],
        nameRe: /^[a-z_]+$/,
        maxBytes: MAX_BYTES,
    });
    await mkdir(OUT_DIR, { recursive: true });
    await writeFile(OUT, glb);

    // license + notice (Apache-2.0 §4)
    const license = await readFile(join(SRC, "LICENSE"), "utf8").catch(() => null);
    if (license) await writeFile(join(OUT_DIR, "LICENSE-SO-ARM100.txt"), license);
    const notice = `so101.v1.glb — SO-101 robot arm model

Source: https://github.com/${REPO}
  commit ${SHA}
  files  ${URDF_PATH} and the STL meshes it references (Simulation/SO101/assets/)
Copyright TheRobotStudio. Licensed under the Apache License, Version 2.0; see LICENSE-SO-ARM100.txt.

Modified by Ayush Goyal (built by scripts/build-so101-glb.mjs):
  - converted from URDF + STL to a single glTF binary (GLB), Z-up turned to Y-up
  - joint hierarchy kept as named nodes (shoulder_pan … gripper, gripper_frame); inertial/collision data dropped
  - meshes simplified (meshoptimizer, ~${Math.round(RATIO * 100)}% of vertices), deduplicated, normals recomputed
  - materials replaced with two flat colours; geometry quantized and meshopt-compressed (EXT_meshopt_compression)

so101-poster.v1.png is a still render of this model (same modifications), used before the 3D scene loads.
`;
    await writeFile(join(OUT_DIR, "NOTICE.txt"), notice);

    const size = (await stat(OUT)).size;
    const sha = createHash("sha256").update(glb).digest("hex").slice(0, 12);
    console.log(`\nwrote ${OUT}`);
    console.log(`  size       ${(size / 1024).toFixed(1)} KB (sha256 ${sha})`);
    console.log(`  triangles  ${rawTris} -> ${tris}`);
    console.log(`  meshes     ${doc.getRoot().listMeshes().map((m) => m.getName()).join(", ")}`);
    console.log(`  nodes      ${names.join(", ")}`);
    if (tris < 30000 || tris > 60000) console.warn(`  note: triangle count ${tris} outside the 30–60k target`);
}

build().catch((e) => {
    console.error(e);
    process.exit(1);
});
