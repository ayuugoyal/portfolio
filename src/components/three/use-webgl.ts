"use client";

import { useEffect, useState } from "react";

/** null until checked on the client, then whether this browser can draw WebGL. */
export function useWebGL(): boolean | null {
    const [ok, setOk] = useState<boolean | null>(null);
    useEffect(() => {
        try {
            const c = document.createElement("canvas");
            setOk(!!(c.getContext("webgl2") || c.getContext("webgl")));
        } catch {
            setOk(false);
        }
    }, []);
    return ok;
}

/** Whether the visitor asked for reduced motion; follows changes live. */
export function useReducedMotion(): boolean {
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setReduced(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);
    return reduced;
}
