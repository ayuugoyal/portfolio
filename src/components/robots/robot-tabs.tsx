"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { type KeyboardEvent, type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArmPlayground } from "@/components/arm/arm-playground";
import { MoveoPlayground } from "@/components/moveo/moveo-playground";
import { RobotFeature } from "@/components/robot-showcase";
import { RoverPlayground } from "@/components/rover/rover-playground";
import type { Project } from "@/lib/site";
import { cn } from "@/lib/utils";

export type RobotKind = "so101" | "moveo" | "rover" | "scara";
export type RobotTab = { kind: RobotKind; label: string; project: Project };

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const linkCls = "text-foreground underline-offset-4 hover:underline";

/** Only the active panel mounts its scene, so the page holds at most one WebGL canvas. */
function Demo({ kind, hero = false }: { kind: RobotKind; hero?: boolean }) {
    if (kind === "so101") return <ArmPlayground variant={hero ? "hero" : "robotics"} />;
    if (kind === "moveo") return <MoveoPlayground />;
    if (kind === "rover") return <RoverPlayground />;
    return null; // no 3D scene yet: the panel shows the real robot's video
}

const HAS_DEMO: Record<RobotKind, boolean> = { so101: true, moveo: true, rover: true, scara: false };

const CREDITS: Partial<Record<RobotKind, ReactNode>> = {
    so101: (
        <>
            3D model: SO-101 by{" "}
            <a href="https://github.com/TheRobotStudio/SO-ARM100" target="_blank" rel="noopener noreferrer" className={linkCls}>
                TheRobotStudio
            </a>{" "}
            (Apache-2.0), simplified for the web ·{" "}
            <a href="/models/NOTICE.txt" className={linkCls}>
                notice
            </a>
        </>
    ),
    moveo: (
        <>
            3D model: the{" "}
            <a href="https://github.com/BCN3D/BCN3D-Moveo" target="_blank" rel="noopener noreferrer" className={linkCls}>
                BCN3D Moveo
            </a>
            , an open-source design by BCN3D Technologies (MIT), converted from this build&apos;s URDF ·{" "}
            <a href="/models/NOTICE-moveo.txt" className={linkCls}>
                notice
            </a>
        </>
    ),
};

/**
 * The robots as tabs. Every panel's text is rendered (server HTML included); inactive panels are `hidden`.
 * The active tab follows the URL hash (#<project slug>), so /robotics#raftaar-rover opens the rover.
 */
export function RobotTabs({
    robots,
    className,
    variant = "feature",
}: {
    robots: RobotTab[];
    className?: string;
    /** feature: the full write-up per robot (/robotics). hero: the 3D demo first, a short clip and a line under it (home). */
    variant?: "feature" | "hero";
}) {
    const [active, setActive] = useState(robots[0].project.slug);
    const root = useRef<HTMLDivElement>(null);
    const tabs = useRef<(HTMLButtonElement | null)[]>([]);
    const scrollPending = useRef(false);

    // hash -> tab: on load (before paint) and on in-page hash changes
    const fromHash = useCallback(() => {
        const slug = decodeURIComponent(window.location.hash.slice(1));
        if (robots.some((r) => r.project.slug === slug)) {
            scrollPending.current = true;
            setActive(slug);
        }
    }, [robots]);
    useIsoLayoutEffect(() => {
        fromHash();
        // next/link changes the hash with pushState (no hashchange), so also watch clicks on same-page anchors
        const onClick = (e: MouseEvent) => {
            const a = (e.target as Element | null)?.closest?.("a[href*='#']") as HTMLAnchorElement | null;
            if (a && a.pathname === window.location.pathname) requestAnimationFrame(fromHash);
        };
        window.addEventListener("hashchange", fromHash);
        window.addEventListener("popstate", fromHash);
        document.addEventListener("click", onClick);
        return () => {
            window.removeEventListener("hashchange", fromHash);
            window.removeEventListener("popstate", fromHash);
            document.removeEventListener("click", onClick);
        };
    }, [fromHash]);

    // the anchor's panel was hidden when the browser looked for it; scroll once it is shown
    useEffect(() => {
        if (!scrollPending.current) return;
        scrollPending.current = false;
        root.current?.scrollIntoView({ block: "start" });
    }, [active]);

    const select = (slug: string, focus = false) => {
        setActive(slug);
        // keep Next's router state; replace so tab clicks do not pile up history entries
        window.history.replaceState(window.history.state, "", `#${slug}`);
        if (focus) tabs.current[robots.findIndex((r) => r.project.slug === slug)]?.focus();
    };

    const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
        const n = robots.length;
        const to =
            e.key === "ArrowRight" ? (i + 1) % n
            : e.key === "ArrowLeft" ? (i - 1 + n) % n
            : e.key === "Home" ? 0
            : e.key === "End" ? n - 1
            : -1;
        if (to < 0) return;
        e.preventDefault();
        select(robots[to].project.slug, true);
    };

    return (
        <div ref={root} className={cn("scroll-mt-24 space-y-6", className)}>
            <div
                role="tablist"
                aria-label="Robots"
                className="inline-flex max-w-full flex-wrap gap-1 rounded-full border border-border bg-card p-1"
            >
                {robots.map((r, i) => {
                    const selected = r.project.slug === active;
                    return (
                        <button
                            key={r.project.slug}
                            ref={(el) => {
                                tabs.current[i] = el;
                            }}
                            type="button"
                            role="tab"
                            id={`${r.project.slug}-tab`}
                            aria-selected={selected}
                            aria-controls={r.project.slug}
                            tabIndex={selected ? 0 : -1}
                            onClick={() => select(r.project.slug)}
                            onKeyDown={(e) => onKeyDown(e, i)}
                            className={cn(
                                "rounded-full px-3.5 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                                selected
                                    ? "bg-foreground text-background"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            {r.label}
                        </button>
                    );
                })}
            </div>

            {robots.map((r, i) => {
                const selected = r.project.slug === active;
                return (
                    <div
                        key={r.project.slug}
                        role="tabpanel"
                        id={r.project.slug}
                        aria-labelledby={`${r.project.slug}-tab`}
                        hidden={!selected}
                        tabIndex={0}
                        className="scroll-mt-24 focus-visible:outline-none"
                    >
                        {variant === "hero" ? (
                            selected && <HeroPanel robot={r} index={i + 1} />
                        ) : (
                            <RobotFeature
                                project={r.project}
                                index={i + 1}
                                id={null}
                                bordered={false}
                                mediaActive={selected}
                                demo={selected && HAS_DEMO[r.kind] ? <Demo kind={r.kind} /> : undefined}
                                credit={CREDITS[r.kind]}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/** A short silent clip of the real robot (its loop, else its demo video), playing while the tab is open. */
function Clip({ project: p }: { project: Project }) {
    const reduced = useReducedMotion() ?? false;
    const src = p.loop ?? p.video ?? p.links.find((l) => l.type === "Demo Video")?.href;
    const poster = p.loop?.replace(/\.mp4$/, ".jpg") ?? p.poster ?? p.image;
    if (!src) return p.image ? <Image src={p.image} alt="" width={480} height={270} className="aspect-video w-full rounded-xl border border-border object-cover" /> : null;
    return (
        <video
            key={src}
            src={src}
            poster={poster}
            muted
            loop
            playsInline
            autoPlay={!reduced}
            controls={reduced}
            preload="metadata"
            aria-label={`${p.title}, the real robot`}
            className="aspect-video w-full rounded-xl border border-border bg-muted object-cover"
        />
    );
}

/** Home hero: the interactive 3D robot slides up first, then a clip of the real one and a line about it. */
function HeroPanel({ robot: r, index }: { robot: RobotTab; index: number }) {
    const reduced = useReducedMotion() ?? false;
    const p = r.project;
    return (
        <motion.div
            initial={reduced ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            // shorter 3D window on wide screens, so the console is in view when the page lands
            className="space-y-4 [--scene-aspect-override:4/3] sm:[--scene-aspect-override:2/1] lg:[--scene-aspect-override:5/2]"
        >
            <Demo kind={r.kind} hero />
            <motion.div
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduced ? 0 : 0.15, type: "spring", stiffness: 260, damping: 30 }}
                className="grid items-center gap-4 sm:grid-cols-[minmax(0,15rem)_1fr]"
            >
                <Clip project={p} />
                <div className="space-y-1.5">
                    <p className="font-mono text-[11px] text-muted-foreground">
                        {String(index).padStart(2, "0")} · the real one
                    </p>
                    <h3 className="font-display text-xl font-medium tracking-[-0.01em]">{p.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{p.blurb ?? p.description}</p>
                    <Link
                        href={`/robotics#${p.slug}`}
                        className="inline-flex items-center gap-1 pt-1 text-sm text-foreground underline-offset-4 hover:underline"
                    >
                        the full story
                        <ArrowUpRight className="size-3.5" />
                    </Link>
                    {CREDITS[r.kind] && <p className="pt-1 text-[11px] text-muted-foreground">{CREDITS[r.kind]}</p>}
                </div>
            </motion.div>
        </motion.div>
    );
}
