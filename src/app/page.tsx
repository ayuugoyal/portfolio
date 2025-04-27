import { Experience } from "@/components/experience";
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Badge } from "@/components/ui/badge";
import { IconCloudDemo } from "@/components/icon-cloud";
import { cn } from "@/lib/utils";
import AnimatedGradientText from "@/components/magicui/animated-gradient-text";
import { ChevronRight, Github as GitIcon } from "lucide-react";
import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { Globe as GlobeIcon } from "lucide-react";
import MagicButton from "@/components/magic-button";
import TypingAnimation from "@/components/magicui/typing-animation";

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
    "GraphQL",
    "SQL/NoSQL DB",
    "PrismaORM",
    "DrizzleORM",
    "Git",
    "Github",
    "Gitlab",
    "AWS",
    "Azure",
    "Nginx",
    "Docker",
    "vercel",
    "Supabase",
    "Firebase",
    "ROS Humble",
];

const projectsData = [
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
                            <BlurFadeText
                                className="max-w-[600px] md:text-xl"
                                delay={BLUR_FADE_DELAY}
                                text="Robotics Software Engineer with a passion for building cool stuff."
                            />
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
            <div className="mx-auto w-full max-w-2xl grid items-center sm:grid-cols-2 sm:space-y-8">
                <div className="flex gap-3 min-h-0 flex-col">
                    <div className="max-w-7xl">
                        <BlurFadeText
                            className="text-2xl mt-6 font-semibold md:text-4xl text-black dark:text-white max-w-4xl"
                            text="Skills"
                        />
                    </div>
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
                </div>
                <div className="flex justify-center ml-2 items-center">
                    <IconCloudDemo />
                </div>
            </div>
            <section
                id="projects"
                className="mx-auto sm:mt-32 w-full max-w-2xl space-y-4 sm:space-y-8"
            >
                <div className="space-y-12 w-full py-12">
                    <BlurFade delay={BLUR_FADE_DELAY * 11}>
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                                    Check out my latest work
                                </h2>
                                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    I&apos;ve tackled a wide range of projects,
                                    from sleek websites to intricate web
                                    applications. Here are some of my top picks.
                                </p>
                            </div>
                        </div>
                    </BlurFade>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-[800px] mx-auto">
                        {projectsData.map((project, id) => (
                            <BlurFade
                                key={project.title}
                                delay={BLUR_FADE_DELAY * 12 + id * 0.05}
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
                    </div>
                </div>
            </section>
            <Experience />
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
        </div>
    );
}
