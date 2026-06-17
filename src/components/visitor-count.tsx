"use client";

import { Eye } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Free, tokenless hit counter — https://abacus.jasoncameron.dev
const COUNTER_URL = "https://abacus.jasoncameron.dev/hit/ayuugoyal-tech/home";

export function VisitorCount() {
    const [count, setCount] = useState<number | null>(null);
    const hasRun = useRef(false);

    useEffect(() => {
        // Guard against React StrictMode double-invocation in development
        if (hasRun.current) return;
        hasRun.current = true;

        fetch(COUNTER_URL)
            .then((res) => res.json())
            .then((data) => {
                if (typeof data?.value === "number") setCount(data.value);
            })
            .catch(() => {
                /* silently ignore if the counter service is unavailable */
            });
    }, []);

    return (
        <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Eye className="size-4" />
            <span className="tabular-nums">
                {count === null ? "—" : count.toLocaleString()}
            </span>
            <span>visitors</span>
        </div>
    );
}
