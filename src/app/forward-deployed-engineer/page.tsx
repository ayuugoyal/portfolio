import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, ChevronLeft, Mail } from "lucide-react";
import BlurFade from "@/components/magicui/blur-fade";
import { Footer } from "@/components/footer";
import { ServiceCard } from "@/components/service-card";
import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/structured-data";
import { withIcons } from "@/components/project-links";
import { ENGAGEMENTS, FAQS, PLAYBOOK, PROJECTS, SERVICES, SITE } from "@/lib/site";
import { IDS, breadcrumbSchema, faqSchema, projectListSchema } from "@/lib/schema";

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

const deployed = PROJECTS.filter((p) => p.category === "Forward-Deployed & Client Work");

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
                    faqSchema(`${SITE.url}${PATH}#faq`, FAQS.fde),
                    projectListSchema(deployed, "Forward-deployed client work"),
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
                            I embed with your team, sit with the people doing the work, and
                            ship AI into your production stack. You get running software, not
                            a slide deck.
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

                <section className="space-y-4 pt-6">
                    <BlurFade delay={D}>
                        <SectionHeading index="01" title="how it runs" sub="playbook" />
                    </BlurFade>
                    <BlurFade delay={D}>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                            {PLAYBOOK.map((p) => (
                                <div key={p.step} className="space-y-1">
                                    <div className="font-mono text-[10px] tabular-nums text-muted-foreground">
                                        {p.step}
                                    </div>
                                    <h3 className="font-display text-sm font-bold tracking-tight">
                                        {p.title}
                                    </h3>
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        {p.body}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </BlurFade>
                    <BlurFade delay={D}>
                        <dl className="divide-y divide-border border-y border-border">
                            {ENGAGEMENTS.map((e) => (
                                <div
                                    key={e.title}
                                    className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-4"
                                >
                                    <dt className="w-36 shrink-0 font-mono text-[10px] lowercase text-muted-foreground">
                                        {e.title}
                                    </dt>
                                    <dd className="text-sm">{e.body}</dd>
                                </div>
                            ))}
                        </dl>
                    </BlurFade>
                </section>

                <section className="space-y-2 pt-6">
                    <BlurFade delay={D}>
                        <SectionHeading index="02" title="what i deploy" sub="services" />
                    </BlurFade>
                    <div>
                        {SERVICES.map((s, i) => (
                            <BlurFade key={s.slug} delay={D}>
                                <ServiceCard
                                    index={i + 1}
                                    title={s.title}
                                    summary={s.summary}
                                    deliverables={s.deliverables}
                                    proof={s.proof}
                                />
                            </BlurFade>
                        ))}
                    </div>
                </section>

                <section id="deployed" className="scroll-mt-24 space-y-4 pt-6">
                    <BlurFade delay={D}>
                        <SectionHeading index="03" title="where i've deployed" sub="client work" />
                    </BlurFade>
                    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {deployed.map((p) => (
                            <BlurFade key={p.slug} delay={D}>
                                <ProjectCard
                                    href={p.href}
                                    title={p.title}
                                    description={p.description}
                                    dates={p.dates}
                                    tags={p.technologies}
                                    image={p.image}
                                    links={withIcons(p.links)}
                                />
                            </BlurFade>
                        ))}
                    </ul>
                </section>

                <section className="space-y-2 pt-6">
                    <BlurFade delay={D}>
                        <SectionHeading index="04" title="questions" sub="faq" />
                    </BlurFade>
                    <BlurFade delay={D}>
                        <FaqList faqs={FAQS.fde.slice(1)} />
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
                                all services
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
