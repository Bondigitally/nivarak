"use client";

import { motion, useReducedMotion } from "framer-motion";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { ArrowUpRight03Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

export const ARROW_MOTION = {
  duration: 0.65,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function AnimatedArrowIcon({
  icon = ArrowUpRight03Icon,
  size = 19,
  hovered,
  className,
}: {
  icon?: IconSvgElement;
  size?: number;
  hovered: boolean;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <span className={cn("relative size-4.75 shrink-0 overflow-hidden", className)} aria-hidden>
      {hovered ? (
        <motion.span
          key="hover"
          className="absolute inset-0 flex items-center justify-center"
          initial={reduceMotion ? false : { x: -14, y: 14 }}
          animate={{ x: 0, y: 0 }}
          transition={ARROW_MOTION}
        >
          <HugeiconsIcon icon={icon} size={size} strokeWidth={1.75} color="currentColor" />
        </motion.span>
      ) : (
        <span className="absolute inset-0 flex items-center justify-center">
          <HugeiconsIcon icon={icon} size={size} strokeWidth={1.75} color="currentColor" />
        </span>
      )}
    </span>
  );
}
