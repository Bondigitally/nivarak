"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type SegmentedControlOption<T extends string = string> = {
  id: T;
  label: string;
};

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  layoutId = "segmentedControlActiveTab",
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly SegmentedControlOption<T>[];
  ariaLabel: string;
  /** Unique when multiple controls can mount on the same page. */
  layoutId?: string;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "flex w-fit max-w-full items-start overflow-x-auto overscroll-x-contain rounded-[14px] border border-[#E9E4ED] bg-[#F8F5FA] p-0.5 scrollbar-none [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {options.map((tab) => {
        const isActive = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex shrink-0 items-center justify-center px-3 py-2.5 text-center text-sm leading-5 whitespace-nowrap select-none transition-colors duration-200 ease-out sm:px-5 sm:py-3",
              isActive ? "text-(--primary-active)" : "text-muted-foreground hover:text-(--primary-active)",
            )}
          >
            {isActive ? (
              <motion.div
                layoutId={reducedMotion ? undefined : layoutId}
                className="absolute inset-0 rounded-[14px] border border-[#E9E4ED] bg-white shadow-[0_1px_1px_rgba(17,24,39,0.04)]"
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 300, damping: 28, mass: 0.8 }
                }
              />
            ) : null}
            <span className="relative z-10 inline-grid place-items-center">
              <span className="invisible col-start-1 row-start-1 font-semibold" aria-hidden>
                {tab.label}
              </span>
              <span
                className={cn(
                  "col-start-1 row-start-1",
                  isActive ? "font-semibold" : "font-medium",
                )}
              >
                {tab.label}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
