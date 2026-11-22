"use client";

import { Eye } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function VisitorCount() {
    const [count, setCount] = useState<number | null>(null);
    const [failed, setFailed] = useState(false);
    const hasRun = useRef(false);

    useEffect(() => {
        // Guard against React StrictMode double-invocation in development
        if (hasRun.current) return;
        hasRun.current = true;

        // the server counts each visitor once a day; this POST is safe to send on every load
        fetch("/api/visits", { method: "POST" })
            .then((res) => res.json())
            .then((data) => {
                if (typeof data?.count === "number") setCount(data.count);
                else setFailed(true);
            })
            .catch(() => setFailed(true));
    }, []);

    // nothing to show if the count can't be loaded: hide it rather than leave dots on screen
    if (failed) return null;

    return (
        <div className="inline-flex items-center gap-1.5 font-mono text-[10px] lowercase text-muted-foreground">
            <Eye className="size-3" />
            <span className="tabular-nums text-foreground">
                {count === null ? "···" : count.toLocaleString()}
            </span>
            <span>pulled up</span>
        </div>
    );
}
