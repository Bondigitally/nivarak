"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Minimum full ping-pong cycle (0 → −shift → 0) — matches care-team readability. */
const MARQUEE_MIN_DURATION_SEC = 4;
const MARQUEE_MAX_DURATION_SEC = 16;
/** Horizontal travel speed while scrolling (px/s, one direction). */
const MARQUEE_PX_PER_SEC = 24;

function marqueeDurationSec(overflowPx: number): number {
  const roundTripSec = (overflowPx * 2) / MARQUEE_PX_PER_SEC;
  return Math.min(
    MARQUEE_MAX_DURATION_SEC,
    Math.max(MARQUEE_MIN_DURATION_SEC, roundTripSec),
  );
}

type TruncateHoverMarqueeProps = {
  children: string;
  className?: string;
  textClassName?: string;
  /** When set, marquee runs while this is true (e.g. parent card hover). */
  hovered?: boolean;
  as?: "span" | "h3";
};

/**
 * Truncates overflowing text; on hover, scrolls the full label (care-team name pattern).
 */
export function TruncateHoverMarquee({
  children,
  className,
  textClassName,
  hovered: hoveredProp,
  as = "span",
}: TruncateHoverMarqueeProps) {
  const reduceMotion = useReducedMotion();
  const [hoveredInternal, setHoveredInternal] = useState(false);
  const hovered = hoveredProp ?? hoveredInternal;
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [shift, setShift] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const update = () => {
      const overflow = measure.scrollWidth - container.clientWidth;
      setShift(overflow > 1 ? overflow : 0);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [children]);

  const marquee = shift > 0 && hovered && !reduceMotion;
  const marqueeTransition = useMemo(
    () =>
      marquee
        ? {
            duration: marqueeDurationSec(shift),
            repeat: Infinity,
            ease: "linear" as const,
          }
        : undefined,
    [marquee, shift],
  );
  const MotionText = as === "h3" ? motion.h3 : motion.span;

  return (
    <div
      ref={containerRef}
      className={cn("relative min-w-0 overflow-hidden", className)}
      onMouseEnter={
        hoveredProp === undefined ? () => setHoveredInternal(true) : undefined
      }
      onMouseLeave={
        hoveredProp === undefined ? () => setHoveredInternal(false) : undefined
      }
    >
      <span
        ref={measureRef}
        className={cn(textClassName, "invisible absolute whitespace-nowrap")}
        aria-hidden
      >
        {children}
      </span>
      <MotionText
        title={shift > 0 ? children : undefined}
        className={cn(
          textClassName,
          "min-w-0 whitespace-nowrap",
          marquee ? "inline-block" : "truncate",
        )}
        animate={marquee ? { x: [0, -shift, 0] } : { x: 0 }}
        transition={marqueeTransition}
      >
        {children}
      </MotionText>
    </div>
  );
}