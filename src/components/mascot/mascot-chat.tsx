"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
    useCallback,
    useEffect,
    useId,
    useRef,
    useState,
    useSyncExternalStore,
    type RefObject,
} from "react";
import { AgentText } from "@/components/agent/agent-text";
import {
    type ToolOutcome,
    getAgentMode,
    getAgentStatus,
    isCheckingHuman,
    loadAgentStatus,
    runAgentTurn,
    subscribeAgentMode,
    warmSession,
} from "@/lib/agent/client";
import { type ClientMessage, LIMITS } from "@/lib/agent/protocol";
import { getArm, matchArmIntent } from "@/lib/arm/bridge";
import { formatCall } from "@/lib/arm/format";
import { NO_MOVEO, getMoveo } from "@/lib/moveo/bridge";
import { formatMoveoCall, isMoveoCall } from "@/lib/moveo/tools";
import { CHIPS, answer, type MatchContext, type ReplyLink } from "@/lib/mascot/matcher";
import { useArmPresent } from "./use-mascot-env";
import { MicButton, SpeakerToggle, useVoiceOn } from "@/components/voice/voice-controls";
import { FRAMES, toPaths, type FrameName } from "@/lib/mascot-sprite";
import { enableVoiceByDefault, isSpeaking, speak, stopSpeaking, subscribeSpeaking } from "@/lib/voice/speech";
import { ClaudeStage } from "./claude-stage";

type Who = "you" | "bot" | "arm" | "call" | "result" | "note";
/** live: a Claude reply (rendered with the link allow-list) */
type Msg = { id: number; who: Who; text: string; links?: ReplyLink[]; live?: boolean };

const MAX_MESSAGES = 40;
const FALLBACK_NOTE = "live answers are unavailable right now, so the scripted bot answered.";
const LIVE_GREETING =
    "Hi! I'm Claude, answering for Ayush from this site's content. Ask about his work or robots, or paste a job description to see how he fits.";

const ctx = (): MatchContext => ({
    armAvailable: getArm() !== null,
    matchArm: (t) => matchArmIntent(t, { strict: true }),
});

function MsgLink({ link }: { link: ReplyLink }) {
    const cls = "text-brand-ink underline underline-offset-2 hover:no-underline";
    if (link.href.startsWith("/"))
        return (
            <Link href={link.href} className={cls}>
                {link.label}
            </Link>
        );
    if (link.href.startsWith("mailto:"))
        return (
            <a href={link.href} className={cls}>
                {link.label}
            </a>
        );
    return (
        <a href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>
            {link.label}
        </a>
    );
}

const FACE = { idle: toPaths(FRAMES.idle), blink: toPaths(FRAMES.blink), talk: toPaths(FRAMES.talk), happy: toPaths(FRAMES.happy) } as const;

/** Three bouncing dots while the bot is thinking. */
function TypingDots() {
    return (
        <span className="inline-flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border bg-background px-3 py-2.5" aria-label="typing">
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="size-1.5 rounded-full bg-muted-foreground/70 motion-safe:animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                />
            ))}
        </span>
    );
}

/** Claude's small face next to its replies. */
function MiniClaude() {
    const p = FACE.idle;
    return (
        <span aria-hidden className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-brand/10">
            <svg viewBox="0 0 12 12" shapeRendering="crispEdges" className="size-5">
                <path d={p.brand} className="fill-brand" />
                <path d={p.visor} className="fill-[hsl(var(--mascot-visor))]" />
                <path d={p.eye} className="fill-[hsl(var(--mascot-eye))]" />
            </svg>
        </span>
    );
}

/** One message, laid out like the Claude app: the visitor in a soft bubble on the right, Claude as plain text. */
function Bubble({ m }: { m: Msg }) {
    if (m.who === "note") return <p className="pl-10 font-mono text-[11px] italic text-muted-foreground">{m.text}</p>;
    if (m.who === "call" || m.who === "result")
        return (
            <p
                className={`ml-10 max-w-full break-words rounded-md bg-muted/60 px-2.5 py-1 font-mono text-[11.5px] text-muted-foreground ${m.who === "result" ? "-mt-3 ml-14" : ""}`}
            >
                <span aria-hidden className={m.who === "call" ? "text-brand-ink" : ""}>
                    {m.who === "call" ? "⏺ " : "⎿ "}
                </span>
                {m.text}
            </p>
        );
    if (m.who === "you")
        return <div className="max-w-[85%] break-words rounded-2xl bg-muted px-4 py-2.5 text-[15px]">{m.text}</div>;
    return (
        <div className="flex max-w-full gap-3">
            <MiniClaude />
            <div className="min-w-0 break-words font-display text-[17px] leading-relaxed">
                {m.who === "arm" && <span className="mr-1 font-mono text-xs text-brand-ink">arm ›</span>}
                {m.live ? <AgentText text={m.text} /> : m.text}
                {m.links && m.links.length > 0 && (
                    <span className="mt-2 flex flex-wrap gap-1.5 font-sans text-xs">
                        {m.links.map((l) => (
                            <span key={l.href} className="rounded-full border border-border px-2.5 py-1">
                                <MsgLink link={l} />
                            </span>
                        ))}
                    </span>
                )}
            </div>
        </div>
    );
}

export default function MascotChat({
    open,
    onClose,
    onTyping,
}: {
    open: boolean;
    /** returnFocus: move focus back to the mascot */
    onClose: (returnFocus: boolean) => void;
    /** where the mascot is (the chat used to pop up above it; it now covers the screen) */
    anchorX?: number;
    anchorBottom?: number;
    mascotRef?: RefObject<HTMLButtonElement>;
    onTyping?: (typing: boolean) => void;
}) {
    const reduced = useReducedMotion() ?? false;
    const armPresent = useArmPresent();
    const mode = useSyncExternalStore(subscribeAgentMode, getAgentMode, () => "unknown" as const);
    const live = mode === "live";
    const titleId = useId();
    const inputId = useId();
    const panelRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const jdRef = useRef<HTMLTextAreaElement>(null);
    const logRef = useRef<HTMLDivElement>(null);
    const turnstileRef = useRef<HTMLDivElement>(null);
    const nextId = useRef(1);
    const timer = useRef<number | undefined>(undefined);
    const history = useRef<ClientMessage[]>([]);
    const agentAbort = useRef<AbortController | null>(null);
    const [value, setValue] = useState("");
    const [jd, setJd] = useState(false);
    const [jdText, setJdText] = useState("");
    const [typing, setTyping] = useState(false);
    const [agentBusy, setAgentBusy] = useState(false);
    const speaking = useSyncExternalStore(subscribeSpeaking, isSpeaking, () => false);
    const voiceOn = useVoiceOn();
    const greeted = useRef(false);
    const [messages, setMessages] = useState<Msg[]>(() => {
        const hello = answer("hi", ctx());
        return hello ? [{ id: 0, who: "bot", text: hello.text }] : [];
    });
    const messagesRef = useRef(messages);
    messagesRef.current = messages;

    const checkingHuman = useSyncExternalStore(subscribeAgentMode, isCheckingHuman, () => false);

    // the chat is open: get the live agent ready (status, then the Turnstile check) before the first question
    useEffect(() => {
        if (!open) return;
        void loadAgentStatus().then((s) => {
            if (s) void warmSession(turnstileRef.current);
        });
    }, [open]);

    // opening the chat is a click, so the browser lets it speak: voice on (unless muted before) and say hello
    useEffect(() => {
        if (!open) return;
        enableVoiceByDefault();
        if (greeted.current) return;
        greeted.current = true;
        const t = window.setTimeout(() => {
            const first = messagesRef.current[0];
            if (first?.id === 0) speak(first.text);
        }, 250);
        return () => window.clearTimeout(t);
    }, [open]);

    // live: swap the scripted greeting while it is still the only message
    useEffect(() => {
        if (!live) return;
        setMessages((m) => (m.length === 1 && m[0].id === 0 ? [{ id: 0, who: "bot", text: LIVE_GREETING, live: true }] : m));
    }, [live]);

    const push = useCallback((add: Omit<Msg, "id">[]): number[] => {
        const ids = add.map(() => nextId.current++);
        setMessages((m) => [...m, ...add.map((a, i) => ({ ...a, id: ids[i] }))].slice(-MAX_MESSAGES));
        return ids;
    }, []);

    const appendTo = useCallback((id: number, d: string) => {
        setMessages((m) => m.map((x) => (x.id === id ? { ...x, text: x.text + d } : x)));
    }, []);

    const setBusy = useCallback(
        (b: boolean) => {
            setTyping(b);
            onTyping?.(b);
        },
        [onTyping],
    );

    /** The scripted brain (also the live agent's fallback). */
    const answerScripted = useCallback(
        (text: string) => {
            const r = answer(text, ctx());
            if (!r) return;
            if (r.kind === "arm") {
                const d = getArm()?.run(text, "mascot");
                if (d) {
                    push([{ who: "arm", text: d.reply }, ...d.calls.map((c) => ({ who: "call" as const, text: c }))]);
                    speak(d.reply);
                    return;
                }
                // the arm unmounted while we were "typing"
                const elsewhere = answer(text, { ...ctx(), armAvailable: false });
                if (elsewhere) {
                    push([{ who: "bot", text: elsewhere.text, links: elsewhere.links }]);
                    speak(elsewhere.text);
                }
                return;
            }
            push([{ who: "bot", text: r.text, links: r.links }]);
            speak(r.text);
        },
        [push],
    );

    /** One message to Claude, with its tool loop (arm tools run on the page's arm, if there is one). */
    const sendLive = useCallback(
        async (text: string, isJd: boolean) => {
            const ac = new AbortController();
            agentAbort.current = ac;
            setAgentBusy(true);
            setBusy(true);
            const streams = new Map<string, number>(); // `${round}.${block}` -> message id
            const stream = (key: string, who: "bot" | "note", d: string) => {
                setBusy(false);
                const id = streams.get(key);
                if (id === undefined) streams.set(key, push([{ who, text: d, live: who === "bot" }])[0]);
                else appendTo(id, d);
            };
            const turn = `chat-${nextId.current}`;
            const r = await runAgentTurn({
                history: history.current,
                user: {
                    role: "user",
                    text,
                    surface: "chat",
                    arm: getArm() !== null,
                    moveo: getMoveo() !== null,
                    page: window.location.pathname,
                    ...(isJd ? { jd: true } : {}),
                },
                signal: ac.signal,
                turnstileHost: () => turnstileRef.current,
                hooks: {
                    text: (round, i, d) => stream(`t${round}.${i}`, "bot", d),
                    note: (round, i, d) => stream(`n${round}.${i}`, "note", d),
                    runTool: async (block, call, error): Promise<ToolOutcome> => {
                        setBusy(false);
                        const arm = getArm();
                        if (!call) {
                            push([{ who: "call", text: `${block.name}(…)` }, { who: "result", text: `invalid input: ${error}` }]);
                            return { content: "", is_error: true };
                        }
                        if (isMoveoCall(call)) {
                            push([{ who: "call", text: formatMoveoCall(call) }]);
                            const moveo = getMoveo();
                            if (!moveo) {
                                push([{ who: "result", text: "no moveo on this page" }]);
                                return { content: NO_MOVEO, is_error: true };
                            }
                            const res = await moveo.runTool(call);
                            const first = res.text.split("\n")[0];
                            push([{ who: "result", text: first.length > 140 ? `${first.slice(0, 139)}…` : first }]);
                            return { content: res.text, ...(res.error ? { is_error: true } : {}) };
                        }
                        push([{ who: "call", text: formatCall(call) }]);
                        if (!arm) {
                            push([{ who: "result", text: "no arm on this page" }]);
                            return {
                                content: "No arm on this page. The 3D arm is on the home page (/#arm) and /robotics.",
                                is_error: true,
                            };
                        }
                        const res = await arm.runTool(call, "mascot", turn);
                        const first = res.text.split("\n")[0];
                        push([{ who: "result", text: first.length > 140 ? `${first.slice(0, 139)}…` : first }]);
                        return { content: res.text };
                    },
                },
            });
            history.current = r.history;
            if (agentAbort.current === ac) agentAbort.current = null;
            setAgentBusy(false);
            setBusy(false);
            if (r.end === "fallback") {
                // the note only when live mode had been on (not when it was never configured)
                if (getAgentStatus()) push([{ who: "note", text: FALLBACK_NOTE }]);
                if (isJd)
                    push([
                        {
                            who: "bot",
                            text: "Matching a job description needs the live assistant. Meanwhile, the resume and a quick call cover it.",
                            links: [
                                { label: "resume", href: "/resume" },
                                { label: "book a call", href: "https://cal.com/ayuugoyal" },
                            ],
                        },
                    ]);
                else answerScripted(text);
                return;
            }
            const note: Partial<Record<typeof r.end, string>> = {
                steps: "that took too many steps for one message, so I stopped there.",
                refusal: "I can't help with that one. Ask me about Ayush's work, robots, or hiring him.",
                truncated: "(reply cut short)",
                error: "the live connection dropped. Try again in a bit.",
            };
            if (note[r.end]) push([{ who: "note", text: note[r.end] as string }]);
        },
        [answerScripted, appendTo, push, setBusy],
    );

    const send = useCallback(
        (raw: string, isJd = false) => {
            if (agentAbort.current) return; // one live turn at a time
            const text = raw.trim().slice(0, isJd ? LIMITS.jdText : getAgentMode() === "off" ? 200 : LIMITS.userText);
            if (!text) return;
            push([{ who: "you", text: isJd ? `pasted a job description (${text.length.toLocaleString()} characters)` : text }]);
            setValue("");
            if (isJd) {
                setJdText("");
                setJd(false);
            }
            window.clearTimeout(timer.current);
            if (getAgentMode() !== "off") {
                void sendLive(text, isJd);
                return;
            }
            setBusy(true);
            timer.current = window.setTimeout(
                () => {
                    setBusy(false);
                    answerScripted(text);
                },
                reduced ? 0 : 300,
            );
        },
        [answerScripted, push, reduced, sendLive, setBusy],
    );

    useEffect(
        () => () => {
            window.clearTimeout(timer.current);
            agentAbort.current?.abort();
        },
        [],
    );

    // focus the input on open
    useEffect(() => {
        if (open) inputRef.current?.focus({ preventScroll: true });
    }, [open]);
    useEffect(() => {
        if (jd) jdRef.current?.focus({ preventScroll: true });
    }, [jd]);

    // keep the newest message in view
    useEffect(() => {
        const el = logRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [messages, typing, open]);

    // Esc closes; the page behind doesn't scroll while the chat covers it
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                onClose(true);
            }
        };
        document.addEventListener("keydown", onKey);
        const overflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.documentElement.style.overflow = overflow;
        };
    }, [open, onClose]);

    // closing mid-reply: stop talking (the mascot's mouth and the voice)
    useEffect(() => {
        if (open) return;
        onTyping?.(false);
        stopSpeaking();
    }, [open, onTyping]);

    const chipCls =
        "rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";
    const starters = [
        "What has Ayush built with robots?",
        armPresent ? "Make the arm wave" : "What does a forward deployed engineer do for me?",
        "Is he open to remote roles?",
        "How do I hire him?",
    ];
    const fresh = messages.length <= 1;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    ref={panelRef}
                    id="mascot-chat"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={titleId}
                    initial={{ opacity: 0, scale: reduced ? 1 : 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: reduced ? 1 : 0.98 }}
                    transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                    className="fixed inset-0 z-[70] flex flex-col bg-background text-foreground print:hidden"
                >
                    {/* ── top bar ── */}
                    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border px-4 sm:px-6">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="md:hidden">
                                <ClaudeStage mood={typing ? "thinking" : "idle"} still={reduced} compact />
                            </span>
                            <div className="min-w-0">
                                <h2 id={titleId} className="truncate font-display text-lg font-medium leading-tight">
                                    Claude <span className="text-muted-foreground">· about Ayush</span>
                                </h2>
                                <p className="flex items-center gap-1.5 truncate font-mono text-[11px] text-muted-foreground">
                                    <span
                                        aria-hidden
                                        className={`inline-block size-1.5 ${typing || speaking ? "bg-brand motion-safe:animate-pulse" : "bg-emerald-500"}`}
                                    />
                                    {typing ? "thinking…" : speaking ? "speaking…" : live ? "online · answers from this site" : "online · scripted from this site"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <SpeakerToggle className={voiceOn ? "" : "motion-safe:animate-pulse"} />
                            <button
                                type="button"
                                onClick={() => onClose(true)}
                                aria-label="Close chat"
                                className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                    <path d="M4 4l8 8M12 4l-8 8" />
                                </svg>
                            </button>
                        </div>
                    </header>

                    <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                        {/* ── Claude, the character ── */}
                        <aside className="relative hidden flex-col items-center justify-center overflow-hidden border-r border-border bg-card px-6 md:flex">
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(hsl(var(--border))_1px,transparent_1px)] [background-size:18px_18px]"
                            />
                            <ClaudeStage mood={typing ? "thinking" : "idle"} still={reduced} />
                        </aside>

                        {/* ── the conversation ── */}
                        <section className="flex min-h-0 flex-col">
                            <div
                                ref={logRef}
                                role="log"
                                aria-live="polite"
                                aria-label="Conversation"
                                className="min-h-0 flex-1 overflow-y-auto"
                            >
                                <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6 sm:px-6">
                                    <AnimatePresence initial={false}>
                                        {messages.map((m) => (
                                            <motion.div
                                                key={m.id}
                                                layout={reduced ? false : "position"}
                                                initial={reduced ? false : { opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                                                className={m.who === "you" ? "flex justify-end" : "flex justify-start"}
                                            >
                                                <Bubble m={m} />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {typing && (
                                        <div className="flex items-center gap-3">
                                            <MiniClaude />
                                            <TypingDots />
                                            {checkingHuman && (
                                                <span className="font-mono text-[11px] text-muted-foreground">
                                                    quick check that you&apos;re human…
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {fresh && !typing && (
                                        <div className="grid gap-2 pt-2 sm:grid-cols-2">
                                            {starters.map((q) => (
                                                <button
                                                    key={q}
                                                    type="button"
                                                    onClick={() => send(q)}
                                                    disabled={agentBusy}
                                                    className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground disabled:opacity-50"
                                                >
                                                    {q}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div ref={turnstileRef} className="mx-auto w-full max-w-2xl px-4 empty:hidden sm:px-6" />

                            {/* ── composer ── */}
                            <div className="mx-auto w-full max-w-2xl px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 sm:px-6">
                                {jd ? (
                                    <form
                                        className="rounded-2xl border border-border bg-card p-3 shadow-sm"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            send(jdText, true);
                                        }}
                                    >
                                        <label htmlFor={`${inputId}-jd`} className="mb-1.5 block font-mono text-xs text-muted-foreground">
                                            paste the job description: Claude maps each requirement to Ayush&apos;s work on this site
                                        </label>
                                        <textarea
                                            ref={jdRef}
                                            id={`${inputId}-jd`}
                                            value={jdText}
                                            onChange={(e) => setJdText(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                                    e.preventDefault();
                                                    send(jdText, true);
                                                }
                                            }}
                                            maxLength={LIMITS.jdText}
                                            rows={6}
                                            placeholder="role, responsibilities, requirements…"
                                            className="block w-full resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                                        />
                                        <div className="flex items-center justify-between gap-2 pt-2 font-mono text-xs">
                                            <span className="text-muted-foreground">
                                                {jdText.length.toLocaleString()} / {LIMITS.jdText.toLocaleString()}
                                            </span>
                                            <span className="flex gap-1.5">
                                                <button type="button" onClick={() => setJd(false)} className={chipCls}>
                                                    cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={!jdText.trim() || agentBusy}
                                                    className="rounded-full bg-brand px-3 py-1.5 text-brand-foreground disabled:opacity-50"
                                                >
                                                    check fit ↵
                                                </button>
                                            </span>
                                        </div>
                                    </form>
                                ) : (
                                    <form
                                        className="flex items-center gap-2 rounded-2xl border border-border bg-card py-2 pl-4 pr-2 shadow-sm focus-within:border-foreground/30"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            send(value);
                                        }}
                                    >
                                        <label htmlFor={inputId} className="sr-only">
                                            Ask Claude about Ayush
                                        </label>
                                        <input
                                            ref={inputRef}
                                            id={inputId}
                                            type="text"
                                            value={value}
                                            onChange={(e) => setValue(e.target.value)}
                                            maxLength={live ? LIMITS.userText : 200}
                                            autoComplete="off"
                                            enterKeyHint="send"
                                            placeholder={armPresent ? "Ask about Ayush, or tell the arm what to do…" : "Ask about Ayush…"}
                                            className="min-w-0 flex-1 bg-transparent py-1.5 text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
                                        />
                                        <MicButton
                                            onInterim={setValue}
                                            onFinal={(t) => {
                                                if (!agentBusy) send(t);
                                            }}
                                        />
                                        <button
                                            type="submit"
                                            aria-label="Send"
                                            disabled={agentBusy || !value.trim()}
                                            className="grid size-9 place-items-center rounded-xl bg-brand text-brand-foreground transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
                                        >
                                            <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" />
                                            </svg>
                                        </button>
                                    </form>
                                )}

                                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 font-mono text-xs">
                                    {live && !jd && (
                                        <button
                                            type="button"
                                            onClick={() => setJd(true)}
                                            disabled={agentBusy}
                                            className={`${chipCls} border-brand/40 text-brand-ink`}
                                        >
                                            paste a job description
                                        </button>
                                    )}
                                    {CHIPS.map((c) => (
                                        <button key={c} type="button" onClick={() => send(c)} disabled={agentBusy} className={chipCls}>
                                            {c}
                                        </button>
                                    ))}
                                </div>
                                <p className="mt-2 text-center font-mono text-[10px] lowercase text-muted-foreground">
                                    {live
                                        ? "claude answers from this site's content · messages go to anthropic's api, not stored by this site · esc to close"
                                        : "scripted from this site · nothing is sent anywhere · esc to close"}
                                </p>
                            </div>
                        </section>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
