import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { ArrowUpRight, CalendarDays, ChevronLeft, Mail } from "lucide-react";
import BlurFade from "@/components/magicui/blur-fade";
import { ServiceCard } from "@/components/service-card";
import { FAQS, PROCESS, SERVICES, SITE } from "@/lib/site";

const D = 0.06;

const DESCRIPTION =
    "AI services: agents and chatbots, WhatsApp and voice agents, RAG and knowledge systems, MCP servers, lead generation, workflow automation, integrations, LLMOps and Physical AI robotics. Freelance and contract, remote worldwide.";

export const metadata: Metadata = {
    title: "AI Services — Agents, Voice, RAG, Automation & Integrations",
    description: DESCRIPTION,
    alternates: { canonical: "/services" },
    openGraph: {
        title: `AI Services — ${SITE.name}`,
        description: DESCRIPTION,
        url: `${SITE.url}/services`,
        type: "website",
    },
};

/**
 * FAQ markup lives here rather than in the root layout: Google requires the
 * marked-up answers to be visible on the same page, and the FAQ block was
 * removed from the home page.
 */
function FaqSchema() {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "@id": `${SITE.url}/services#faq`,
                    mainEntity: FAQS.map((f) => ({
                        "@type": "Question",
                        name: f.q,
                        acceptedAnswer: { "@type": "Answer", text: f.a },
                    })),
                }),
            }}
        />
    );
}

/** Breadcrumbs help this page surface as its own result rather than a fragment. */
function Breadcrumbs() {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    itemListElement: [
                        {
                            "@type": "ListItem",
                            position: 1,
                            name: "Home",
                            item: SITE.url,
                        },
                        {
                            "@type": "ListItem",
                            position: 2,
                            name: "Services",
                            item: `${SITE.url}/services`,
                        },
                    ],
                }),
            }}
        />
    );
}

export default function ServicesPage() {
    return (
        <div className="px-5">
            <Breadcrumbs />
            <FaqSchema />
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
                            I scope the system, choose the models, build it, and hand you
                            something your team can actually run. Fixed-scope builds or ongoing
                            retainers — remote, worldwide.
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
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {PROCESS.map((p) => (
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
                        <div className="divide-y divide-border border-b border-border">
                            {FAQS.map((f) => (
                                <details key={f.q} className="group py-3.5">
                                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 marker:content-none">
                                        <h3 className="font-display text-sm font-bold tracking-tight">
                                            {f.q}
                                        </h3>
                                        <span className="mt-0.5 shrink-0 font-mono text-xs text-muted-foreground transition-transform group-open:rotate-45">
                                            +
                                        </span>
                                    </summary>
                                    <p className="pr-8 pt-2 text-sm leading-relaxed text-muted-foreground">
                                        {f.a}
                                    </p>
                                </details>
                            ))}
                        </div>
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
                            <Link href="/#projects" className="btn-quiet">
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
