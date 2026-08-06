import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { Badge } from "@/components/ui/badge";
import { IconCloudDemo } from "@/components/icon-cloud";
import { ArrowUpRight, Github, Github as GitIcon, Mail, Video } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ProjectCard } from "@/components/project-card";
import { Globe as GlobeIcon } from "lucide-react";
import TypingAnimation from "@/components/magicui/typing-animation";
import { Highlighter } from "@/components/magicui/highlighter";
import { ResumeCard } from "@/components/resume-card";
import { HackathonCard } from "@/components/pro-card";
import { VisitorCount } from "@/components/visitor-count";
import { Marquee } from "@/components/marquee";
import { SectionHeading } from "@/components/section-heading";

const BLUR_FADE_DELAY = 0.5;

const marqueeItems = [
    "physical ai",
    "ros2",
    "rag pipelines",
    "mcp servers",
    "arduino",
    "langgraph",
    "robot arms",
    "embedded systems",
    "computer vision",
    "things that move",
];

const currently = [
    { label: "cooking", value: "AI harness systems @ TAP Innovations" },
    { label: "obsessed w/", value: "Physical AI — ROS2 + embedded control" },
    { label: "shipping", value: "RAG & MCP servers that don't fold in prod" },
    { label: "down for", value: "robotics/AI roles + unhinged hardware collabs" },
];

const skillsData = [
    {
        category: "Physical AI / Robotics",
        skills: ["ROS2", "ROSBridge", "Arduino", "Raspberry Pi", "Embedded Systems", "Motion Control", "Sensor Integration", "Computer Vision", "WebSockets"],
    },
    {
        category: "AI / GenAI",
        skills: ["LangChain", "LangGraph", "LangSmith", "OpenAI API", "Gemini API", "HuggingFace", "RAG", "VectorDBs", "MCP Servers", "Prompt Engineering", "LLM Fine-tuning"],
    },
    {
        category: "AI Dev Tools",
        skills: ["Claude Code", "Cursor", "Antigravity", "n8n"],
    },
    {
        category: "Languages",
        skills: ["Python", "TypeScript / JavaScript", "C++"],
    },
    {
        category: "Backend & Frameworks",
        skills: ["Next.js", "FastAPI", "Flask", "Express.js", "React.js", "GraphQL", "REST APIs"],
    },
    {
        category: "Databases & Infrastructure",
        skills: ["PostgreSQL", "MongoDB", "MySQL", "Docker", "AWS / Azure", "Nginx", "PrismaORM", "DrizzleORM"],
    },
];

const projectsData = [
    {
        category: "Physical AI / Robotics",
        title: "BCN3D Moveo Control System",
        href: "https://github.com/ayuugoyal/bcn-3d-control-system",
        active: true,
        dates: "",
        description: "Full control system for the BCN3D Moveo robot arm — Next.js web UI, ROS2 integration, Arduino firmware. Real-time WebSocket comms, joint + cartesian control modes, 3D visualisation, and health monitoring so you know the second it's cooked.",
        technologies: [
            "Next.js",
            "TypeScript",
            "ROS2 Humble",
            "ROSBridge",
            "Python",
            "C++",
            "Arduino",
            "pnpm",
            "WebSockets",
        ],
        links: [
            {
                type: "Github",
                href: "https://github.com/ayuugoyal/bcn-3d-control-system",
                icon: <Github className="size-3" />,
            },
            {
                type: "Demo Video",
                href: "https://rndynamolabs.tech/bcn3d.mp4",
                icon: <Video className="size-3" />,
            },
        ],
        image: "/bcn-3d.jpg",
    },
    {
        category: "AI",
        title: "Chatter AI",
        href: "https://www.chatterai.tech/",
        active: true,
        dates: "",
        description: "Lightweight embeddable AI chatbot so businesses stop leaving customers on read. Answers product questions, recommends related items, and drops into a site in under 10 seconds.",
        technologies: [
            "Next.js",
            "Typescript",
            "PostgresSQL",
            "DrizzleORM",
            "Tailwindcss/ShadcnUI",
            "Google Gemini API",
            "Clerk",
            "LangChain",
        ],
        links: [
            {
                type: "Website",
                href: "https://www.chatterai.tech/",
                icon: <GlobeIcon className="size-3" />,
            },
            {
                type: "Github",
                href: "https://github.com/ayuugoyal/chatterai/",
                icon: <GitIcon className="size-3" />,
            },
        ],
        image: "/chatter.png",
    },
    {
        category: "AI",
        title: "LawGPT",
        href: "https://lawgpt.rndynamolabs.tech/",
        active: true,
        dates: "",
        description: "AI legal assistant running RAG, so every answer comes with receipts instead of vibes. HuggingFace embeddings + FAISS vectorstore + Gemini API, turning legal chaos into something you can actually read.",
        technologies: [
            "Next.js",
            "Typescript",
            "NeonDB - PostgresSQL",
            "DrizzleORM",
            "Tailwindcss/ShadcnUI",
            "Google Gemini API",
            "HuggingFace Embeddings",
            "FAISS Vectorstore",
            "Clerk",
            "FastAPI",
            "LangChain",
        ],
        links: [
            {
                type: "Website",
                href: "https://lawgpt.rndynamolabs.tech/",
                icon: <GlobeIcon className="size-3" />,
            },
            {
                type: "Github",
                href: "https://github.com/ayuugoyal/lawgpt/",
                icon: <GitIcon className="size-3" />,
            },
        ],
        image: "/lawgpt.png",
    },
    {
        category: "Physical AI / Robotics",
        title: "SCARA Robot",
        href: "https://github.com/ayuugoyal/scara",
        active: true,
        dates: "",
        description: "Control system for a 4-axis SCARA robot — Express.js API, Next.js frontend, Arduino Mega firmware. Precise motion control you can run remotely from a browser tab.",
        technologies: [
            "Arduino Mega",
            "Nema 17 Stepper Motors",
            "Next.js",
            "Typescript",
            "TailwindCSS",
            "Shadcn UI",
        ],
        links: [
            {
                type: "Github",
                href: "https://github.com/ayuugoyal/scara/",
                icon: <GitIcon className="size-3" />,
            },
            {
                type: "Demo Video",
                href: "https://rndynamolabs.tech/scara.mp4",
                icon: <Video className="size-3" />,
            },
        ],
        image: "/scara.png",
    },
    {
        category: "AI",
        title: "QuickDocs",
        href: "https://github.com/ayuugoyal/quickdocs",
        active: true,
        dates: "",
        description:
            "Instant docs for any service. CLI + MCP server powered by llms.txt — pull docs for any library or API in seconds, straight from your terminal or your agent. No more 40 open tabs.",
        technologies: [
            "TypeScript",
            "Shell",
            "MCP Server",
            "CLI",
            "llms.txt",
            "Node.js",
        ],
        links: [
            {
                type: "Github",
                href: "https://github.com/ayuugoyal/quickdocs",
                icon: <GitIcon className="size-3" />,
            },
        ],
        image: "/quickdocs.png",
    },
];

const workExp = [
    {
        company: "TAP Innovations",
        href: "https://tapinnov.com/",
        badges: [],
        location: "Remote, US",
        title: "AI (Harness) Engineer",
        logoUrl: "/tapinnov.png",
        start: "May 2026",
        current: true,
        description:
            "AI (Harness) Engineer at TAP Innovations, a US software startup building integrations, analytics and custom apps for enterprise systems. Fully remote, shipping AI-driven solutions — while going all in on Physical AI, i.e. machine intelligence inside actual robots and embedded hardware. Calling it now: that's the next big thing."
    },
    {
        company: "Loadshare Networks",
        href: "https://www.loadshare.net/",
        badges: [],
        location: "Remote",
        title: "AI Engineer",
        logoUrl: "/loadshare.svg",
        start: "Nov 2025",
        end: "Apr 2026",
        description:
            "AI Engineer at Loadshare Networks, a big name in logistics and supply chain tech. Built AI-driven solutions to optimise logistics ops, make deliveries way less painful, and level up the customer experience. Also freelanced AI/ML consulting on the side across a bunch of domains."
    },
    {
        company: "Data Alt Dynamics",
        href: "https://dataaltdynamics.com/",
        badges: [],
        location: "Remote",
        title: "Backend Developer",
        logoUrl: "/datalogo.png",
        start: "July 2025",
        end: "Nov 2025",
        description:
            "Shipped a Raspberry Pi server with multi-sensor integration for real-time data acquisition and control. Tuned local ComfyUI workflows and made AI-driven processes 70% more efficient. Glued Cloudflare Tunnel to n8n for secure remote access and clean cloud sync, which deleted 40% of the manual busywork."
    },
    {
        company: "Physics Wallah",
        badges: [],
        href: "https://www.pw.live",
        location: "Noida, IN",
        title: "Trainee",
        logoUrl: "/pwlogo.jpg",
        start: "May 2025",
        end: "July 2025",
        description: "Backend and platform engineering at India's biggest ed-tech, serving millions of students across JEE, NEET and school curricula. Real traffic, real stakes, zero room to fumble."
    },
    {
        company: "Bharat Electronics Limited",
        href: "https://bel-india.in/homepage/",
        badges: [],
        location: "Delhi, IN",
        title: "Summer Intern",
        logoUrl: "/bellogo.png",
        start: "June 2024",
        end: "Aug 2024",
        description: "Embedded systems and electronics at India's top defence electronics manufacturer, under the Ministry of Defence. First proper taste of industrial hardware, and the reason i'm stuck on this stuff now."
    },
];

const patentdata = [
    {
        title: "3D Printed, Pneumatically Actuated Four-Finger Adaptive Gripper",
        dates: "June 2025",
        description:
            "UK Design Registration for an industrial robotic end-effector: a pneumatically actuated four-finger gripper that grabs objects of basically any shape or size. Adaptive robotics for manufacturing, officially on record.",
        image: "/patent.png",
        links: [
            {
                title: "see the patent",
                href: "/patents/6450987",
                icon: <ArrowUpRight />,
            }
        ],
    },
];

const openSourceData = [
    {
        title: "archestra-ai/archestra",
        dates: "2026",
        description:
            "AI agent platform — MCP servers, multi-LLM orchestration, RAG knowledge connectors & embeddings. Shipped the Notion connector, Gemini embeddings, SharePoint & OneDrive connectors, an OAuth proxy fix, and recursive subfolder traversal across 6 PRs. *underline#84cc16 Maintainers paid out $400 in bounties.* Big W.",
        image: "https://github.com/archestra-ai.png",
        links: [
            {
                title: "archestra-ai/archestra",
                href: "https://github.com/archestra-ai/archestra",
                icon: <Github />,
            },
            {
                title: "pr #3555",
                href: "https://github.com/archestra-ai/archestra/pull/3555",
                icon: <ArrowUpRight />,
            },
            {
                title: "pr #3611",
                href: "https://github.com/archestra-ai/archestra/pull/3611",
                icon: <ArrowUpRight />,
            },
            {
                title: "pr #3656",
                href: "https://github.com/archestra-ai/archestra/pull/3656",
                icon: <ArrowUpRight />,
            },
            {
                title: "pr #3960",
                href: "https://github.com/archestra-ai/archestra/pull/3960",
                icon: <ArrowUpRight />,
            },
            {
                title: "pr #3400",
                href: "https://github.com/archestra-ai/archestra/pull/3400",
                icon: <ArrowUpRight />,
            },
            {
                title: "pr #3958",
                href: "https://github.com/archestra-ai/archestra/pull/3958",
                icon: <ArrowUpRight />,
            },
        ],
    },
    {
        title: "bolna-ai/bolna",
        dates: "2025",
        description:
            "Open-source voice AI agent framework (telephony, LLM, TTS pipelines). Killed the duplicate .env situation in the telephony server Dockerfiles (Twilio & Plivo) by centralising config through the docker-compose env_file directive. Small PR, big ick removed.",
        image: "https://github.com/bolna-ai.png",
        links: [
            {
                title: "bolna-ai/bolna",
                href: "https://github.com/bolna-ai/bolna",
                icon: <Github />,
            },
            {
                title: "pr #310",
                href: "https://github.com/bolna-ai/bolna/pull/310",
                icon: <ArrowUpRight />,
            },
        ],
    },
];

export default function Home() {
    return (
        <div className="overflow-x-clip">
            {/* ───────────────────────── hero ───────────────────────── */}
            <section id="hero" className="px-5">
                <div className="mx-auto w-full max-w-2xl space-y-5">
                    <BlurFade delay={BLUR_FADE_DELAY}>
                        <div className="inline-flex items-center gap-2 font-mono text-[10px] lowercase text-muted-foreground">
                            <span className="relative flex size-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                                <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
                            </span>
                            open to work — robots preferred
                        </div>
                    </BlurFade>

                    <div className="flex items-start justify-between gap-5">
                        <div className="flex flex-1 flex-col space-y-3">
                            <BlurFade delay={BLUR_FADE_DELAY}>
                                <TypingAnimation
                                    duration={70}
                                    className="max-w-full text-pretty font-mono text-[11px] font-normal leading-none text-muted-foreground"
                                    text="// certified robot whisperer, allegedly"
                                />
                            </BlurFade>

                            <BlurFadeText
                                delay={BLUR_FADE_DELAY}
                                className="font-display text-5xl font-bold lowercase leading-[0.9] tracking-tight sm:text-6xl"
                                yOffset={8}
                                text="ayush"
                            />
                            <BlurFadeText
                                delay={BLUR_FADE_DELAY + 0.1}
                                className="text-outline -mt-1 font-display text-5xl font-bold lowercase leading-[0.9] tracking-tight sm:text-6xl"
                                yOffset={8}
                                text="goyal"
                            />

                            <BlurFade
                                delay={BLUR_FADE_DELAY}
                                className="max-w-md pt-1 text-sm leading-relaxed text-muted-foreground"
                            >
                                i do{" "}
                                <Highlighter action="underline" color="#a3e635">
                                    <span className="text-foreground">Physical AI</span>
                                </Highlighter>{" "}
                                — giving machines a brain, then making them actually move.
                                it&apos;s giving sentient.
                            </BlurFade>
                        </div>

                        <BlurFade delay={BLUR_FADE_DELAY} className="shrink-0">
                            <Image
                                src="/sakuta.png"
                                alt="Ayush Goyal"
                                width={160}
                                height={160}
                                className="size-16 rounded-2xl border border-border object-cover sm:size-24"
                                priority
                            />
                        </BlurFade>
                    </div>

                    <BlurFade
                        delay={BLUR_FADE_DELAY}
                        className="flex flex-wrap items-center gap-2"
                    >
                        <Link href="/resume" className="btn-solid">
                            peep the resume
                            <ArrowUpRight className="size-3.5" />
                        </Link>
                        <Link
                            href="mailto:ayushgoyal8178@gmail.com"
                            className="btn-quiet"
                        >
                            <Mail className="size-3.5" />
                            slide in
                        </Link>
                    </BlurFade>
                </div>
            </section>

            {/* ───────────────────────── ticker ───────────────────────── */}
            <BlurFade delay={BLUR_FADE_DELAY} className="my-12">
                <Marquee items={marqueeItems} duration={40} />
            </BlurFade>

            {/* ───────────────────────── about ───────────────────────── */}
            <section id="about" className="px-5">
                <div className="mx-auto w-full max-w-2xl space-y-4">
                    <BlurFade delay={BLUR_FADE_DELAY * 3}>
                        <SectionHeading index="01" title="the lore" kicker="no yap, promise" />
                    </BlurFade>
                    <BlurFade delay={BLUR_FADE_DELAY * 4}>
                        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                            AI engineer, but make it physical. I got bored of things that only
                            live in a browser tab, so now I build{" "}
                            <span className="text-foreground">Physical AI</span> — real GenAI
                            in prod (RAG pipelines, LLM integrations, MCP servers) wired
                            straight into hardware that moves. ROS2 control stacks, Arduino
                            firmware, and a robotic gripper the UK government looked at and
                            went yeah, that&apos;s new. Currently AI (Harness) Engineer at TAP
                            Innovations, remote for a US team. Everything I ship has to survive
                            the real world: chatbots with actual paying customers, open-source
                            AI platforms, robot arms you can drive from a browser. No demos
                            that only work on my laptop.
                        </p>
                    </BlurFade>

                    <BlurFade delay={BLUR_FADE_DELAY * 4}>
                        <dl className="divide-y divide-border border-y border-border">
                            {currently.map((c) => (
                                <div
                                    key={c.label}
                                    className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-4"
                                >
                                    <dt className="w-28 shrink-0 font-mono text-[10px] lowercase text-muted-foreground">
                                        {c.label}
                                    </dt>
                                    <dd className="text-sm">{c.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </BlurFade>
                </div>
            </section>

            {/* ───────────────────────── work ───────────────────────── */}
            <section id="work-experience" className="px-5 pt-14">
                <div className="mx-auto w-full max-w-2xl space-y-3">
                    <BlurFade delay={BLUR_FADE_DELAY * 3}>
                        <SectionHeading
                            index="02"
                            title="where i've been cooking"
                            kicker="tap for the yap"
                        />
                    </BlurFade>
                    <div>
                        {workExp.map((work, id) => (
                            <BlurFade
                                key={work.company}
                                delay={BLUR_FADE_DELAY * 6 + id * 0.05}
                            >
                                <ResumeCard
                                    logoUrl={work.logoUrl}
                                    altText={work.company}
                                    title={work.company}
                                    subtitle={work.title}
                                    href={work.href}
                                    badges={work.badges}
                                    current={work.current}
                                    period={`${work.start} — ${work.end ?? "now"}`}
                                    description={work.description}
                                />
                            </BlurFade>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───────────────────────── open source ───────────────────────── */}
            <section id="open-source" className="px-5 pt-14">
                <div className="mx-auto w-full max-w-2xl space-y-2">
                    <BlurFade delay={BLUR_FADE_DELAY * 5}>
                        <SectionHeading
                            index="03"
                            title="free labor era"
                            kicker="except it paid"
                        />
                    </BlurFade>
                    <ul className="divide-y divide-border">
                        {openSourceData.map((project, id) => (
                            <BlurFade
                                key={project.title + project.dates}
                                delay={BLUR_FADE_DELAY * 7 + id * 0.05}
                            >
                                <HackathonCard
                                    title={project.title}
                                    description={project.description}
                                    dates={project.dates}
                                    image={project.image}
                                    links={project.links}
                                />
                            </BlurFade>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ───────────────────────── patents ───────────────────────── */}
            <section id="patents" className="px-5 pt-14">
                <div className="mx-auto w-full max-w-2xl space-y-2">
                    <BlurFade delay={BLUR_FADE_DELAY * 5}>
                        <SectionHeading
                            index="04"
                            title="certified inventor arc"
                            kicker="the uk agreed"
                        />
                    </BlurFade>
                    <ul className="divide-y divide-border">
                        {patentdata.map((project, id) => (
                            <BlurFade
                                key={project.title + project.dates}
                                delay={BLUR_FADE_DELAY * 7 + id * 0.05}
                            >
                                <HackathonCard
                                    title={project.title}
                                    description={project.description}
                                    dates={project.dates}
                                    image={project.image}
                                    links={project.links}
                                />
                            </BlurFade>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ───────────────────────── skills ───────────────────────── */}
            <section id="skills" className="px-5 pt-14">
                <div className="mx-auto w-full max-w-2xl space-y-4">
                    <BlurFade delay={BLUR_FADE_DELAY * 5}>
                        <SectionHeading
                            index="05"
                            title="the arsenal"
                            kicker="stuff i actually use"
                        />
                    </BlurFade>
                    <div className="flex flex-col gap-6 sm:flex-row">
                        <div className="flex flex-1 flex-col gap-3.5">
                            {skillsData.map((group, i) => (
                                <BlurFade key={group.category} delay={BLUR_FADE_DELAY + i * 0.08}>
                                    <div>
                                        <p className="mb-1.5 font-mono text-[10px] lowercase text-muted-foreground">
                                            {group.category}
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {group.skills.map((skill) => (
                                                <Badge key={skill} variant="chip">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </BlurFade>
                            ))}
                        </div>
                        <div className="w-full shrink-0 sm:w-56">
                            <IconCloudDemo />
                        </div>
                    </div>
                </div>
            </section>

            {/* ───────────────────────── projects ───────────────────────── */}
            <section id="projects" className="px-5 pt-14">
                <div className="mx-auto w-full max-w-2xl space-y-5">
                    <BlurFade delay={BLUR_FADE_DELAY * 5}>
                        <SectionHeading index="06" title="the receipts" kicker="click around" />
                    </BlurFade>
                    {(["Physical AI / Robotics", "AI"] as const).map((cat) => (
                        <BlurFade key={cat} delay={BLUR_FADE_DELAY * 5}>
                            <div className="space-y-2.5">
                                <p className="font-mono text-[10px] lowercase text-muted-foreground">
                                    {cat}
                                </p>
                                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {projectsData
                                        .filter((p) => p.category === cat)
                                        .map((project, id) => (
                                            <BlurFade
                                                key={project.title}
                                                delay={BLUR_FADE_DELAY * 8 + id * 0.05}
                                            >
                                                <ProjectCard
                                                    href={project.href}
                                                    title={project.title}
                                                    description={project.description}
                                                    dates={project.dates}
                                                    tags={project.technologies}
                                                    image={project.image}
                                                    links={project.links}
                                                />
                                            </BlurFade>
                                        ))}
                                </ul>
                            </div>
                        </BlurFade>
                    ))}
                </div>
            </section>

            {/* ───────────────────────── contact ───────────────────────── */}
            <section id="contact" className="px-5 pb-20 pt-16">
                <div className="mx-auto w-full max-w-2xl">
                    <BlurFade delay={BLUR_FADE_DELAY}>
                        <SectionHeading index="07" title="hit me up" kicker="dms are open" />
                    </BlurFade>

                    <BlurFade delay={BLUR_FADE_DELAY}>
                        <div className="mt-6 space-y-4">
                            <h3 className="font-display text-2xl font-bold lowercase tracking-tight sm:text-3xl">
                                got a robot that needs a brain?
                            </h3>
                            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                                Slide into my DMs with an actual question, or just email me. I
                                reply to everything that isn&apos;t a recruiter copy-paste.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Link
                                    href="mailto:ayushgoyal8178@gmail.com"
                                    className="btn-solid"
                                >
                                    <Mail className="size-3.5" />
                                    email me
                                </Link>
                                <Link
                                    href="https://x.com/ayuugoyal"
                                    target="_blank"
                                    className="btn-quiet"
                                >
                                    @ayuugoyal
                                    <ArrowUpRight className="size-3.5" />
                                </Link>
                                <Link
                                    href="https://github.com/ayuugoyal"
                                    target="_blank"
                                    className="btn-quiet"
                                >
                                    <Github className="size-3.5" />
                                    github
                                </Link>
                            </div>
                        </div>
                    </BlurFade>

                    <BlurFade delay={BLUR_FADE_DELAY}>
                        <div className="mt-14 flex flex-col items-center justify-between gap-2 border-t border-border pt-4 font-mono text-[10px] lowercase text-muted-foreground sm:flex-row">
                            <span>ayush goyal — india, remote-friendly</span>
                            <VisitorCount />
                        </div>
                    </BlurFade>
                </div>
            </section>
        </div>
    );
}
