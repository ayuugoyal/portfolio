/**
 * Collapsed Q&A list. Answers render into the DOM inside <details>, so the
 * FAQPage markup on the same page matches visible (expandable) content.
 */
export function FaqList({ faqs }: { faqs: { q: string; a: string }[] }) {
    return (
        <div className="divide-y divide-border border-b border-border">
            {faqs.map((f) => (
                <details key={f.q} className="group py-3.5">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 marker:content-none">
                        <h3 className="font-display text-sm font-bold tracking-tight">{f.q}</h3>
                        <span className="mt-0.5 shrink-0 font-mono text-xs text-muted-foreground transition-transform group-open:rotate-45">
                            +
                        </span>
                    </summary>
                    <p className="pr-8 pt-2 text-sm leading-relaxed text-muted-foreground">
                        {f.a}
                    </p>
                </details>
            ))}
        </div>
    );
}
