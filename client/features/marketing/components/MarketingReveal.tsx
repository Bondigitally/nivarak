"use client";

import { BlurFade } from "@/components/ui/blur-fade";
import {
  marketingEase,
  marketingReveal,
} from "@/features/marketing/lib/motion";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";

type MarketingRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Eager on mount (hero). Default: scroll-triggered. */
  eager?: boolean;
  direction?: "up" | "down" | "left" | "right";
  offset?: number;
  duration?: number;
  blur?: string;
  /**
   * `lite` — opacity + translate only. Prefer for hero / image-heavy blocks.
   */
  mode?: "default" | "lite";
};

export function MarketingReveal({
  children,
  className,
  delay = 0,
  eager = false,
  direction = "up",
  offset = marketingReveal.offset,
  duration = marketingReveal.duration,
  blur = marketingReveal.blur,
  mode = "default",
}: MarketingRevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  if (mode === "lite") {
    const axis = direction === "left" || direction === "right" ? "x" : "y";
    const hiddenOffset =
      direction === "right" || direction === "down" ? -offset : offset;

    return (
      <motion.div
        className={cn(
          "transform-gpu will-change-[transform,opacity]",
          className,
        )}
        initial={{ opacity: 0, [axis]: hiddenOffset }}
        animate={eager ? { opacity: 1, [axis]: 0 } : undefined}
        whileInView={eager ? undefined : { opacity: 1, [axis]: 0 }}
        viewport={
          eager ? undefined : { once: true, margin: marketingReveal.inViewMargin }
        }
        transition={{ duration, delay, ease: marketingEase }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <BlurFade
      className={className}
      delay={delay}
      direction={direction}
      offset={offset}
      duration={duration}
      blur={blur}
      ease={marketingEase}
      inView={!eager}
      inViewMargin={marketingReveal.inViewMargin}
    >
      {children}
    </BlurFade>
  );
}
