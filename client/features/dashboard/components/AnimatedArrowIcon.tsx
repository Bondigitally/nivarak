"use client";

import { useEffect } from "react";
import { motion, useAnimation, useReducedMotion } from "framer-motion";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { ArrowUpRight03Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

const ARROW_OFFSET = 5;

const EXIT_TRANSITION = {
  duration: 0.58,
  ease: [0.4, 0, 0.2, 1] as const,
};

const ENTER_TRANSITION = {
  duration: 0.42,
  ease: [0.22, 1, 0.36, 1] as const,
  delay: 0.26,
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
  const exitControls = useAnimation();
  const enterControls = useAnimation();

  useEffect(() => {
    if (reduceMotion) {
      void exitControls.set({ x: 0, y: 0, opacity: 1 });
      void enterControls.set({ x: 0, y: 0, opacity: 0 });
      return;
    }

    if (hovered) {
      void exitControls.set({ x: 0, y: 0, opacity: 1 });
      void enterControls.set({
        x: -ARROW_OFFSET * 2,
        y: ARROW_OFFSET * 2,
        opacity: 0,
      });

      void exitControls.start({
        x: ARROW_OFFSET * 2,
        y: -ARROW_OFFSET * 2,
        opacity: 0,
        transition: EXIT_TRANSITION,
      });

      void enterControls.start({
        x: 0,
        y: 0,
        opacity: 1,
        transition: ENTER_TRANSITION,
      });
      return;
    }

    void exitControls.set({ x: 0, y: 0, opacity: 1 });
    void enterControls.set({ x: 0, y: 0, opacity: 0 });
  }, [hovered, reduceMotion, exitControls, enterControls]);

  const layerClassName = "absolute inset-0 flex items-center justify-center";

  return (
    <span className={cn("relative size-4.75 shrink-0 overflow-hidden", className)} aria-hidden>
      <motion.span className={layerClassName} animate={exitControls} initial={{ x: 0, y: 0, opacity: 1 }}>
        <HugeiconsIcon icon={icon} size={size} strokeWidth={1.5} color="currentColor" absoluteStrokeWidth />
      </motion.span>
      <motion.span className={layerClassName} animate={enterControls} initial={{ x: 0, y: 0, opacity: 0 }}>
        <HugeiconsIcon icon={icon} size={size} strokeWidth={1.5} color="currentColor" absoluteStrokeWidth />
      </motion.span>
    </span>
  );
}
