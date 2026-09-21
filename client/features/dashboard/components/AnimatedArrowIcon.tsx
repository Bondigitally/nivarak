"use client";

import { useEffect } from "react";
import { motion, useAnimation, useReducedMotion } from "framer-motion";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { ArrowUpRight03Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";

const ARROW_OFFSET = 5;

const EXIT_TRANSITION = {
  duration: 0.58,
  ease: [0.4, 0, 0.2, 1] as const,
};

/** Dual-arrow swap — delay lets the exit layer clear before the enter lands. */
const ENTER_TRANSITION = {
  duration: 0.42,
  ease: [0.22, 1, 0.36, 1] as const,
  delay: 0.26,
};

/** Reveal-from-hidden (e.g. notification links) — snappy hover, no swap delay. */
const IDLE_HIDDEN_ENTER_TRANSITION = {
  duration: 0.18,
  ease: [0.22, 1, 0.36, 1] as const,
};

const ARROW_MOTION = {
  "up-right": {
    enter: { x: -ARROW_OFFSET * 2, y: ARROW_OFFSET * 2 },
    exit: { x: ARROW_OFFSET * 2, y: -ARROW_OFFSET * 2 },
  },
  right: {
    enter: { x: -ARROW_OFFSET * 2, y: 0 },
    exit: { x: ARROW_OFFSET * 2, y: 0 },
  },
} as const;

export function AnimatedArrowIcon({
  icon = ArrowUpRight03Icon,
  size = ICON_SIZE,
  hovered,
  direction = "up-right",
  idleHidden = false,
  className,
}: {
  icon?: IconSvgElement;
  size?: number;
  hovered: boolean;
  direction?: keyof typeof ARROW_MOTION;
  /** When true, the arrow is fully hidden (opacity 0) until hovered. Layout space is preserved. */
  idleHidden?: boolean;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const exitControls = useAnimation();
  const enterControls = useAnimation();
  const arrowMotion = ARROW_MOTION[direction];

  useEffect(() => {
    if (reduceMotion) {
      void exitControls.set({
        x: 0,
        y: 0,
        opacity: hovered || !idleHidden ? 1 : 0,
      });
      void enterControls.set({ x: 0, y: 0, opacity: 0 });
      return;
    }

    if (hovered) {
      if (idleHidden) {
        void exitControls.set({ x: 0, y: 0, opacity: 0 });
        void enterControls.set({
          x: arrowMotion.enter.x,
          y: arrowMotion.enter.y,
          opacity: 0,
        });

        void enterControls.start({
          x: 0,
          y: 0,
          opacity: 1,
          transition: IDLE_HIDDEN_ENTER_TRANSITION,
        });
        return;
      }

      void exitControls.set({ x: 0, y: 0, opacity: 1 });
      void enterControls.set({
        x: arrowMotion.enter.x,
        y: arrowMotion.enter.y,
        opacity: 0,
      });

      void exitControls.start({
        x: arrowMotion.exit.x,
        y: arrowMotion.exit.y,
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

    void exitControls.set({ x: 0, y: 0, opacity: idleHidden ? 0 : 1 });
    void enterControls.set({ x: 0, y: 0, opacity: 0 });
  }, [hovered, reduceMotion, exitControls, enterControls, arrowMotion, idleHidden]);

  const layerClassName = "absolute inset-0 flex items-center justify-center";

  return (
    <span className={cn("relative size-5 shrink-0 overflow-hidden", className)} aria-hidden>
      <motion.span className={layerClassName} animate={exitControls} initial={{ x: 0, y: 0, opacity: 1 }}>
        <HugeiconsIcon icon={icon} size={size} strokeWidth={ICON_STROKE} color="currentColor" absoluteStrokeWidth />
      </motion.span>
      <motion.span className={layerClassName} animate={enterControls} initial={{ x: 0, y: 0, opacity: 0 }}>
        <HugeiconsIcon icon={icon} size={size} strokeWidth={ICON_STROKE} color="currentColor" absoluteStrokeWidth />
      </motion.span>
    </span>
  );
}
