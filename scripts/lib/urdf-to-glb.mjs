/**
 * URDF + STL -> meshopt-compressed GLB, shared by the per-robot build scripts (build-so101-glb.mjs,
 * build-moveo-glb.mjs).
 *
 * Node tree (URDF frames, root turned -90° about X so Z-up becomes three's Y-up):
 *   <root> > <base link> > <joint>_origin > <joint> > <child link> > …
 * Every `<joint>` node rotates about its own local +Z. A URDF axis other than 0 0 1 is folded into the
 * fixed nodes around it (only when `anyAxis` is set):
 *   <joint>_origin (origin · align) > <joint> (about +Z) > <joint>_unalign (align⁻¹) > <child link>
 * where `align` turns +Z onto the URDF axis, so a positive angle on `<joint>` is a positive URDF angle.
 * Fixed joints become one plain node holding the child link's contents. One mesh per STL file; visuals
 * keep their URDF origins.
 *
 * Pipeline: weld -> simplify (meshopt) -> dedup -> prune(keepLeaves) -> crease-angle normals -> meshopt encode.
 */
import { Document, NodeIO } from "@gltf-transform/core";
import { EXTMeshoptCompression, KHRMeshQuantization } from "@gltf-transform/extensions";
import { dedup, meshopt, prune, simplify, weld } from "@gltf-transform/functions";
import { XMLParser } from "fast-xml-parser";
import { MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";
import { Euler, Quaternion, Vector3 } from "three";

// ------------------------------------------------------------------ URDF
const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    isArray: (_n, jpath) => ["robot.link", "robot.joint", "robot.link.visual"].includes(jpath),
});

/** Parsed `<robot>` plus the distinct mesh filenames its visuals reference, in document order. */
export function parseUrdf(xml) {
    const urdf = parser.parse(xml.replace(/^﻿/, "")).robot;
    const meshes = new Set();
    for (const link of urdf.link ?? []) for (const v of link.visual ?? []) meshes.add(v.geometry.mesh.filename);
    return { urdf, meshes: [...meshes] };
}

export const nums = (s, d = [0, 0, 0]) => (s ? String(s).trim().split(/\s+/).map(Number) : d);

/** URDF `<origin>` -> glTF translation + quaternion (rpy is fixed-axis XYZ, i.e. Euler "ZYX" in three). */
export function origin(o) {
    const xyz = nums(o?.xyz);
    const [r, p, y] = nums(o?.rpy);
    const q = new Quaternion().setFromEuler(new Euler(r, p, y, "ZYX"));
    return { t: xyz, q: [q.x, q.y, q.z, q.w] };
}

// ------------------------------------------------------------------ STL
/** Indexed geometry from a binary (or ASCII) STL; vertices shared by bitwise-equal positions. */
export function readStl(buf) {
    const tris = [];
    const isBinary = buf.length >= 84 && 84 + buf.readUInt32LE(80) * 50 === buf.length;
    if (isBinary) {
        const n = buf.readUInt32LE(80);
        for (let i = 0; i < n; i++) {
            const o = 84 + i * 50 + 12;
            for (let k = 0; k < 9; k++) tris.push(buf.readFloatLE(o + k * 4));
        }
    } else {
        const re = /vertex\s+(\S+)\s+(\S+)\s+(\S+)/g;
        for (const m of buf.toString("utf8").matchAll(re)) tris.push(+m[1], +m[2], +m[3]);
    }
    const f32 = new Float32Array(tris);
    const u32 = new Uint32Array(f32.buffer);
    const map = new Map();
    const positions = [];
    const indices = new Uint32Array(f32.length / 3);
    for (let v = 0; v < indices.length; v++) {
        const key = `${u32[v * 3]},${u32[v * 3 + 1]},${u32[v * 3 + 2]}`;
        let id = map.get(key);
        if (id === undefined) {
            id = positions.length / 3;
            map.set(key, id);
            positions.push(f32[v * 3], f32[v * 3 + 1], f32[v * 3 + 2]);
        }
        indices[v] = id;
    }
    return { positions: new Float32Array(positions), indices };
}

// ------------------------------------------------------------------ crease-angle normals
function creaseNormals(doc, prim, creaseDeg) {
    const pos = prim.getAttribute("POSITION").getArray();
    const idx = prim.getIndices().getArray();
    const nTri = idx.length / 3;
    const fn = new Float32Array(nTri * 3); // area-weighted
    const fu = new Float32Array(nTri * 3); // unit
    for (let t = 0; t < nTri; t++) {
        const a = idx[t * 3] * 3, b = idx[t * 3 + 1] * 3, c = idx[t * 3 + 2] * 3;
        const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2];
        const vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
        const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
        const len = Math.hypot(nx, ny, nz) || 1;
        fn.set([nx, ny, nz], t * 3);
        fu.set([nx / len, ny / len, nz / len], t * 3);
    }
    const nVert = pos.length / 3;
    const count = new Uint32Array(nVert + 1);
    for (const v of idx) count[v + 1]++;
    for (let i = 0; i < nVert; i++) count[i + 1] += count[i];
    const fill = count.slice();
    const adj = new Uint32Array(idx.length);
    for (let i = 0; i < idx.length; i++) adj[fill[idx[i]]++] = Math.floor(i / 3);
    const cos = Math.cos((creaseDeg * Math.PI) / 180);
    const outPos = [], outNrm = [], outIdx = new Uint32Array(idx.length), keys = new Map();
    for (let i = 0; i < idx.length; i++) {
        const v = idx[i], t = Math.floor(i / 3);
        let nx = 0, ny = 0, nz = 0;
        for (let k = count[v]; k < count[v + 1]; k++) {
            const f = adj[k];
            if (fu[f * 3] * fu[t * 3] + fu[f * 3 + 1] * fu[t * 3 + 1] + fu[f * 3 + 2] * fu[t * 3 + 2] >= cos) {
                nx += fn[f * 3]; ny += fn[f * 3 + 1]; nz += fn[f * 3 + 2];
            }
        }
        const len = Math.hypot(nx, ny, nz) || 1;
        nx /= len; ny /= len; nz /= len;
        const key = `${v},${Math.round(nx * 512)},${Math.round(ny * 512)},${Math.round(nz * 512)}`;
        let id = keys.get(key);
        if (id === undefined) {
            id = outPos.length / 3;
            keys.set(key, id);
            outPos.push(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]);
            outNrm.push(nx, ny, nz);
        }
        outIdx[i] = id;
    }
    const buffer = doc.getRoot().listBuffers()[0];
    prim.getAttribute("POSITION").setArray(new Float32Array(outPos));
    prim.setAttribute("NORMAL", doc.createAccessor().setType("VEC3").setArray(new Float32Array(outNrm)).setBuffer(buffer));
    prim.getIndices().setArray(outIdx);
}

// ------------------------------------------------------------------ build
/**
 * Build a GLB from a parsed URDF.
 *
 * @param {object} o
 * @param {object} o.urdf                parsed `<robot>` (from parseUrdf)
 * @param {string[]} o.meshFiles         mesh filenames, as the URDF writes them
 * @param {(file: string) => Promise<Buffer>} o.readMesh
 * @param {Array<[string, {color: number[], roughness: number, metallic?: number}]>} o.materials
 *        created in this order; the first is the default
 * @param {(part: string) => string} [o.materialFor]  material name for a part (mesh) name
 * @param {(file: string) => string} o.partName       mesh + visual node name for a mesh file
 * @param {(link: string) => string} o.linkName       node name for a URDF link
 * @param {(joint: string) => string} [o.jointName]   node name for a movable URDF joint (default: as-is)
 * @param {(joint: string) => string} o.fixedName     node name for a fixed URDF joint
 * @param {boolean} [o.anyAxis]          allow joint axes other than 0 0 1 (adds `<joint>_unalign` nodes)
 * @param {string} o.rootName            name of the Z-up -> Y-up root node
 * @param {string} o.sceneName
 * @param {object} [o.extras]            asset extras (source, license)
 * @param {number} o.ratio               simplify target ratio
 * @param {number} o.error               simplify error
 * @param {number} [o.creaseDeg]
 * @param {string[]} o.requiredNodes     build fails when one is missing
 * @param {RegExp} o.nameRe              every node name must match
 * @param {number} o.maxBytes
 * @param {(units: {file: string, max: number, mm: boolean}) => void} [o.onUnits]
 */
export async function buildGlb(o) {
    const { urdf, meshFiles } = o;
    const jointName = o.jointName ?? ((n) => n);
    const doc = new Document();
    const buffer = doc.createBuffer();
    const mat = {};
    for (const [name, m] of o.materials)
        mat[name] = doc.createMaterial(name).setBaseColorFactor(m.color).setRoughnessFactor(m.roughness).setMetallicFactor(m.metallic ?? 0);
    const defaultMat = mat[o.materials[0][0]];

    // one Mesh per STL; detect mm vs m from the bounds
    const meshByFile = new Map();
    let rawTris = 0;
    for (const file of meshFiles) {
        const { positions, indices } = readStl(await o.readMesh(file));
        rawTris += indices.length / 3;
        let max = 0;
        for (const p of positions) max = Math.max(max, Math.abs(p));
        const mm = max > 2;
        if (mm) for (let i = 0; i < positions.length; i++) positions[i] *= 0.001; // mm -> m
        o.onUnits?.({ file, max, mm });
        const name = o.partName(file);
        const prim = doc
            .createPrimitive()
            .setAttribute("POSITION", doc.createAccessor().setType("VEC3").setArray(positions).setBuffer(buffer))
            .setIndices(doc.createAccessor().setType("SCALAR").setArray(indices).setBuffer(buffer))
            .setMaterial(mat[o.materialFor?.(name)] ?? defaultMat);
        meshByFile.set(file, doc.createMesh(name).addPrimitive(prim));
    }

    // links -> nodes with their visuals
    const used = new Map();
    const unique = (n) => {
        const k = used.get(n) ?? 0;
        used.set(n, k + 1);
        return k === 0 ? n : `${n}_${"abcdefghijklmnopqrstuvwxyz"[k]}`;
    };
    const linkNodes = new Map();
    for (const link of urdf.link) {
        const node = doc.createNode(o.linkName(link.name));
        for (const v of link.visual ?? []) {
            const file = v.geometry.mesh.filename;
            const { t, q } = origin(v.origin);
            const vis = doc.createNode(unique(o.partName(file))).setTranslation(t).setRotation(q).setMesh(meshByFile.get(file));
            node.addChild(vis);
        }
        linkNodes.set(link.name, node);
    }

    // joints
    const children = new Set();
    const joints = [];
    for (const j of urdf.joint) {
        const parent = linkNodes.get(j.parent.link);
        const child = linkNodes.get(j.child.link);
        const { t, q } = origin(j.origin);
        children.add(j.child.link);
        if (j.type === "fixed") {
            const fixed = doc.createNode(o.fixedName(j.name)).setTranslation(t).setRotation(q);
            for (const c of child.listChildren()) fixed.addChild(c);
            child.dispose();
            parent.addChild(fixed);
            continue;
        }
        const name = jointName(j.name);
        const isZ = (a) => a[0] === 0 && a[1] === 0 && a[2] === 1;
        let axis = nums(j.axis?.xyz, o.anyAxis ? [1, 0, 0] : [0, 0, 0]); // URDF default axis is 1 0 0
        if (!isZ(axis) && !o.anyAxis) throw new Error(`joint ${j.name}: axis ${axis} is not 0 0 1`);
        const jo = doc.createNode(`${name}_origin`).setTranslation(t);
        const jn = doc.createNode(name);
        jo.addChild(jn);
        if (isZ(axis)) {
            jo.setRotation(q);
            jn.addChild(child);
        } else {
            const v = new Vector3(...axis);
            if (v.length() < 1e-6) throw new Error(`joint ${j.name}: zero axis`);
            v.normalize();
            axis = [v.x, v.y, v.z];
            const align = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), v);
            const qo = new Quaternion(...q).multiply(align);
            jo.setRotation([qo.x, qo.y, qo.z, qo.w]);
            const inv = align.clone().invert();
            const un = doc.createNode(`${name}_unalign`).setRotation([inv.x, inv.y, inv.z, inv.w]);
            jn.addChild(un);
            un.addChild(child);
        }
        parent.addChild(jo);
        const lim = j.limit ?? {};
        joints.push({ urdf: j.name, node: name, type: j.type, axis, lower: Number(lim.lower ?? 0), upper: Number(lim.upper ?? 0), velocity: Number(lim.velocity ?? 0) });
    }
    const rootLinks = urdf.link.filter((l) => !children.has(l.name));
    if (rootLinks.length !== 1) throw new Error(`expected one root link, got ${rootLinks.map((l) => l.name)}`);
    const s = Math.SQRT1_2;
    const root = doc.createNode(o.rootName).setRotation([-s, 0, 0, s]).addChild(linkNodes.get(rootLinks[0].name));
    doc.createScene(o.sceneName).addChild(root);
    if (o.extras) doc.getRoot().getAsset().extras = o.extras;

    // optimise
    await MeshoptSimplifier.ready;
    await MeshoptEncoder.ready;
    await doc.transform(
        weld(),
        simplify({ simplifier: MeshoptSimplifier, ratio: o.ratio, error: o.error }),
        dedup(),
        prune({ keepLeaves: true }),
    );
    let tris = 0;
    for (const mesh of doc.getRoot().listMeshes())
        for (const prim of mesh.listPrimitives()) {
            creaseNormals(doc, prim, o.creaseDeg ?? 40);
            tris += prim.getIndices().getCount() / 3;
        }
    doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
    await doc.transform(meshopt({ encoder: MeshoptEncoder, level: "high" }));

    // checks
    const names = new Set(doc.getRoot().listNodes().map((n) => n.getName()));
    const missing = o.requiredNodes.filter((n) => !names.has(n));
    if (missing.length) throw new Error(`missing nodes: ${missing.join(", ")}`);
    const bad = [...names].filter((n) => !o.nameRe.test(n));
    if (bad.length) throw new Error(`node names outside ${o.nameRe}: ${bad.join(", ")}`);

    const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({ "meshopt.encoder": MeshoptEncoder });
    const glb = await io.writeBinary(doc);
    if (glb.byteLength > o.maxBytes) throw new Error(`GLB is ${glb.byteLength} bytes (> ${o.maxBytes})`);
    return { doc, glb, rawTris, tris, names: [...names], joints };
}
