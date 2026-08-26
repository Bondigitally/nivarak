"use client";

import { Children, isValidElement, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const ITEM_TRANSITION = {
  duration: 0.18,
  ease: EASE,
};

const listVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.035 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: ITEM_TRANSITION },
};

const reducedItemVariants: Variants = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0 },
};

export function DashboardReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  const variants = reducedMotion ? reducedItemVariants : itemVariants;

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={listVariants}
    >
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;
        return (
          <motion.div key={child.key ?? index} variants={variants} className="w-full">
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
