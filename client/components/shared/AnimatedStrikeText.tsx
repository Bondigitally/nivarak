"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const STRIKE_DURATION_MS = 350;

const STRIKE_EASE = [0.22, 1, 0.36, 1] as const;

export function AnimatedStrikeText({
  active,
  className,
  children,
}: {
  active: boolean;
  className?: string;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <span className={cn("relative inline-block max-w-full", className)}>
      {children}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current"
        initial={false}
        animate={{ scaleX: active ? 1 : 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: STRIKE_DURATION_MS / 1000, ease: STRIKE_EASE }
        }
        style={{ transformOrigin: "left center" }}
      />
    </span>
  );
}

function useStrikeTransitionDuration() {
  const reduceMotion = useReducedMotion();
  return reduceMotion ? 0 : STRIKE_DURATION_MS;
}

export function useStrikeToggle(completed: boolean, onToggle: () => void) {
  const strikeDuration = useStrikeTransitionDuration();
  const [pending, setPending] = useState(false);
  const displayCompleted = completed ? !pending : pending;

  function toggle() {
    if (pending) return;

    setPending(true);
    window.setTimeout(() => {
      onToggle();
      setPending(false);
    }, strikeDuration);
  }

  return { displayCompleted, isPending: pending, toggle };
}
