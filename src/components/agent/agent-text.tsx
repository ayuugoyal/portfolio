"use client";

import Link from "next/link";
import { Fragment, useMemo } from "react";
import { getAgentStatus } from "@/lib/agent/client";
import { linkify } from "@/lib/agent/links";

const LINK = "text-brand-ink underline underline-offset-2 hover:no-underline";

/** **bold** spans inside a plain-text piece (no HTML is ever interpreted). */
function Bold({ text }: { text: string }) {
    const parts = text.split(/\*\*([^*\n]+)\*\*/g);
    return (
        <>
            {parts.map((p, i) => (i % 2 ? <strong key={i} className="font-semibold">{p}</strong> : <Fragment key={i}>{p}</Fragment>))}
        </>
    );
}

function Line({ text, allowed, origins }: { text: string; allowed: ReadonlySet<string>; origins: string[] }) {
    return (
        <>
            {linkify(text, allowed, origins).map((p, i) =>
                p.kind === "text" ? (
                    <Bold key={i} text={p.text} />
                ) : p.internal ? (
                    <Link key={i} href={p.href} className={LINK}>
                        {p.text.replace(/^https?:\/\/(www\.)?/, "")}
                    </Link>
                ) : (
                    <a
                        key={i}
                        href={p.href}
                        className={LINK}
                        {...(p.href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                    >
                        {p.text.replace(/^https?:\/\/(www\.)?/, "")}
                    </a>
                )
            )}
        </>
    );
}

/**
 * A reply from the live agent: plain text with "- " bullets, **bold**, and links only to URLs that appear in
 * the site's own content (anything else stays plain text). Never renders HTML from the model.
 */
export function AgentText({ text, className }: { text: string; className?: string }) {
    const status = getAgentStatus();
    const allowed = useMemo(() => new Set(status?.links ?? []), [status]);
    const origins = status?.origins ?? [];
    const lines = text.replace(/\n{3,}/g, "\n\n").trim().split("\n");
    return (
        <span className={className}>
            {lines.map((l, i) => {
                const bullet = /^\s*[-*•]\s+/.exec(l);
                const body = bullet ? l.slice(bullet[0].length) : l.replace(/^#+\s*/, "");
                return (
                    <span key={i} className={bullet ? "block pl-3 -indent-3" : l.trim() ? "block" : "block h-2"}>
                        {bullet && <span aria-hidden>· </span>}
                        <Line text={body} allowed={allowed} origins={origins} />
                    </span>
                );
            })}
        </span>
    );
}
