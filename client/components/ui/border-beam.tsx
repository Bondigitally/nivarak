"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface BorderBeamProps {
  /** Controls how long the visible beam arc is (mapped to degrees). */
  size?: number;
  /** Duration of one full loop in seconds. */
  duration?: number;
  /** Delay before the animation starts. */
  delay?: number;
  /** Start color of the beam gradient. */
  colorFrom?: string;
  /** End color of the beam gradient. */
  colorTo?: string;
  /** Reverse animation direction. */
  reverse?: boolean;
  /** Border thickness of the beam ring. */
  borderWidth?: number;
  className?: string;
  /** @deprecated Kept for call-site compat — unused (rotation has no corner path). */
  radius?: number;
  /** @deprecated Kept for call-site compat. */
  initialOffset?: number;
  style?: React.CSSProperties;
  transition?: unknown;
}

/**
 * Animated border highlight. Uses a masked rotating conic gradient so speed
 * stays even through corners (offset-path rect beams jitter at edges).
 */
export function BorderBeam({
  className,
  size = 50,
  delay = 0,
  duration = 6,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  reverse = false,
  borderWidth = 1.5,
}: BorderBeamProps) {
  const beamDeg = Math.min(100, Math.max(36, size * 0.6));

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        className,
      )}
      style={{
        padding: borderWidth,
        WebkitMask:
          "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        maskComposite: "exclude",
      }}
    >
      <motion.div
        className="absolute inset-[-120%]"
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, ${colorFrom} ${beamDeg * 0.35}deg, ${colorTo} ${beamDeg}deg, transparent ${beamDeg + 10}deg)`,
        }}
        animate={{ rotate: reverse ? -360 : 360 }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration,
          delay: -delay,
        }}
      />
    </div>
  );
}
