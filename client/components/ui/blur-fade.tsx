"use client";

/**
 * Reusable entrance animation that combines a blur-in with a directional slide.
 *
 * `inView` mode — animation fires once when the element enters the viewport
 *   (stagger-reveal for dashboard sections and list rows).
 * Eager mode (default) — fires on mount, used for route/modal transitions
 *   like the `DashboardReveal` stagger wrapper.
 *
 * `blurDuration` defaults to 45% of `duration` so the blur clears slightly
 * before the translate finishes, giving a layered feel.
 */

import { useRef } from "react";
import {
  motion,
  useInView,
  type MotionProps,
  type UseInViewOptions,
  type Variants,
} from "motion/react";

import { cn } from "@/lib/utils";

type MarginType = UseInViewOptions["margin"];

interface BlurFadeProps extends Omit<MotionProps, "transition" | "ease"> {
  children: React.ReactNode;
  className?: string;
  variant?: {
    hidden: { y: number };
    visible: { y: number };
  };
  duration?: number;
  delay?: number;
  offset?: number;
  direction?: "up" | "down" | "left" | "right";
  inView?: boolean;
  inViewMargin?: MarginType;
  blur?: string;
  ease?: readonly [number, number, number, number] | "easeOut" | "easeIn" | "easeInOut";
  blurDuration?: number;
}

const getFilter = (v: Variants[string]) =>
  typeof v === "function" ? undefined : v.filter;

export function BlurFade({
  children,
  className,
  variant,
  duration = 0.4,
  delay = 0,
  offset = 6,
  direction = "down",
  inView = false,
  inViewMargin = "-50px",
  blur = "6px",
  ease = [0.22, 1, 0.36, 1],
  blurDuration,
  ...props
}: BlurFadeProps) {
  const ref = useRef(null);
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin });
  const isInView = !inView || inViewResult;
  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const hiddenOffset =
    direction === "right" || direction === "down" ? -offset : offset;

  const defaultVariants: Variants = {
    hidden: {
      [axis]: hiddenOffset,
      opacity: 0,
      filter: `blur(${blur})`,
    },
    visible: {
      [axis]: 0,
      opacity: 1,
      filter: "blur(0px)",
    },
  };
  const combinedVariants = variant ?? defaultVariants;

  const hiddenFilter = getFilter(combinedVariants.hidden);
  const visibleFilter = getFilter(combinedVariants.visible);

  const shouldTransitionFilter =
    hiddenFilter != null &&
    visibleFilter != null &&
    hiddenFilter !== visibleFilter;

  const resolvedBlurDuration = blurDuration ?? duration * 0.45;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      exit="hidden"
      variants={combinedVariants}
      transition={{
        delay,
        duration,
        ease,
        opacity: { duration, ease, delay },
        [axis]: { duration, ease, delay },
        ...(shouldTransitionFilter
          ? {
              filter: {
                duration: resolvedBlurDuration,
                ease: "easeOut",
                delay,
              },
            }
          : {}),
      }}
      className={cn("transform-gpu will-change-[transform,opacity,filter]", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
