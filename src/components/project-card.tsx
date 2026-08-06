import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import HeroVideoDialog from "./magicui/hero-video-dialog";

interface Props {
    title: string;
    href?: string;
    description: string;
    dates: string;
    tags: readonly string[];
    link?: string;
    image?: string;
    video?: string;
    links?: readonly {
        icon: React.ReactNode;
        type: string;
        href: string;
    }[];
    className?: string;
}

export function ProjectCard({
    title,
    href,
    description,
    dates,
    tags,
    link,
    image,
    video,
    links,
    className,
}: Props) {
    return (
        <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors duration-200 hover:border-foreground/20">
            <Link
                href={href || "#"}
                target="_blank"
                className={cn("block cursor-pointer overflow-hidden", className)}
            >
                {video && (
                    <video
                        src={video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="pointer-events-none mx-auto h-36 w-full object-cover object-top"
                    />
                )}
                {image && (
                    <Image
                        src={image}
                        alt={title}
                        width={500}
                        height={300}
                        className="h-36 w-full object-cover object-top"
                    />
                )}
            </Link>

            <div className="flex flex-1 flex-col gap-2 p-3.5">
                <div className="space-y-1.5">
                    <h3 className="flex items-center gap-1 font-display text-sm font-bold tracking-tight">
                        {title}
                        <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </h3>
                    {dates && (
                        <time className="font-mono text-[10px] text-muted-foreground">
                            {dates}
                        </time>
                    )}
                    <div className="hidden font-sans text-xs underline print:visible">
                        {link
                            ?.replace("https://", "")
                            .replace("www.", "")
                            .replace("/", "")}
                    </div>
                    <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
                        {description}
                    </p>
                </div>

                {tags && tags.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-1 pt-1">
                        {tags.map((tag) => (
                            <Badge variant="chip" key={tag}>
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

                {links && links.length > 0 && (
                    <div className="flex flex-row flex-wrap items-start gap-1.5 pt-1">
                        {links.map((l, idx) => (
                            <div key={idx}>
                                {l.type === "Demo Video" ? (
                                    <HeroVideoDialog
                                        animationStyle="from-center"
                                        videoSrc={l.href}
                                        thumbnailAlt={l.type}
                                        icon={l.icon}
                                    />
                                ) : (
                                    <Link href={l.href} target="_blank">
                                        <Badge
                                            variant="link"
                                            className="[&_svg]:size-3"
                                        >
                                            {l.icon}
                                            {l.type}
                                        </Badge>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
