"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Highlighter } from "./magicui/highlighter";

interface Props {
  title: string;
  description: string;
  dates: string;
  location?: string;
  image?: string;
  links?: readonly {
    icon: React.ReactNode;
    title: string;
    href: string;
  }[];
}

type AnnotationAction =
  | "highlight"
  | "underline"
  | "box"
  | "circle"
  | "strike-through"
  | "crossed-off"
  | "bracket";

interface HighlighterProps {
  children: React.ReactNode;
  action?: AnnotationAction;
  color?: string;
  strokeWidth?: number;
  animationDuration?: number;
  iterations?: number;
  padding?: number;
  multiline?: boolean;
  isView?: boolean;
}


export function HackathonCard({
  title,
  description,
  dates,
  location,
  image,
  links,
}: Props) {
  const parseTextWithHighlighter = (
    text: string,
    HighlighterComponent: React.ComponentType<HighlighterProps>
  ): React.ReactNode => {
    if (!text) return text;

    const parts = text.split(/(\*[^*]+\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        const content = part.slice(1, -1);
        const words = content.split(' ');

        if (words.length > 0) {
          const firstWord = words[0];
          const restText = words.slice(1).join(' ');

          let action: AnnotationAction = "highlight";
          let color = "#FF9800";

          if (firstWord.includes('#')) {
            const splitParts = firstWord.split('#');
            action = splitParts[0] as AnnotationAction;
            color = '#' + splitParts[1];
          } else {
            action = firstWord as AnnotationAction;
          }

          return (
            <HighlighterComponent
              key={index}
              action={action}
              color={color}
            >
              {restText}
            </HighlighterComponent>
          );
        }
      }

      return part;
    });
  };

  return (
    <li className="flex items-start gap-3 py-4">
      <Avatar className="size-9 shrink-0 rounded-lg border border-border bg-white">
        <AvatarImage src={image} alt={title} className="object-contain" />
        <AvatarFallback className="rounded-lg font-display text-sm font-bold">
          {title[0]}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2">
          <h3 className="font-display text-sm font-bold tracking-tight">
            {title}
          </h3>
          {dates && (
            <time className="font-mono text-[10px] text-muted-foreground">
              {dates}
            </time>
          )}
        </div>

        {location && (
          <p className="font-mono text-[11px] text-muted-foreground">{location}</p>
        )}

        {description && (
          <span className="text-xs leading-relaxed text-muted-foreground">
            {parseTextWithHighlighter(description, Highlighter)}
          </span>
        )}

        {links && links.length > 0 && (
          <div className="mt-1.5 flex flex-row flex-wrap items-start gap-1.5">
            {links.map((link, idx) => {
              const external = link.href.startsWith("http");
              return (
                <Link
                  href={link.href}
                  key={idx}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                >
                  <Badge
                    variant="link"
                    title={link.title}
                    className="[&_svg]:size-3"
                  >
                    {link.title}
                    {link.icon}
                  </Badge>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </li>
  );
}
