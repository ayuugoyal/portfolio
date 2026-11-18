"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion, Variants } from "framer-motion";
import { useMemo } from "react";

interface BlurFadeTextProps {
  text: string;
  className?: string;
  variant?: {
    hidden: { y: number };
    visible: { y: number };
  };
  duration?: number;
  characterDelay?: number;
  delay?: number;
  yOffset?: number;
  animateByCharacter?: boolean;
}
const BlurFadeText = ({
  text,
  className,
  variant,
  characterDelay = 0.03,
  delay = 0,
  yOffset = 6,
  duration = 0.5,
  animateByCharacter = false,
}: BlurFadeTextProps) => {
  const reduceMotion = useReducedMotion();
  // Calm reveal: a short lift with a light blur; opacity only under reduced motion.
  const defaultVariants: Variants = reduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { y: yOffset, opacity: 0, filter: "blur(4px)" },
        visible: { y: 0, opacity: 1, filter: "blur(0px)" },
      };
  const combinedVariants = (!reduceMotion && variant) || defaultVariants;
  const characters = useMemo(() => Array.from(text), [text]);

  if (animateByCharacter) {
    return (
      <div className="flex">
        <AnimatePresence>
          {characters.map((char, i) => (
            <motion.span
              key={i}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={combinedVariants}
              transition={{
                delay: delay + i * characterDelay,
                duration,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={cn("inline-block", className)}
              style={{ width: char.trim() === "" ? "0.2em" : "auto" }}
            >
              {char}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex">
      <AnimatePresence>
        <motion.span
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={combinedVariants}
          transition={{
            delay,
            duration,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={cn("inline-block", className)}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default BlurFadeText;
