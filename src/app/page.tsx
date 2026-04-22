import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Badge } from "@/components/ui/badge";
import { IconCloudDemo } from "@/components/icon-cloud";
import { cn } from "@/lib/utils";
import AnimatedGradientText from "@/components/magicui/animated-gradient-text";
import { ArrowUpRight, ChevronRight, Github, Github as GitIcon, Video } from "lucide-react";
import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { Globe as GlobeIcon } from "lucide-react";
import MagicButton from "@/components/magic-button";
import TypingAnimation from "@/components/magicui/typing-animation";
import { Highlighter } from "@/components/magicui/highlighter";
import { ResumeCard } from "@/components/resume-card";
import { HackathonCard } from "@/components/pro-card";

const BLUR_FADE_DELAY = 0.5;

const skillsList = [
    "Typescript/Javascript",
    "Node.js",
    "Python",
    "C++",
    "React.js",
    "Next.js",
    "express.js",
    "PostgresSQL",
    "MySQL",
    "MongoDB",
    "PrismaORM",
    "DrizzleORM",
    "Git/Github",
    "AWS/Azure clouds",
    "Nginx",
    "Docker",
    "ROS2",
    "Arduino",
    "Raspberry Pi",
    "Websockets",
    "REST APIs",
    "GraphQL",
    "TailwindCSS",
    "Shadcn UI",
    "Framer Motion",
    "LLM's Integration",
    "LangChain/LangSmith/LangGraph",
    "FastAPI/Flask",
    "HuggingFace",
    "OpenAI",
    "VectorDBs",
];

const projectsData = [
    {
        title: "BCN3D Moveo Control System",
        href: "https://github.com/ayuugoyal/bcn-3d-control-system",
        active: true,
        dates: "",
        description: "A complete control system for the BCN3D Moveo robot arm with a modern Next.js web interface, ROS2 integration, and Arduino firmware. Features include real-time WebSocket communication, joint and cartesian control modes, 3D visualization, and system health monitoring.",
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
                icon: <Github className="size-4" />,
            },
            {
                type: "Demo Video",
                href: "https://rndynamolabs.tech/bcn3d.mp4",
                icon: <Video className="size-4" />,
            },
        ],
        image: "/bcn-3d.jpg",
    },
    {
        title: "Chatter AI",
        href: "https://www.chatterai.tech/",
        active: true,
        dates: "",
        description: "Chatter AI is a lightweight, embeddable AI chatbot built to help businesses provide instant, intelligent customer support. It answers product queries, recommends related items, and integrates in under 10 seconds.",
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
                icon: <GlobeIcon className="size-4" />,
            },
            {
                type: "Github",
                href: "https://github.com/ayuugoyal/chattercraft/",
                icon: <GitIcon className="size-4" />,
            },
        ],
        image: "/chatter.png",
    },
    {
        title: "LawGPT",
        href: "https://lawgpt.rndynamolabs.tech/",
        active: true,
        dates: "",
        description: "LawGPT is an AI-powered legal assistant that uses Retrieval-Augmented Generation (RAG) to provide instant, document-backed legal guidance. By leveraging advanced technologies like HuggingFace embeddings, FAISS vectorstore, and the Gemini API, it helps users navigate complex legal matters efficiently and accurately.",
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
                icon: <GlobeIcon className="size-4" />,
            },
            {
                type: "Github",
                href: "https://github.com/ayuugoyal/lawgpt/",
                icon: <GitIcon className="size-4" />,
            },
        ],
        image: "/lawgpt.png",
    },
    {
        title: "SCARA Robot",
        href: "https://github.com/ayuugoyal/scara",
        active: true,
        dates: "",
        description: "A comprehensive control system for a 4-axis SCARA robot that combines an Express.js backend API, Next.js frontend, and Arduino Mega firmware for precise motion control, enabling remote operation and automation via a web interface.",
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
                icon: <GitIcon className="size-4" />,
            },
            {
                type: "Demo Video",
                href: "https://rndynamolabs.tech/scara.mp4",
                icon: <Video className="size-4" />,
            },
        ],
        image: "/scara.png",
    },
    {
        title: "QuickDocs",
        href: "https://github.com/ayuugoyal/quickdocs",
        active: true,
        dates: "",
        description:
            "Instant documentation fetcher for any service. CLI + MCP server powered by llms.txt — fetch docs for any library or API in seconds directly from your terminal or AI agent.",
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
                icon: <GitIcon className="size-4" />,
            },
        ],
        image: "/quickdocs.png",
    },
    {
        title: "Maintain AI",
        href: "https://rndynamolabs.tech/",
        active: true,
        dates: "",
        description:
            "Industry-grade operations chatbot deployed for internal use at a Singapore company. Enterprise deployment with active paying customers — handles operational queries, maintenance workflows, and internal knowledge retrieval.",
        technologies: [
            "Next.js",
            "TypeScript",
            "LLM Integration",
            "RAG",
            "PostgreSQL",
            "Docker",
        ],
        links: [
            {
                type: "Website",
                href: "https://rndynamolabs.tech/",
                icon: <GlobeIcon className="size-4" />,
            },
        ],
        image: "/surakshit.png",
    },
];

const workExp = [
    {
        company: "Loadshare Networks",
        href: "https://www.loadshare.net/",
        badges: [],
        location: "Remote",
        title: "AI Engineer",
        logoUrl: "/loadshare.svg",
        start: "Nov 2025",
        description:
            "Working as an AI Engineer at Loadshare Networks, a leading logistics and supply chain technology company. Developing and implementing AI-driven solutions to optimize logistics operations, enhance delivery efficiency, and improve customer experience. Additionally providing freelance consulting services for AI/ML projects across various domains."
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
            "Deployed a Raspberry Pi–based server with multi-sensor integration for real-time data acquisition and control. Designed and optimised local ComfyUI workflows, boosting AI-driven process efficiency by 70%. Built scalable backend architectures and automated pipelines by integrating Cloudflare Tunnel with n8n, enabling secure remote access, seamless cloud sync, and reducing manual operational tasks by 40%."
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
        description: "Contributed to backend development and platform engineering at India's leading ed-tech platform serving millions of students across JEE, NEET, and school curricula."
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
        description: "Worked on embedded systems and electronics projects at India's premier defence electronics manufacturer under the Ministry of Defence, gaining hands-on experience with industrial hardware systems."
    },
];

const patentdata = [
    {
        title: "3D Printed, Pneumatically Actuated Four-Finger Adaptive Gripper",
        dates: "June 2025",
        description:
            "UK Design Registration for an innovative industrial robotic end-effector featuring pneumatically actuated multi-finger grippers capable of grasping objects of various shapes and sizes. This patented design represents a breakthrough in adaptive robotics technology for manufacturing applications.",
        image: "/patent.png",
        links: [
            {
                title: "View Patent",
                href: "/patents/6450987",
                icon: <ArrowUpRight />,
            }
        ],
    },
];

const openSourceData = [
    {
        title: "archestra-ai/archestra",
        dates: "2025",
        description:
            "AI agent platform — MCP servers, multi-LLM orchestration, RAG knowledge connectors & embeddings. *box#c3b1e1 Built Notion knowledge connector* — full-workspace & incremental sync via lastSyncedAt checkpoint, recursive block-to-Markdown conversion up to 3 levels deep (PR#3555). Added provider-agnostic Gemini embedding API client with outputDimensionality support (PR#3611). Fixed OAuth HTTPS metadata generation behind TLS-terminating reverse proxies via ARCHESTRA_TRUST_PROXY env var (PR#3400). Built Microsoft SharePoint knowledge connector with incremental sync & multimodal embedding support — merged by maintainer from my commits (PR#3656). Added recursive SharePoint subfolder traversal (PR#3960). *box#FFD700 Awarded $400 in bounties* by maintainers.",
        image: "https://github.com/archestra-ai.png",
        links: [
            {
                title: "archestra-ai/archestra",
                href: "https://github.com/archestra-ai/archestra",
                icon: <Github />,
            },
            {
                title: "PR #3555",
                href: "https://github.com/archestra-ai/archestra/pull/3555",
                icon: <ArrowUpRight />,
            },
            {
                title: "PR #3611",
                href: "https://github.com/archestra-ai/archestra/pull/3611",
                icon: <ArrowUpRight />,
            },
            {
                title: "PR #3656",
                href: "https://github.com/archestra-ai/archestra/pull/3656",
                icon: <ArrowUpRight />,
            },
            {
                title: "PR #3960",
                href: "https://github.com/archestra-ai/archestra/pull/3960",
                icon: <ArrowUpRight />,
            },
            {
                title: "PR #3400",
                href: "https://github.com/archestra-ai/archestra/pull/3400",
                icon: <ArrowUpRight />,
            },
        ],
    },
    {
        title: "bolna-ai/bolna",
        dates: "2025",
        description:
            "Open-source voice AI agent framework (telephony, LLM, TTS pipelines). Resolved duplicate .env file requirement in telephony server Dockerfiles (Twilio & Plivo), centralising config via docker-compose env_file directive (PR#310).",
        image: "https://github.com/bolna-ai.png",
        links: [
            {
                title: "bolna-ai/bolna",
                href: "https://github.com/bolna-ai/bolna",
                icon: <Github />,
            },
            {
                title: "PR #310",
                href: "https://github.com/bolna-ai/bolna/pull/310",
                icon: <ArrowUpRight />,
            },
        ],
    },
];

export default function Home() {
    return (
        <div className="px-5">
            <section id="hero">
                <div className="mx-auto w-full max-w-2xl space-y-4 sm:space-y-8">
                    <div className="gap-2 flex justify-between">
                        <div className="flex-col flex flex-1 space-y-1.5">
                            <BlurFade delay={BLUR_FADE_DELAY}>
                                <TypingAnimation
                                    duration={80}
                                    className="prose max-w-full mb-1 text-pretty font-sans text-xs sm:text-sm text-muted-foreground dark:prose-invert"
                                    text="const ayuugoyal = ( name, passion ) =>"
                                />
                            </BlurFade>
                            <BlurFadeText
                                delay={BLUR_FADE_DELAY}
                                className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
                                yOffset={8}
                                text="Hi, I'm Ayush 👋"
                            />
                            <BlurFade delay={BLUR_FADE_DELAY} className="md:text-xl space-y-2 ">
                                <Highlighter action="underline" color="#FF9800">
                                    GenAI Engineer
                                </Highlighter> &{" "}
                                <Highlighter action="underline" color="#8BC34A">
                                    Robotics Software Engineer
                                </Highlighter>{" "}
                                with a passion for{" "}
                                <Highlighter action="highlight" color="#d677b6">
                                    building cool
                                </Highlighter>{" "} stuff.
                            </BlurFade>
                            <BlurFade
                                delay={BLUR_FADE_DELAY}
                                className="hidden sm:flex sm:gap-3 pt-2"
                            >
                                <Link
                                    href="/resume"
                                    className="flex items-center"
                                >
                                    <AnimatedGradientText className="">
                                        🎉{" "}
                                        <hr className="mx-2 h-4 w-[1px] shrink-0 bg-gray-300" />{" "}
                                        <span
                                            className={cn(
                                                `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
                                            )}
                                        >
                                            Checkout my Resume
                                        </span>
                                        <ChevronRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
                                    </AnimatedGradientText>
                                </Link>
                                <MagicButton />
                            </BlurFade>
                        </div>
                        <BlurFade delay={BLUR_FADE_DELAY} className="sm:p-10">
                            <Avatar className="size-28 border">
                                <AvatarImage
                                    alt="Ayush"
                                    className="w-full"
                                    src="/sakuta.png"
                                />
                                <AvatarFallback className="text-6xl font-bold text-center w-full h-full flex items-center justify-center">
                                    AG
                                </AvatarFallback>
                            </Avatar>
                        </BlurFade>
                    </div>
                    <BlurFade
                        delay={BLUR_FADE_DELAY}
                        className="flex gap-3 sm:hidden"
                    >
                        <Link
                            href="/resume"
                            className="flex items-center"
                        >
                            <AnimatedGradientText>
                                🎉{" "}
                                <hr className="mx-2 h-4 w-[1px] shrink-0 bg-gray-300" />{" "}
                                <span
                                    className={cn(
                                        `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
                                    )}
                                >
                                    Checkout my Resume
                                </span>
                                <ChevronRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
                            </AnimatedGradientText>
                        </Link>
                        <MagicButton />
                    </BlurFade>
                </div>
            </section>
            <section id="about">
                <div className="mx-auto w-full max-w-2xl pt-4 space-y-2">
                    <BlurFade delay={BLUR_FADE_DELAY * 3}>
                        <h2 className="text-xl font-bold">About</h2>
                    </BlurFade>
                    <BlurFade delay={BLUR_FADE_DELAY * 4}>
                        <div className="prose max-w-full text-pretty font-sans text-sm dark:prose-invert">
                            I&apos;m Ayush Goyal, a passionate AI Engineer and Robotics Software Engineer with a knack for building innovative solutions. With a strong foundation in full-stack development and a love for cutting-edge technologies, I thrive on turning ideas into reality. Whether it&apos;s developing intelligent AI systems or crafting seamless user experiences, I&apos;m driven by the excitement of creating impactful products that make a difference. Let&apos;s connect and explore how we can bring your vision to life!
                        </div>
                    </BlurFade>
                </div>
            </section>
            <section id="work-experience">
                <div className="mx-auto w-full max-w-2xl pt-4 space-y-2">
                    <BlurFade delay={BLUR_FADE_DELAY * 3}>
                        <h2 className="text-xl font-bold">Work Experience</h2>
                    </BlurFade>
                    {workExp.map((work, id) => (
                        <BlurFade
                            key={work.company}
                            delay={BLUR_FADE_DELAY * 6 + id * 0.05}
                        >
                            <ResumeCard
                                key={work.company}
                                logoUrl={work.logoUrl}
                                altText={work.company}
                                title={work.company}
                                subtitle={work.title}
                                href={work.href}
                                badges={work.badges}
                                period={`${work.start} - ${work.end ?? "Present"}`}
                                description={work.description}
                            />
                        </BlurFade>
                    ))}
                </div>
            </section>
            <section id="patents">
                <div className="mx-auto w-full max-w-2xl pt-4 space-y-2">
                    <BlurFade delay={BLUR_FADE_DELAY * 5}>
                        <h2 className="text-xl font-bold">Patents</h2>
                    </BlurFade>
                    <BlurFade delay={BLUR_FADE_DELAY * 5}>
                        <ul className="ml-4 divide-y divide-dashed border-l">
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
                    </BlurFade>
                </div>
            </section>
            <section id="open-source">
                <div className="mx-auto w-full max-w-2xl pt-4 space-y-2">
                    <BlurFade delay={BLUR_FADE_DELAY * 5}>
                        <h2 className="text-xl font-bold">Open Source</h2>
                    </BlurFade>
                    <BlurFade delay={BLUR_FADE_DELAY * 5}>
                        <ul className="ml-4 divide-y divide-dashed border-l">
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
                    </BlurFade>
                </div>
            </section>
            <section id="skills">
                <div className="mx-auto w-full max-w-2xl pt-4 space-y-2">
                    <BlurFade delay={BLUR_FADE_DELAY * 5}>
                        <h2 className="text-xl font-bold">Skills</h2>
                    </BlurFade>
                    <div className="flex justify-start items-center flex-col sm:flex-row gap-4">
                        <div className="flex flex-wrap gap-1">
                            {skillsList.map((skill, id) => (
                                <BlurFade
                                    key={skill}
                                    delay={BLUR_FADE_DELAY + id * 0.05}
                                >
                                    <Badge key={skill}>{skill}</Badge>
                                </BlurFade>
                            ))}
                        </div>
                        <div className="px-14 sm:px-0 w-full">
                            <IconCloudDemo />
                        </div>
                    </div>
                </div>
            </section>
            <section id="projects">
                <div className="mx-auto w-full max-w-2xl pt-4 space-y-2">
                    <BlurFade delay={BLUR_FADE_DELAY * 5}>
                        <h2 className="text-xl font-bold">Projects</h2>
                    </BlurFade>
                    <BlurFade delay={BLUR_FADE_DELAY * 5}>
                        <ul className="pt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {projectsData.map((project, id) => (
                                <BlurFade
                                    key={project.title}
                                    delay={BLUR_FADE_DELAY * 8 + id * 0.05}
                                >
                                    <ProjectCard
                                        href={project.href}
                                        key={project.title}
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
                    </BlurFade>
                </div>
            </section>
            <section id="contact" className="mb-10">
                <div className="grid items-center justify-center gap-4 px-4 text-center md:px-6 w-full py-12">
                    <BlurFade delay={BLUR_FADE_DELAY}>
                        <div className="space-y-3">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                                Get in Touch
                            </h2>
                            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                Got something on your mind? Slide into my DMs{" "}
                                <Link
                                    href="https://x.com/ayuugoyal"
                                    className="text-blue-500 hover:underline"
                                >
                                    on Twitter
                                </Link>{" "}
                                with a direct question or mail at{" "}
                                <Link
                                    href="mailto:ayushgoyal8178@gmail.com"
                                    className="text-blue-500 hover:underline"
                                >
                                    ayushgoyal8178@gmail.com
                                </Link>
                                , and I&apos;ll hit you back when I can.
                            </p>
                        </div>
                    </BlurFade>
                </div>
            </section>
        </div >
    );
}
