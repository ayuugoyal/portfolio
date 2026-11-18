#!/usr/bin/env node
/**
 * Build public/models/moveo.v1.glb from the BCN3D Moveo URDF + STLs in Ayush's ROS 2 workspace
 * (github.com/ayuugoyal/bcn3d_ws, src/moveo_description). The arm itself is BCN3D Technologies' open-source
 * Moveo design (github.com/BCN3D/BCN3D-Moveo, MIT).
 *
 *   pnpm build:moveo                 fetch with the GitHub CLI (the repo may be private; needs `gh auth login`),
 *                                    cached in scripts/.cache/moveo, then build
 *   pnpm build:moveo --src <dir>     use a local copy of src/moveo_description (urdf/moveo.urdf, meshes/*.STL)
 *
 * Names: GLTFLoader keeps names mostly as-is, but the site wants [a-z_0-9] only, so the URDF names are
 * lower-cased and the joints spelled out:
 *   J_1 … J_5     -> joint_1 … joint_5   (movable; each node rotates about its local +Z, angle = URDF radians)
 *   Link_1 …      -> link_1 … link_5     (base_link unchanged)
 *   <link>.STL    -> <link>_mesh         (mesh + visual node)
 * The Moveo's joint axes are arbitrary unit vectors (SolidWorks export), so each joint gets a
 * `<joint>_unalign` node under it; see scripts/lib/urdf-to-glb.mjs.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildGlb, parseUrdf } from "./lib/urdf-to-glb.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REPO = "ayuugoyal/bcn3d_ws";
const SHA = "cee7021482ca4ad6e55d06cf32816ddbd05cffc0";
const PKG = "src/moveo_description";
const UPSTREAM = "BCN3D/BCN3D-Moveo";
const UPSTREAM_SHA = "0866a92501277636f76000a195d8a16d44b5b476";
const OUT_DIR = join(ROOT, "public", "models");
const OUT = join(OUT_DIR, "moveo.v1.glb");
const MAX_BYTES = 2 * 1024 * 1024;
const JOINT_NODES = ["joint_1", "joint_2", "joint_3", "joint_4", "joint_5"];
const RATIO = 0.5;
const ERROR = 0.0005;
const CREASE_DEG = 40;

// ------------------------------------------------------------------ args + fetch
const argv = process.argv.slice(2);
const srcArg = argv.includes("--src") ? argv[argv.indexOf("--src") + 1] : null;
const SRC = srcArg ? resolve(srcArg) : join(ROOT, "scripts", ".cache", "moveo");

/** `gh api` raw download (works for private repos the CLI is logged in to). */
async function ghDownload(repo, sha, path, file) {
    if (existsSync(file)) return;
    const buf = execFileSync("gh", ["api", "-H", "Accept: application/vnd.github.raw", `repos/${repo}/contents/${path}?ref=${sha}`], {
        maxBuffer: 64 * 1024 * 1024,
    });
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, buf);
    console.log(`  fetched ${repo}/${path}`);
}

/** package://moveo_description/meshes/Link_1.STL -> meshes/Link_1.STL */
const meshPath = (f) => f.replace(/^package:\/\/moveo_description\//, "");

async function loadSources() {
    const urdfFile = join(SRC, "urdf", "moveo.urdf");
    if (!srcArg) {
        console.log(`source: ${REPO}@${SHA} (cache ${SRC})`);
        await ghDownload(REPO, SHA, `${PKG}/urdf/moveo.urdf`, urdfFile);
        await ghDownload(UPSTREAM, UPSTREAM_SHA, "LICENSE", join(SRC, "LICENSE-BCN3D-Moveo.txt"));
    } else {
        console.log(`source: ${SRC} (--src)`);
    }
    const { urdf, meshes } = parseUrdf(await readFile(urdfFile, "utf8"));
    if (!srcArg) for (const m of meshes) await ghDownload(REPO, SHA, `${PKG}/${meshPath(m)}`, join(SRC, meshPath(m)));
    return { urdf, meshes };
}

// ------------------------------------------------------------------ names
const clean = (s) => s.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
const linkName = (l) => clean(l);
const partName = (file) => `${clean(file.split("/").pop().replace(/\.stl$/i, ""))}_mesh`;
const jointName = (j) => clean(j).replace(/^j_(\d+)$/, "joint_$1");

// ------------------------------------------------------------------ build
async function build() {
    const { urdf, meshes: meshFiles } = await loadSources();
    const { doc, glb, rawTris, tris, names, joints } = await buildGlb({
        urdf,
        meshFiles,
        readMesh: (file) => readFile(join(SRC, meshPath(file))),
        materials: [
            ["printed", { color: [0.92, 0.89, 0.83, 1], roughness: 0.8 }],
            ["base", { color: [0.16, 0.15, 0.14, 1], roughness: 0.6 }],
        ],
        materialFor: (part) => (part === "base_link_mesh" ? "base" : "printed"),
        partName,
        linkName,
        jointName,
        fixedName: (j) => clean(j),
        anyAxis: true,
        rootName: "moveo_root",
        sceneName: "moveo",
        extras: {
            source: `https://github.com/${REPO}/tree/${SHA}/${PKG}`,
            design: `https://github.com/${UPSTREAM}`,
            license: "MIT (BCN3D Moveo design)",
        },
        ratio: RATIO,
        error: ERROR,
        creaseDeg: CREASE_DEG,
        requiredNodes: [...JOINT_NODES, "link_5"],
        nameRe: /^[a-z_0-9]+$/,
        maxBytes: MAX_BYTES,
        onUnits: ({ file, max, mm }) => console.log(`  ${file.split("/").pop()}: max |coord| ${max.toFixed(4)} -> ${mm ? "mm (scaled 0.001)" : "metres"}`),
    });
    await mkdir(OUT_DIR, { recursive: true });
    await writeFile(OUT, glb);

    const mit = await readFile(join(SRC, "LICENSE-BCN3D-Moveo.txt"), "utf8").catch(() => null);
    if (!mit) throw new Error("upstream LICENSE missing; run without --src once, or put LICENSE-BCN3D-Moveo.txt in the source dir");
    const deg = (r) => ((r * 180) / Math.PI).toFixed(1);
    const notice = `moveo.v1.glb — BCN3D Moveo robot arm model

Design: BCN3D Moveo, an open-source 3D-printed robot arm by BCN3D Technologies
  https://github.com/${UPSTREAM} (commit ${UPSTREAM_SHA})
  Released under the MIT License; the licence text is reproduced below.

Source of the files converted here: https://github.com/${REPO}
  commit ${SHA}
  files  ${PKG}/urdf/moveo.urdf and the STL meshes it references (${PKG}/meshes/)
  A SolidWorks-to-URDF export of the Moveo, with joint axes and limits set for Ayush Goyal's build.

Modified by Ayush Goyal (built by scripts/build-moveo-glb.mjs):
  - converted from URDF + STL to a single glTF binary (GLB), Z-up turned to Y-up
  - joint hierarchy kept as named nodes; names lower-cased for the web:
${joints.map((j) => `      ${j.urdf.padEnd(5)} -> ${j.node}   ${j.type}, ${deg(j.lower)}°…${deg(j.upper)}°`).join("\n")}
      Link_N -> link_N, <link>.STL -> <link>_mesh
  - each joint's axis folded into fixed <joint>_origin / <joint>_unalign nodes so the joint node turns about +Z
  - inertial/collision data dropped
  - meshes simplified (meshoptimizer, ~${Math.round(RATIO * 100)}% of vertices), deduplicated, normals recomputed
  - materials replaced with flat colours; geometry quantized and meshopt-compressed (EXT_meshopt_compression)

moveo-poster.v1.png is a still render of this model (same modifications), used before the 3D scene loads
(rendered by scripts/render-moveo-poster.mjs).

------------------------------------------------------------------------------
${mit.trim()}
`;
    await writeFile(join(OUT_DIR, "NOTICE-moveo.txt"), notice);

    const size = (await stat(OUT)).size;
    const sha = createHash("sha256").update(glb).digest("hex").slice(0, 12);
    console.log(`\nwrote ${OUT}`);
    console.log(`  size       ${(size / 1024).toFixed(1)} KB (sha256 ${sha})`);
    console.log(`  triangles  ${rawTris} -> ${tris}`);
    console.log(`  meshes     ${doc.getRoot().listMeshes().map((m) => m.getName()).join(", ")}`);
    console.log(`  nodes      ${names.join(", ")}`);
    console.log(`  joints`);
    for (const j of joints)
        console.log(`    ${j.urdf} -> ${j.node}  [${deg(j.lower)}°, ${deg(j.upper)}°]  axis ${j.axis.map((a) => a.toFixed(4)).join(" ")}  v ${j.velocity} rad/s`);
}

build().catch((e) => {
    console.error(e);
    process.exit(1);
});
