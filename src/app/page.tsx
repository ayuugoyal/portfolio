import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Badge } from "@/components/ui/badge";
import { IconCloudDemo } from "@/components/icon-cloud";
import { cn } from "@/lib/utils";
import AnimatedGradientText from "@/components/magicui/animated-gradient-text";
import { ArrowUpRight, ChevronRight, Github, Github as GitIcon } from "lucide-react";
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
    "Java",
    "C++",
    "Rust",
    "React.js",
    "express.js",
    "Next.js",
    "PostgresSQL",
    "MySQL",
    "MongoDB",
    "PrismaORM",
    "DrizzleORM",
    "Git",
    "Github",
    "AWS",
    "Azure",
    "Nginx",
    "Docker",
    "Supabase",
    "Firebase",
    "ROS Humble",
    "LangChain",
    "FastAPI",
    "Flask",
    "HuggingFace",
    "OpenAI",
    "VectorDBs",
    "ChromaDB",
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
                icon: <GitIcon />,
            },
        ],
        image: "/bcn-3d.jpg",
    },
    {
        title: "ChatterCraft AI",
        href: "https://chattercraftai.ayuugoyal.tech/",
        active: true,
        dates: "",
        description: "ChatterCraft AI is a lightweight, embeddable AI chatbot built to help businesses provide instant, intelligent customer support.  It answers product queries, recommends related items, and integrates in under 10 seconds.",
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
                href: "https://chattercraftai.ayuugoyal.tech/",
                icon: <GlobeIcon />,
            },
            {
                type: "Github",
                href: "https://github.com/ayuugoyal/chattercraft/",
                icon: <GitIcon />,
            },
        ],
        image: "/chatter.png",
    },
    {
        title: "LawGPT",
        href: "https://lawgpt.ayuugoyal.tech/",
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
                href: "https://lawgpt.ayuugoyal.tech/",
                icon: <GlobeIcon />,
            },
            {
                type: "Github",
                href: "https://github.com/ayuugoyal/lawgpt/",
                icon: <GitIcon />,
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
                icon: <GitIcon />,
            },
        ],
        image: "/scara.png",
    },
    {
        title: "ThriveAgro",
        href: "https://thriveagro-eta.vercel.app/",
        active: true,
        dates: "",
        description:
            "THRIVE AGRO is a web app that enhances farmers' livelihoods by providing inventory management, direct buyer connections, and a reporting system for infrastructure issues, streamlining operations and improving access to resources.",
        technologies: [
            "Next.js",
            "Typescript",
            "PostgreSQL",
            "Drizzle",
            "TailwindCSS",
            "Shadcn UI",
            "OpenAI",
            "HuggingFace",
        ],
        links: [
            {
                type: "Website",
                href: "https://thriveagro-eta.vercel.app/",
                icon: <GlobeIcon />,
            },
            {
                type: "Github",
                href: "https://github.com/ayuugoyal/thriveagro/",
                icon: <GitIcon />,
            },
        ],
        image: "/thrivagro.png",
    },
    {
        title: "Unstudio",
        href: "https://unstudio-ai.vercel.app/",
        active: true,
        dates: "",
        description:
            "An alternative to excelidraw to create and share your art on canvas by recording or sharing with a freture of adding intro and outro to recoreded videos.",
        technologies: [
            "Next.js",
            "Typescript",
            "PostgreSQL",
            "Prisma",
            "TailwindCSS",
            "Shadcn UI",
            "OpenAI",
            "Remotion",
            "Fabric JS",
            "NextAuth",
        ],
        links: [
            {
                type: "Website",
                href: "https://unstudio-ai.vercel.app/",
                icon: <GlobeIcon />,
            },
            {
                type: "Github",
                href: "https://github.com/ayuugoyal/unstudio/",
                icon: <GitIcon />,
            },
        ],
        image: "/unstudio.png",
    },
    {
        title: "Verdant",
        href: "https://verdant-phi.vercel.app/",
        active: true,
        dates: "",
        description:
            "Verdant utilizes Open AI key to personalize event planning. From community yoga sessions to cleanliness drives, AI tailors recommendations to fit users' preferences, making participation seamless and enjoyable.",
        technologies: [
            "Next.js",
            "Typescript",
            "PostgreSQL",
            "Drizzle",
            "TailwindCSS",
            "Shadcn UI",
            "OpenAI",
            "HuggingFace",
        ],
        links: [
            {
                type: "Website",
                href: "https://verdant-phi.vercel.app/",
                icon: <GlobeIcon />,
            },
            {
                type: "Github",
                href: "https://github.com/ayuugoyal/verdant/",
                icon: <GitIcon />,
            },
        ],
        image: "/verdant.png",
    },

    {
        title: "Surakshit",
        href: "https://surakshit.vercel.app/",
        active: true,
        dates: "",
        description:
            "Surakshit is a cybersecurity project designed to shield businesses and individuals from cyber threats like ransomware, phishing, and malicious activities, ensuring a safe online journey through advanced technologies and proactive measures.",
        technologies: [
            "Next.js",
            "Typescript",
            "PostgreSQL",
            "Drizzle",
            "TailwindCSS",
            "Shadcn UI",
            "OpenAI",
            "HuggingFace",
            "FastAPI",
            "Uvicorn",
            "Chroma",
            "LangChain",
        ],
        links: [
            {
                type: "Website",
                href: "https://surakshit.vercel.app/",
                icon: <GlobeIcon />,
            },
            {
                type: "Github",
                href: "https://github.com/ayuugoyal/surakshit/",
                icon: <GitIcon />,
            },
        ],
        image: "/surakshit.png",
    },
];

const proj = [
    {
        company: "Data Alt Dynamics",
        href: "",
        badges: [],
        location: "Remote",
        title: "Backend Developer",
        logoUrl: "/datalogo.png",
        start: "July 2025",
        description:
            "Deployed a Raspberry Pi–based server with multi-sensor integration for real-time data acquisition and control. Designed and optimised local ComfyUI workflows, boosting AI-driven process efficiency by 70%. Built scalable backend architectures and automated pipelines by integrating Cloudflare Tunnel with n8n, enabling secure remote access, seamless cloud sync, and reducing manual operational tasks by 40%."
    },
    {
        company: "Physics Wallah",
        badges: [],
        href: "https://pw.live",
        location: "Noida, IN",
        title: "Trainee",
        logoUrl: "/pwlogo.jpg",
        start: "May 2025",
        end: "July 2025",
        description: ""
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
        description: ""
    },
];

const caseStudies = [
    {
        title: "LawGPT – AI-Powered Legal Assistant",
        dates: "June 2024 - Aug 2024",
        description:
            "LawGPT is an AI-driven legal research assistant that leverages Retrieval-Augmented Generation (RAG) to deliver document-backed, transparent answers to legal queries. Designed to simplify access to complex legal information, LawGPT attracted *box#FFB6C1 70+ user sign-ups* in its early testing phase, validating strong demand for an AI-powered legal assistant.",
        image:
            "/law_i.png",
        links: [
            {
                title: "read more",
                href: "",
                icon: <ArrowUpRight />,
            },
        ],
    },
];

export default function Home() {
    return (
        <div className="">
            <section id="hero">
                <div className="mx-auto w-full max-w-2xl space-y-4 sm:space-y-8">
                    <div className="gap-2 flex justify-between">
                        <div className="flex-col flex flex-1 space-y-1.5">
                            <BlurFade delay={BLUR_FADE_DELAY}>
                                <TypingAnimation
                                    duration={80}
                                    className="prose max-w-full mb-1 text-pretty font-sans text-sm text-muted-foreground dark:prose-invert"
                                    text="const ayuugoyal = ( name, passion ) =>"
                                />
                            </BlurFade>
                            <BlurFadeText
                                delay={BLUR_FADE_DELAY}
                                className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
                                yOffset={8}
                                text="Hi, I'm Ayush 👋"
                            />
                            <BlurFade delay={BLUR_FADE_DELAY} className="md:text-xl gap-2 flex flex-wrap">
                                <Highlighter action="underline" color="#FF9800">
                                    AI Product Manager
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
                                className="hidden sm:flex sm:gap-3"
                            >
                                <Link
                                    href="https://drive.google.com/file/d/1wPyEPWPzfSSmk5lwP6279Tt6vzUMp5xT/view?usp=sharing"
                                    target="_blank"
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
                        <BlurFade delay={BLUR_FADE_DELAY}>
                            <Avatar className="size-28 border">
                                <AvatarImage
                                    alt="Ayush"
                                    className="w-full"
                                    src="/ayush.JPG"
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
                            href="https://drive.google.com/file/d/1wPyEPWPzfSSmk5lwP6279Tt6vzUMp5xT/view?usp=sharing"
                            target="_blank"
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
                            I&apos;m Ayush Goyal, a passionate AI Product Manager and Robotics Software Engineer with a knack for building innovative solutions. With a strong foundation in full-stack development and a love for cutting-edge technologies, I thrive on turning ideas into reality. Whether it&apos;s developing intelligent AI systems or crafting seamless user experiences, I&apos;m driven by the excitement of creating impactful products that make a difference. Let&apos;s connect and explore how we can bring your vision to life!
                        </div>
                    </BlurFade>
                </div>
            </section>
            <section id="work-experience">
                <div className="mx-auto w-full max-w-2xl pt-4 space-y-2">
                    <BlurFade delay={BLUR_FADE_DELAY * 3}>
                        <h2 className="text-xl font-bold">Work Experience</h2>
                    </BlurFade>
                    {proj.map((work, id) => (
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
            <section id="case-studies">
                <div className="mx-auto w-full max-w-2xl pt-4 space-y-2">
                    <BlurFade delay={BLUR_FADE_DELAY * 5}>
                        <h2 className="text-xl font-bold">Case Studies</h2>
                    </BlurFade>
                    <BlurFade delay={BLUR_FADE_DELAY * 5}>
                        <ul className="ml-4 divide-y divide-dashed border-l">
                            {caseStudies.map((project, id) => (
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
