import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { IconCloudDemo } from "@/components/icon-cloud";
import {
    ArrowUpRight,
    CalendarDays,
    Github,
    Github as GitIcon,
    Mail,
    Video,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ProjectCard } from "@/components/project-card";
import { Globe as GlobeIcon } from "lucide-react";
import TypingAnimation from "@/components/magicui/typing-animation";
import { Highlighter } from "@/components/magicui/highlighter";
import { ResumeCard } from "@/components/resume-card";
import { HackathonCard } from "@/components/pro-card";
import { SectionHeading } from "@/components/section-heading";
import { Footer } from "@/components/footer";
import { ServiceCard } from "@/components/service-card";
import { PROCESS, SERVICES, SITE, SKILLS } from "@/lib/site";

const D = 0.06;

/** how many services show on the home page before linking to /services */
const HOME_SERVICES = 5;

const CAPABILITIES = [
    "ai agents",
    "voice agents",
    "whatsapp bots",
    "rag",
    "mcp servers",
    "lead gen",
    "automation",
    "integrations",
    "ros2",
    "physical ai",
];

const currently = [
    { label: "cooking", value: "AI harness systems @ TAP Innovations" },
    { label: "obsessed w/", value: "agentic systems + Physical AI" },
    { label: "shipping", value: "RAG, MCP servers & voice agents in prod" },
    { label: "open for", value: "freelance builds, retainers, weird hardware" },
];

const PROJECT_CATEGORIES = [
    "AI Agents & Automation",
    "Chat & Voice Agents",
    "AI Products",
    "GTM & Growth",
    "Physical AI / Robotics",
] as const;

const projectsData = [
    {
        category: "AI Agents & Automation",
        title: "AI DevOps Agent",
        href: "https://github.com/ayuugoyal/ai-devops-agent",
        dates: "2026",
        description:
            "An AI-native DevOps engineer. Connects to any cloud or server from Slack, terminal or Claude Desktop through the official MCP SDK — 67+ AWS MCP servers, Docker, and a Slack bot front end.",
        technologies: ["Python", "MCP SDK", "Docker", "AWS", "Slack Bot", "Claude Desktop"],
        links: [
            {
                type: "Github",
                href: "https://github.com/ayuugoyal/ai-devops-agent",
                icon: <GitIcon className="size-3" />,
            },
        ],
    },
    {
        category: "AI Agents & Automation",
        title: "slack-claude",
        href: "https://github.com/ayuugoyal/slack-claude",
        dates: "2026",
        description:
            "Control Claude Code from Slack. Mention the bot on a bug report and it investigates, fixes it in an isolated git branch and raises a GitHub PR — without anyone leaving the channel.",
        technologies: ["Python", "Slack Bolt", "Claude Code", "GitHub API", "Git"],
        links: [
            {
                type: "Github",
                href: "https://github.com/ayuugoyal/slack-claude",
                icon: <GitIcon className="size-3" />,
            },
        ],
    },
    {
        category: "AI Agents & Automation",
        title: "QuickDocs",
        href: "https://github.com/ayuugoyal/quickdocs",
        dates: "2026",
        description:
            "Instant docs for any service. CLI + MCP server powered by llms.txt — pull documentation for any library or API in seconds, straight from your terminal or your agent. No more 40 open tabs.",
        technologies: ["TypeScript", "MCP Server", "CLI", "llms.txt", "Node.js"],
        links: [
            {
                type: "Github",
                href: "https://github.com/ayuugoyal/quickdocs",
                icon: <GitIcon className="size-3" />,
            },
        ],
        image: "/quickdocs.png",
    },
    {
        category: "Chat & Voice Agents",
        title: "NBC 2016 WhatsApp Assistant",
        dates: "2025",
        description:
            "A WhatsApp AI agent that answers National Building Code (Part 4) questions over the client's own documentation. FastAPI + Gemini with a comprehensive domain prompt instead of a vectorstore, tuned to run on a low-resource VPS. Private client work.",
        technologies: [
            "Python",
            "FastAPI",
            "Gemini API",
            "WhatsApp Business API",
            "Docker",
            "VPS",
        ],
        links: [],
    },
    {
        category: "Chat & Voice Agents",
        title: "ArduPilot Assistant",
        href: "https://github.com/ayuugoyal/ArduPilot-Assistant",
        dates: "",
        description:
            "Natural-language and voice control of ArduPilot vehicles. An LLM orchestration layer turns spoken commands into MAVLink through a vehicle connection layer — voice agents pointed at actual hardware.",
        technologies: ["Next.js", "MAVLink", "ArduPilot", "OpenAI", "Gemini", "Voice"],
        links: [
            {
                type: "Live",
                href: "https://ardupilot-assistant.ayuugoyal.tech/",
                icon: <GlobeIcon className="size-3" />,
            },
            {
                type: "Github",
                href: "https://github.com/ayuugoyal/ArduPilot-Assistant",
                icon: <GitIcon className="size-3" />,
            },
        ],
    },
    {
        category: "AI Products",
        title: "Chatter AI",
        href: "https://www.chatterai.tech/",
        dates: "",
        description:
            "Lightweight embeddable AI chatbot so businesses stop leaving customers on read. Answers product queries, recommends related items, and drops into a site in under 10 seconds.",
        technologies: [
            "Next.js",
            "TypeScript",
            "PostgreSQL",
            "DrizzleORM",
            "Gemini API",
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
        category: "AI Products",
        title: "LawGPT",
        href: "https://lawgpt.rndynamolabs.tech/",
        dates: "",
        description:
            "AI legal assistant running RAG, so every answer comes with receipts instead of vibes. HuggingFace embeddings + FAISS vectorstore + Gemini API, turning legal chaos into something you can actually read.",
        technologies: [
            "Next.js",
            "FastAPI",
            "LangChain",
            "HuggingFace",
            "FAISS",
            "Gemini API",
            "NeonDB",
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
        category: "GTM & Growth",
        title: "Lead Enrichment Tool",
        href: "https://github.com/ayuugoyal/lead-enrich-data",
        dates: "",
        description:
            "Full-stack lead enrichment for outbound. Next.js frontend with Firebase auth over a Flask backend that uses Gemini to generate company intelligence — a cheaper, more flexible stand-in for Clearbit.",
        technologies: ["Next.js", "Flask", "Gemini API", "Firebase Auth", "Python"],
        links: [
            {
                type: "Live",
                href: "https://lead-enrich-data.vercel.app",
                icon: <GlobeIcon className="size-3" />,
            },
            {
                type: "Github",
                href: "https://github.com/ayuugoyal/lead-enrich-data",
                icon: <GitIcon className="size-3" />,
            },
        ],
    },
    {
        category: "GTM & Growth",
        title: "Cold Outreach Engine",
        href: "https://github.com/ayuugoyal/auto-mail",
        dates: "",
        description:
            "Personalised cold email at volume, built for RnDynamos Labs. Standard-library Python only — web UI, SMTP sender, scheduler, per-vertical templates, daily send caps, suppression lists and a full sent log.",
        technologies: ["Python", "SMTP", "pm2", "Scheduling", "CSV Pipelines"],
        links: [
            {
                type: "Github",
                href: "https://github.com/ayuugoyal/auto-mail",
                icon: <GitIcon className="size-3" />,
            },
        ],
    },
    {
        category: "Physical AI / Robotics",
        title: "BCN3D Moveo Control System",
        href: "https://github.com/ayuugoyal/bcn-3d-control-system",
        dates: "",
        description:
            "Full control system for the BCN3D Moveo 6-DOF robot arm — Next.js web UI, ROS2 integration, Arduino firmware. Real-time WebSocket comms, joint + cartesian control modes, 3D visualisation and health monitoring.",
        technologies: [
            "Next.js",
            "ROS2 Humble",
            "ROSBridge",
            "Python",
            "C++",
            "Arduino",
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
        category: "Physical AI / Robotics",
        title: "Sensor Dash — IoT Factory Server",
        dates: "2025",
        description:
            "Raspberry Pi sensor server for live factory visibility. FastAPI with WebSocket streaming, Arduino integration for analog sensors, DHT / BH1750 / MCP3008 over I2C and SPI, and a Next.js dashboard on top. Private client work.",
        technologies: [
            "Python",
            "FastAPI",
            "Raspberry Pi",
            "Arduino",
            "WebSockets",
            "SQLite",
            "Next.js",
            "Drizzle",
        ],
        links: [],
    },
    {
        category: "Physical AI / Robotics",
        title: "SCARA Robot",
        href: "https://github.com/ayuugoyal/scara",
        dates: "",
        description:
            "Control system for a 4-axis SCARA robot — Express.js API, Next.js frontend, Arduino Mega firmware. Precise motion control you can run remotely from a browser tab.",
        technologies: [
            "Arduino Mega",
            "Nema 17 Steppers",
            "Next.js",
            "TypeScript",
            "Express.js",
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
            "AI (Harness) Engineer at TAP Innovations, a US software startup building integrations, analytics and custom apps for enterprise systems. Fully remote, shipping AI-driven solutions — while going all in on Physical AI, i.e. machine intelligence inside actual robots and embedded hardware. Calling it now: that's the next big thing.",
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
            "AI Engineer at Loadshare Networks, a big name in logistics and supply chain tech. Built AI-driven solutions to optimise logistics ops, make deliveries way less painful, and level up the customer experience. Also freelanced AI/ML consulting on the side across a bunch of domains.",
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
            "Shipped a Raspberry Pi server with multi-sensor integration for real-time data acquisition and control. Tuned local ComfyUI workflows and made AI-driven processes 70% more efficient. Glued Cloudflare Tunnel to n8n for secure remote access and clean cloud sync, which deleted 40% of the manual busywork.",
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
        description:
            "Backend and platform engineering at India's biggest ed-tech, serving millions of students across JEE, NEET and school curricula. Real traffic, real stakes, zero room to fumble.",
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
        description:
            "Embedded systems and electronics at India's top defence electronics manufacturer, under the Ministry of Defence. First proper taste of industrial hardware, and the reason i'm stuck on this stuff now.",
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
            { title: "see the patent", href: "/patents/6450987", icon: <ArrowUpRight /> },
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
            { title: "pr #3555", href: "https://github.com/archestra-ai/archestra/pull/3555", icon: <ArrowUpRight /> },
            { title: "pr #3611", href: "https://github.com/archestra-ai/archestra/pull/3611", icon: <ArrowUpRight /> },
            { title: "pr #3656", href: "https://github.com/archestra-ai/archestra/pull/3656", icon: <ArrowUpRight /> },
            { title: "pr #3960", href: "https://github.com/archestra-ai/archestra/pull/3960", icon: <ArrowUpRight /> },
            { title: "pr #3400", href: "https://github.com/archestra-ai/archestra/pull/3400", icon: <ArrowUpRight /> },
            { title: "pr #3958", href: "https://github.com/archestra-ai/archestra/pull/3958", icon: <ArrowUpRight /> },
        ],
    },
    {
        title: "bolna-ai/bolna",
        dates: "2025",
        description:
            "Open-source voice AI agent framework (telephony, LLM, TTS pipelines). Killed the duplicate .env situation in the telephony server Dockerfiles (Twilio & Plivo) by centralising config through the docker-compose env_file directive. Small PR, big ick removed.",
        image: "https://github.com/bolna-ai.png",
        links: [
            { title: "bolna-ai/bolna", href: "https://github.com/bolna-ai/bolna", icon: <Github /> },
            { title: "pr #310", href: "https://github.com/bolna-ai/bolna/pull/310", icon: <ArrowUpRight /> },
        ],
    },
];

export default function Home() {
    return (
        <div className="overflow-x-clip">
            {/* ───────────────────────── hero ───────────────────────── */}
            <section id="hero" className="px-5">
                <div className="mx-auto w-full max-w-2xl space-y-5">
                    <BlurFade delay={D}>
                        <div className="inline-flex items-center gap-2 font-mono text-[10px] lowercase text-muted-foreground">
                            <span className="relative flex size-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                                <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
                            </span>
                            available for freelance &amp; contract work
                        </div>
                    </BlurFade>

                    <div className="flex items-start justify-between gap-5">
                        <div className="flex flex-1 flex-col space-y-3">
                            <BlurFade delay={D}>
                                <TypingAnimation
                                    duration={70}
                                    className="max-w-full text-pretty font-mono text-[11px] font-normal leading-none text-muted-foreground"
                                    text="// i design the system, then i ship it"
                                />
                            </BlurFade>

                            <BlurFadeText
                                delay={D}
                                className="font-display text-5xl font-bold lowercase leading-[0.9] tracking-tight sm:text-6xl"
                                yOffset={8}
                                text="ayush"
                            />
                            <BlurFadeText
                                delay={D + 0.08}
                                className="text-outline -mt-1 font-display text-5xl font-bold lowercase leading-[0.9] tracking-tight sm:text-6xl"
                                yOffset={8}
                                text="goyal"
                            />

                            <BlurFade delay={D} className="space-y-1 pt-1">
                                <h1 className="font-display text-lg font-bold tracking-tight sm:text-xl">
                                    AI Engineer
                                </h1>
                                <p className="font-mono text-[10px] lowercase leading-relaxed text-muted-foreground">
                                    ai solution architect · gtm engineer · harness engineer ·
                                    physical ai
                                </p>
                            </BlurFade>

                            <BlurFade
                                delay={D}
                                className="max-w-md text-sm leading-relaxed text-muted-foreground"
                            >
                                I build{" "}
                                <Highlighter action="underline" color="#a3e635">
                                    <span className="text-foreground">AI that ships</span>
                                </Highlighter>{" "}
                                — agents, voice bots, RAG, lead-gen and automation — plus the
                                robots that run it in the real world.
                            </BlurFade>
                        </div>

                        <BlurFade delay={D} className="shrink-0">
                            <Image
                                src="/sakuta.png"
                                alt="Ayush Goyal, AI Solution Architect and GTM Engineer"
                                width={160}
                                height={160}
                                className="size-16 rounded-2xl border border-border object-cover sm:size-24"
                                priority
                            />
                        </BlurFade>
                    </div>

                    <BlurFade delay={D} className="flex flex-wrap items-center gap-2">
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
                        <Link href="#services" className="btn-quiet">
                            what i build
                        </Link>
                        <Link href="/resume" className="btn-quiet">
                            resume
                            <ArrowUpRight className="size-3.5" />
                        </Link>
                    </BlurFade>

                    <BlurFade delay={D}>
                        <p className="font-mono text-[10px] lowercase text-muted-foreground">
                            remote worldwide · currently ai engineer @ tap innovations (us)
                            · uk patent holder
                        </p>
                    </BlurFade>
                </div>
            </section>

            {/* ─────────────────── capability strip ─────────────────── */}
            <BlurFade delay={D} className="px-5 pt-12">
                <p className="mx-auto w-full max-w-2xl font-mono text-[11px] lowercase leading-loose text-muted-foreground">
                    {CAPABILITIES.map((c, i) => (
                        <span key={c}>
                            {i > 0 && <span className="px-2 opacity-30">/</span>}
                            {c}
                        </span>
                    ))}
                </p>
            </BlurFade>

            {/* ───────────────────────── services ───────────────────────── */}
            <section id="services" className="px-5 pt-12">
                <div className="mx-auto w-full max-w-2xl space-y-2">
                    <BlurFade delay={D}>
                        <SectionHeading
                            index="01"
                            title="what i build for you"
                            sub="services"
                            kicker="pick your problem"
                        />
                    </BlurFade>
                    <BlurFade delay={D}>
                        <p className="pb-2 pt-3 text-sm leading-relaxed text-muted-foreground">
                            End-to-end: I scope the system, choose the models, build it, and
                            hand you something your team can run. Fixed-scope builds or
                            ongoing retainers.
                        </p>
                    </BlurFade>
                    <div>
                        {SERVICES.slice(0, HOME_SERVICES).map((s, i) => (
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
                    <BlurFade delay={D}>
                        <Link
                            href="/services"
                            className="group inline-flex items-center gap-1.5 pt-4 font-mono text-[11px] lowercase text-muted-foreground transition-colors hover:text-foreground"
                        >
                            + {SERVICES.length - HOME_SERVICES} more — see all{" "}
                            {SERVICES.length} services
                            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </BlurFade>

                    {/* how an engagement runs — the freelance conversion path */}
                    <BlurFade delay={D}>
                        <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-3">
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
                    </BlurFade>

                    <BlurFade delay={D}>
                        <div className="flex flex-wrap items-center gap-2 pt-4">
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
                            <Link
                                href={SITE.socials.lab}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-quiet"
                            >
                                rndynamos labs
                                <ArrowUpRight className="size-3.5" />
                            </Link>
                        </div>
                    </BlurFade>
                </div>
            </section>

            {/* ───────────────────────── about ───────────────────────── */}
            <section id="about" className="px-5 pt-16">
                <div className="mx-auto w-full max-w-2xl space-y-4">
                    <BlurFade delay={D}>
                        <SectionHeading
                            index="02"
                            title="the lore"
                            sub="about"
                            kicker="no yap, promise"
                        />
                    </BlurFade>
                    <BlurFade delay={D}>
                        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                            AI engineer, but make it physical. I got bored of things that only
                            live in a browser tab, so now I build{" "}
                            <span className="text-foreground">Physical AI</span> — real GenAI
                            in prod, wired straight into hardware that moves. No demos that
                            only work on my laptop.
                        </p>
                    </BlurFade>

                    <BlurFade delay={D}>
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

            {/* ───────────────────────── projects ───────────────────────── */}
            <section id="projects" className="px-5 pt-16">
                <div className="mx-auto w-full max-w-2xl space-y-5">
                    <BlurFade delay={D}>
                        <SectionHeading
                            index="03"
                            title="the receipts"
                            sub="projects"
                            kicker="click around"
                        />
                    </BlurFade>
                    {PROJECT_CATEGORIES.map((cat) => (
                        <BlurFade key={cat} delay={D}>
                            <div className="space-y-2.5">
                                <h3 className="font-mono text-[10px] lowercase text-muted-foreground">
                                    {cat}
                                </h3>
                                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {projectsData
                                        .filter((p) => p.category === cat)
                                        .map((project) => (
                                            <BlurFade key={project.title} delay={D}>
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

            {/* ───────────────────────── work ───────────────────────── */}
            <section id="work-experience" className="px-5 pt-16">
                <div className="mx-auto w-full max-w-2xl space-y-3">
                    <BlurFade delay={D}>
                        <SectionHeading
                            index="04"
                            title="where i've been cooking"
                            sub="experience"
                            kicker="tap for the yap"
                        />
                    </BlurFade>
                    <div>
                        {workExp.map((work) => (
                            <BlurFade key={work.company} delay={D}>
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
            <section id="open-source" className="px-5 pt-16">
                <div className="mx-auto w-full max-w-2xl space-y-2">
                    <BlurFade delay={D}>
                        <SectionHeading
                            index="05"
                            title="free labor era"
                            sub="open source"
                            kicker="except it paid"
                        />
                    </BlurFade>
                    <ul className="divide-y divide-border">
                        {openSourceData.map((project) => (
                            <BlurFade key={project.title} delay={D}>
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
            <section id="patents" className="px-5 pt-16">
                <div className="mx-auto w-full max-w-2xl space-y-2">
                    <BlurFade delay={D}>
                        <SectionHeading
                            index="06"
                            title="certified inventor arc"
                            sub="patents"
                            kicker="the uk agreed"
                        />
                    </BlurFade>
                    <ul className="divide-y divide-border">
                        {patentdata.map((project) => (
                            <BlurFade key={project.title} delay={D}>
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
            <section id="skills" className="px-5 pt-16">
                <div className="mx-auto w-full max-w-2xl space-y-4">
                    <BlurFade delay={D}>
                        <SectionHeading
                            index="07"
                            title="the arsenal"
                            sub="skills"
                            kicker="stuff i actually use"
                        />
                    </BlurFade>
                    <div className="flex flex-col gap-6 sm:flex-row">
                        {/* collapsed by default — 12 categories expanded at once
                            made this section taller than the rest of the page.
                            The text still renders into the DOM for crawlers. */}
                        <div className="flex-1 divide-y divide-border border-y border-border">
                            {SKILLS.map((group) => (
                                <BlurFade key={group.category} delay={D}>
                                    <details className="group py-2.5">
                                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 marker:content-none">
                                            <h3 className="font-mono text-[11px] lowercase">
                                                {group.category}
                                            </h3>
                                            <span className="flex shrink-0 items-center gap-2 font-mono text-[10px] tabular-nums text-muted-foreground">
                                                {group.skills.length}
                                                <span className="transition-transform group-open:rotate-45">
                                                    +
                                                </span>
                                            </span>
                                        </summary>
                                        <p className="pt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                                            {group.skills.join(" · ")}
                                        </p>
                                    </details>
                                </BlurFade>
                            ))}
                        </div>
                        <div className="w-full shrink-0 sm:w-48">
                            <IconCloudDemo />
                        </div>
                    </div>
                </div>
            </section>

            {/* ───────────────────────── contact ───────────────────────── */}
            <section id="contact" className="px-5 pb-20 pt-16">
                <div className="mx-auto w-full max-w-2xl">
                    <BlurFade delay={D}>
                        <SectionHeading
                            index="09"
                            title="hit me up"
                            sub="contact"
                            kicker="dms are open"
                        />
                    </BlurFade>

                    <BlurFade delay={D}>
                        <div className="mt-8 flex flex-col items-center space-y-4 text-center">
                            <h2 className="font-display text-2xl font-bold lowercase tracking-tight sm:text-3xl">
                                got something that needs a brain?
                            </h2>
                            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                                Agent, voice bot, RAG system, outbound machine, or a robot arm —
                                tell me what you&apos;re trying to build and I&apos;ll tell you
                                straight whether it&apos;s worth it. I reply to everything that
                                isn&apos;t a recruiter copy-paste.
                            </p>
                            <div className="flex flex-wrap justify-center gap-2">
                                <Link
                                    href={SITE.booking}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-solid"
                                >
                                    <CalendarDays className="size-3.5" />
                                    book a call
                                </Link>
                                <Link href={`mailto:${SITE.email}`} className="btn-quiet">
                                    <Mail className="size-3.5" />
                                    email me
                                </Link>
                                <Link
                                    href={SITE.socials.x}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-quiet"
                                >
                                    @ayuugoyal
                                    <ArrowUpRight className="size-3.5" />
                                </Link>
                                <Link
                                    href={SITE.socials.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-quiet"
                                >
                                    linkedin
                                    <ArrowUpRight className="size-3.5" />
                                </Link>
                                <Link
                                    href={SITE.socials.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-quiet"
                                >
                                    <Github className="size-3.5" />
                                    github
                                </Link>
                            </div>
                        </div>
                    </BlurFade>

                </div>
            </section>

            <div className="px-5 pb-16">
                <Footer />
            </div>
        </div>
    );
}
