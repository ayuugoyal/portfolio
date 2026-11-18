import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/site";

/**
 * One robot: video, title, blurb, highlights (or the description) and stack, plus an optional demo slot.
 * Links other than the video already shown are listed under the text.
 */
export function RobotFeature({
    project: p,
    index,
    demo,
    id = p.slug,
    bordered = true,
    mediaActive = true,
    credit,
}: {
    project: Project;
    index: number;
    /** rendered full width under the article content, e.g. a 3D scene */
    demo?: ReactNode;
    /** element id (anchor); defaults to the slug, null for none (e.g. when a tab panel owns the anchor) */
    id?: string | null;
    /** top rule + padding, for stacking features in a list */
    bordered?: boolean;
    /** false keeps the video from loading or autoplaying (e.g. in a hidden tab panel) */
    mediaActive?: boolean;
    /** small print under the demo, e.g. model attribution */
    credit?: ReactNode;
}) {
    const vertical = p.slug === "so101-claude-code";
    const links = [
        ...(p.href && !p.links.some((l) => l.href === p.href) ? [{ type: "Website", href: p.href }] : []),
        ...p.links,
    ].filter((l) => l.href !== p.video);
    return (
        <article
            id={id ?? undefined}
            className={[
                "grid scroll-mt-24 grid-cols-1 gap-5",
                bordered && "border-t border-border pt-8",
                vertical && p.video && "sm:grid-cols-[minmax(0,15rem)_1fr]",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            {p.video && (
                <video
                    // remount when activated so autoplay starts
                    key={mediaActive ? "on" : "off"}
                    src={p.video}
                    poster={p.poster}
                    controls={vertical}
                    autoPlay={!vertical && mediaActive}
                    loop={!vertical}
                    muted={!vertical}
                    playsInline
                    preload={vertical || !mediaActive ? "none" : "auto"}
                    className={`w-full rounded-xl border border-border bg-muted object-cover ${
                        vertical ? "aspect-[9/16]" : "aspect-video"
                    }`}
                />
            )}
            <div className="flex flex-col gap-4">
                <div className="space-y-1.5">
                    <p className="font-mono text-[10px] lowercase text-muted-foreground">
                        {String(index).padStart(2, "0")}
                        {p.dates && ` · ${p.dates}`}
                        {vertical && p.video && " · sound on"}
                    </p>
                    <h2 className="font-display text-2xl font-medium tracking-[-0.01em]">{p.title}</h2>
                    <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                        {p.blurb}.
                    </p>
                </div>
                {p.highlights?.length ? (
                    <ul className="space-y-2 text-sm leading-relaxed">
                        {p.highlights.map((h) => (
                            <li key={h} className="flex gap-2.5">
                                <span className="mt-2 size-1 shrink-0 rounded-full bg-foreground/50" />
                                <span className="text-pretty">{h}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-pretty text-sm leading-relaxed">{p.description}</p>
                )}
                {links.length > 0 && (
                    <p className="flex flex-wrap gap-2">
                        {links.map((l) => (
                            <Link
                                key={l.href}
                                href={l.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-quiet"
                            >
                                {l.type === "Github" ? "code" : l.type === "Demo Video" ? "demo video" : l.type.toLowerCase()}
                                <ArrowUpRight className="size-3.5" />
                            </Link>
                        ))}
                    </p>
                )}
                <p className="mt-auto flex flex-wrap gap-1.5">
                    {p.technologies.map((t) => (
                        <span
                            key={t}
                            className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] lowercase text-muted-foreground"
                        >
                            {t}
                        </span>
                    ))}
                </p>
            </div>
            {(demo || credit) && (
                <div className={vertical && p.video ? "space-y-2 sm:col-span-2" : "space-y-2"}>
                    {demo}
                    {credit && <p className="text-[11px] leading-relaxed text-muted-foreground">{credit}</p>}
                </div>
            )}
        </article>
    );
}

/** Compact two-up preview for the home page: silent loops linking to /robotics. */
export function RobotTiles({ projects }: { projects: Project[] }) {
    return (
        <ul className="grid grid-cols-2 gap-3">
            {projects.map((p) => (
                <li key={p.slug}>
                    <Link href={`/robotics#${p.slug}`} className="group block space-y-2">
                        <video
                            src={p.loop}
                            poster={p.loop?.replace(/\.mp4$/, ".jpg")}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="pointer-events-none aspect-square w-full rounded-xl border border-border bg-muted object-cover transition-colors group-hover:border-foreground/30"
                        />
                        <span className="flex items-start justify-between gap-2">
                            <span className="min-w-0">
                                <span className="block font-display text-sm font-medium tracking-[-0.01em]">
                                    {p.title}
                                </span>
                                <span className="block text-xs leading-snug text-muted-foreground">
                                    {p.blurb}
                                </span>
                            </span>
                            <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}
