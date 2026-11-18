/**
 * Voice mode: replies read aloud with the browser's own speech engine (free, no API calls).
 * On by default once the visitor opens the chat (a click, so the browser allows audio) unless they muted it
 * before; the speaker toggle mutes it and that choice is remembered. Browser-only module.
 */

let voiceOn = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
const MUTED_KEY = "voice-muted";

let speaking = false;
const speakingListeners = new Set<() => void>();
const setSpeaking = (on: boolean) => {
    if (speaking === on) return;
    speaking = on;
    speakingListeners.forEach((l) => l());
};
/** true while a reply is being read aloud (the mascot moves its mouth) */
export const isSpeaking = (): boolean => speaking;

/** What is being said right now (one sentence-sized piece) and a counter bumped on every spoken word. */
export type SpeechNow = { line: string; word: number; wordAt: number; boundaries: boolean };
let now: SpeechNow = { line: "", word: 0, wordAt: 0, boundaries: false };
const setNow = (next: Partial<SpeechNow>) => {
    now = { ...now, ...next };
    speakingListeners.forEach((l) => l());
};
/** for useSyncExternalStore(subscribeSpeaking, getSpeechNow): lip sync and captions */
export const getSpeechNow = (): SpeechNow => now;
export function subscribeSpeaking(listener: () => void): () => void {
    speakingListeners.add(listener);
    return () => speakingListeners.delete(listener);
}
/** utterances being spoken: Chrome can drop events of utterances that were garbage-collected */
const live = new Set<SpeechSynthesisUtterance>();

const mutedBefore = (): boolean => {
    try {
        return window.localStorage.getItem(MUTED_KEY) === "1";
    } catch {
        return false;
    }
};

/** Turn voice on unless the visitor muted it on an earlier visit. Call from a click (user activation). */
export function enableVoiceByDefault(): void {
    if (!speechSupported() || mutedBefore()) return;
    window.speechSynthesis.resume();
    setVoiceOn(true);
}

export function speechSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export function isVoiceOn(): boolean {
    return voiceOn;
}

export function setVoiceOn(on: boolean, remember = false): void {
    if (remember) {
        try {
            if (on) window.localStorage.removeItem(MUTED_KEY);
            else window.localStorage.setItem(MUTED_KEY, "1");
        } catch {
            /* storage blocked: the choice lasts for this page only */
        }
    }
    if (voiceOn === on) return;
    voiceOn = on;
    if (!on) stopSpeaking();
    notify();
}

/** for useSyncExternalStore */
export function subscribeVoice(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

/** Which language a reply is in, roughly: by script first, then the visitor's browser language. */
export function replyLang(text: string, browserLang = "en"): string {
    if (/[ऀ-ॿ]/.test(text)) return "hi";
    if (/[؀-ۿ]/.test(text)) return "ar";
    if (/[぀-ヿ]/.test(text)) return "ja";
    if (/[一-鿿]/.test(text)) return "zh";
    if (/[가-힯]/.test(text)) return "ko";
    if (/[Ѐ-ӿ]/.test(text)) return "ru";
    return browserLang.slice(0, 2).toLowerCase() || "en";
}

/** The most natural voice this browser has for that language (Edge "Natural", Chrome "Google", Safari…). */
function pickVoice(lang: string): SpeechSynthesisVoice | null {
    const all = window.speechSynthesis.getVoices();
    let voices = all.filter((v) => v.lang.toLowerCase().startsWith(lang));
    if (!voices.length) voices = all.filter((v) => v.lang.toLowerCase().startsWith("en"));
    if (!voices.length) return null;
    const score = (v: SpeechSynthesisVoice) =>
        (/natural|neural/i.test(v.name) ? 8 : 0) +
        (/online/i.test(v.name) ? 2 : 0) +
        (/google/i.test(v.name) ? 4 : 0) +
        (/samantha|ava|aria|jenny|sonia|libby/i.test(v.name) ? 3 : 0) +
        (v.lang === navigator.language ? 1 : 0) +
        (v.localService ? 0 : 1);
    return [...voices].sort((a, b) => score(b) - score(a))[0];
}

/** Text as a person would say it: no links, markdown, tool lines or emoji. */
export function toSpeakable(text: string): string {
    return text
        .split("\n")
        .filter((l) => !/^\s*(⏺|⎿)/.test(l))
        .join(" ")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/https?:\/\/\S+/g, "")
        .replace(/[*_`#>|~]/g, "")
        .replace(/[\uD800-\uDFFF☀-➿]/g, "") // emoji and other astral symbols
        .replace(/\s+/g, " ")
        .trim();
}

/** Split into sentence-sized pieces: Chrome stops long single utterances after ~15 s. */
export function chunks(text: string, max = 180): string[] {
    const out: string[] = [];
    for (const sentence of text.match(/[^.!?]+[.!?]*/g) ?? []) {
        let s = sentence.trim();
        while (s.length > max) {
            const cut = s.lastIndexOf(" ", max);
            out.push(s.slice(0, cut > 40 ? cut : max));
            s = s.slice(cut > 40 ? cut + 1 : max);
        }
        if (s) out.push(s);
    }
    return out;
}

/** Read text aloud if voice mode is on. Replaces what is being spoken, unless `queue` (later parts of one answer). */
export function speak(text: string, { queue = false }: { queue?: boolean } = {}): void {
    if (!voiceOn || !speechSupported()) return;
    const clean = toSpeakable(text);
    if (!clean) return;
    const synth = window.speechSynthesis;
    const go = () => {
        const lang = replyLang(clean, navigator.language);
        const voice = pickVoice(lang);
        for (const piece of chunks(clean)) {
            const u = new SpeechSynthesisUtterance(piece);
            if (voice) u.voice = voice;
            u.lang = voice?.lang ?? lang;
            u.rate = 1.03;
            u.onstart = () => {
                setSpeaking(true);
                setNow({ line: piece });
            };
            // word boundaries drive the lip sync (local voices send them; some network voices don't)
            u.onboundary = (e) => {
                if (e.name === "word") setNow({ word: now.word + 1, wordAt: performance.now(), boundaries: true });
            };
            const end = () => {
                live.delete(u);
                if (live.size === 0) {
                    setSpeaking(false);
                    setNow({ line: "" });
                }
            };
            u.onend = end;
            u.onerror = end;
            live.add(u);
            synth.speak(u);
        }
        synth.resume(); // Chrome sometimes leaves the queue paused
    };
    if (queue || (!synth.speaking && !synth.pending)) go();
    else {
        synth.cancel();
        live.clear();
        // Chrome drops an utterance queued in the same tick as cancel()
        window.setTimeout(go, 80);
    }
}

export function stopSpeaking(): void {
    if (!speechSupported()) return;
    window.speechSynthesis.cancel();
    live.clear();
    setSpeaking(false);
    setNow({ line: "" });
}

// voices load asynchronously in Chrome; touching the list early warms it up
if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", () => window.speechSynthesis.getVoices());
}
