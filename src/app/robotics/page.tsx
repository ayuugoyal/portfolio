import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, ChevronLeft } from "lucide-react";
import BlurFade from "@/components/magicui/blur-fade";
import { Footer } from "@/components/footer";
import { RobotTabs } from "@/components/robots/robot-tabs";
import { JsonLd } from "@/components/structured-data";
import { PROJECTS, SITE } from "@/lib/site";
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
const moveo = robots.find((p) => p.slug === "bcn3d-moveo")!;
const rover = robots.find((p) => p.slug === "raftaar-rover")!;

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
                    projectListSchema([arm, moveo, rover], "Robots"),
                    patentSchema(),
                ]}
            />

            <section className="mx-auto w-full max-w-4xl space-y-8">
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
                            freelance robotics · physical ai
                        </p>
                    </BlurFade>
                    <BlurFade delay={D}>
                        <h1 className="font-display text-4xl font-medium lowercase tracking-[-0.01em] sm:text-5xl">
                            robots i build
                        </h1>
                    </BlurFade>
                    <BlurFade delay={D}>
                        <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
                            Motors, firmware and ROS 2, for clients and for my own builds — and
                            putting LLMs in charge of real hardware, behind a controller that keeps
                            them safe. Need a robot built or brought to life? I take freelance
                            robotics work.
                        </p>
                    </BlurFade>
                </div>

                <BlurFade delay={D}>
                    <RobotTabs
                        robots={[
                            { kind: "so101", label: "SO-101", project: arm },
                            { kind: "moveo", label: "BCN3D Moveo", project: moveo },
                            { kind: "rover", label: "Raftaar", project: rover },
                        ]}
                    />
                </BlurFade>

                <BlurFade delay={D}>
                    <div className="mb-16 space-y-4 border-t border-border pt-8">
                        <h2 className="font-display text-2xl font-medium lowercase tracking-[-0.01em] sm:text-3xl">
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
