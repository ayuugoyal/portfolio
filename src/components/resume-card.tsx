"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronRightIcon, ExternalLink } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Highlighter } from "./magicui/highlighter";

interface ResumeCardProps {
  logoUrl: string;
  altText: string;
  title: string;
  subtitle?: string;
  href?: string;
  badges?: readonly string[];
  period: string;
  description?: string;
  /** true for the role currently held — gets the pulsing dot */
  current?: boolean;
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

export const ResumeCard = ({
  logoUrl,
  altText,
  title,
  subtitle,
  href,
  badges,
  period,
  description,
  current,
}: ResumeCardProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleToggle = () => {
    if (description) {
      setIsExpanded(!isExpanded);
    }
  };

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
    <div
      className={cn(
        "rounded-lg px-2 py-2.5 transition-colors hover:bg-secondary/60",
        description && "cursor-pointer"
      )}
      onClick={handleToggle}
    >
      <div className="flex items-start gap-3">
        <div className="flex-none">
          {href ? (
            <Link href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              <Avatar className="size-9 rounded-lg border border-border bg-white">
                <AvatarImage
                  src={logoUrl}
                  alt={altText}
                  className="object-contain p-0.5"
                />
                <AvatarFallback className="rounded-lg font-display text-sm font-bold">{altText[0]}</AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="size-9 rounded-lg border border-border bg-white">
              <AvatarImage
                src={logoUrl}
                alt={altText}
                className="object-contain p-0.5"
              />
              <AvatarFallback className="rounded-lg font-display text-sm font-bold">{altText[0]}</AvatarFallback>
            </Avatar>
          )}
        </div>

        <div className="flex flex-grow flex-col">
          <div className="flex items-start justify-between gap-x-2">
            <h3 className="inline-flex items-center gap-x-1.5 font-display text-sm font-bold leading-tight">
              {href ? (
                <Link
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-x-1 underline-offset-4 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {title}
                  <ExternalLink className="size-3 text-muted-foreground" />
                </Link>
              ) : (
                title
              )}
              {current && (
                <span className="relative flex size-1.5" title="current role">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
                </span>
              )}
              {badges && badges.length > 0 && (
                <span className="inline-flex gap-x-1">
                  {badges.map((badge, index) => (
                    <Badge variant="chip" key={index}>
                      {badge}
                    </Badge>
                  ))}
                </span>
              )}
              {description && (
                <ChevronRightIcon
                  className={cn(
                    "size-3.5 shrink-0 text-muted-foreground transition-transform duration-300 ease-out",
                    isExpanded ? "rotate-90" : "rotate-0"
                  )}
                />
              )}
            </h3>
            <div className="shrink-0 whitespace-nowrap font-mono text-[10px] tabular-nums text-muted-foreground">
              {period}
            </div>
          </div>

          {subtitle && (
            <div className="font-mono text-[11px] lowercase tracking-tight text-muted-foreground">
              {subtitle}
            </div>
          )}

          {description && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: isExpanded ? 1 : 0,
                height: isExpanded ? "auto" : 0,
              }}
              transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="overflow-hidden text-xs leading-relaxed text-muted-foreground"
            >
              <div className="pt-2">
                {parseTextWithHighlighter(description, Highlighter)}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
