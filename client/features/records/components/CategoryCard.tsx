"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const CARD_EASE = [0.22, 1, 0.36, 1] as const;

const categoryCardVariants = {
  rest: {
    y: 0,
    boxShadow: "0px 2px 8px rgba(17, 24, 39, 0.05)",
    borderColor: "#E9E4ED",
  },
  hover: {
    y: -3,
    boxShadow: "0px 8px 20px rgba(17, 24, 39, 0.10)",
    borderColor: "#D4CBD9",
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
  hover: { rotate: -4, scale: 1.04 },
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
        "@container flex min-w-0 w-full flex-col items-start gap-3 rounded-xl border border-solid border-[#E9E4ED] bg-white p-5 text-left",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C318E]/30",
        "@min-[304px]:flex-row @min-[304px]:items-center @min-[304px]:gap-2 @min-[304px]:p-6",
      )}
    >
      <motion.div
        variants={categoryIconShellVariants}
        transition={{ duration: 0.22, ease: CARD_EASE }}
        className="flex shrink-0 items-center rounded-[14px] bg-[#F1F2F4] p-2"
      >
        <motion.div
          variants={categoryIconVariants}
          transition={{ duration: 0.28, ease: CARD_EASE }}
          className="relative size-8 overflow-hidden rounded-lg"
        >
          <img
            src={iconSrc}
            alt=""
            width={32}
            height={32}
            className="size-full object-cover"
          />
        </motion.div>
      </motion.div>
      <div className="flex min-w-0 w-full flex-1 flex-col gap-1">
        <div className="flex w-full min-w-0 items-start gap-2">
          <h3 className="min-w-0 flex-1 truncate font-sans text-xl font-semibold leading-7 text-[#1A1A1A]">
            {label}
          </h3>
          <span className="shrink-0 whitespace-nowrap pt-1 font-sans text-sm font-normal leading-5 text-[#8A8F98]">
            {count}
          </span>
        </div>
        <p className="w-full font-sans text-sm font-normal leading-5 text-[#8A8F98]">{updated}</p>
      </div>
    </motion.button>
  );
}
