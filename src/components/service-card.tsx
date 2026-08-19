import { Check } from "lucide-react";

interface ServiceCardProps {
    index: number;
    title: string;
    summary: string;
    deliverables: readonly string[];
    proof: readonly string[];
    /** true renders it open and non-collapsible (the /services page) */
    expanded?: boolean;
}

function Body({
    summary,
    deliverables,
    proof,
}: Pick<ServiceCardProps, "summary" | "deliverables" | "proof">) {
    return (
        <div className="grid grid-cols-1 gap-3 pt-2.5 sm:grid-cols-[1.1fr_1fr] sm:gap-8">
            <div className="space-y-2">
                <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                    {summary}
                </p>
                {proof.length > 0 && (
                    <p className="font-mono text-[10px] lowercase text-muted-foreground">
                        <span className="text-foreground">shipped:</span>{" "}
                        {proof.join(" · ")}
                    </p>
                )}
            </div>
            <ul className="space-y-1.5">
                {deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm">
                        <Check
                            aria-hidden
                            className="mt-[3px] size-3.5 shrink-0 text-foreground/45"
                        />
                        <span className="text-muted-foreground">{d}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * Collapsed by default so the services list stays scannable. The detail still
 * renders into the DOM inside <details>, so crawlers read it either way.
 */
export function ServiceCard({
    index,
    title,
    summary,
    deliverables,
    proof,
    expanded = false,
}: ServiceCardProps) {
    const num = String(index).padStart(2, "0");

    if (expanded) {
        return (
            <article className="border-b border-border py-6">
                <div className="flex items-baseline gap-2.5">
                    <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                        {num}
                    </span>
                    <h2 className="font-display text-base font-bold tracking-tight">
                        {title}
                    </h2>
                </div>
                <Body summary={summary} deliverables={deliverables} proof={proof} />
            </article>
        );
    }

    return (
        <details className="group border-b border-border py-3.5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 marker:content-none">
                <span className="flex items-baseline gap-2.5">
                    <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                        {num}
                    </span>
                    <h3 className="font-display text-base font-bold tracking-tight">
                        {title}
                    </h3>
                </span>
                <span className="shrink-0 font-mono text-xs text-muted-foreground transition-transform group-open:rotate-45">
                    +
                </span>
            </summary>
            <Body summary={summary} deliverables={deliverables} proof={proof} />
        </details>
    );
}
