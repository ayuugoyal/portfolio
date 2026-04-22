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
      className={cn("block", description && "cursor-pointer")}
      onClick={handleToggle}
    >
      <div className="flex justify-center items-center">
        <div className="flex-none">
          {href ? (
            <Link href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              <Avatar className="border size-12 m-auto bg-muted-background dark:bg-foreground">
                <AvatarImage
                  src={logoUrl}
                  alt={altText}
                  className="object-contain"
                />
                <AvatarFallback>{altText[0]}</AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="border size-12 m-auto bg-muted-background dark:bg-foreground">
              <AvatarImage
                src={logoUrl}
                alt={altText}
                className="object-contain"
              />
              <AvatarFallback>{altText[0]}</AvatarFallback>
            </Avatar>
          )}
        </div>
        <div className="flex-grow ml-4 items-center flex-col group">
          <div>
            <div className="flex items-center justify-between gap-x-2 text-base">
              <h3 className="inline-flex items-center gap-x-1 font-semibold leading-none text-xs sm:text-sm">
                {href ? (
                  <Link
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline inline-flex items-center gap-x-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {title}
                    <ExternalLink className="size-3 text-muted-foreground" />
                  </Link>
                ) : (
                  title
                )}
                {badges && (
                  <span className="inline-flex gap-x-1">
                    {badges.map((badge, index) => (
                      <Badge
                        variant="secondary"
                        className="align-middle text-xs"
                        key={index}
                      >
                        {badge}
                      </Badge>
                    ))}
                  </span>
                )}
                {description && (
                  <ChevronRightIcon
                    className={cn(
                      "size-4 translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100",
                      isExpanded ? "rotate-90" : "rotate-0"
                    )}
                  />
                )}
              </h3>
              <div className="text-xs sm:text-sm tabular-nums text-muted-foreground text-right">
                {period}
              </div>
            </div>
            {subtitle && <div className="font-sans text-xs">{subtitle}</div>}
          </div>
          {description && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: isExpanded ? 1 : 0,
                height: isExpanded ? "auto" : 0,
              }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-xs sm:text-sm"
            >
              {parseTextWithHighlighter(description, Highlighter)}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};