"use client";

import { type ReactNode, type RefObject, useEffect, useId, useRef, useState } from "react";
import { AgentText } from "@/components/agent/agent-text";
import { MicButton, SpeakerToggle } from "@/components/voice/voice-controls";
import { LIMITS } from "@/lib/agent/protocol";
import type { ArmSource } from "@/lib/arm/types";
import { cn } from "@/lib/utils";

export type CallLine = { id: number; line: string; result?: string; clamped?: string[]; stopped?: boolean; error?: boolean };

/** One piece of a live (Claude) exchange, in the order it happened. */
export type Part =
    | { kind: "text"; key: string; text: string }
    | { kind: "note"; key: string; text: string }
    | ({ kind: "call"; key: string } & CallLine);

export type Exchange = {
    id: number;
    source: ArmSource;
    you: string;
    reply: string;
    notes: string[];
    calls: CallLine[];
    /** answered by the live agent: render `parts` instead of reply + calls */
    live?: boolean;
    parts?: Part[];
    /** waiting for the first token */
    pending?: boolean;
};

export const CHIPS = ["wave", "nod", "garba", "look around", "pick up the cube", "rest", "left 200"] as const;

function Call({ c }: { c: CallLine }) {
    return (
        <div>
            <p className="break-words">
                <span aria-hidden className={cn(c.result === undefined ? "text-brand-ink" : "text-muted-foreground")}>
                    ⏺{" "}
                </span>
                {c.line}
            </p>
            {c.result !== undefined && (
                <p
                    title={c.result}
                    className={cn(
                        "pl-4 text-muted-foreground",
                        c.result.includes("\n") ? "whitespace-pre-wrap break-words" : "truncate",
                        c.error && "text-brand-ink"
                    )}
                >
                    <span aria-hidden>⎿ </span>
                    {c.result}
                </p>
            )}
            {c.clamped && c.clamped.length > 0 && (
                <p className="break-words pl-4 text-brand-ink">
                    <span aria-hidden>⎿ </span>clamped: {c.clamped.join("; ")}
                </p>
            )}
        </div>
    );
}

function Notes({ notes }: { notes: string[] }) {
    return (
        <>
            {notes.map((n) => (
                <p key={n} className="break-words pl-4 text-muted-foreground">
                    {n}
                </p>
            ))}
        </>
    );
}

function LiveExchange({ ex }: { ex: Exchange }) {
    return (
        <>
            {ex.you ? (
                <p className="break-words">
                    <span className="text-muted-foreground">you › </span>
                    {ex.you}
                </p>
            ) : (
                <p className="text-muted-foreground">via chat ›</p>
            )}
            {ex.pending && (
                <p className="text-muted-foreground">
                    <span>claude › </span>…
                </p>
            )}
            {ex.parts?.map((p) =>
                p.kind === "text" ? (
                    <p key={p.key} className="break-words">
                        <span className="text-muted-foreground">claude › </span>
                        <AgentText text={p.text} />
                    </p>
                ) : p.kind === "note" ? (
                    <p key={p.key} className="break-words pl-4 italic text-muted-foreground">
                        {p.text}
                    </p>
                ) : (
                    <Call key={p.key} c={p} />
                )
            )}
        </>
    );
}

/**
 * Claude-Code-style transcript + prompt box for the arm. Plain HTML: it renders on the server and works
 * without WebGL (call lines still appear one by one as the player runs).
 */
export function ArmConsole({
    exchanges,
    onCommand,
    busy,
    live = false,
    turnstileRef,
    chips = CHIPS,
    hint,
    placeholder,
    label = "Arm transcript",
    robot = "arm",
}: {
    exchanges: Exchange[];
    onCommand: (text: string, source: ArmSource) => void;
    /** the arm is moving or Claude is working: show the stop chip */
    busy: boolean;
    /** typed text goes to Claude */
    live?: boolean;
    /** where Cloudflare Turnstile may show a check, if it needs one */
    turnstileRef?: RefObject<HTMLDivElement>;
    /** example commands under the prompt (default: the SO-101's) */
    chips?: readonly string[];
    /** shown before the first exchange (default: the SO-101's examples) */
    hint?: ReactNode;
    placeholder?: string;
    label?: string;
    /** prefix of scripted replies, e.g. "arm ›" */
    robot?: string;
}) {
    const inputId = useId();
    const [text, setText] = useState("");
    const log = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = log.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [exchanges]);

    return (
        <div className="font-mono text-[12.5px] leading-relaxed">
            <div
                ref={log}
                role="log"
                aria-live="polite"
                aria-label={label}
                className="h-28 overflow-y-auto px-4 py-3 sm:h-32"
            >
                {exchanges.length === 0 ? (
                    hint ? (
                        <p className="text-muted-foreground">{hint}</p>
                    ) : live ? (
                        <p className="text-muted-foreground">
                            ask in your own words, e.g.{" "}
                            <span className="text-foreground">wave, then pick up the cube and put it on the left</span>
                        </p>
                    ) : (
                        <p className="text-muted-foreground">
                            try <span className="text-foreground">wave</span>, <span className="text-foreground">garba 2 times</span>{" "}
                            or <span className="text-foreground">left 200</span>. hindi works too:{" "}
                            <span className="text-foreground">हाथ हिलाओ</span>
                        </p>
                    )
                ) : (
                    exchanges.map((ex) => (
                        <div key={ex.id} className="mb-2.5 last:mb-0">
                            {ex.live ? (
                                <LiveExchange ex={ex} />
                            ) : (
                                <>
                                    <p className="break-words">
                                        <span className="text-muted-foreground">you › </span>
                                        {ex.you}
                                    </p>
                                    <p className="break-words">
                                        <span className="text-muted-foreground">{robot} › </span>
                                        {ex.reply}
                                    </p>
                                    <Notes notes={ex.notes} />
                                    {ex.calls.map((c) => (
                                        <Call key={c.id} c={c} />
                                    ))}
                                </>
                            )}
                            {ex.live && <Notes notes={ex.notes} />}
                        </div>
                    ))
                )}
            </div>

            <div ref={turnstileRef} className="px-4 empty:hidden" />

            <form
                className="border-t border-border px-3 py-2.5"
                onSubmit={(e) => {
                    e.preventDefault();
                    const t = text.trim();
                    if (!t) return;
                    onCommand(t, "prompt");
                    setText("");
                }}
            >
                <label htmlFor={inputId} className="sr-only">
                    {live ? "Ask Claude to move the arm" : "Command the arm"}
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:border-foreground/40">
                    <span aria-hidden className="text-brand-ink">
                        ›
                    </span>
                    <input
                        id={inputId}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        maxLength={live ? LIMITS.userText : 200}
                        autoComplete="off"
                        spellCheck={false}
                        enterKeyHint="send"
                        placeholder={placeholder ?? (live ? "ask claude to move the arm…" : "ask the arm to do something…")}
                        className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
                    />
                    <SpeakerToggle />
                    <MicButton
                        onInterim={setText}
                        onFinal={(t) => {
                            onCommand(t, "prompt");
                            setText("");
                        }}
                    />
                    <button
                        type="submit"
                        aria-label="Send command"
                        className="rounded px-1 text-muted-foreground transition-colors hover:text-foreground"
                    >
                        ↵
                    </button>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Example commands">
                    {chips.map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => onCommand(c, "chip")}
                            className="rounded-full border border-border px-2.5 py-0.5 text-[11.5px] text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted hover:text-foreground"
                        >
                            {c}
                        </button>
                    ))}
                    {/* always laid out (no shift); only visible while the arm is moving or Claude is working */}
                    <button
                        type="button"
                        onClick={() => onCommand("stop", "chip")}
                        className={cn(
                            "rounded-full border border-border px-2.5 py-0.5 text-[11.5px] text-brand-ink transition-colors hover:bg-muted",
                            !busy && "invisible"
                        )}
                    >
                        stop
                    </button>
                </div>
            </form>
        </div>
    );
}
