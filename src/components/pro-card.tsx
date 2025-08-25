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
    console.log(text);

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
    <li className="relative ml-10 py-4">
      <div className="absolute -left-16 top-2 flex items-center justify-center bg-white rounded-full">
        <Avatar className="border size-12 m-auto">
          <AvatarImage src={image} alt={title} className="object-contain" />
          <AvatarFallback>{title[0]}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-1 flex-col justify-start gap-1">
        {dates && (
          <time className="text-xs text-muted-foreground">{dates}</time>
        )}
        <h2 className="font-semibold leading-none">{title}</h2>
        {location && (
          <p className="text-sm text-muted-foreground">{location}</p>
        )}
        {description && (
          <span className="prose dark:prose-invert text-sm text-muted-foreground">
            {parseTextWithHighlighter(description, Highlighter)}
          </span>
        )}
      </div>
      {links && links.length > 0 && (
        <div className="mt-2 flex flex-row flex-wrap items-start gap-2">
          {links?.map((link, idx) => (
            <Link href={link.href} key={idx}>
              <Badge key={idx} title={link.title} className="flex gap-2">
                {link.title}
                {link.icon}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </li>
  );
}