"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
    type ToolOutcome,
    getAgentMode,
    getAgentStatus,
    loadAgentStatus,
    runAgentTurn,
    subscribeAgentMode,
} from "@/lib/agent/client";
import type { ClientMessage, UserTextMessage } from "@/lib/agent/protocol";
import { type ArmToolResult, emitArmCommand, registerArm } from "@/lib/arm/bridge";
import { spotSide } from "@/lib/arm/constants";
import { plan } from "@/lib/arm/plan";
import { ArmPlayer } from "@/lib/arm/player";
import { executeToolCall, initialPoses } from "@/lib/arm/tools";
import { NO_MOVEO, getMoveo } from "@/lib/moveo/bridge";
import { formatMoveoCall, isMoveoCall } from "@/lib/moveo/tools";
import type { ArmCommandDetail, ArmSource, Intent, ToolCall } from "@/lib/arm/types";
import { cn } from "@/lib/utils";
import { LazyScene } from "@/components/three/lazy-scene";
import { ArmContext, type ArmScene, cloneMap } from "./arm-context";
import { ArmConsole, type Exchange, type Part } from "./arm-console";

const ArmDebug = dynamic(() => import("./arm-debug"), { ssr: false });
const loadCanvas = () => import("./arm-canvas");

const KEEP = 3;
/** still render of the arm in its start pose (same camera as the canvas), shown until the scene draws */
export const ARM_POSTER = "/models/so101-poster.v1.png";
/** a tool call that hasn't finished in this long (e.g. a hidden tab pausing animation) reports a timeout */
const TOOL_TIMEOUT_MS = 90_000;
const FALLBACK_NOTE = "live mode is unavailable right now, so the built-in demo answered";

const STOP_WORDS = /^(stop|ruko|ruk ja|ruk jao|freeze|रुको|बस करो)[.!]*$/i;

/** The intent a structured call corresponds to, for the mascot's reaction (`arm:command`). */
function intentOf(call: ToolCall): Intent | null {
    const name = String(call.args.name ?? "");
    if (call.tool === "gesture" && ["wave", "nod", "shake", "look_around", "garba"].includes(name)) return name as Intent;
    if (call.tool === "go_to_pose" && ["rest", "ready", "face_me", "hand_up"].includes(name)) return name as Intent;
    if (call.tool === "release") return "release";
    if (call.tool === "status") return "status";
    if (call.tool === "list_poses") return "list_poses";
    return null;
}

/**
 * The SO-101 demo: a 3D arm (lazy, WebGL) above a Claude-Code-style console (plain HTML, always works).
 * Live mode: typed text goes to Claude, which drives the arm with the real MCP server's tools; the browser
 * runs each call on the simulation and returns the server's result string once the motion has finished.
 * Otherwise (and for the chips) text runs through a port of the real app's matcher, in the browser.
 */
export function ArmPlayground({
    variant = "hero",
    poster = ARM_POSTER,
    className,
}: {
    variant?: "hero" | "robotics";
    /** still of the arm shown before the scene loads (and when WebGL is off); "" shows a line drawing instead */
    poster?: string;
    className?: string;
}) {
    const [scene] = useState<ArmScene>(() => ({ player: new ArmPlayer(), canvasTick: { at: 0 }, map: cloneMap() }));
    const { player } = scene;
    const root = useRef<HTMLElement>(null);
    const turnstileRef = useRef<HTMLDivElement>(null);
    const [exchanges, setExchanges] = useState<Exchange[]>([]);
    const [busy, setBusy] = useState(false);
    const [agentBusy, setAgentBusy] = useState(false);
    const [debug, setDebug] = useState(false);
    const owner = useRef(new Map<number, number>()); // call id -> exchange id
    const nextId = useRef(1);
    const startTicker = useRef<() => void>(() => {});
    // live agent
    const mode = useSyncExternalStore(subscribeAgentMode, getAgentMode, () => "unknown" as const);
    const history = useRef<ClientMessage[]>([]);
    const agentAbort = useRef<AbortController | null>(null);
    const poses = useRef(initialPoses());
    const pending = useRef(new Map<number, (r: { stopped: boolean }) => void>()); // call id -> resolver
    const simNotes = useRef(new Map<number, string>()); // call id -> "(sim: …)" shown under the result
    const turns = useRef(new Map<string, number>()); // mascot chat turn -> exchange id

    useEffect(() => setDebug(new URLSearchParams(window.location.search).has("arm-debug")), []);

    // is the live agent on? (a cheap status call, no model call; idle so it never competes with first paint)
    useEffect(() => {
        const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
        const go = () => void loadAgentStatus();
        if (w.requestIdleCallback) w.requestIdleCallback(go);
        else window.setTimeout(go, 1500);
    }, []);

    // transcript follows the player: call lines appear as each call starts, results as it ends
    useEffect(() => {
        const patch = (callId: number, fn: (ex: Exchange) => Exchange) => {
            const exId = owner.current.get(callId);
            if (exId === undefined) return;
            setExchanges((prev) => prev.map((ex) => (ex.id === exId ? fn(ex) : ex)));
        };
        const offs = [
            player.on("callStart", (s) =>
                patch(s.id, (ex) =>
                    ex.live
                        ? { ...ex, pending: false, parts: [...(ex.parts ?? []), { kind: "call", key: `c${s.id}`, id: s.id, line: s.line }] }
                        : { ...ex, calls: [...ex.calls, { id: s.id, line: s.line }] }
                )
            ),
            player.on("callEnd", (r) => {
                const done = { result: r.stopped ? r.text : r.text + (simNotes.current.get(r.id) ?? ""), clamped: r.clamped, stopped: r.stopped };
                patch(r.id, (ex) =>
                    ex.live
                        ? { ...ex, parts: ex.parts?.map((p) => (p.kind === "call" && p.id === r.id ? { ...p, ...done } : p)) }
                        : { ...ex, calls: ex.calls.map((c) => (c.id === r.id ? { ...c, ...done } : c)) }
                );
                pending.current.get(r.id)?.({ stopped: !!r.stopped });
                pending.current.delete(r.id);
            }),
            player.on("idle", (idle) => setBusy(!idle)),
            // the visitor clicked the table in the 3D view: say where the cube is now
            player.on("event", (e) => {
                if (e.type !== "cube:place") return;
                const id = nextId.current++;
                const side = spotSide(e.spot);
                setExchanges((prev) =>
                    [
                        ...prev,
                        {
                            id,
                            source: "prompt" as const,
                            you: "(placed the cube on the table)",
                            reply: `cube is at shoulder_pan ${e.spot}${side === "straight ahead" ? ", straight ahead" : `, ${side} of the base`}. try "pick up the cube"`,
                            notes: [],
                            calls: [],
                        },
                    ].slice(-KEEP)
                );
            }),
        ];
        return () => offs.forEach((off) => off());
    }, [player]);

    // DOM ticker: drives the player when no canvas is rendering it (no WebGL, reduced motion, off-screen)
    useEffect(() => {
        let raf = 0;
        let last = 0;
        const loop = (now: number) => {
            const dt = (now - last) / 1000;
            last = now;
            if (now - scene.canvasTick.at > 250) player.tick(dt);
            raf = player.idle ? 0 : requestAnimationFrame(loop);
        };
        startTicker.current = () => {
            if (raf) return;
            last = performance.now();
            raf = requestAnimationFrame(loop);
        };
        return () => cancelAnimationFrame(raf);
    }, [player, scene]);

    const updateEx = useCallback((id: number, fn: (ex: Exchange) => Exchange) => {
        setExchanges((prev) => prev.map((ex) => (ex.id === id ? fn(ex) : ex)));
    }, []);

    /** Halt the arm, cancel Claude's turn, and settle every tool call that was waiting. */
    const stopAll = useCallback(() => {
        agentAbort.current?.abort();
        player.stop();
        pending.current.forEach((resolve) => resolve({ stopped: true }));
        pending.current.clear();
    }, [player]);

    const waitIdle = useCallback(
        () =>
            new Promise<void>((resolve) => {
                if (player.idle) return resolve();
                const off = player.on("idle", (idle) => {
                    if (!idle) return;
                    off();
                    resolve();
                });
            }),
        [player]
    );

    /** One of Claude's tool calls on the simulation; resolves with the server's string after the motion. */
    const runToolOn = useCallback(
        async (call: ToolCall, source: ArmSource, exId: number): Promise<ArmToolResult> => {
            await waitIdle();
            const exec = executeToolCall(call, { pose: { ...player.pose }, cube: player.cubeNow, poses: poses.current });
            poses.current = exec.state.poses;
            const callStep = exec.steps.find((s) => s.kind === "call");
            const callId = callStep && callStep.kind === "call" ? callStep.id : -1;
            owner.current.set(callId, exId);
            if (exec.notes.length) simNotes.current.set(callId, `\n(sim: ${exec.notes.join("; ")})`);
            const finished = new Promise<{ stopped: boolean }>((resolve) => {
                pending.current.set(callId, resolve);
                window.setTimeout(() => resolve({ stopped: true }), TOOL_TIMEOUT_MS);
            });
            player.enqueue(exec.steps);
            startTicker.current();
            emitArmCommand({
                source,
                text: exec.line,
                intent: intentOf(call),
                reply: "",
                calls: [exec.line],
                clamped: exec.clamped.length > 0,
                stopped: false,
            });
            const { stopped } = await finished;
            return { text: stopped ? "Stopped. Holding position." : exec.text, line: exec.line, stopped };
        },
        [player, waitIdle]
    );

    /** Scripted: the local matcher + the real server's motion code. */
    const runScripted = useCallback(
        (text: string, source: ArmSource, into?: number): ArmCommandDetail => {
            const p = plan(text, player.plannedEndPose(), { cubeSpot: player.cubeSpot });
            if (p.stop) stopAll();
            const id = into ?? nextId.current++;
            for (const s of p.steps) if (s.kind === "call") owner.current.set(s.id, id);
            setExchanges((prev) =>
                into !== undefined
                    ? prev.map((ex) =>
                          ex.id === into
                              ? {
                                    ...ex,
                                    live: false,
                                    pending: false,
                                    reply: p.reply,
                                    // the note only when live mode had been on (not when it was never configured)
                                    notes: getAgentStatus() ? [...p.notes, FALLBACK_NOTE] : p.notes,
                                    calls: [],
                                }
                              : ex
                      )
                    : [...prev, { id, source, you: text, reply: p.reply, notes: p.notes, calls: [] }].slice(-KEEP)
            );
            player.enqueue(p.steps);
            if (p.steps.length) startTicker.current();
            const detail: ArmCommandDetail = {
                source,
                text,
                intent: p.intent,
                reply: p.reply,
                calls: p.lines,
                clamped: p.clamped,
                stopped: p.stop,
            };
            if (p.intent !== null) emitArmCommand(detail);
            return detail;
        },
        [player, stopAll]
    );

    /** Live: one typed message to Claude, with its tool loop. Falls back to the scripted engine silently. */
    const askClaude = useCallback(
        async (text: string) => {
            const id = nextId.current++;
            setExchanges((prev) =>
                [...prev, { id, source: "prompt" as const, you: text, reply: "", notes: [], calls: [], live: true, parts: [], pending: true }].slice(
                    -KEEP
                )
            );
            const ac = new AbortController();
            agentAbort.current = ac;
            setAgentBusy(true);
            const user: UserTextMessage = {
                role: "user",
                text,
                surface: "arm",
                arm: true,
                moveo: getMoveo() !== null,
                page: window.location.pathname,
            };
            const addText = (key: string, d: string, kind: "text" | "note") =>
                updateEx(id, (ex) => {
                    const parts = ex.parts ?? [];
                    const at = parts.findIndex((p) => p.key === key);
                    const next: Part[] =
                        at >= 0
                            ? parts.map((p, i) => (i === at && p.kind !== "call" ? { ...p, text: p.text + d } : p))
                            : [...parts, { kind, key, text: d }];
                    return { ...ex, pending: false, parts: next };
                });
            const r = await runAgentTurn({
                history: history.current,
                user,
                signal: ac.signal,
                turnstileHost: () => turnstileRef.current,
                hooks: {
                    text: (round, i, d) => addText(`t${round}.${i}`, d, "text"),
                    note: (round, i, d) => addText(`n${round}.${i}`, d, "note"),
                    runTool: async (block, call, error): Promise<ToolOutcome> => {
                        if (!call) {
                            updateEx(id, (ex) => ({
                                ...ex,
                                parts: [
                                    ...(ex.parts ?? []),
                                    { kind: "call", key: `x${block.id}`, id: -1, line: `${block.name}(…)`, result: `invalid input: ${error}`, error: true },
                                ],
                            }));
                            return { content: "", is_error: true };
                        }
                        if (isMoveoCall(call)) {
                            // asked here to move the Moveo: run it there if its demo is on the page
                            const moveo = getMoveo();
                            const res = moveo ? await moveo.runTool(call) : { text: NO_MOVEO, error: true };
                            updateEx(id, (ex) => ({
                                ...ex,
                                parts: [
                                    ...(ex.parts ?? []),
                                    { kind: "call", key: `m${block.id}`, id: -1, line: formatMoveoCall(call), result: res.text.split("\n")[0], error: !!res.error },
                                ],
                            }));
                            return { content: res.text, ...(res.error ? { is_error: true } : {}) };
                        }
                        const out = await runToolOn(call, "prompt", id);
                        return { content: out.text };
                    },
                },
            });
            history.current = r.history;
            if (agentAbort.current === ac) agentAbort.current = null;
            setAgentBusy(false);
            const note: Partial<Record<typeof r.end, string>> = {
                stopped: "stopped.",
                steps: "that took too many steps for one message, so Claude stopped there.",
                refusal: "Claude can't help with that one. Try asking the arm to wave, dance or pick up the cube.",
                truncated: "(reply cut short)",
                error: "the live connection dropped. Try again in a bit, or use the chips.",
            };
            if (r.end === "fallback") runScripted(text, "prompt", id);
            else if (note[r.end]) updateEx(id, (ex) => ({ ...ex, pending: false, notes: [...ex.notes, note[r.end] as string] }));
            else updateEx(id, (ex) => ({ ...ex, pending: false }));
        },
        [runScripted, runToolOn, updateEx]
    );

    const run = useCallback(
        (input: string, source: ArmSource): ArmCommandDetail | null => {
            const text = input.trim().slice(0, source === "prompt" ? 1000 : 200);
            if (STOP_WORDS.test(text)) return runScripted(text, source);
            if (source === "prompt" && getAgentMode() !== "off") {
                if (agentAbort.current) return null; // Claude is still working; "stop" interrupts
                void askClaude(text);
                return null;
            }
            return runScripted(text.slice(0, 200), source);
        },
        [askClaude, runScripted]
    );

    // the mascot chat forwards commands here (scripted text, or Claude's tool calls); bring the arm on screen
    useEffect(() => {
        const reveal = () => {
            const el = root.current;
            if (!el) return;
            const r = el.getBoundingClientRect();
            const visible = r.top < window.innerHeight * 0.6 && r.bottom > window.innerHeight * 0.3;
            if (!visible) {
                const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
            }
        };
        return registerArm({
            run(text, source) {
                reveal();
                return runScripted(text.trim().slice(0, 200), source);
            },
            runTool(call, source, turn) {
                reveal();
                let exId = turns.current.get(turn);
                if (exId === undefined) {
                    const id = nextId.current++;
                    exId = id;
                    turns.current.set(turn, id);
                    setExchanges((prev) =>
                        [...prev, { id, source, you: "", reply: "", notes: [], calls: [], live: true, parts: [] }].slice(-KEEP)
                    );
                }
                return runToolOn(call, source, exId);
            },
        });
    }, [runScripted, runToolOn]);

    useEffect(() => () => agentAbort.current?.abort(), []);

    const live = mode === "live";
    return (
        <ArmContext.Provider value={scene}>
            <section
                id="arm"
                ref={root}
                aria-label="SO-101 arm demo"
                className={cn("scroll-mt-24 overflow-hidden rounded-xl border border-border bg-card", className)}
            >
                <LazyScene
                    load={loadCanvas}
                    aspect={variant === "hero" ? "4 / 3" : "16 / 11"}
                    poster={poster}
                    posterAlt="The SO-101 robot arm"
                    className="bg-muted/40"
                >
                    <ArmPlaceholder hidden={!!poster} />
                    <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 font-pixel text-[10px] uppercase tracking-wider text-muted-foreground">
                        <span
                            aria-hidden
                            className={cn(
                                "inline-block h-1.5 w-1.5",
                                busy || agentBusy ? "animate-pulse bg-brand motion-reduce:animate-none" : "bg-muted-foreground/50"
                            )}
                        />
                        so-101 · sim
                    </div>
                    {/* only once the 3D scene is up (the poster can't take clicks) */}
                    <p className="pointer-events-none absolute bottom-3 right-3 font-pixel text-[10px] uppercase tracking-wider text-muted-foreground opacity-0 transition-opacity duration-500 [[data-scene=ready]_&]:opacity-100">
                        click the table to place the cube
                    </p>
                </LazyScene>

                <div className="border-t border-border">
                    <ArmConsole
                        exchanges={exchanges}
                        onCommand={run}
                        busy={busy || agentBusy}
                        live={live}
                        turnstileRef={turnstileRef}
                    />
                    <p className="border-t border-border px-4 py-2 text-[11.5px] text-muted-foreground">
                        {live
                            ? "Claude drives this simulated arm with the same tools as my real MCP server"
                            : "simulated in your browser — the real arm runs these same tools over MCP"}
                        {variant === "hero" && (
                            <>
                                {" · "}
                                <Link href="/robotics" className="text-foreground underline-offset-4 hover:underline">
                                    see it on the desk
                                </Link>
                            </>
                        )}
                    </p>
                </div>
                {debug && <ArmDebug />}
            </section>
        </ArmContext.Provider>
    );
}

/** A quiet line drawing of the arm, shown until the 3D scene has drawn (and when there is no WebGL). */
function ArmPlaceholder({ hidden }: { hidden: boolean }) {
    if (hidden) return null;
    return (
        <svg
            aria-hidden
            viewBox="0 0 120 90"
            className="pointer-events-none absolute inset-0 m-auto h-3/5 w-3/5 text-muted-foreground/40 transition-opacity duration-500 [[data-scene=ready]_&]:opacity-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M30 80h30M36 80v-8h18v8" />
            <path d="M45 72V44l26-6" />
            <path d="M71 38l12 10m0 0l4 9m-4-9l9 2" />
            <circle cx="45" cy="44" r="3" />
            <circle cx="71" cy="38" r="3" />
            <path d="M16 84h88" strokeOpacity="0.5" />
        </svg>
    );
}
