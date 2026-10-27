import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, ChevronLeft } from "lucide-react";
import BlurFade from "@/components/magicui/blur-fade";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/structured-data";
import { PROJECTS, SITE, SKILLS } from "@/lib/site";
import {
    IDS,
    breadcrumbSchema,
    patentSchema,
    projectListSchema,
} from "@/lib/schema";

const D = 0.06;
const PATH = "/robotics";
const TITLE = "Robots — Claude Code SO-101 Arm & Autonomous Rover";
const DESCRIPTION =
    "Robots Ayush Goyal builds: an SO-101 arm Claude Code drives over MCP, and ROS 2 + Nav2 LiDAR obstacle avoidance for a 2.2 m skid-steer ArduPilot rover running on an NVIDIA Jetson.";

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
const arm = robots.find((p) => p.slug === "so101-claude-code")!;
const rover = robots.find((p) => p.slug === "raftaar-rover")!;
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
                        about: ["Robotics", "Physical AI", "ROS2", "Nav2", "LeRobot", "SO-101", "MCP", "Claude Code", "Robot arm", "Autonomous rover", "ArduPilot"],
                    },
                    projectListSchema([arm, rover], "Robots"),
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
                            Day job is AI. After hours it&apos;s motors, firmware and ROS2 — and
                            putting LLMs in charge of real hardware, behind a controller that keeps
                            them safe.
                        </p>
                    </BlurFade>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_3fr]">
                    <BlurFade delay={D}>
                        <figure id={arm.slug} className="scroll-mt-24 space-y-2">
                            <video
                                src={arm.video}
                                poster={arm.poster}
                                controls
                                playsInline
                                preload="none"
                                className="aspect-[9/16] w-full rounded-xl border border-border bg-muted object-cover"
                            />
                            <figcaption className="font-mono text-[10px] lowercase text-muted-foreground">
                                sound on · claude code drives the arm over mcp
                            </figcaption>
                        </figure>
                    </BlurFade>
                    <div className="space-y-3">
                        <BlurFade delay={D}>
                            <div className="space-y-2">
                                <h2 className="font-display text-xl font-bold tracking-tight">
                                    {arm.title}
                                </h2>
                                <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                                    {arm.description}
                                </p>
                            </div>
                        </BlurFade>
                        <BlurFade delay={D}>
                            <figure id={rover.slug} className="scroll-mt-24 space-y-2 pt-2">
                                <video
                                    src={rover.video}
                                    poster={rover.poster}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="aspect-video w-full rounded-xl border border-border bg-muted object-cover"
                                />
                                <figcaption className="space-y-1">
                                    <span className="block font-display text-sm font-bold tracking-tight">
                                        {rover.title}
                                    </span>
                                    <span className="block text-pretty text-sm leading-relaxed text-muted-foreground">
                                        {rover.description}
                                    </span>
                                </figcaption>
                            </figure>
                        </BlurFade>
                    </div>
                </div>

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
                            hiring for robotics or physical ai?
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
                            <Link href="/resume" className="btn-quiet">
                                resume
                                <ArrowUpRight className="size-3.5" />
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
