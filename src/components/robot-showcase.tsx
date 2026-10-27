import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/site";

/** One robot: video, title, blurb, highlights and stack. */
export function RobotFeature({ project: p, index }: { project: Project; index: number }) {
    const vertical = p.slug === "so101-claude-code";
    return (
        <article
            id={p.slug}
            className={`grid scroll-mt-24 grid-cols-1 gap-5 border-t border-border pt-8 ${
                vertical ? "sm:grid-cols-[minmax(0,15rem)_1fr]" : ""
            }`}
        >
            <video
                src={p.video}
                poster={p.poster}
                controls={vertical}
                autoPlay={!vertical}
                loop={!vertical}
                muted={!vertical}
                playsInline
                preload={vertical ? "none" : "auto"}
                className={`w-full rounded-xl border border-border bg-muted object-cover ${
                    vertical ? "aspect-[9/16]" : "aspect-video"
                }`}
            />
            <div className="flex flex-col gap-4">
                <div className="space-y-1.5">
                    <p className="font-mono text-[10px] lowercase text-muted-foreground">
                        {String(index).padStart(2, "0")} · {p.dates}
                        {vertical && " · sound on"}
                    </p>
                    <h2 className="font-display text-2xl font-bold tracking-tight">{p.title}</h2>
                    <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                        {p.blurb}.
                    </p>
                </div>
                <ul className="space-y-2 text-sm leading-relaxed">
                    {p.highlights?.map((h) => (
                        <li key={h} className="flex gap-2.5">
                            <span className="mt-2 size-1 shrink-0 rounded-full bg-foreground/50" />
                            <span className="text-pretty">{h}</span>
                        </li>
                    ))}
                </ul>
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
                                <span className="block font-display text-sm font-bold tracking-tight">
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
