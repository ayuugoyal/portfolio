import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import TypingAnimation from "@/components/magicui/typing-animation";
import { Highlighter } from "@/components/magicui/highlighter";
import { ArrowUpRight, CalendarDays, Github, Mail } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { RobotTabs } from "@/components/robots/robot-tabs";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/structured-data";
import { ResumeCard } from "@/components/resume-card";
import { HackathonCard } from "@/components/pro-card";
import { EXPERIENCE, HATS, OPEN_SOURCE, PATENT, PROJECTS, SITE } from "@/lib/site";
import {
    IDS,
    experienceSchema,
    openSourceSchema,
    patentSchema,
    projectListSchema,
} from "@/lib/schema";

const D = 0.06;

/**
 * The home page is for humans: short, scannable, three ideas. Everything else
 * lives one click away (/forward-deployed-engineer, /robotics, /services) or
 * in the machine-readable layer — the JSON-LD below, /llms-full.txt and
 * /index.md — so crawlers and LLMs still get the full picture.
 */

const featured = PROJECTS.filter((p) => p.featured);
const bySlug = (slug: string) => PROJECTS.find((p) => p.slug === slug)!;
const robots = [
    { kind: "so101" as const, label: "SO-101", project: bySlug("so101-claude-code") },
    { kind: "moveo" as const, label: "BCN3D Moveo", project: bySlug("bcn3d-moveo") },
    { kind: "rover" as const, label: "Raftaar", project: bySlug("raftaar-rover") },
];

/** ProfilePage is Google's recommended type for a personal site's home page. */
function HomeSchema() {
    return (
        <JsonLd
            graph={[
                {
                    "@type": "ProfilePage",
                    "@id": `${SITE.url}/#profile`,
                    url: SITE.url,
                    name: `${SITE.name} — ${SITE.role}`,
                    mainEntity: { "@id": IDS.person },
                    isPartOf: { "@id": IDS.website },
                    hasPart: [
                        `${SITE.url}/forward-deployed-engineer`,
                        `${SITE.url}/robotics`,
                        `${SITE.url}/services`,
                    ],
                },
                projectListSchema(),
                patentSchema(),
                ...experienceSchema(),
                ...openSourceSchema(),
            ]}
        />
    );
}

function external(href: string) {
    return href.startsWith("http")
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {};
}

export default function Home() {
    return (
        <div className="overflow-x-clip">
            <HomeSchema />

            {/* ───────────────────────── hero ───────────────────────── */}
            <section id="hero" className="px-5">
                <div className="relative isolate mx-auto w-full max-w-4xl space-y-5">
                    {/* faded pixel portrait behind the name (scripts/build-hero-pixel.mjs) */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/hero-pixel.svg"
                        alt=""
                        aria-hidden
                        width={36}
                        height={40}
                        className="pointer-events-none absolute -top-4 right-0 -z-10 w-28 select-none opacity-[0.1] [image-rendering:pixelated] [mask-image:linear-gradient(to_bottom,black_60%,transparent)] dark:opacity-[0.1] sm:w-56 sm:opacity-[0.14] md:-top-8 md:w-72"
                    />
                    <BlurFade delay={D}>
                        <div className="inline-flex items-center gap-2 font-mono text-[10px] lowercase text-muted-foreground">
                            <span aria-hidden className="relative flex size-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping bg-brand opacity-60 motion-reduce:animate-none" />
                                <span className="relative inline-flex size-1.5 bg-brand" />
                            </span>
                            taking freelance fde engagements
                        </div>
                    </BlurFade>

                    <div className="flex items-start justify-between gap-5">
                        <div className="flex flex-1 flex-col space-y-3">
                            <BlurFade delay={D}>
                                <TypingAnimation
                                    duration={70}
                                    className="max-w-full text-pretty font-mono text-[11px] font-normal leading-none text-muted-foreground"
                                    text="// i embed with your team, then i ship"
                                />
                            </BlurFade>

                            <div className="flex items-baseline gap-x-[0.28em] whitespace-nowrap font-display text-5xl font-medium lowercase leading-[0.95] tracking-[-0.01em] sm:text-6xl md:text-7xl">
                                <BlurFadeText delay={D} yOffset={8} text="ayush" />
                                <BlurFadeText delay={D + 0.08} className="text-outline" yOffset={8} text="goyal" />
                            </div>

                            <BlurFade delay={D} className="pt-1">
                                <h1 className="font-display text-lg font-medium tracking-[-0.01em] sm:text-xl">
                                    Forward Deployed Engineer &amp; AI Engineer
                                </h1>
                            </BlurFade>

                            <BlurFade
                                delay={D}
                                className="max-w-md text-sm leading-relaxed text-muted-foreground"
                            >
                                I drop into your team and ship{" "}
                                <Highlighter action="underline">
                                    <span className="text-foreground">AI that actually runs</span>
                                </Highlighter>{" "}
                                in production. Full-time AI engineer, freelance FDE for AI
                                and robotics, and I build my own robots.
                            </BlurFade>
                        </div>

                    </div>

                    <BlurFade delay={D} className="flex flex-wrap items-center gap-2">
                        <Link href={SITE.booking} {...external(SITE.booking)} className="btn-solid">
                            <CalendarDays className="size-3.5" />
                            book a call
                        </Link>
                        <Link href="/forward-deployed-engineer" className="btn-quiet">
                            hire me as your fde
                        </Link>
                        <Link href="/resume" className="btn-quiet">
                            resume
                            <ArrowUpRight className="size-3.5" />
                        </Link>
                    </BlurFade>

                    <BlurFade delay={D} className="pt-6">
                        <RobotTabs robots={robots} variant="hero" />
                    </BlurFade>
                </div>
            </section>

            {/* ──────────────────────── three hats ──────────────────────── */}
            <section id="what-i-do" className="px-5 pt-16">
                <div className="mx-auto w-full max-w-4xl space-y-3">
                    <BlurFade delay={D}>
                        <SectionHeading index="01" title="three hats" sub="what i do" />
                    </BlurFade>
                    <div className="divide-y divide-border border-y border-border">
                        {HATS.map((h) => (
                            <BlurFade key={h.key} delay={D}>
                                <Link
                                    href={h.href}
                                    className="group grid grid-cols-1 gap-1 py-4 sm:grid-cols-[7rem_1fr_auto] sm:items-baseline sm:gap-4"
                                >
                                    <span className="font-mono text-[10px] lowercase text-muted-foreground">
                                        {h.mode}
                                    </span>
                                    <div className="space-y-1">
                                        <h2 className="font-display text-base font-medium tracking-[-0.01em]">
                                            {h.title}
                                        </h2>
                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                            {h.body}
                                        </p>
                                    </div>
                                    <ArrowUpRight className="hidden size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground sm:block" />
                                </Link>
                            </BlurFade>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───────────────────────── open source ───────────────────────── */}
            <section id="open-source" className="px-5 pt-16">
                <div className="mx-auto w-full max-w-4xl space-y-2">
                    <BlurFade delay={D}>
                        <SectionHeading
                            index="02"
                            title="free labor era"
                            sub="open source"
                            kicker="except it paid"
                        />
                    </BlurFade>
                    <ul className="divide-y divide-border">
                        {OPEN_SOURCE.map((o) => (
                            <BlurFade key={o.title} delay={D}>
                                <HackathonCard
                                    title={o.title}
                                    description={o.display}
                                    dates={o.dates}
                                    image={o.image}
                                    links={[
                                        { title: o.title, href: o.repo, icon: <Github /> },
                                        ...o.prs.map((n) => ({
                                            title: `pr #${n}`,
                                            href: `${o.repo}/pull/${n}`,
                                            icon: <ArrowUpRight />,
                                        })),
                                    ]}
                                />
                            </BlurFade>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ──────────────────────── selected work ──────────────────────── */}
            <section id="work" className="px-5 pt-16">
                <div className="mx-auto w-full max-w-4xl space-y-3">
                    <BlurFade delay={D}>
                        <SectionHeading
                            index="03"
                            title="selected work"
                            sub="projects"
                            kicker={`${PROJECTS.length} total`}
                        />
                    </BlurFade>
                    <ul className="divide-y divide-border border-y border-border">
                        {featured.map((p) => {
                            const href =
                                p.href ??
                                (p.category === "Robots & Physical AI"
                                    ? `/robotics#${p.slug}`
                                    : "/forward-deployed-engineer#deployed");
                            return (
                                <BlurFade key={p.slug} delay={D}>
                                    <li>
                                        <Link
                                            href={href}
                                            {...external(href)}
                                            className="group flex items-baseline justify-between gap-4 py-3"
                                        >
                                            <span className="min-w-0">
                                                <span className="font-display text-sm font-medium tracking-[-0.01em]">
                                                    {p.title}
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {" "}
                                                    — {p.blurb}
                                                </span>
                                            </span>
                                            <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                                        </Link>
                                    </li>
                                </BlurFade>
                            );
                        })}
                    </ul>
                    <BlurFade delay={D} className="flex flex-wrap gap-x-5 gap-y-1 pt-1">
                        <Link
                            href="/forward-deployed-engineer#deployed"
                            className="font-mono text-[11px] lowercase text-muted-foreground hover:text-foreground"
                        >
                            fde deployments →
                        </Link>
                        <Link
                            href="/robotics"
                            className="font-mono text-[11px] lowercase text-muted-foreground hover:text-foreground"
                        >
                            all the robots →
                        </Link>
                        <Link
                            href={SITE.socials.github}
                            {...external(SITE.socials.github)}
                            className="font-mono text-[11px] lowercase text-muted-foreground hover:text-foreground"
                        >
                            github →
                        </Link>
                    </BlurFade>
                </div>
            </section>

            {/* ───────────────────────── experience ───────────────────────── */}
            <section id="work-experience" className="px-5 pt-16">
                <div className="mx-auto w-full max-w-4xl space-y-3">
                    <BlurFade delay={D}>
                        <SectionHeading
                            index="04"
                            title="where i've been cooking"
                            sub="experience"
                            kicker="tap for the yap"
                        />
                    </BlurFade>
                    <div>
                        {EXPERIENCE.map((e) => (
                            <BlurFade key={e.company} delay={D}>
                                <ResumeCard
                                    logoUrl={e.logoUrl}
                                    altText={e.company}
                                    title={e.company}
                                    subtitle={e.title}
                                    href={e.href}
                                    current={e.current}
                                    period={`${e.start} — ${e.end ?? "now"}`}
                                    description={e.description}
                                />
                            </BlurFade>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───────────────────────── patent ───────────────────────── */}
            <section id="patents" className="px-5 pt-16">
                <div className="mx-auto w-full max-w-4xl space-y-2">
                    <BlurFade delay={D}>
                        <SectionHeading
                            index="05"
                            title="certified inventor arc"
                            sub="uk design patent"
                            kicker="the uk agreed"
                        />
                    </BlurFade>
                    <ul className="divide-y divide-border">
                        <BlurFade delay={D}>
                            <HackathonCard
                                title={PATENT.title}
                                description={`${PATENT.summary} UK Design Registration ${PATENT.number}.`}
                                dates="June 2025"
                                image="/patent.png"
                                links={[
                                    {
                                        title: "see the patent",
                                        href: PATENT.url,
                                        icon: <ArrowUpRight />,
                                    },
                                    {
                                        title: "gov.uk record",
                                        href: PATENT.official,
                                        icon: <ArrowUpRight />,
                                    },
                                ]}
                            />
                        </BlurFade>
                    </ul>
                </div>
            </section>

            {/* ───────────────────────── contact ───────────────────────── */}
            <section id="contact" className="px-5 pb-20 pt-20">
                <BlurFade delay={D}>
                    <div className="mx-auto flex w-full max-w-4xl flex-col items-center space-y-4 text-center">
                        <h2 className="font-display text-2xl font-medium lowercase tracking-[-0.01em] sm:text-3xl">
                            got ai that needs shipping?
                        </h2>
                        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                            Tell me what you&apos;re trying to build. I&apos;ll tell you straight
                            whether it&apos;s worth it.
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            <Link href={SITE.booking} {...external(SITE.booking)} className="btn-solid">
                                <CalendarDays className="size-3.5" />
                                book a call
                            </Link>
                            <Link href={`mailto:${SITE.email}`} className="btn-quiet">
                                <Mail className="size-3.5" />
                                email me
                            </Link>
                        </div>
                    </div>
                </BlurFade>
            </section>

            <div className="px-5 pb-16">
                <Footer />
            </div>
        </div>
    );
}
