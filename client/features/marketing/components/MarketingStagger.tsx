"use client";

import type { ElementType, ReactNode } from "react";
import {
  marketingEase,
  marketingHero,
  marketingReveal,
  marketingStagger,
} from "@/features/marketing/lib/motion";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion, type Variants } from "motion/react";

type MarketingStaggerProps = {
  children: ReactNode;
  className?: string;
  /** Eager on mount (hero). Default: scroll-triggered. */
  eager?: boolean;
  /**
   * When false with `eager`, stay hidden (e.g. wait for site preload).
   * Default true.
   */
  active?: boolean;
  as?: ElementType;
  stagger?: number;
  delayChildren?: number;
  /**
   * `lite` — opacity + translate only (hero). Avoids filter blur,
   * which is costly next to images/carousels.
   */
  mode?: "default" | "lite";
};

const defaultItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: marketingStagger.itemOffset,
    filter: "blur(6px)",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: marketingStagger.itemDuration,
      ease: marketingEase,
    },
  },
};

const liteItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: marketingHero.itemOffset,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: marketingHero.itemDuration,
      ease: marketingEase,
    },
  },
};

const reducedItemVariants: Variants = {
  hidden: { opacity: 1, y: 0, filter: "blur(0px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export function MarketingStagger({
  children,
  className,
  eager = false,
  active = true,
  as: Tag = "div",
  stagger,
  delayChildren,
  mode = "default",
}: MarketingStaggerProps) {
  const reduceMotion = useReducedMotion();
  const isLite = mode === "lite";
  const resolvedStagger =
    stagger ??
    (isLite
      ? marketingHero.staggerChildren
      : marketingStagger.staggerChildren);
  const resolvedDelay =
    delayChildren ??
    (isLite ? marketingHero.delayChildren : marketingStagger.delayChildren);

  const motionProps = {
    className: cn(
      !reduceMotion && "transform-gpu will-change-[transform,opacity]",
      className,
    ),
    variants: {
      hidden: {},
      show: {
        transition: {
          staggerChildren: resolvedStagger,
          delayChildren: resolvedDelay,
        },
      },
    },
    initial: "hidden" as const,
    animate: eager ? (active ? "show" : "hidden") : undefined,
    whileInView: eager || reduceMotion || !active ? undefined : "show",
    viewport:
      eager || reduceMotion || !active
        ? undefined
        : { once: true, margin: marketingReveal.inViewMargin },
  };

  if (Tag === "ol") return <motion.ol {...motionProps}>{children}</motion.ol>;
  if (Tag === "ul") return <motion.ul {...motionProps}>{children}</motion.ul>;
  if (Tag === "li") return <motion.li {...motionProps}>{children}</motion.li>;
  if (Tag === "article") return <motion.article {...motionProps}>{children}</motion.article>;
  if (Tag === "section") return <motion.section {...motionProps}>{children}</motion.section>;
  if (Tag === "span") return <motion.span {...motionProps}>{children}</motion.span>;
  if (Tag === "aside") return <motion.aside {...motionProps}>{children}</motion.aside>;
  return <motion.div {...motionProps}>{children}</motion.div>;
}

/** Direct child of MarketingStagger — keeps element semantics (li, article). */
export function MarketingStaggerItem({
  children,
  className,
  as: Tag = "div",
  mode = "default",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  mode?: "default" | "lite";
}) {
  const reduceMotion = useReducedMotion();
  const variants = reduceMotion
    ? reducedItemVariants
    : mode === "lite"
      ? liteItemVariants
      : defaultItemVariants;

  const motionProps = {
    className: cn(
      !reduceMotion && "transform-gpu will-change-[transform,opacity]",
      className,
    ),
    variants,
  };

  if (Tag === "li") return <motion.li {...motionProps}>{children}</motion.li>;
  if (Tag === "article") return <motion.article {...motionProps}>{children}</motion.article>;
  if (Tag === "ol") return <motion.ol {...motionProps}>{children}</motion.ol>;
  if (Tag === "ul") return <motion.ul {...motionProps}>{children}</motion.ul>;
  if (Tag === "section") return <motion.section {...motionProps}>{children}</motion.section>;
  if (Tag === "span") return <motion.span {...motionProps}>{children}</motion.span>;
  if (Tag === "aside") return <motion.aside {...motionProps}>{children}</motion.aside>;
  return <motion.div {...motionProps}>{children}</motion.div>;
}
