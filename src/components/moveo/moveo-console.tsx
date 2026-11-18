"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArmConsole, type CallLine, type Exchange, type Part } from "@/components/arm/arm-console";
import {
    type ToolOutcome,
    getAgentMode,
    getAgentStatus,
    loadAgentStatus,
    runAgentTurn,
    subscribeAgentMode,
} from "@/lib/agent/client";
import type { ClientMessage, UserTextMessage } from "@/lib/agent/protocol";
import { getArm } from "@/lib/arm/bridge";
import { formatCall } from "@/lib/arm/format";
import { registerMoveo, type MoveoToolResult } from "@/lib/moveo/bridge";
import { MOVEO_HELP, type MoveoCall, executeMoveoCall, isMoveoCall, matchMoveo } from "@/lib/moveo/tools";
import { type MoveoStore, useMoveoState } from "./moveo-store";

const KEEP = 3;
const CHIPS = ["pick and place", "ready", "home", "turn the base to 90", "status"] as const;
const STOP = /^(stop|ruko|ruk ja|freeze|रुको)[.!]*$/i;
const FALLBACK_NOTE = "live mode is unavailable right now, so the built-in demo answered";

/**
 * The Claude Code-style console under the Moveo. Live: Claude drives the twin with the moveo_* tools
 * (lib/moveo/tools.ts), each call finishing its motion before Claude sees the result. Otherwise a small
 * matcher maps plain words to the same calls.
 */
export function MoveoConsole({ store }: { store: MoveoStore }) {
    const { playing } = useMoveoState(store);
    const mode = useSyncExternalStore(subscribeAgentMode, getAgentMode, () => "unknown" as const);
    const [exchanges, setExchanges] = useState<Exchange[]>([]);
    const [agentBusy, setAgentBusy] = useState(false);
    const nextId = useRef(1);
    const history = useRef<ClientMessage[]>([]);
    const agentAbort = useRef<AbortController | null>(null);
    const turnstileRef = useRef<HTMLDivElement>(null);
    /** the exchange that collects calls coming from the mascot chat */
    const chatEx = useRef<number | null>(null);

    useEffect(() => {
        const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
        const go = () => void loadAgentStatus();
        if (w.requestIdleCallback) w.requestIdleCallback(go);
        else window.setTimeout(go, 1500);
    }, []);

    const add = useCallback((ex: Exchange) => setExchanges((prev) => [...prev, ex].slice(-KEEP)), []);
    const update = useCallback((id: number, fn: (ex: Exchange) => Exchange) => {
        setExchanges((prev) => prev.map((ex) => (ex.id === id ? fn(ex) : ex)));
    }, []);

    /** Run one call on the twin, showing it in exchange `exId` (as a live part or a scripted call line). */
    const runCall = useCallback(
        async (call: MoveoCall, exId: number, live: boolean): Promise<MoveoToolResult> => {
            const exec = executeMoveoCall(call, store.get().pose);
            const cid = nextId.current++;
            const line: CallLine = { id: cid, line: exec.line };
            update(exId, (ex) =>
                live
                    ? { ...ex, pending: false, parts: [...(ex.parts ?? []), { kind: "call", key: `c${cid}`, ...line }] }
                    : { ...ex, calls: [...ex.calls, line] }
            );
            const { stopped } = exec.steps.length ? await store.play(exec.steps, exec.line, exec.speed) : { stopped: false };
            const text = stopped ? "Stopped. Holding position." : exec.text;
            const done: Partial<CallLine> = { result: text, clamped: exec.clamped, stopped, error: exec.error };
            update(exId, (ex) =>
                live
                    ? { ...ex, parts: ex.parts?.map((p) => (p.kind === "call" && p.id === cid ? { ...p, ...done } : p)) }
                    : { ...ex, calls: ex.calls.map((c) => (c.id === cid ? { ...c, ...done } : c)) }
            );
            return { text, line: exec.line, stopped, error: exec.error };
        },
        [store, update]
    );

    // the mascot chat (or the SO-101 console) can drive the Moveo through the bridge while it is on the page
    useEffect(
        () =>
            registerMoveo({
                runTool(call) {
                    if (chatEx.current === null) {
                        const id = nextId.current++;
                        chatEx.current = id;
                        add({ id, source: "mascot", you: "", reply: "", notes: [], calls: [], live: true, parts: [] });
                    }
                    return runCall(call, chatEx.current, true);
                },
            }),
        [add, runCall]
    );

    const stopAll = useCallback(() => {
        agentAbort.current?.abort();
        store.stop();
    }, [store]);

    const runScripted = useCallback(
        (text: string, into?: number) => {
            const m = matchMoveo(text);
            const id = into ?? nextId.current++;
            const ex: Exchange = { id, source: "prompt", you: text, reply: m ? m.reply : MOVEO_HELP, notes: [], calls: [] };
            if (into === undefined) add(ex);
            else update(into, () => ({ ...ex, notes: getAgentStatus() ? [FALLBACK_NOTE] : [] }));
            if (m) void runCall(m.call, id, false);
        },
        [add, runCall, update]
    );

    const askClaude = useCallback(
        async (text: string) => {
            const id = nextId.current++;
            add({ id, source: "prompt", you: text, reply: "", notes: [], calls: [], live: true, parts: [], pending: true });
            const ac = new AbortController();
            agentAbort.current = ac;
            setAgentBusy(true);
            const user: UserTextMessage = {
                role: "user",
                text,
                surface: "moveo",
                arm: getArm() !== null,
                moveo: true,
                page: window.location.pathname,
            };
            const addText = (key: string, d: string, kind: "text" | "note") =>
                update(id, (ex) => {
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
                        const fail = (line: string, result: string): ToolOutcome => {
                            update(id, (ex) => ({
                                ...ex,
                                pending: false,
                                parts: [...(ex.parts ?? []), { kind: "call", key: `x${block.id}`, id: -1, line, result, error: true }],
                            }));
                            return { content: result, is_error: true };
                        };
                        if (!call) return fail(`${block.name}(…)`, `invalid input: ${error}`);
                        if (isMoveoCall(call)) {
                            const res = await runCall(call, id, true);
                            return { content: res.text, ...(res.error ? { is_error: true } : {}) };
                        }
                        // an SO-101 tool asked from here: run it on the page's SO-101 if there is one
                        const arm = getArm();
                        if (!arm) return fail(formatCall(call), "The SO-101 arm isn't on this page (it's on the home page, /#arm).");
                        const res = await arm.runTool(call, "prompt", `moveo-${id}`);
                        update(id, (ex) => ({
                            ...ex,
                            parts: [
                                ...(ex.parts ?? []),
                                { kind: "call", key: `s${block.id}`, id: -1, line: res.line, result: res.text.split("\n")[0] },
                            ],
                        }));
                        return { content: res.text };
                    },
                },
            });
            history.current = r.history;
            if (agentAbort.current === ac) agentAbort.current = null;
            setAgentBusy(false);
            const note: Partial<Record<typeof r.end, string>> = {
                stopped: "stopped.",
                steps: "that took too many steps for one message, so Claude stopped there.",
                refusal: "Claude can't help with that one. Try pick and place, or ask it to turn the base.",
                truncated: "(reply cut short)",
                error: "the live connection dropped. Try again in a bit, or use the chips.",
            };
            const extra = note[r.end];
            if (r.end === "fallback") runScripted(text, id);
            else update(id, (ex) => ({ ...ex, pending: false, notes: extra ? [...ex.notes, extra] : ex.notes }));
        },
        [add, runCall, runScripted, update]
    );

    const onCommand = useCallback(
        (input: string, source: "prompt" | "chip" | "mascot") => {
            const text = input.trim().slice(0, 1000);
            chatEx.current = null;
            if (STOP.test(text)) {
                stopAll();
                return;
            }
            if (source === "prompt" && getAgentMode() !== "off") {
                if (agentAbort.current) return; // Claude is still working; "stop" interrupts
                void askClaude(text);
                return;
            }
            runScripted(text.slice(0, 200));
        },
        [askClaude, runScripted, stopAll]
    );

    useEffect(() => () => agentAbort.current?.abort(), []);

    const live = mode === "live";
    return (
        <ArmConsole
            exchanges={exchanges}
            onCommand={onCommand}
            busy={!!playing || agentBusy}
            live={live}
            turnstileRef={turnstileRef}
            chips={CHIPS}
            label="Moveo transcript"
            robot="moveo"
            placeholder={live ? "ask claude to move the moveo…" : "tell the moveo what to do…"}
            hint={
                live ? (
                    <>
                        ask in your own words, e.g.{" "}
                        <span className="text-foreground">run pick and place, then turn the base all the way left</span>
                    </>
                ) : (
                    <>
                        try <span className="text-foreground">pick and place</span>, <span className="text-foreground">home</span> or{" "}
                        <span className="text-foreground">turn the base to 90</span>
                    </>
                )
            }
        />
    );
}
