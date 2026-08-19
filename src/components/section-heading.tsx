import { cn } from "@/lib/utils";

interface SectionHeadingProps {
    /** two-digit section number, e.g. "01" */
    index: string;
    title: string;
    /** plain-language label, so a playful title is still scannable */
    sub?: string;
    /** the throwaway line on the right — the actual personality */
    kicker?: string;
    className?: string;
}

export function SectionHeading({
    index,
    title,
    sub,
    kicker,
    className,
}: SectionHeadingProps) {
    return (
        <div
            className={cn(
                "flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1",
                className
            )}
        >
            <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                    {index}
                </span>
                <h2 className="font-display text-lg font-bold tracking-tight sm:text-xl">
                    {title}
                </h2>
                {sub && (
                    <span className="font-mono text-[10px] lowercase text-muted-foreground">
                        / {sub}
                    </span>
                )}
            </div>
            {kicker && (
                <span className="font-mono text-[10px] lowercase text-muted-foreground">
                    {kicker}
                </span>
            )}
        </div>
    );
}
