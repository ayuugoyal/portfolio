"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { FRAMES, toPaths } from "@/lib/mascot-sprite";
import { getSpeechNow, isSpeaking, subscribeSpeaking } from "@/lib/voice/speech";
import { cn } from "@/lib/utils";

/** rows 4-5 are the eyes; the walk frames have them shifted one pixel toward the travel direction */
const withSideEyes = (frame: string[]) => frame.map((row, i) => (i === 4 || i === 5 ? FRAMES.walk1[i] : row));

const FACES = {
    idle: toPaths(FRAMES.idle),
    blink: toPaths(FRAMES.blink),
    talk: toPaths(FRAMES.talk),
    happy: toPaths(FRAMES.happy),
    wink: toPaths(FRAMES.wink),
    think: toPaths(FRAMES.look),
    side: toPaths(withSideEyes(FRAMES.idle)),
    sideTalk: toPaths(withSideEyes(FRAMES.talk)),
} as const;
type Face = keyof typeof FACES;

export type StageMood = "idle" | "thinking" | "answering";

const emptyNow = { line: "", word: 0, wordAt: 0, boundaries: false };

/**
 * Claude, as a character: a big pixel face that looks toward the pointer, blinks, thinks (eyes up, dots)
 * while waiting, and moves its mouth in time with the spoken words (word boundaries from the speech engine,
 * or a steady flap when the voice doesn't report them). The sentence being spoken shows as a caption.
 */
export function ClaudeStage({ mood, still, compact = false }: { mood: StageMood; still: boolean; compact?: boolean }) {
    const speaking = useSyncExternalStore(subscribeSpeaking, isSpeaking, () => false);
    const now = useSyncExternalStore(subscribeSpeaking, getSpeechNow, () => emptyNow);
    const [face, setFace] = useState<Face>("happy");
    const [lookLeft, setLookLeft] = useState(false);
    const [lookSide, setLookSide] = useState(false);
    const root = useRef<HTMLDivElement>(null);
    const nowRef = useRef(now);
    nowRef.current = now;

    // look toward the pointer
    useEffect(() => {
        if (still) return;
        const onMove = (e: PointerEvent) => {
            const r = root.current?.getBoundingClientRect();
            if (!r) return;
            const dx = e.clientX - (r.left + r.width / 2);
            setLookSide(Math.abs(dx) > r.width * 0.6);
            setLookLeft(dx < 0);
        };
        window.addEventListener("pointermove", onMove);
        return () => window.removeEventListener("pointermove", onMove);
    }, [still]);

    // the face loop
    useEffect(() => {
        if (still) {
            setFace(speaking ? "talk" : "idle");
            return;
        }
        let blinkUntil = 0;
        let nextBlink = performance.now() + 1800;
        const t = window.setInterval(() => {
            const n = performance.now();
            if (n > nextBlink) {
                blinkUntil = n + 140;
                nextBlink = n + 2500 + Math.random() * 3000;
            }
            const s = nowRef.current;
            let next: Face;
            if (speaking) {
                const open = s.boundaries ? n - s.wordAt < 170 : Math.floor(n / 150) % 2 === 0;
                next = open ? (lookSide ? "sideTalk" : "talk") : lookSide ? "side" : "idle";
            } else if (mood === "thinking") next = "think";
            else if (n < blinkUntil) next = "blink";
            else if (mood === "answering") next = "happy";
            else next = lookSide ? "side" : "idle";
            setFace((f) => (f === next ? f : next));
        }, 50);
        return () => window.clearInterval(t);
    }, [speaking, mood, lookSide, still]);

    const p = FACES[face];
    const flip = lookSide && lookLeft;
    return (
        <div ref={root} className="flex flex-col items-center text-center">
            <div className={cn("relative grid place-items-center", compact ? "size-11" : "size-44 md:size-56")}>
                {/* voice rings while speaking, a soft glow otherwise */}
                <span aria-hidden className="absolute inset-[12%] rounded-full bg-brand/10 blur-xl" />
                {speaking && !still && (
                    <>
                        <span aria-hidden className="absolute inset-[18%] animate-ping rounded-full border-2 border-brand/30" />
                        <span
                            aria-hidden
                            className="absolute inset-[6%] animate-ping rounded-full border border-brand/20"
                            style={{ animationDelay: "0.35s", animationDuration: "1.6s" }}
                        />
                    </>
                )}
                {mood === "thinking" && !speaking && !still && (
                    <span aria-hidden className="absolute -top-1 right-[14%] flex gap-1">
                        {[0, 1, 2].map((i) => (
                            <span
                                key={i}
                                className="size-2 animate-bounce bg-brand/70"
                                style={{ animationDelay: `${i * 0.15}s` }}
                            />
                        ))}
                    </span>
                )}
                <svg
                    aria-hidden
                    viewBox="0 0 12 12"
                    shapeRendering="crispEdges"
                    className={cn(
                        "relative drop-shadow-[0_6px_0_hsl(var(--brand)/0.18)]",
                        compact ? "size-9" : "size-36 md:size-44",
                        !still && (speaking ? "animate-mascot-bob [animation-duration:0.9s]" : "animate-mascot-bob")
                    )}
                    style={{ transform: flip ? "scaleX(-1)" : undefined }}
                >
                    <path d={p.brand} className="fill-brand" />
                    <path d={p.visor} className="fill-[hsl(var(--mascot-visor))]" />
                    <path d={p.eye} className="fill-[hsl(var(--mascot-eye))]" />
                </svg>
            </div>
            {!compact && (
                <>
                    <p className="mt-3 font-pixel text-xs uppercase tracking-widest text-brand-ink">claude</p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                        {speaking ? "speaking" : mood === "thinking" ? "thinking…" : "here to tell you about ayush"}
                    </p>
                    <p
                        aria-hidden
                        className={cn(
                            "mt-4 min-h-[4.5rem] max-w-xs text-balance font-display text-lg leading-snug transition-opacity duration-300",
                            speaking && now.line ? "opacity-100" : "opacity-0"
                        )}
                    >
                        {now.line ? `“${now.line.trim()}”` : " "}
                    </p>
                </>
            )}
        </div>
    );
}
