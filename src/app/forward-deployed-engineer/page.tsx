import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, ChevronLeft, Mail } from "lucide-react";
import BlurFade from "@/components/magicui/blur-fade";
import { Footer } from "@/components/footer";
import { SectionHeading } from "@/components/section-heading";
import { JsonLd } from "@/components/structured-data";
import { FAQS, PLAYBOOK, PROJECTS, SITE } from "@/lib/site";
import { IDS, breadcrumbSchema, projectListSchema } from "@/lib/schema";

const D = 0.06;
const PATH = "/forward-deployed-engineer";
const TITLE = "Hire a Freelance Forward Deployed Engineer (AI)";
const DESCRIPTION =
    "Ayush Goyal is a freelance forward deployed engineer who embeds with your team and ships AI into production — agents, voice, RAG, MCP servers and enterprise integrations. Remote, worldwide.";

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
        canonical: PATH,
        types: { "text/markdown": `${SITE.url}${PATH}.md` },
    },
    openGraph: {
        title: `${TITLE} — ${SITE.name}`,
        description: DESCRIPTION,
        url: `${SITE.url}${PATH}`,
        type: "profile",
    },
    twitter: { title: `${TITLE} — ${SITE.name}`, description: DESCRIPTION },
};

/**
 * Kept short for humans: what an FDE is, proof, how it runs, one CTA. The
 * full service catalogue and FAQ live on /services; the markdown twin
 * (/forward-deployed-engineer.md) carries everything for crawlers.
 */
const deployed = PROJECTS.filter((p) => p.category === "Freelance FDE Deployments");

export default function FdePage() {
    return (
        <div className="px-5">
            <JsonLd
                graph={[
                    breadcrumbSchema([{ name: "Forward Deployed Engineer", path: PATH }]),
                    {
                        "@type": "WebPage",
                        "@id": `${SITE.url}${PATH}#page`,
                        url: `${SITE.url}${PATH}`,
                        name: TITLE,
                        description: DESCRIPTION,
                        about: { "@id": IDS.service },
                        mainEntity: { "@id": IDS.person },
                        isPartOf: { "@id": IDS.website },
                    },
                    projectListSchema(deployed, "Freelance FDE deployments"),
                ]}
            />

            <section className="mx-auto w-full max-w-2xl space-y-6">
                <BlurFade delay={D}>
                    <Link
                        href="/"
                        className="inline-flex items-center font-mono text-[10px] lowercase text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ChevronLeft className="mr-1 h-3 w-3" />
                        back home
                    </Link>
                </BlurFade>

                <div className="space-y-3">
                    <BlurFade delay={D}>
                        <p className="font-mono text-[10px] lowercase text-muted-foreground">
                            freelance · remote worldwide
                        </p>
                    </BlurFade>
                    <BlurFade delay={D}>
                        <h1 className="font-display text-4xl font-bold lowercase tracking-tight sm:text-5xl">
                            forward deployed engineer, for hire
                        </h1>
                    </BlurFade>
                    <BlurFade delay={D}>
                        <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
                            I embed with your team and ship AI into your production stack.
                            Running software, not a slide deck.
                        </p>
                    </BlurFade>
                    <BlurFade delay={D} className="flex flex-wrap items-center gap-2 pt-1">
                        <Link
                            href={SITE.booking}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-solid"
                        >
                            <CalendarDays className="size-3.5" />
                            book a scope call
                        </Link>
                        <Link href={`mailto:${SITE.email}`} className="btn-quiet">
                            <Mail className="size-3.5" />
                            email me
                        </Link>
                    </BlurFade>
                </div>

                {/* definition — the answer-shaped paragraph LLMs quote */}
                <BlurFade delay={D}>
                    <div className="space-y-2 border-l-2 border-brand pl-4">
                        <h2 className="font-display text-base font-bold tracking-tight">
                            What is a forward deployed engineer?
                        </h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {FAQS.fde[0].a}
                        </p>
                    </div>
                </BlurFade>

                <section id="deployed" className="scroll-mt-24 space-y-3 pt-6">
                    <BlurFade delay={D}>
                        <SectionHeading index="01" title="live deployments" sub="proof" />
                    </BlurFade>
                    <ul className="divide-y divide-border border-y border-border">
                        {deployed.map((p) => (
                            <BlurFade key={p.slug} delay={D}>
                                <li className="flex items-baseline justify-between gap-4 py-3">
                                    <span className="min-w-0">
                                        <span className="font-display text-sm font-bold tracking-tight">
                                            {p.title}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {" "}
                                            — {p.blurb}
                                        </span>
                                    </span>
                                    <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] lowercase text-muted-foreground">
                                        <span className="size-1.5 rounded-full bg-brand" />
                                        live
                                    </span>
                                </li>
                            </BlurFade>
                        ))}
                    </ul>
                </section>

                <section className="space-y-3 pt-6">
                    <BlurFade delay={D}>
                        <SectionHeading index="02" title="how it runs" sub="playbook" />
                    </BlurFade>
                    <BlurFade delay={D}>
                        <ol className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-[11px] lowercase">
                            {PLAYBOOK.map((p, i) => (
                                <li key={p.step} className="flex items-baseline gap-2">
                                    {i > 0 && <span className="text-muted-foreground">→</span>}
                                    <span>{p.title}</span>
                                </li>
                            ))}
                        </ol>
                    </BlurFade>
                </section>

                <BlurFade delay={D}>
                    <div className="mb-16 space-y-4 border-t border-border pt-8">
                        <h2 className="font-display text-2xl font-bold lowercase tracking-tight sm:text-3xl">
                            got ai that needs shipping?
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href={SITE.booking}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-solid"
                            >
                                <CalendarDays className="size-3.5" />
                                book a scope call
                            </Link>
                            <Link href="/services" className="btn-quiet">
                                everything i deploy
                                <ArrowUpRight className="size-3.5" />
                            </Link>
                        </div>
                    </div>
                </BlurFade>
            </section>

            <div className="pb-4 pt-12">
                <Footer />
            </div>
        </div>
    );
}
