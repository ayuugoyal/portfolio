// Draws the hero's background portrait: an original pixel-art anime-style guy (messy hair, side locks,
// big eyes, dark jacket over a white tee), rasterised from simple shapes onto a small grid, outlined,
// and written as a crisp SVG. Run: node scripts/build-hero-pixel.mjs
import { writeFileSync } from "node:fs";

const W = 36;
const H = 40;
const PAL = {
    o: "#2a201b", // outline
    h: "#5b4434", // hair
    H: "#8b6a52", // hair highlight
    d: "#3f2f25", // hair shadow
    s: "#f3d9c6", // skin
    S: "#dcb49c", // skin shadow
    e: "#4a3328", // iris
    E: "#7a5544", // iris light
    w: "#ffffff", // eye highlight
    m: "#c4796a", // mouth
    j: "#2b2c31", // jacket
    J: "#43454d", // jacket light
    t: "#ece8e0", // tee
};

const g = Array.from({ length: H }, () => Array(W).fill("."));
const set = (x, y, c) => {
    if (x >= 0 && x < W && y >= 0 && y < H) g[y][x] = c;
};
const get = (x, y) => (x >= 0 && x < W && y >= 0 && y < H ? g[y][x] : ".");
const inEllipse = (x, y, cx, cy, rx, ry) => ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1;

// shoulders + jacket
for (let y = 31; y < H; y++) {
    const half = 7 + (y - 31) * 1.6;
    for (let x = 0; x < W; x++) if (Math.abs(x + 0.5 - 18) <= Math.min(half, 17)) set(x, y, "j");
}
// jacket lapel light + tee V
for (let y = 31; y < H; y++) {
    const v = Math.max(0, 3 - (y - 31) * 0.5);
    for (let x = 0; x < W; x++) {
        const dx = Math.abs(x + 0.5 - 18);
        if (dx <= v + 0.5) set(x, y, "t");
        else if (dx <= v + 1.6 && y < 37) set(x, y, "J");
    }
}
// neck
for (let y = 26; y < 33; y++) for (let x = 15; x < 21; x++) set(x, y, y < 28 ? "S" : "s");
for (let y = 31; y < 33; y++) for (let x = 15; x < 21; x++) if (Math.abs(x + 0.5 - 18) <= 2) set(x, y, "s");

// face: an oval that narrows to a soft chin
for (let y = 10; y < 29; y++)
    for (let x = 0; x < W; x++) {
        const t = y > 21 ? (y - 21) / 7 : 0;
        const rx = 7.6 * (1 - 0.55 * t * t);
        if (Math.abs(x + 0.5 - 18) <= rx && inEllipse(x, y, 18, 19, 9, 10)) set(x, y, "s");
    }
// shade under the jaw / right side
for (let y = 22; y < 29; y++) for (let x = 22; x < 26; x++) if (get(x, y) === "s") set(x, y, "S");

// hair mass on top
for (let y = 0; y < 22; y++)
    for (let x = 0; x < W; x++) if (inEllipse(x, y, 18, 13, 11.2, 10.4) && y < 15) set(x, y, "h");
// side locks
for (let y = 12; y < 26; y++) {
    const w = y < 20 ? 2.6 : 2.6 - (y - 20) * 0.45;
    for (let x = 0; x < W; x++) {
        if (Math.abs(x + 0.5 - 9.2) <= w) set(x, y, "h");
        if (Math.abs(x + 0.5 - 26.8) <= w) set(x, y, "h");
    }
}
// bangs: spikes hanging over the forehead (tip x, tip y, half width at the base)
const spikes = [
    [11, 18, 2.4],
    [14, 17, 2.2],
    [17, 19, 2.4],
    [20.5, 16, 2.0],
    [23.5, 18, 2.4],
    [26, 19, 1.8],
];
for (const [tx, ty, hw] of spikes)
    for (let y = 13; y <= ty; y++) {
        const k = (ty - y) / (ty - 13);
        const half = hw * k;
        for (let x = 0; x < W; x++) if (Math.abs(x + 0.5 - (tx + (y - 13) * 0.25)) <= half + 0.2) set(x, y, "h");
    }
// a few spikes sticking up
for (const [tx, ty, hw] of [
    [12, 1, 1.6],
    [21, 0, 1.8],
    [27, 3, 1.4],
])
    for (let y = ty; y < 6; y++) {
        const half = hw * ((y - ty) / (6 - ty));
        for (let x = 0; x < W; x++) if (Math.abs(x + 0.5 - tx) <= half + 0.3) set(x, y, "h");
    }
// hair light and shadow
for (let y = 0; y < 26; y++)
    for (let x = 0; x < W; x++) {
        if (get(x, y) !== "h") continue;
        if (x >= 26 || (y > 15 && x > 24)) set(x, y, "d");
    }
// a glossy arc across the crown, the way anime hair catches light
for (const [x, y] of [
    [12, 7], [13, 6], [14, 5], [15, 5], [16, 4], [17, 4], [18, 4], [19, 4], [20, 5], [21, 5], [22, 6],
    [14, 6], [17, 5], [18, 5], [19, 5], [11, 9], [12, 8], [23, 7],
])
    set(x, y, "H");

// eyes: dark upper lash line, iris with a light lower half, one bright highlight
const eye = (x0) => {
    for (let x = x0 - 1; x < x0 + 4; x++) set(x, 18, "o");
    for (let y = 19; y < 22; y++) for (let x = x0; x < x0 + 3; x++) set(x, y, y === 21 ? "E" : "e");
    set(x0, 19, "w");
    set(x0 + 2, 21, "s");
};
eye(12);
eye(21);
// nose and mouth
set(18, 22, "S");
set(18, 23, "S");
set(17, 25, "m");
set(18, 25, "m");

// outline every empty pixel that touches the drawing
const filled = (x, y) => get(x, y) !== "." && get(x, y) !== "O";
for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
        if (get(x, y) === "." && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => filled(x + dx, y + dy))) set(x, y, "O");
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y][x] === "O") g[y][x] = "o";

// runs of one colour per row -> rects
let rects = "";
for (let y = 0; y < H; y++) {
    let x = 0;
    while (x < W) {
        const c = g[y][x];
        let n = 1;
        while (x + n < W && g[y][x + n] === c) n++;
        if (c !== ".") rects += `<rect x="${x}" y="${y}" width="${n}" height="1" fill="${PAL[c]}"/>`;
        x += n;
    }
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">${rects}</svg>\n`;
writeFileSync(new URL("../public/hero-pixel.svg", import.meta.url), svg);
console.log(g.map((r) => r.join("")).join("\n"));
