"use client";

import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { annotate } from "rough-notation";
import type React from "react";

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

/** Turn a space-separated HSL token ("15 56% 52%") into a CSS colour. */
function hslFromToken(token: string): string | null {
  const parts = token.trim().split(/\s+/);
  if (parts.length < 3) return null;
  return `hsl(${parts[0]}, ${parts[1]}, ${parts[2]})`;
}

/**
 * "brand" (the default) means the clay accent: read --brand from the root at
 * annotation time, so the stroke follows the active theme. Anything else is
 * passed through as a CSS colour.
 */
function resolveColor(color: string): string {
  if (color !== "brand" || typeof window === "undefined") return color;
  const token = getComputedStyle(document.documentElement).getPropertyValue(
    "--brand"
  );
  return hslFromToken(token) ?? "currentColor";
}

export function Highlighter({
  children,
  action = "highlight",
  color = "brand",
  strokeWidth = 1.5,
  animationDuration = 600,
  iterations = 2,
  padding = 2,
  multiline = true,
  isView = false,
}: HighlighterProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(elementRef, {
    once: true,
    margin: "-10%",
  });
  const { resolvedTheme } = useTheme();
  const reduceMotion = useReducedMotion();

  // If isView is false, always show. If isView is true, wait for inView
  const shouldShow = !isView || isInView;

  useEffect(() => {
    if (!shouldShow) return;

    const element = elementRef.current;
    if (!element) return;

    let annotation: ReturnType<typeof annotate> | null = null;
    // Wait a frame: on a theme switch next-themes swaps the root class in its
    // own effect, which runs after ours, so --brand is only current next frame.
    const frame = requestAnimationFrame(() => {
      annotation = annotate(element, {
        type: action,
        color: resolveColor(color),
        strokeWidth,
        animate: !reduceMotion,
        animationDuration,
        iterations,
        padding,
        multiline,
      });
      annotation.show();
    });

    return () => {
      cancelAnimationFrame(frame);
      annotation?.remove();
    };
  }, [
    shouldShow,
    action,
    color,
    strokeWidth,
    animationDuration,
    iterations,
    padding,
    multiline,
    resolvedTheme,
    reduceMotion,
  ]);

  return (
    <span ref={elementRef} className="relative inline-block bg-transparent">
      {children}
    </span>
  );
}
