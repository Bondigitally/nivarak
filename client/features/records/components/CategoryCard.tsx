"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { radius } from "@/lib/tokens/radius";

const CARD_EASE = [0.22, 1, 0.36, 1] as const;

const categoryCardVariants = {
  rest: {
    y: 0,
    boxShadow: "0px 2px 8px rgba(17, 24, 39, 0.05)",
    borderColor: "var(--border)",
  },
  hover: {
    y: -3,
    boxShadow: "0px 8px 20px rgba(17, 24, 39, 0.10)",
    borderColor: "var(--border)",
  },
  tap: {
    y: -1,
    scale: 0.985,
    boxShadow: "0px 4px 12px rgba(17, 24, 39, 0.08)",
  },
};

const categoryIconShellVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.06 },
};

const categoryIconVariants = {
  rest: { rotate: 0, scale: 1 },
  hover: { rotate: -2, scale: 1.02 },
};

export function CategoryCard({
  label,
  count,
  updated,
  iconSrc,
}: {
  label: string;
  count: string;
  updated: string;
  iconSrc: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      initial="rest"
      whileHover={reduceMotion ? undefined : "hover"}
      whileTap={reduceMotion ? undefined : "tap"}
      variants={categoryCardVariants}
      transition={{ duration: 0.22, ease: CARD_EASE }}
      className={cn(
        "@container flex min-w-0 w-full flex-col items-start gap-3 border border-solid border-border bg-card p-5 text-left",
        radius.lg,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        "@min-[304px]:flex-row @min-[304px]:items-center @min-[304px]:gap-2 @min-[304px]:p-6",
      )}
    >
      <motion.div
        variants={categoryIconShellVariants}
        transition={{ duration: 0.22, ease: CARD_EASE }}
        className={cn(
          "flex size-12 shrink-0 items-center justify-center bg-table-header p-2",
          radius.md,
        )}
      >
        <motion.div
          variants={categoryIconVariants}
          transition={{ duration: 0.28, ease: CARD_EASE }}
          className="relative size-8"
        >
          <img
            src={iconSrc}
            alt=""
            width={64}
            height={64}
            decoding="async"
            draggable={false}
            className="pointer-events-none size-8 max-w-none object-contain"
          />
        </motion.div>
      </motion.div>
      <div className="flex min-w-0 w-full flex-1 flex-col gap-1">
        <div className="flex w-full min-w-0 items-start gap-2">
          <h3 className="min-w-0 flex-1 truncate font-sans text-xl font-semibold leading-7 text-foreground">
            {label}
          </h3>
          <span className="shrink-0 whitespace-nowrap pt-1 font-sans text-sm font-normal leading-5 text-tertiary-foreground">
            {count}
          </span>
        </div>
        <p className="w-full font-sans text-sm font-normal leading-5 text-tertiary-foreground">{updated}</p>
      </div>
    </motion.button>
  );
}
