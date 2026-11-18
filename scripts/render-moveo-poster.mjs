#!/usr/bin/env node
/**
 * Render public/models/moveo-poster.v1.png: a transparent still of moveo.v1.glb in its start pose, from the
 * same camera, lights and materials as src/components/moveo/moveo-canvas.tsx. Shown until the 3D scene draws.
 *
 *   node scripts/render-moveo-poster.mjs                      writes the poster
 *   node scripts/render-moveo-poster.mjs --pose 0,1.8,1.7,1.7,1.4 --out shot.png [--camera x,y,z --target x,y,z]
 *                                                             any pose (radians, URDF order J_1..J_5) to a file
 *
 * Needs Playwright and Microsoft Edge (headless, SwiftShader WebGL). Playwright is not a project dependency:
 * set PLAYWRIGHT_PATH to a playwright package folder, or let it fall back to `import("playwright")`.
 * three.js is served from node_modules, so the render uses exactly the site's three version.
 */
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "models", "moveo-poster.v1.png");

// keep in sync with src/components/moveo/moveo-canvas.tsx and src/lib/moveo/constants.ts (START_POSE)
const SCENE = {
    camera: [1.55, 0.8, 1.05],
    target: [0.05, 0.33, 0.12],
    fov: 30,
    width: 1056,
    height: 726, // 16 / 11
    pose: [1.04, 1.8, 1.73, 1.69, 1.37], // POSES.ready
    pads: [
        [0.15, 3.05, 0.378, 0.75, 1.925], // POSES.pick
        [0.85, 3.05, 0.378, 0.75, 1.925], // POSES.place
    ],
    brand: "hsl(15, 56%, 52%)", // light-theme --brand
};

const argv = process.argv.slice(2);
const arg = (k) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : null);
const vec = (s) => s.split(",").map(Number);
const cfg = { ...SCENE };
if (arg("--pose")) cfg.pose = vec(arg("--pose"));
if (arg("--camera")) cfg.camera = vec(arg("--camera"));
if (arg("--target")) cfg.target = vec(arg("--target"));
const out = arg("--out") ? resolve(arg("--out")) : OUT;

const PAGE = /* html */ `<!doctype html>
<html><head><meta charset="utf-8"><style>html,body{margin:0;background:transparent}</style>
<script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js","three/addons/":"/node_modules/three/examples/jsm/"}}</script>
</head><body><script type="module">
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
const cfg = JSON.parse(decodeURIComponent(location.hash.slice(1)));
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(cfg.width, cfg.height);
renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.ACESFilmicToneMapping; // react-three-fiber's default
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(cfg.fov, cfg.width / cfg.height, 0.02, 10);
camera.position.set(...cfg.camera);
camera.lookAt(...cfg.target);

// lights: as the canvas (ambient + key + a Lightformer environment)
scene.add(new THREE.AmbientLight(0xffffff, 0.35));
const key = new THREE.DirectionalLight(0xffffff, 1.6);
key.position.set(0.8, 1.4, 0.6);
scene.add(key);
const env = new THREE.Scene();
const rect = (intensity, pos, rotX, scale, color = "#ffffff") => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide, toneMapped: false }));
    m.position.set(...pos); m.scale.set(...scale); m.lookAt(0, 0, 0);
    env.add(m);
};
rect(2.2, [0, 2, 0], Math.PI / 2, [3, 3, 1]);
rect(1.1, [1.5, 0.6, 2], 0, [2, 1, 1]);
rect(0.6, [-2, 0.5, -1], 0, [2, 1, 1], "#ffe8d6");
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(env, 0, 0.1, 100).texture;

const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync("/public/models/moveo.v1.glb");
const root = gltf.scene;
const printed = new THREE.MeshStandardMaterial({ color: "#ece6da", roughness: 0.78, metalness: 0 });
const base = new THREE.MeshStandardMaterial({ color: "#252321", roughness: 0.5, metalness: 0 });
const accent = new THREE.MeshStandardMaterial({ color: new THREE.Color(cfg.brand), roughness: 0.62, metalness: 0 });
root.traverse((o) => {
    if (!o.isMesh) return;
    o.material = o.name === "base_link_mesh" ? base : o.name === "link_5_mesh" ? accent : printed;
});
const apply = (pose) => { pose.forEach((a, i) => root.getObjectByName("joint_" + (i + 1)).rotation.set(0, 0, a)); root.updateMatrixWorld(true); };
// lowest point of the end link: the tool tip when the wrist points down (as moveo-model.tsx)
const tip = root.getObjectByName("link_5_mesh");
const lowest = () => {
    const p = tip.geometry.attributes.position, v = new THREE.Vector3();
    let low = null;
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(tip.matrixWorld); if (!low || v.y < low.y) low = v.clone(); }
    return low;
};
const padMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(cfg.brand), roughness: 0.9, metalness: 0, transparent: true, opacity: 0.45 });
const padGeo = new THREE.PlaneGeometry(0.055, 0.055).rotateX(-Math.PI / 2);
for (const pose of cfg.pads) { apply(pose); const at = lowest(); const m = new THREE.Mesh(padGeo, padMat); m.position.set(at.x, 0.001, at.z); root.add(m); }
apply(cfg.pose);
scene.add(root);
const box = new THREE.Box3().setFromObject(root);
const low = lowest();
renderer.render(scene, camera);
window.__info = { box: [box.min.toArray(), box.max.toArray()], tipLow: low.toArray() };
window.__done = true;
</script></body></html>`;

const TYPES = { ".js": "text/javascript", ".mjs": "text/javascript", ".glb": "model/gltf-binary", ".html": "text/html" };
const server = createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (path === "/render.html") return res.writeHead(200, { "content-type": "text/html" }).end(PAGE);
    const file = normalize(join(ROOT, path));
    if (!file.startsWith(ROOT) || !/^\/(node_modules\/three|public\/models)\//.test(path)) return res.writeHead(404).end();
    try {
        const body = await readFile(file);
        res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" }).end(body);
    } catch {
        res.writeHead(404).end();
    }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;

const pwPath = process.env.PLAYWRIGHT_PATH;
const { chromium } = pwPath ? await import(pathToFileURL(join(pwPath, "index.mjs")).href) : await import("playwright");
const browser = await chromium.launch({
    channel: "msedge",
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
try {
    const page = await browser.newPage({ viewport: { width: cfg.width, height: cfg.height }, deviceScaleFactor: 1 });
    page.on("pageerror", (e) => console.error("page error:", e.message));
    await page.goto(`http://127.0.0.1:${port}/render.html#${encodeURIComponent(JSON.stringify(cfg))}`);
    await page.waitForFunction(() => window.__done === true, null, { timeout: 60000 });
    const info = await page.evaluate(() => window.__info);
    const png = await page.locator("canvas").screenshot({ omitBackground: true });
    await writeFile(out, png);
    const f = (a) => a.map((x) => x.toFixed(3)).join(", ");
    console.log(`wrote ${out} (${(png.length / 1024).toFixed(1)} KB)`);
    console.log(`  pose ${cfg.pose.join(", ")}  bbox [${f(info.box[0])}] .. [${f(info.box[1])}]  tip-low [${f(info.tipLow)}]`);
} finally {
    await browser.close();
    server.close();
}
