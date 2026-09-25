import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { ArrowUpRight, CalendarDays, ChevronLeft, Mail } from "lucide-react";
import BlurFade from "@/components/magicui/blur-fade";
import { ServiceCard } from "@/components/service-card";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/structured-data";
import { FAQS, PLAYBOOK, SERVICES, SITE } from "@/lib/site";
import { IDS, breadcrumbSchema, faqSchema } from "@/lib/schema";

const D = 0.06;

const DESCRIPTION =
    "What a forward deployed engineer ships: AI agents, WhatsApp and voice agents, enterprise integrations, RAG, MCP servers, LLMOps, automation and Physical AI. Freelance, remote worldwide.";

export const metadata: Metadata = {
    title: "Forward Deployed AI Services — Agents, Voice, RAG & Integrations",
    description: DESCRIPTION,
    alternates: { canonical: "/services" },
    openGraph: {
        title: `AI Services — ${SITE.name}`,
        description: DESCRIPTION,
        url: `${SITE.url}/services`,
        type: "website",
    },
};

export default function ServicesPage() {
    return (
        <div className="px-5">
            <JsonLd
                graph={[
                    breadcrumbSchema([{ name: "Services", path: "/services" }]),
                    {
                        "@type": "WebPage",
                        "@id": `${SITE.url}/services#page`,
                        url: `${SITE.url}/services`,
                        name: "Forward deployed AI services",
                        description: DESCRIPTION,
                        about: { "@id": IDS.service },
                        isPartOf: { "@id": IDS.website },
                    },
                    faqSchema(`${SITE.url}/services#faq`, FAQS.general),
                ]}
            />
            <section className="mx-auto w-full max-w-2xl space-y-6">
                <BlurFade delay={D}>
                    <Link
                        href="/"
                        className="inline-flex items-center font-mono text-[10px] lowercase text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ChevronLeft className="mr-1 h-3 w-3" />
                        back to portfolio
                    </Link>
                </BlurFade>

                <div className="space-y-3">
                    <BlurFade delay={D}>
                        <h1 className="font-display text-4xl font-bold lowercase tracking-tight sm:text-5xl">
                            what i build
                        </h1>
                    </BlurFade>
                    <BlurFade delay={D}>
                        <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
                            Everything I ship as a{" "}
                            <Link href="/forward-deployed-engineer" className="text-foreground underline underline-offset-4">
                                forward deployed engineer
                            </Link>
                            . Fixed-scope sprints or embedded retainers — remote, worldwide.
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
                            book a free call
                        </Link>
                        <Link href={`mailto:${SITE.email}`} className="btn-quiet">
                            <Mail className="size-3.5" />
                            email me
                        </Link>
                    </BlurFade>
                </div>

                <div>
                    {SERVICES.map((s, i) => (
                        <BlurFade key={s.slug} delay={D}>
                            <div id={s.slug} className="scroll-mt-24">
                                <ServiceCard
                                    expanded
                                    index={i + 1}
                                    title={s.title}
                                    summary={s.summary}
                                    deliverables={s.deliverables}
                                    proof={s.proof}
                                />
                            </div>
                        </BlurFade>
                    ))}
                </div>

                <BlurFade delay={D}>
                    <div className="space-y-4 pt-2">
                        <h2 className="font-display text-lg font-bold tracking-tight">
                            How it works
                        </h2>
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
                    </div>
                </BlurFade>

                <BlurFade delay={D}>
                    <div className="space-y-2 pt-4">
                        <h2 className="font-display text-lg font-bold tracking-tight">
                            Questions I actually get
                        </h2>
                        <FaqList faqs={FAQS.general} />
                    </div>
                </BlurFade>

                <BlurFade delay={D}>
                    <div className="mb-16 space-y-4 border-t border-border pt-8">
                        <h2 className="font-display text-2xl font-bold lowercase tracking-tight sm:text-3xl">
                            got something that needs a brain?
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
                            <Link href="/#work" className="btn-quiet">
                                see the work
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
