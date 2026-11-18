"use client";

import { Mic, Square, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { isVoiceOn, setVoiceOn, speechSupported, stopSpeaking, subscribeVoice } from "@/lib/voice/speech";

type Recognition = {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
    onerror: (() => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
};

function recognitionCtor(): (new () => Recognition) | null {
    if (typeof window === "undefined") return null;
    const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useVoiceOn(): boolean {
    return useSyncExternalStore(subscribeVoice, isVoiceOn, () => false);
}

/**
 * Talk instead of typing. Shows words in the input as you speak (onInterim) and sends on the final result.
 * Using the mic turns voice mode on, so replies are read aloud. Hidden where the browser can't do speech.
 */
export function MicButton({
    onInterim,
    onFinal,
    className,
}: {
    onInterim: (text: string) => void;
    onFinal: (text: string) => void;
    className?: string;
}) {
    const [supported, setSupported] = useState(false);
    const [listening, setListening] = useState(false);
    const rec = useRef<Recognition | null>(null);

    useEffect(() => setSupported(!!recognitionCtor()), []);
    useEffect(() => () => rec.current?.stop(), []);

    if (!supported) return null;

    const start = () => {
        const Ctor = recognitionCtor();
        if (!Ctor) return;
        stopSpeaking();
        const r = new Ctor();
        r.lang = navigator.language || "en-US";
        r.interimResults = true;
        r.continuous = false;
        let finalText = "";
        r.onresult = (e) => {
            let interim = "";
            for (let i = 0; i < e.results.length; i++) {
                const res = e.results[i];
                if (res.isFinal) finalText += res[0].transcript;
                else interim += res[0].transcript;
            }
            onInterim((finalText + interim).trim());
        };
        r.onerror = () => setListening(false);
        r.onend = () => {
            setListening(false);
            rec.current = null;
            const t = finalText.trim();
            if (t) {
                if (speechSupported()) setVoiceOn(true);
                onFinal(t);
            }
        };
        rec.current = r;
        setListening(true);
        r.start();
    };

    return (
        <button
            type="button"
            onClick={() => (listening ? rec.current?.stop() : start())}
            aria-label={listening ? "Stop listening" : "Speak instead of typing"}
            aria-pressed={listening}
            title={listening ? "listening… tap to stop" : "talk"}
            className={cn(
                "relative grid size-7 shrink-0 place-items-center rounded-md transition-colors",
                listening ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:text-foreground",
                className
            )}
        >
            {listening && (
                <span aria-hidden className="absolute inset-0 animate-ping rounded-md bg-brand/40 motion-reduce:animate-none" />
            )}
            {listening ? <Square className="relative size-3" /> : <Mic className="size-3.5" />}
        </button>
    );
}

/** Speaker toggle: shows while voice mode is on, so replies can be muted. */
export function SpeakerToggle({ className }: { className?: string }) {
    const on = useVoiceOn();
    const [supported, setSupported] = useState(false);
    useEffect(() => setSupported(speechSupported()), []);
    if (!supported) return null;
    return (
        <button
            type="button"
            onClick={() => setVoiceOn(!on, true)}
            aria-label={on ? "Mute spoken replies" : "Read replies aloud"}
            aria-pressed={on}
            title={on ? "replies are read aloud" : "read replies aloud"}
            className={cn(
                "grid size-7 shrink-0 place-items-center rounded-md transition-colors",
                on ? "text-brand-ink" : "text-muted-foreground hover:text-foreground",
                className
            )}
        >
            {on ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
        </button>
    );
}
