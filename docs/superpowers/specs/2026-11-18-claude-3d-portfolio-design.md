# Claude-style 3D portfolio — design

Date: 2026-11-18 · Repo: `portfolio` (Next.js 14.2.6 App Router, React 18, Tailwind, framer-motion) · Live: ayuugoyal.tech

## Intent

Ayush is applying for robotics, physical-AI and Forward Deployed Engineer roles (India, remote, abroad).
Today the site is a minimal, text-first page with a lime accent; the robots appear only as videos. The
goal is a site that *shows* the skill instead of describing it: a visitor can play with a 3D SO-101 arm
by typing to it, the way Claude Code drives the real arm over MCP, and watch the rover avoid an obstacle.
It must stay minimal, fast, and fully readable by search engines and LLMs.

## Decisions made with Ayush

| Topic | Decision |
|---|---|
| "Claude way" | **Both**: a Claude-inspired look *and* a Claude-style prompt box that drives the 3D arm |
| Prompt brain | **Scripted, no API**. Text is matched to preset intents in the browser. Nothing is sent anywhere |
| Scope | **Whole site** gets the new look (home, /forward-deployed-engineer, /services, /robotics, /resume, /patents/*). 3D arm on home, 3D arm + rover on /robotics |
| 3D stack | **React Three Fiber + drei**; framer-motion for UI motion; **no anime.js**, no Spline |
| Style | **Warm Claude look + pixel accents**. Calm warm-paper look and smooth 3D; pixel art only for small touches. Cyberpunk is at most a hint, not the theme |
| Mascot | A small **original** pixel-art character, always on screen on every page, bobbing up and down |
| Mascot chat | **Clicking the mascot opens a chat**. **Scripted from the site's own content**, no API. On pages with the arm it can also pass commands to the arm |

## Goals

1. Warm, Claude-inspired visual system across every page: warm off-white paper (warm near-black in dark
   mode), serif headings, a muted clay-orange accent replacing lime, calm motion.
2. Home hero: interactive 3D SO-101 arm with a Claude-style prompt box under it. Typing a command
   shows a short reply plus the MCP tool calls the real server would make (e.g. `⏺ gesture(name="wave", repeats=3)`),
   and the 3D arm performs it.
3. /robotics: the same arm scene beside the real demo video, and a 3D rover scene showing the
   LiDAR obstacle-avoidance behaviour (AUTO → GUIDED → swerve → mission resumes).
4. A bobbing pixel mascot on every page that reacts when the arm runs a command, and opens a small
   chat about Ayush when clicked.
5. No regression in SEO/LLM layer, page speed for text, or mobile usability.

## Non-goals

- Any LLM/API call, API key, or server route for the prompt box or the mascot chat.
- Physics simulation, IK solver, real robot connection.
- Rewriting copy or changing page content/structure beyond what the new look needs.
- A cyberpunk/neon theme, two separate themes, glitch effects.
- anime.js, Spline, pre-rendered video as the 3D.

## Anti-goals (fails even if it "works")

- The page feels heavy or slow; text waits for 3D.
- Content moves into the canvas or client-only components so crawlers/LLMs lose it.
- It reads as an official Anthropic/Claude page: no Claude or Anthropic logo, wordmark, or copied
  Claude Code mascot art; the mascot is our own character. Copy may say "Claude Code drives the real arm" (true).
- Visitors think a live AI is answering. The demo must say it is a scripted simulation of the real setup.
- Clutter that breaks the minimal feel (multiple floating widgets, busy backgrounds, gimmicks everywhere).
- Mobile jank, layout shift, or the mascot covering content/buttons.

## Constraints

- Next.js 14.2.6 + React 18 → `@react-three/fiber` v8 and `@react-three/drei` v9 (v9/v10 need React 19).
- Vercel, Node 24.x (already pinned). Dev machine is Windows.
- The SEO/LLM layer must keep working unchanged: JSON-LD (`structured-data.tsx`, `lib/schema.ts`),
  `llms.txt`, `llms-full.txt`, markdown twins (`index.md`, `robotics.md`, `forward-deployed-engineer.md`),
  metadata, sitemap, robots. Page text stays server-rendered HTML.
- Content rules: never portray Ayush as a beginner; no degree mentions in site content; no fabricated
  claims (rover = co-maintainer).
- Assets: SO-101 model from TheRobotStudio/SO-ARM100 (Apache-2.0; URDF + STL under `Simulation/SO101`).
  Keep its license/attribution in the repo (e.g. `public/models/NOTICE.txt`) and a credit line in the footer or /robotics.
- Budgets: 3D JS chunk ≈ ≤ 300 KB gzip, loaded only on pages with 3D, never blocking first paint;
  arm model ≤ 2 MB compressed; no CLS from the canvas (reserved aspect box).

## Approaches considered

- **A. React Three Fiber + drei (chosen).** Declarative three.js inside React/Next; real SO-101 model with
  movable joints; scene lazy-loaded after text. Fits the existing component style; easiest to change later.
- **B. Plain three.js + anime.js.** Slightly lighter, but much more hand wiring into Next pages and harder to evolve.
- **C. Spline embed.** Fastest visuals, but heavy runtime, no real joints, shows design taste over engineering.
- Pre-rendered video/Lottie dropped: not interactive.

## The design

### 1. Visual system (whole site)

- Tokens in `globals.css` (`:root` and `.dark`), Tailwind color names kept so components don't churn.
  - Light: warm paper background (≈ `#F5F1E8`), warm near-black text (≈ `#1F1E1B`), hairline warm borders.
  - Dark: warm near-black (≈ `#1C1B19`), warm off-white text (≈ `#ECE9E1`).
  - Accent: muted clay/terracotta (≈ `#C96442` light, ≈ `#D97757` dark). Replace `--brand` lime; keep the rule that
    the accent is a fill/marker, and check text contrast where it is used as text.
  - Exact hex values are the builder's call within this direction; must pass WCAG AA for body text.
- Type: serif for headings (proposal: Newsreader via `next/font/google`), a clean humanist sans for body
  (proposal: Inter, replacing Space Grotesk), JetBrains Mono kept for labels and tool-call lines.
  A pixel font (proposal: Silkscreen) only for tiny pixel accents, never body text. Syne is dropped.
- Motion: slow, eased (framer-motion), respects `prefers-reduced-motion`. Keep BlurFade-style reveals but subtler.
- Background: drop `DotPattern`; optional very faint paper grain. Drop or restyle `SmoothCursor`
  (proposal: remove; pixel accents carry the personality).
- Pixel accents (small, few): mascot; pixel-style section markers or dividers; pixel icons where today's
  small icons sit if it reads well. Builder decides which, keeping it to a handful.
- Restyle every page: home, /forward-deployed-engineer, /services, /robotics, /resume, /patents/[id], Navbar,
  footer, cards. Hero layout of the name keeps its idea (big name, role line, CTAs) in the new type.
- OG images (`lib/og.tsx`, per-page `opengraph-image.tsx`) switch to the new palette/type. Update
  `viewport.themeColor` to the new backgrounds.

### 2. Arm scene + prompt box (home hero, /robotics)

Layout (desktop: scene beside or under the name block; mobile: under it, full width):

```
┌─────────────────────────────────────────┐
│            [ 3D SO-101 arm ]            │  drag to orbit, slow idle
│                                         │
│  you › wave                             │
│  arm › Waving hello!                    │
│  ⏺ gesture(name="wave", repeats=3)      │  appear one by one as they run
│ ┌─────────────────────────────────────┐ │
│ │ ask the arm to do something…      ↵ │ │
│ └─────────────────────────────────────┘ │
│  wave · nod · garba · look around · …   │  chips = buttons
│  simulated in your browser — the real   │
│  arm runs these same tools over MCP     │
└─────────────────────────────────────────┘
```

- **Model pipeline (offline, one-time script in `scripts/`):** load the SO-101 URDF + STLs, build the joint
  hierarchy, export one GLB with named nodes per joint (`shoulder_pan`, `shoulder_lift`, `elbow_flex`,
  `wrist_flex`, `wrist_roll`, `gripper`), compress (gltf-transform, meshopt or draco), write
  `public/models/so101.glb`. Matte warm-white plastic + clay accent material; soft studio light, contact shadow.
- **Joint convention:** degrees with 0 = middle of calibrated range, like the real arm. A small mapping table
  (per joint: axis, sign, offset, limits) turns degrees into node rotations. Builder tunes offsets so the
  `rest` pose looks folded like the real one and `ready` looks upright.
- **Command engine (pure TS, no React, unit-testable):** a port of the real project's local matcher
  (`so101-mcp/commands.py` `parse_local`) and gestures (`so101-mcp/so101_core.py` `Arm.gesture`).
  - Intents: wave, nod, shake, look_around, garba, rest, ready, face_me, open, close, left/right/up/down
    nudges (optional degrees), stop. Numbers set repeats or degrees, as in the original.
  - Gesture keyframes copied from `so101_core.py` (e.g. wave = raise, wrist_flex ±30 × repeats, return);
    poses from `so101-mcp/poses.json` (`rest`, `ready`, `hand_up`, `face_me`).
  - Output: `{ reply, calls: [{tool, args}], keyframes }`. Tool names/args mirror the MCP server's
    tools (`gesture`, `go_to_pose`, `gripper`, `nudge`, `move_joints`, `status`, `look`, `release`, `save_pose`, `list_poses`).
  - Safety core mirrored visibly: targets clamp to limits, speed is capped, a clamped move adds a
    `clamped: …` note to the transcript. This is the thing to show recruiters.
  - Demo-only extra: "pick up the cube" — a scripted sequence (move_joints + gripper) that picks a small
    cube in the scene and puts it down. Labelled the same way as everything else.
  - Unknown text: friendly reply ("in this demo I can only…") plus the chips. Multi-intent sentences: run the
    first intent (no sequencing, unlike the real app which hands those to Claude).
- **Animation:** joints interpolate toward targets at the capped speed in `useFrame`; a queue runs keyframes
  in order; `stop` clears it. Idle: very slow breathing sway when nothing runs.
- **Transcript:** last few exchanges only; tool-call lines appear as each starts; `aria-live="polite"`.
- **Copy:** clear note that it is simulated in the browser and the real arm runs the same tools over MCP,
  with a link to the real video on /robotics.

### 3. Rover scene (/robotics; optional small preview on home)

- Low-poly model built in code from real dimensions: 2.19 × 2.10 m skid-steer chassis, two LiDAR pucks at
  1.15 m and 0.58 m, simple wheels.
- Loop: rover follows a waypoint loop (AUTO). An obstacle appears, LiDAR rays turn clay, mode label flips
  AUTO → GUIDED, rover swerves around, returns to the path, mode back to AUTO. A small HUD shows mode and
  the safety values (debounce 0.5 s, cooldown 2 s, stuck watchdog 8 s) as labels.
- Interaction (proposal): click/tap the ground to drop an obstacle; drag to orbit. Avoidance is scripted
  steering, not Nav2.

### 4. Pixel mascot (every page)

- Our own small pixel robot/creature in the clay colour (≈ 48 px desktop, ≈ 36 px mobile), drawn as an
  inline SVG pixel grid (`shape-rendering: crispEdges`), fixed bottom-right, bobbing up and down (≈ 2 s ease loop).
- Reacts to arm commands via a tiny client event (e.g. a `CustomEvent` or a small store): a quick hop or
  "!" pixel bubble.
- Never covers content (safe-area padding; on small screens sits above the bottom edge and away from CTAs).
  Static when `prefers-reduced-motion`. Hidden in print.

#### Mascot chat (click the mascot)

```
                     ┌───────────────────────────────┐
                     │ hi! ask me about ayush ✕      │
                     │                               │
                     │ you › what robots did he      │
                     │       build?                  │
                     │ bot › An SO-101 arm Claude    │
                     │       Code drives over MCP,   │
                     │       and LiDAR avoidance on  │
                     │       a 2.2 m rover. → /robots│
                     │ ┌───────────────────────────┐ │
                     │ │ ask something…          ↵ │ │
                     │ └───────────────────────────┘ │
                     │ robots · fde · hire · resume  │
                     └──────────────────────────╮────┘
                                              ▄█▄
                                              ▀ ▀
```

- The mascot is a real `<button>` ("chat with Ayush's bot"); it opens a small panel anchored above it
  (bottom sheet on mobile). Esc / ✕ closes; focus moves into the input and back to the mascot on close.
- **Scripted, no API.** A pure-TS matcher (same style as the arm engine, unit-testable) maps questions to
  answers built from `src/lib/site.ts`: `FAQS` (fde/general/robots), `PROJECTS`, `EXPERIENCE`, `SERVICES`,
  `HATS`, `SKILLS`, `PATENT`, `SITE` (contact, booking, socials, resume). Replies are short (1–3 sentences)
  with a link to the page that has the full answer. Topic chips under the input.
- Fallback for anything unmatched: "I'm a small scripted bot. I can tell you about robots, FDE work,
  experience, skills, or how to hire Ayush" plus the chips and the booking/contact link. Never invents facts:
  every answer comes from site content.
- On pages with the arm scene, arm intents typed into the mascot chat ("wave", "garba"…) are forwarded to the
  arm engine and the arm performs them (transcript shows the tool calls). On other pages, arm intents get
  "the arm lives on the home page — try it there" with a link.
- A one-line note in the panel says it is scripted from this site and nothing is sent anywhere.
  Conversation lives in memory only; nothing stored.
- Panel uses the warm look with pixel-art border/corners to tie it to the mascot; text in the normal sans
  (pixel font only for the panel title).

### 5. Loading, fallbacks, performance

- Scenes are client components loaded with `next/dynamic` (`ssr: false`), mounted when near the viewport /
  on idle, inside a fixed-aspect box so nothing shifts.
- Before load, and when WebGL is missing or `prefers-reduced-motion` is set: a static poster image of the
  arm/rover (rendered once from the scene) with the prompt box still usable (it shows the reply and tool calls;
  no animation).
- Mobile: cap DPR ~1.5, no real-time shadows, simpler lighting; pause rendering when off-screen
  (`frameloop="demand"` or IntersectionObserver).
- The rest of the page is unchanged server-rendered HTML.

## Verification

- `next build` passes on Node 24; production `next start` checked with the existing Playwright (msedge)
  screenshot script at desktop and 390 px, light and dark.
- Command engine unit tests: each intent → expected calls; clamping; unknown text; numbers.
- Mascot chat matcher unit tests: each topic → answer + link drawn from `site.ts`; fallback; arm-intent forwarding.
- SEO layer: JSON-LD, `llms.txt`, markdown routes, metadata unchanged in output (diff before/after).
- Quick Lighthouse-style check on home: text paints before 3D; no CLS from canvas or mascot.

## Build split (for agents)

Independent streams after a shared token/font change lands first:
1. Visual system + restyle of all pages, Navbar, footer, cards, OG images.
2. Arm: model pipeline script + GLB, scene, command engine + tests, prompt box/transcript.
3. Rover scene + HUD.
4. Mascot + event hook + mascot chat panel and matcher.

## Left to the builder

Exact hex values and font choices within the stated direction; mascot pixel design; camera, lighting, materials;
keyframe timing; file/component structure; which pixel accents to use (few); idle animation details;
test tooling choice; whether the rover gets a home preview.
