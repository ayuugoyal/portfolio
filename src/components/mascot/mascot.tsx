"use client";

import dynamic from "next/dynamic";
import { type PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from "react";
import { onArmCommand } from "@/lib/arm/bridge";
import { BANG, FRAMES, toPaths, type FrameName } from "@/lib/mascot-sprite";
import {
    computeSegments,
    createWander,
    nearestAllowed,
    type Range,
    type Wander,
    type WanderLayout,
} from "@/lib/mascot/wander";
import { cn } from "@/lib/utils";
import { useReducedMotionPref } from "./use-mascot-env";

const loadChat = () => import("./mascot-chat");
const MascotChat = dynamic(loadChat, { ssr: false });

const PATHS = Object.fromEntries(
    (Object.keys(FRAMES) as FrameName[]).map((k) => [k, toPaths(FRAMES[k])]),
) as Record<FrameName, ReturnType<typeof toPaths>>;
const BANG_PATHS = toPaths(BANG);

const GUTTER = 16;
const DOCK_GAP = 16;
const ABOVE_DOCK = 8;
const MOBILE = "(max-width: 767.98px)";

/** Speech-bubble lines, so visitors know the mascot is a chat. */
const HELLO = "hi! talk to me";
const NUDGES = ["talk to me!", "ask me about ayush", "psst… click me to chat", "drag me around!"];
const CHATTED_KEY = "mascot-chatted";

/** Drag and drop. */
const DRAG_START = 5; // px of pointer travel before a press becomes a drag
const EDGE = 8; // viewport margin while held
const GRAVITY = 2000; // px/s²
const BIG_DROP = 250; // px: above this the landing makes it dizzy
const SLIDE_MS = 380; // hop sideways off the dock after landing on it
const DIZZY_MS = 1500;
const HAPPY_MS = 800;
const SPEAK_MS = 1500;
/** bubble flips below the mascot when its top is this close to the viewport top */
const BUBBLE_FLIP = 70;

/**
 * What the mascot is doing outside its normal wander. x/y live in posRef: x = left edge (viewport px),
 * y = offset from its home height on the strip (negative = higher up).
 */
type Act =
    | { kind: "drag"; grabX: number; grabY: number; homeTop: number }
    | { kind: "fall"; vy: number; fromY: number }
    | { kind: "slide"; fromX: number; toX: number; t0: number; height: number }
    | { kind: "react"; face: "happy" | "dizzy"; until: number };

const chattedBefore = () => {
    try {
        return window.sessionStorage.getItem(CHATTED_KEY) === "1";
    } catch {
        return false;
    }
};

/**
 * The nav dock. Prefers `[data-dock]`; otherwise finds the Navbar's /robotics link inside a
 * position:fixed wrapper and returns the wrapper's child that holds it (the Dock root).
 */
function findDock(): HTMLElement | null {
    const tagged = document.querySelector<HTMLElement>("[data-dock]");
    if (tagged) return tagged;
    const links = document.querySelectorAll<HTMLElement>('a[href="/robotics"], a[href="/forward-deployed-engineer"]');
    for (const link of Array.from(links)) {
        let el: HTMLElement | null = link;
        while (el && el.parentElement && el.parentElement !== document.body) {
            if (getComputedStyle(el.parentElement).position === "fixed") return el;
            el = el.parentElement;
        }
    }
    return null;
}

type Placement = { layout: WanderLayout; bottomTarget: number | null };

/**
 * The pixel mascot: wanders the bottom strip, can be picked up and dropped (it falls back down and reacts to
 * the height), jumps around now and then, and opens the chat when clicked.
 */
export function Mascot() {
    const reduced = useReducedMotionPref();
    const wrapRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const bodyRef = useRef<HTMLSpanElement>(null);
    const playRef = useRef<HTMLDivElement>(null);
    const wanderRef = useRef<Wander | null>(null);
    const dyRef = useRef(0);
    const dockRef = useRef<HTMLElement | null>(null);
    const dockSpanRef = useRef<Range | null>(null);
    const blinkRef = useRef(false);
    const talkRef = useRef(false);
    const frameRef = useRef<FrameName>("idle");
    const hoverRef = useRef(false);
    const focusRef = useRef(false);
    const actRef = useRef<Act | null>(null);
    /** where the mascot is drawn: left edge x, and y offset from its home height */
    const posRef = useRef({ x: 0, y: 0 });
    /** a press on the mascot that may turn into a drag */
    const pressRef = useRef<{ id: number; x: number; y: number } | null>(null);
    /** the click that follows a drag must not open the chat */
    const suppressClickRef = useRef(false);
    /** a short face shown over the normal ones (play jumps), until performance.now() reaches `until` */
    const faceRef = useRef<{ name: FrameName; until: number } | null>(null);
    const speakUntilRef = useRef(0);
    const chattedRef = useRef(false);
    const bubbleTimer = useRef(0);

    const [frame, setFrame] = useState<FrameName>("idle");
    const [facing, setFacing] = useState<1 | -1>(-1);
    const [walking, setWalking] = useState(false);
    const [held, setHeld] = useState(false);
    const [open, setOpen] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [bang, setBang] = useState(0);
    const [hop, setHop] = useState(0);
    const [anchor, setAnchor] = useState({ x: 0, bottom: 0 });
    const [bubble, setBubble] = useState<{ text: string; right: boolean } | null>(null);
    /** the mascot is near the top of the viewport: bubbles go below it */
    const [high, setHigh] = useState(false);

    const openRef = useRef(open);
    openRef.current = open;

    const showFrame = useCallback((f: FrameName) => {
        if (f !== frameRef.current) {
            frameRef.current = f;
            setFrame(f);
        }
    }, []);

    /** Show a speech bubble for `ms` (on the side of the mascot that has room). */
    const say = useCallback((text: string, ms: number) => {
        if (openRef.current) return;
        setBubble({ text, right: posRef.current.x > document.documentElement.clientWidth / 2 });
        window.clearTimeout(bubbleTimer.current);
        bubbleTimer.current = window.setTimeout(() => setBubble(null), ms);
    }, []);

    /** Writes the position (wander x, or the drag/fall x/y) plus the vertical correction into the transform. */
    const apply = useCallback(() => {
        const w = wanderRef.current;
        const el = wrapRef.current;
        if (!w || !el) return;
        if (!actRef.current) posRef.current = { x: w.state.x, y: 0 };
        const { x, y } = posRef.current;
        el.style.transform = `translate3d(${x}px, ${dyRef.current + y}px, 0)`;
    }, []);

    /** Measures the strip and dock; desktop walks beside the dock, mobile (or no room) walks above it. */
    const place = useCallback((): Placement | null => {
        const btn = buttonRef.current;
        const wrap = wrapRef.current;
        if (!btn || !wrap) return null;
        if (!dockRef.current?.isConnected) dockRef.current = findDock();
        const dock = dockRef.current;
        const vw = document.documentElement.clientWidth;
        const width = btn.offsetWidth;
        const strip = { left: GUTTER, right: vw - GUTTER };
        const rect = dock?.getBoundingClientRect() ?? null;
        // The dock grows while icons magnify; keep the widest span seen at this viewport size.
        if (rect && rect.width > 0) {
            const prev = dockSpanRef.current;
            dockSpanRef.current = prev
                ? { left: Math.min(prev.left, rect.left), right: Math.max(prev.right, rect.right) }
                : { left: rect.left, right: rect.right };
        }
        const span = dockSpanRef.current ?? { left: vw / 2 - 240, right: vw / 2 + 240 };
        const desktop: WanderLayout = { strip, blocked: [span], gap: DOCK_GAP, width };
        const mobile = window.matchMedia(MOBILE).matches || computeSegments(desktop).length === 0;
        if (mobile) {
            // phones: stay in a short strip at the right edge so it never sits on top of the text
            const phoneStrip = { left: Math.max(strip.left, strip.right - width - 72), right: strip.right };
            return {
                layout: { strip: phoneStrip, blocked: [], gap: DOCK_GAP, width },
                bottomTarget: rect && rect.height > 0 ? rect.top - ABOVE_DOCK : null,
            };
        }
        return { layout: desktop, bottomTarget: rect && rect.height > 0 ? rect.bottom : null };
    }, []);

    const measure = useCallback(() => {
        const p = place();
        const wrap = wrapRef.current;
        if (!p || !wrap) return;
        const baseBottom = wrap.getBoundingClientRect().bottom - dyRef.current - (actRef.current ? posRef.current.y : 0);
        dyRef.current = p.bottomTarget === null ? 0 : Math.round(p.bottomTarget - baseBottom);
        if (!wanderRef.current) wanderRef.current = createWander({ layout: p.layout, start: "right" });
        else wanderRef.current.setLayout(p.layout);
        if (reduced) {
            // Parked bottom-right, static (until the visitor drags it somewhere else).
            const segs = wanderRef.current.segments;
            const park = segs[segs.length - 1];
            if (park && !actRef.current) wanderRef.current = createWander({ layout: p.layout, start: park.max });
        }
        apply();
        if (openRef.current) {
            const r = buttonRef.current?.getBoundingClientRect();
            if (r) setAnchor({ x: r.left + r.width / 2, bottom: window.innerHeight - r.top + 8 });
        }
    }, [apply, place, reduced]);

    // measure on mount, resize and dock size changes
    useEffect(() => {
        measure();
        const onResize = () => {
            dockSpanRef.current = null;
            measure();
        };
        window.addEventListener("resize", onResize);
        const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => measure()) : null;
        if (ro && dockRef.current) ro.observe(dockRef.current);
        // fonts and the dock's entrance can shift things right after load
        const late = window.setTimeout(() => {
            measure();
            if (ro && dockRef.current) ro.observe(dockRef.current);
        }, 800);
        return () => {
            window.removeEventListener("resize", onResize);
            ro?.disconnect();
            window.clearTimeout(late);
        };
    }, [measure]);

    // freeze the wander while hovered / focused / chat open / held, falling or reacting
    const syncFrozen = useCallback(() => {
        wanderRef.current?.setFrozen(hoverRef.current || focusRef.current || openRef.current || !!actRef.current);
    }, []);
    useEffect(syncFrozen, [open, syncFrozen]);

    /** Short body animations (Web Animations API, so no global keyframes): squash on landing, dizzy wobble. */
    const squash = useCallback((strength: number) => {
        bodyRef.current?.animate(
            [
                { transform: `scale(${1 + 0.3 * strength}, ${1 - 0.35 * strength})` },
                { transform: "scale(0.95, 1.08)", offset: 0.6 },
                { transform: "scale(1, 1)" },
            ],
            { duration: 320, easing: "ease-out" },
        );
    }, []);
    const wobble = useCallback(() => {
        bodyRef.current?.animate(
            [{ transform: "rotate(0deg)" }, { transform: "rotate(-12deg)" }, { transform: "rotate(12deg)" }, { transform: "rotate(0deg)" }],
            { duration: 500, iterations: DIZZY_MS / 500, easing: "ease-in-out" },
        );
    }, []);

    /** Back to wandering from wherever it is now on the strip. */
    const settle = useCallback(() => {
        actRef.current = null;
        posRef.current.y = 0;
        wanderRef.current?.setX(posRef.current.x);
        setHeld(false);
        setHigh(false);
        syncFrozen();
        apply();
    }, [apply, syncFrozen]);

    /** Landed (after the fall, and any hop off the dock): squash, then a face that depends on the drop height. */
    const react = useCallback(
        (height: number) => {
            const big = height > BIG_DROP;
            squash(big ? 1 : 0.6);
            if (big) {
                wobble();
                say("whoa… dizzy", DIZZY_MS);
            } else if (height > 40) say("wheee!", HAPPY_MS + 300);
            actRef.current = { kind: "react", face: big ? "dizzy" : "happy", until: performance.now() + (big ? DIZZY_MS : HAPPY_MS) };
        },
        [say, squash, wobble],
    );

    /** Hit the strip at y = 0: hop sideways off the dock if it came down on it, else react. */
    const touchDown = useCallback(
        (height: number) => {
            const w = wanderRef.current;
            const x = posRef.current.x;
            const toX = w ? nearestAllowed(x, w.segments) : x;
            posRef.current.y = 0;
            if (Math.abs(toX - x) > 1) {
                squash(0.5);
                actRef.current = { kind: "slide", fromX: x, toX, t0: performance.now(), height };
            } else react(height);
        },
        [react, squash],
    );

    // the animation loop (skipped entirely under reduced motion)
    useEffect(() => {
        if (reduced) {
            showFrame("idle");
            setWalking(false);
            return;
        }
        let raf = 0;
        let lastFacing: 1 | -1 = -1;
        let lastWalking = false;
        let wasHigh = false;
        let last = performance.now();
        const loop = () => {
            const now = performance.now();
            const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
            last = now;
            const w = wanderRef.current;
            const act = actRef.current;
            let f: FrameName = "idle";
            let moving = false;
            if (w && act) {
                if (act.kind === "drag") {
                    f = Math.floor(now / 120) % 2 ? "surprised2" : "surprised";
                } else if (act.kind === "fall") {
                    act.vy += GRAVITY * dt;
                    posRef.current.y += act.vy * dt;
                    f = Math.floor(now / 90) % 2 ? "surprised2" : "surprised";
                    if (posRef.current.y >= 0) touchDown(-act.fromY);
                } else if (act.kind === "slide") {
                    const k = Math.min(1, (now - act.t0) / SLIDE_MS);
                    posRef.current = { x: act.fromX + (act.toX - act.fromX) * k, y: -26 * Math.sin(Math.PI * k) };
                    moving = true;
                    f = "surprised";
                    if (k >= 1) {
                        posRef.current.y = 0;
                        react(act.height);
                    }
                } else {
                    f = act.face;
                    if (now >= act.until) settle();
                }
                apply();
                const top = buttonRef.current?.getBoundingClientRect().top ?? Infinity;
                const isHigh = actRef.current !== null && top < BUBBLE_FLIP;
                if (isHigh !== wasHigh) {
                    wasHigh = isHigh;
                    setHigh(isHigh);
                }
            } else if (w) {
                const s = w.tick();
                apply();
                moving = s.phase === "walk" && !s.frozen;
                if (s.facing !== lastFacing) {
                    lastFacing = s.facing;
                    setFacing(s.facing);
                }
                const face = faceRef.current && now < faceRef.current.until ? faceRef.current.name : null;
                if (moving) f = Math.floor(s.walked / 6) % 2 ? "walk2" : "walk1";
                else if (face) f = face;
                else if (s.looking) f = "look";
                else if (blinkRef.current) f = "blink";
            }
            // speaking wins over everything except being held or dizzy: while typing, right after a click,
            // and while a reply is read aloud (voice mode; the browser's own flag, so no import of the TTS module)
            const busyFace = act && (act.kind === "drag" || act.kind === "fall" || (act.kind === "react" && act.face === "dizzy"));
            const readingAloud = "speechSynthesis" in window && window.speechSynthesis.speaking;
            if (!busyFace && (talkRef.current || readingAloud || now < speakUntilRef.current))
                f = Math.floor(now / 160) % 2 ? "talk" : "idle";
            if (moving !== lastWalking) {
                lastWalking = moving;
                setWalking(moving);
            }
            showFrame(f);
            raf = requestAnimationFrame(loop);
        };
        const start = () => {
            cancelAnimationFrame(raf);
            last = performance.now();
            if (document.visibilityState === "visible") raf = requestAnimationFrame(loop);
        };
        start();
        document.addEventListener("visibilitychange", start);
        return () => {
            cancelAnimationFrame(raf);
            document.removeEventListener("visibilitychange", start);
        };
    }, [apply, react, reduced, settle, showFrame, touchDown]);

    // play: every 8-15 s, while idle on the strip, a jump (or two small hops) with a happy face or a wink
    useEffect(() => {
        if (reduced) return;
        let t = 0;
        const schedule = () => {
            t = window.setTimeout(() => {
                const w = wanderRef.current;
                const idle =
                    w &&
                    !actRef.current &&
                    !openRef.current &&
                    !hoverRef.current &&
                    !focusRef.current &&
                    w.state.phase === "pause" &&
                    document.visibilityState === "visible";
                if (idle && playRef.current) {
                    const two = Math.random() < 0.5;
                    const frames = two
                        ? [0, -12, 0, -12, 0].map((y) => ({ transform: `translateY(${y}px)` }))
                        : [0, -22, 0].map((y) => ({ transform: `translateY(${y}px)` }));
                    playRef.current.animate(frames, { duration: two ? 650 : 520, easing: "ease-in-out" });
                    faceRef.current = { name: Math.random() < 0.65 ? "happy" : "wink", until: performance.now() + 900 };
                }
                schedule();
            }, 8000 + Math.random() * 7000);
        };
        schedule();
        return () => window.clearTimeout(t);
    }, [reduced]);

    // "talk to me" bubbles until the visitor has opened the chat once this visit
    useEffect(() => {
        chattedRef.current = chattedBefore();
        if (chattedRef.current) return;
        const hello = window.setTimeout(() => say(HELLO, 7000), 2500);
        let i = 0;
        const nudge = window.setInterval(() => {
            if (!chattedRef.current && !actRef.current) say(NUDGES[i++ % NUDGES.length], 5000);
        }, 25000);
        return () => {
            window.clearTimeout(hello);
            window.clearInterval(nudge);
            window.clearTimeout(bubbleTimer.current);
        };
    }, [say]);

    // blink every 4-6 s
    useEffect(() => {
        if (reduced) return;
        let t = 0;
        const schedule = () => {
            t = window.setTimeout(() => {
                blinkRef.current = true;
                t = window.setTimeout(() => {
                    blinkRef.current = false;
                    schedule();
                }, 140);
            }, 4000 + Math.random() * 2000);
        };
        schedule();
        return () => window.clearTimeout(t);
    }, [reduced]);

    // hop + "!" when the arm runs a command
    useEffect(
        () =>
            onArmCommand(() => {
                setBang((n) => n + 1);
                if (!reduced) setHop((n) => n + 1);
            }),
        [reduced],
    );
    useEffect(() => {
        if (!bang) return;
        const t = window.setTimeout(() => setBang(0), 900);
        return () => window.clearTimeout(t);
    }, [bang]);
    useEffect(() => {
        if (!hop) return;
        const t = window.setTimeout(() => setHop(0), 450);
        return () => window.clearTimeout(t);
    }, [hop]);

    const prefetch = () => {
        void loadChat();
    };

    // ─── drag and drop ────────────────────────────────────────────────────────────────────────────

    const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
        if (e.button !== 0 || open) return;
        pressRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
        const press = pressRef.current;
        if (!press || press.id !== e.pointerId) return;
        const btn = buttonRef.current;
        if (!btn) return;
        let act = actRef.current;
        if (act?.kind !== "drag") {
            if (Math.hypot(e.clientX - press.x, e.clientY - press.y) < DRAG_START) return;
            // picked up (also mid-fall or mid-reaction: it's grabbed out of the air)
            const r = btn.getBoundingClientRect();
            bodyRef.current?.getAnimations().forEach((a) => a.cancel());
            act = { kind: "drag", grabX: press.x - r.left, grabY: press.y - r.top, homeTop: r.top - (actRef.current ? posRef.current.y : 0) };
            actRef.current = act;
            setHeld(true);
            setBubble(null);
            syncFrozen();
        }
        const r = btn.getBoundingClientRect();
        const vw = document.documentElement.clientWidth;
        const left = Math.min(vw - r.width - EDGE, Math.max(EDGE, e.clientX - act.grabX));
        const top = Math.min(window.innerHeight - r.height - EDGE, Math.max(EDGE, e.clientY - act.grabY));
        const dx = left - posRef.current.x;
        if (Math.abs(dx) > 1.5) setFacing(dx > 0 ? 1 : -1);
        posRef.current = { x: left, y: Math.min(0, top - act.homeTop) };
        apply();
    };

    const drop = (e: ReactPointerEvent<HTMLButtonElement>) => {
        const press = pressRef.current;
        if (!press || press.id !== e.pointerId) return;
        pressRef.current = null;
        if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
        if (actRef.current?.kind !== "drag") return; // a plain press: the click opens the chat
        suppressClickRef.current = true;
        window.setTimeout(() => (suppressClickRef.current = false), 80);
        setHeld(false);
        if (reduced) {
            // no falling: straight to the nearest spot on the strip
            const w = wanderRef.current;
            posRef.current = { x: w ? nearestAllowed(posRef.current.x, w.segments) : posRef.current.x, y: 0 };
            settle();
            return;
        }
        actRef.current = { kind: "fall", vy: 0, fromY: posRef.current.y };
    };

    // ─── chat ─────────────────────────────────────────────────────────────────────────────────────

    const toggle = () => {
        if (suppressClickRef.current) {
            suppressClickRef.current = false;
            return;
        }
        if (!open) {
            setBubble(null);
            chattedRef.current = true;
            try {
                window.sessionStorage.setItem(CHATTED_KEY, "1");
            } catch {
                /* private mode: bubbles just keep nudging */
            }
            // mid-fall or mid-reaction: snap to the strip first so the panel opens on screen
            if (actRef.current) {
                bodyRef.current?.getAnimations().forEach((a) => a.cancel());
                const w = wanderRef.current;
                posRef.current = { x: w ? nearestAllowed(posRef.current.x, w.segments) : posRef.current.x, y: 0 };
                settle();
            }
            speakUntilRef.current = performance.now() + SPEAK_MS;
            const r = buttonRef.current?.getBoundingClientRect();
            if (r) setAnchor({ x: r.left + r.width / 2, bottom: window.innerHeight - r.top + 8 });
            setLoaded(true);
        }
        setOpen((o) => !o);
    };

    const close = useCallback((returnFocus: boolean) => {
        setOpen(false);
        talkRef.current = false;
        if (returnFocus) buttonRef.current?.focus({ preventScroll: true });
    }, []);

    const onTyping = useCallback((typing: boolean) => {
        talkRef.current = typing;
    }, []);

    const p = PATHS[frame];

    return (
        <>
            <div
                ref={wrapRef}
                data-mascot=""
                className="pointer-events-none fixed bottom-[calc(98px+env(safe-area-inset-bottom))] left-0 z-40 print:hidden md:bottom-10"
                // SSR guess: bottom-right. The client replaces this with a measured px transform (no layout shift).
                style={{ transform: "translateX(calc(100vw - 100% - 2rem))" }}
            >
                <div ref={playRef} className={cn("relative", hop > 0 && "animate-mascot-hop")}>
                    {bang > 0 && !bubble && (
                        <span
                            aria-hidden="true"
                            className="pixel-frame absolute -top-7 left-1/2 -translate-x-1/2 bg-card px-1.5 py-1"
                        >
                            <svg viewBox="0 0 4 6" width={8} height={12} shapeRendering="crispEdges" className="block">
                                <path d={BANG_PATHS.brand} className="fill-brand" />
                            </svg>
                        </span>
                    )}
                    {bubble && !open && !held && (
                        <button
                            type="button"
                            tabIndex={-1}
                            aria-hidden="true"
                            onClick={toggle}
                            className={cn(
                                "pointer-events-auto absolute whitespace-nowrap border-2 border-foreground bg-card px-3 py-2 shadow-[3px_3px_0_0_hsl(var(--brand))] font-pixel text-xs uppercase leading-none tracking-wide text-foreground motion-safe:animate-in motion-safe:fade-in",
                                high ? "top-full mt-2.5" : "bottom-full mb-2.5",
                                bubble.right ? "right-0" : "left-0"
                            )}
                        >
                            {bubble.text}
                            <span
                                aria-hidden="true"
                                className={cn(
                                    high
                                        ? "absolute bottom-full size-2.5 translate-y-[5px] rotate-45 border-l-2 border-t-2 border-foreground bg-card"
                                        : "absolute top-full size-2.5 -translate-y-[5px] rotate-45 border-b-2 border-r-2 border-foreground bg-card",
                                    bubble.right ? "right-4" : "left-4"
                                )}
                            />
                        </button>
                    )}
                    <button
                        ref={buttonRef}
                        type="button"
                        aria-label="Talk to me: chat about Ayush"
                        title="drag me, or click to chat"
                        aria-haspopup="dialog"
                        aria-expanded={open}
                        aria-controls="mascot-chat"
                        onClick={toggle}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={drop}
                        onPointerCancel={drop}
                        onPointerEnter={() => {
                            hoverRef.current = true;
                            syncFrozen();
                            prefetch();
                            if (!open && !actRef.current) say("talk to me", 2500);
                        }}
                        onPointerLeave={() => {
                            hoverRef.current = false;
                            syncFrozen();
                        }}
                        onFocus={() => {
                            focusRef.current = true;
                            syncFrozen();
                            prefetch();
                        }}
                        onBlur={() => {
                            focusRef.current = false;
                            syncFrozen();
                        }}
                        className={cn(
                            "pointer-events-auto grid size-11 touch-none select-none place-items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:size-12",
                            held ? "cursor-grabbing" : "cursor-grab"
                        )}
                    >
                        <span
                            className={cn("block", !walking && !held && !reduced && "animate-mascot-bob")}
                        >
                            <span ref={bodyRef} className="block origin-bottom">
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 12 12"
                                    shapeRendering="crispEdges"
                                    className="block size-9 md:size-12"
                                    style={{ transform: facing === -1 ? "scaleX(-1)" : undefined }}
                                >
                                    <path d={p.brand} className="fill-brand" />
                                    <path d={p.visor} className="fill-[hsl(var(--mascot-visor))]" />
                                    <path d={p.eye} className="fill-[hsl(var(--mascot-eye))]" />
                                </svg>
                            </span>
                        </span>
                    </button>
                </div>
            </div>
            {/* outside the transformed wrapper so the panel's position:fixed is relative to the viewport */}
            {loaded && (
                <MascotChat
                    open={open}
                    onClose={close}
                    anchorX={anchor.x}
                    anchorBottom={anchor.bottom}
                    mascotRef={buttonRef}
                    onTyping={onTyping}
                />
            )}
        </>
    );
}

export default Mascot;
