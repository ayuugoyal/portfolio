import Image from "next/image";
import React from "react";
import { Timeline } from "@/components/ui/timeline";
import BlurFadeText from "./magicui/blur-fade-text";

import { Badge } from "@/components/ui/badge";
import BlurFade from "@/components/magicui/blur-fade";

const BLUR_FADE_DELAY = 0.5;

const BEtechList: String[] = [
    "Java",
    "C++",
    "MySQL",
    "TCP/IP",
    "Netbeans",
    "Python",
    "JFlask",
];

const MEtechList: String[] = [
    "Typescript",
    "Javascript",
    "React.js",
    "Next.js",
    "Tailwind CSS",
    "Framer Motion",
    "Drizzle",
    "PostgreSQL",
    "Vercel",
    "Docker",
    "Git",
    "Github",
];

const PItechList: String[] = [
    "Typescript",
    "Javascript",
    "React.js",
    "Tailwind CSS",
    "Framer Motion",
    "Git",
    "Github",
];

export function Experience() {
    const data = [
        {
            title: "Bharat Electronics Limited",
            content: (
                <div>
                    <div>
                        <BlurFadeText
                            text="Working on Antenna Controlling System by implementing a GUI for the system using Java, netbeans and MySQL over TCP/IP protocol."
                            className="text-neutral-800 dark:text-neutral-200 mb-2 text-xs md:text-sm font-normal"
                        />
                        <BlurFadeText
                            className="max-w-[600px] md:text-xl mb-4"
                            delay={BLUR_FADE_DELAY}
                            text="Jun 2024 - Present"
                        />
                    </div>
                    <div className="flex min-h-0 flex-col gap-y-3">
                        <div className="flex flex-wrap gap-1">
                            {BEtechList.map((tech, id) => (
                                <BlurFade
                                    key={id}
                                    delay={BLUR_FADE_DELAY + id * 0.05}
                                >
                                    <Badge key={id}>{tech}</Badge>
                                </BlurFade>
                            ))}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Movements Elevated Pvt. Ltd.",
            content: (
                <div>
                    <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8"></p>
                    <div>
                        <BlurFadeText
                            text="Developed a web application for the company using React,
                        Next.js, Tailwind CSS, and Framer Motion. The
                        application allows users to manage their deals and
                        customers."
                            className="text-neutral-800 dark:text-neutral-200 mb-2 text-xs md:text-sm font-normal"
                        />
                        <BlurFadeText
                            className="max-w-[600px] md:text-xl mb-4"
                            delay={BLUR_FADE_DELAY}
                            text="Nov 2023 - April 2024"
                        />
                        <div className="flex min-h-0 flex-col gap-y-3">
                            <div className="flex flex-wrap gap-1">
                                {MEtechList.map((tech, id) => (
                                    <BlurFade
                                        key={id}
                                        delay={BLUR_FADE_DELAY + id * 0.05}
                                    >
                                        <Badge key={id}>{tech}</Badge>
                                    </BlurFade>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Potterson India Services Pvt. Ltd.",
            content: (
                <div>
                    <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8"></p>
                    <div>
                        <BlurFadeText
                            text="Develop online presence of the company and showcase their services and products to the customers while also providing a platform for the customers to book services and products."
                            className="text-neutral-800 dark:text-neutral-200 mb-2 text-xs md:text-sm font-normal"
                        />
                        <BlurFadeText
                            className="max-w-[600px] md:text-xl mb-4"
                            delay={BLUR_FADE_DELAY}
                            text="Sep 2023 - Nov 2023"
                        />
                        <div className="flex min-h-0 flex-col gap-y-3">
                            <div className="flex flex-wrap gap-1">
                                {PItechList.map((tech, id) => (
                                    <BlurFade
                                        key={id}
                                        delay={BLUR_FADE_DELAY + id * 0.05}
                                    >
                                        <Badge key={id}>{tech}</Badge>
                                    </BlurFade>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
    ];
    return (
        <div className="w-full">
            <Timeline data={data} />
        </div>
    );
}
