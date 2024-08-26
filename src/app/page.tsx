import { Bento } from "@/components/bento";
import { Experience } from "@/components/experience";
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import BlurIn from "@/components/magicui/blur-in";
import GradualSpacing from "@/components/magicui/gradual-spacing";
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Badge } from "@/components/ui/badge";
import { IconCloudDemo } from "@/components/icon-cloud";
import { cn } from "@/lib/utils";
import AnimatedGradientText from "@/components/magicui/animated-gradient-text";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

const BLUR_FADE_DELAY = 0.5;

const skillsList = [
    "React",
    "Next.js",
    "Typescript",
    "Node.js",
    "rust",
    "git",
    "github",
    "gitlab",
    "Python",
    "Go",
    "Postgres",
    "Docker",
    "Kubernetes",
    "Java",
    "C++",
];

export default function Home() {
    return (
        <div className="">
            <section id="hero">
                <div className="mx-auto w-full max-w-2xl space-y-8">
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
                            <Link
                                href="https://drive.google.com/file/d/1wPyEPWPzfSSmk5lwP6279Tt6vzUMp5xT/view?usp=sharing"
                                target="_blank"
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
                        </div>
                        <BlurFade delay={BLUR_FADE_DELAY}>
                            <Avatar className="size-28 border">
                                <AvatarImage alt="Ayush" src="." />
                                <AvatarFallback className="text-6xl font-bold text-center w-full h-full flex items-center justify-center">
                                    AG
                                </AvatarFallback>
                            </Avatar>
                        </BlurFade>
                    </div>
                </div>
            </section>
            <div className="mx-auto w-full max-w-2xl grid items-center grid-cols-2 space-y-8">
                <div className="flex min-h-0 flex-col gap-y-3">
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
                <div className="flex justify-center items-center">
                    <IconCloudDemo />
                </div>
            </div>
            <Experience />
            {/* <Bento /> */}
        </div>
    );
}
