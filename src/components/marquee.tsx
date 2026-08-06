import { cn } from "@/lib/utils";

interface MarqueeProps {
    items: readonly string[];
    /** seconds per pass of the base item list — bigger is slower */
    duration?: number;
    reverse?: boolean;
    className?: string;
    separator?: string;
}

/** each rendered row repeats the list until it has at least this many entries */
const MIN_ITEMS_PER_ROW = 14;
/** rows laid side by side — enough total width to outrun any viewport */
const ROW_COPIES = 4;

/**
 * A quiet full-bleed ticker: no fill, no rules, just small mono text that
 * fades out at both edges.
 *
 * The row is translated by exactly -100% of its own width, so the loop is only
 * seamless while the rows together are wider than the viewport plus one row.
 * Short lists are therefore repeated inside the row before it is duplicated,
 * and the duration scales with that repetition to keep the speed constant.
 */
export function Marquee({
    items,
    duration = 32,
    reverse = false,
    className,
    separator = "/",
}: MarqueeProps) {
    const reps = Math.max(1, Math.ceil(MIN_ITEMS_PER_ROW / items.length));
    const row = Array.from({ length: reps }).flatMap(() => items);

    return (
        <div
            style={
                {
                    "--marquee-duration": `${duration * reps}s`,
                } as React.CSSProperties
            }
            className={cn(
                "group relative flex w-full select-none overflow-hidden py-1",
                "[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]",
                className
            )}
        >
            {Array.from({ length: ROW_COPIES }).map((_, copy) => (
                <div
                    key={copy}
                    aria-hidden={copy > 0}
                    className={cn(
                        "flex shrink-0 items-center",
                        reverse ? "animate-marquee-reverse" : "animate-marquee",
                        "group-hover:[animation-play-state:paused]"
                    )}
                >
                    {row.map((item, i) => (
                        <span
                            key={`${item}-${i}`}
                            className="flex items-center whitespace-nowrap font-mono text-[11px] lowercase text-muted-foreground"
                        >
                            {item}
                            <span className="mx-3 opacity-40">{separator}</span>
                        </span>
                    ))}
                </div>
            ))}
        </div>
    );
}
