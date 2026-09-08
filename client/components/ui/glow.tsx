"use client";

import * as React from "react";
import { motion, type TargetAndTransition, type Transition } from "motion/react";

import { cn } from "@/lib/utils";

type GlowMode =
  | "rotate"
  | "pulse"
  | "breathe"
  | "colorShift"
  | "flowHorizontal"
  | "static";

type GlowBlur =
  | number
  | "softest"
  | "soft"
  | "medium"
  | "strong"
  | "stronger"
  | "strongest"
  | "none";

const BLUR_PRESETS: Record<string, string> = {
  softest: "blur-xs",
  soft: "blur-sm",
  medium: "blur-md",
  strong: "blur-lg",
  stronger: "blur-xl",
  strongest: "blur-2xl",
  none: "blur-none",
};

function blurClass(blur: GlowBlur) {
  if (typeof blur === "number") return `blur-[${blur}px]`;
  return BLUR_PRESETS[blur] ?? "blur-md";
}

interface GlowEffectInnerProps {
  colors?: string[];
  mode?: GlowMode;
  blur?: GlowBlur;
  scale?: number;
  duration?: number;
  transition?: Transition;
  className?: string;
}

function GlowEffectLayer({
  colors = ["#FF5733", "#33FF57", "#3357FF", "#F1C40F"],
  mode = "rotate",
  blur = "strong",
  scale = 1,
  duration = 5,
  transition,
  className,
}: GlowEffectInnerProps) {
  const base: Transition = { repeat: Infinity, duration, ease: "linear" };

  const animations: Record<GlowMode, TargetAndTransition> = {
    rotate: {
      background: [
        `conic-gradient(from 0deg at 50% 50%, ${colors.join(", ")})`,
        `conic-gradient(from 360deg at 50% 50%, ${colors.join(", ")})`,
      ],
      transition: transition ?? base,
    },
    pulse: {
      background: colors.map(
        (c) => `radial-gradient(circle at 50% 50%, ${c} 0%, transparent 100%)`,
      ),
      scale: [scale, scale * 1.1, scale],
      opacity: [0.5, 0.8, 0.5],
      transition: transition ?? { ...base, repeatType: "mirror" },
    },
    breathe: {
      background: colors.map(
        (c) => `radial-gradient(circle at 50% 50%, ${c} 0%, transparent 100%)`,
      ),
      scale: [scale, scale * 1.05, scale],
      transition: transition ?? { ...base, repeatType: "mirror" },
    },
    colorShift: {
      background: colors.map((c, i) => {
        const next = colors[(i + 1) % colors.length];
        return `conic-gradient(from 0deg at 50% 50%, ${c} 0%, ${next} 50%, ${c} 100%)`;
      }),
      transition: transition ?? { ...base, repeatType: "mirror" },
    },
    flowHorizontal: {
      background: colors.map((c, i) => {
        const next = colors[(i + 1) % colors.length];
        return `linear-gradient(to right, ${c}, ${next})`;
      }),
      transition: transition ?? { ...base, repeatType: "mirror" },
    },
    static: {
      background: `linear-gradient(to right, ${colors.join(", ")})`,
    },
  };

  return (
    <motion.div
      animate={animations[mode]}
      style={
        { "--scale": scale, willChange: "transform" } as React.CSSProperties
      }
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full",
        "scale-[var(--scale)] transform-gpu",
        blurClass(blur),
        className,
      )}
    />
  );
}

export interface GlowWrapperProps extends GlowEffectInnerProps {
  children: React.ReactNode;
  glowOpacity?: number;
  glowScale?: number;
  wrapperClassName?: string;
  disabled?: boolean;
}

export function GlowWrapper({
  children,
  mode = "rotate",
  colors = ["#FF5733", "#33FF57", "#3357FF", "#F1C40F"],
  blur = "softest",
  duration = 8,
  glowScale = 1,
  glowOpacity = 0.55,
  wrapperClassName,
  disabled,
}: GlowWrapperProps) {
  return (
    <div
      className={cn(
        "relative inline-flex rounded-full",
        disabled && "pointer-events-none opacity-50",
        wrapperClassName,
      )}
    >
      <div
        className="pointer-events-none absolute -inset-0.5 rounded-full"
        style={{ opacity: glowOpacity }}
      >
        <GlowEffectLayer
          colors={colors}
          mode={mode}
          blur={blur}
          duration={duration}
          scale={glowScale}
          className="rounded-full"
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
