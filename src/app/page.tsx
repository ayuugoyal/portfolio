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
import { CoolMode } from "@/components/magicui/cool-mode";
import { Button } from "@/components/ui/button";
import ShinyButton from "@/components/magicui/shiny-button";
import MagicButton from "@/components/magic-button";

const BLUR_FADE_DELAY = 0.5;

const skillsList = [
    "React",
    "Next.js",
    "Typescript",
    "Javascript",
    "Node.js",
    "express.js",
    "Rust",
    "Git",
    "Github",
    "Gitlab",
    "Python",
    "PostgresSQL",
    "Docker",
    "Java",
    "C++",
    "html5",
    "css3",
    "PrismaORM",
    "DrizzleORM",
    "AWS",
    "Firebase",
    "Nginx",
    "vercel",
];

const projectsData = [
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
];

export default function Home() {
    return (
        <div className="">
            <section id="hero">
                <div className="mx-auto w-full max-w-2xl space-y-4 sm:space-y-8">
                    <div className="gap-2 flex justify-between">
                        <div className="flex-col flex flex-1 space-y-1.5">
                            <BlurFadeText
                                className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert"
                                delay={BLUR_FADE_DELAY}
                                text="const ayuugoyal = ( name, passion ) =>"
                            />
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
            <Experience />
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
                                    I&apos;ve worked on a variety of projects,
                                    from simple websites to complex web
                                    applications. Here are a few of my
                                    favorites.
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
            <section id="contact" className="mb-10">
                <div className="grid items-center justify-center gap-4 px-4 text-center md:px-6 w-full py-12">
                    <BlurFade delay={BLUR_FADE_DELAY}>
                        <div className="space-y-3">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                                Get in Touch
                            </h2>
                            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                Want to chat? Just shoot me a dm{" "}
                                <Link
                                    href="https://x.com/ayuugoyal"
                                    className="text-blue-500 hover:underline"
                                >
                                    with a direct question on twitter
                                </Link>{" "}
                                and I&apos;ll respond whenever I can. I will
                                ignore all soliciting.
                            </p>
                        </div>
                    </BlurFade>
                </div>
            </section>
        </div>
    );
}
