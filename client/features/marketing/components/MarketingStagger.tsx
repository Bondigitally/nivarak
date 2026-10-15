"use client";

import {
  createElement,
  type ComponentType,
  type ElementType,
  type ReactNode,
} from "react";
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

const motionTags = {
  div: motion.div,
  span: motion.span,
  ol: motion.ol,
  ul: motion.ul,
  li: motion.li,
  article: motion.article,
  section: motion.section,
  aside: motion.aside,
} as const;

type MotionTagName = keyof typeof motionTags;

function resolveMotionTag(as: ElementType): ComponentType<Record<string, unknown>> {
  if (typeof as === "string" && as in motionTags) {
    return motionTags[as as MotionTagName] as ComponentType<
      Record<string, unknown>
    >;
  }
  return motion.div as ComponentType<Record<string, unknown>>;
}

export function MarketingStagger({
  children,
  className,
  eager = false,
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

  return createElement(
    resolveMotionTag(Tag),
    {
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
      initial: "hidden",
      animate: eager ? "show" : undefined,
      whileInView: eager || reduceMotion ? undefined : "show",
      viewport:
        eager || reduceMotion
          ? undefined
          : { once: true, margin: marketingReveal.inViewMargin },
    },
    children,
  );
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

  return createElement(
    resolveMotionTag(Tag),
    {
      className: cn(
        !reduceMotion && "transform-gpu will-change-[transform,opacity]",
        className,
      ),
      variants,
    },
    children,
  );
}
