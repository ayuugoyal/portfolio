import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, ChevronLeft } from "lucide-react";
import BlurFade from "@/components/magicui/blur-fade";
import { Footer } from "@/components/footer";
import { ProjectCard } from "@/components/project-card";
import { JsonLd } from "@/components/structured-data";
import { withIcons } from "@/components/project-links";
import { PROJECTS, SITE, SKILLS } from "@/lib/site";
import {
    IDS,
    breadcrumbSchema,
    patentSchema,
    projectListSchema,
} from "@/lib/schema";

const D = 0.06;
const PATH = "/robotics";
const TITLE = "Robots — ROS2 Arms, SCARA, ArduPilot & Physical AI";
const DESCRIPTION =
    "Robots Ayush Goyal builds as side projects: a ROS2-controlled BCN3D Moveo 6-DOF arm, a browser-controlled SCARA, voice control for ArduPilot vehicles, and a patented pneumatic four-finger gripper.";

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
        type: "website",
    },
    twitter: { title: `${TITLE} — ${SITE.name}`, description: DESCRIPTION },
};

const robots = PROJECTS.filter((p) => p.category === "Robots & Physical AI");
const stack = SKILLS.find((s) => s.category === "Robotics & Physical AI")?.skills ?? [];

export default function RoboticsPage() {
    return (
        <div className="px-5">
            <JsonLd
                graph={[
                    breadcrumbSchema([{ name: "Robotics", path: PATH }]),
                    {
                        "@type": "CollectionPage",
                        "@id": `${SITE.url}${PATH}#page`,
                        url: `${SITE.url}${PATH}`,
                        name: TITLE,
                        description: DESCRIPTION,
                        author: { "@id": IDS.person },
                        isPartOf: { "@id": IDS.website },
                        about: ["Robotics", "Physical AI", "ROS2", "Robot arm", "SCARA", "ArduPilot"],
                    },
                    projectListSchema(robots, "Robots"),
                    patentSchema(),
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
                            side projects · physical ai
                        </p>
                    </BlurFade>
                    <BlurFade delay={D}>
                        <h1 className="font-display text-4xl font-bold lowercase tracking-tight sm:text-5xl">
                            robots i build
                        </h1>
                    </BlurFade>
                    <BlurFade delay={D}>
                        <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
                            Day job is AI. After hours it&apos;s motors, firmware and ROS2.
                        </p>
                    </BlurFade>
                </div>

                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {robots.map((p) => (
                        <BlurFade key={p.slug} delay={D}>
                            <ProjectCard
                                href={p.href}
                                title={p.title}
                                description={p.blurb ?? p.description}
                                dates={p.dates}
                                tags={[]}
                                image={p.image}
                                links={withIcons(p.links)}
                            />
                        </BlurFade>
                    ))}
                </ul>

                <BlurFade delay={D}>
                    <p className="font-mono text-[11px] lowercase leading-loose text-muted-foreground">
                        {stack.map((s, i) => (
                            <span key={s}>
                                {i > 0 && <span className="px-2 opacity-30">/</span>}
                                {s}
                            </span>
                        ))}
                    </p>
                </BlurFade>

                <BlurFade delay={D}>
                    <div className="mb-16 space-y-4 border-t border-border pt-8">
                        <h2 className="font-display text-2xl font-bold lowercase tracking-tight sm:text-3xl">
                            need ai in a machine?
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href={SITE.booking}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-solid"
                            >
                                <CalendarDays className="size-3.5" />
                                book a call
                            </Link>
                            <Link href="/patents/6450987" className="btn-quiet">
                                the gripper patent
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
