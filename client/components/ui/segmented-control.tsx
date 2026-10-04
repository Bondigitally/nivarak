"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type SegmentedControlOption<T extends string = string> = {
  id: T;
  label: string;
};

/** Stronger neutral border for tabs on page/white backgrounds (not card surfaces). */
const SEGMENTED_TRACK_CLASS =
  "border-foreground/14 shadow-[0_1px_2px_rgba(17,24,39,0.05)]";
const SEGMENTED_ACTIVE_TAB_CLASS =
  "border-foreground/18 bg-card shadow-[0_1px_2px_rgba(17,24,39,0.08)]";

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  layoutId: _layoutId = "segmentedControlActiveTab",
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
  const listRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef(new Map<T, HTMLButtonElement>());
  const [indicator, setIndicator] = useState({ left: 0, top: 0, width: 0, height: 0 });

  useLayoutEffect(() => {
    const list = listRef.current;
    const active = buttonRefs.current.get(value);
    if (!list || !active) return;

    const update = () => {
      setIndicator({
        left: active.offsetLeft,
        top: active.offsetTop,
        width: active.offsetWidth,
        height: active.offsetHeight,
      });
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(list);
    observer.observe(active);
    return () => observer.disconnect();
  }, [value, options]);

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "relative flex w-fit max-w-full items-start overflow-x-auto overscroll-x-contain rounded-md border bg-background p-0.5 scrollbar-none [&::-webkit-scrollbar]:hidden",
        SEGMENTED_TRACK_CLASS,
        className,
      )}
    >
      {indicator.width > 0 ? (
        <motion.div
          aria-hidden
          className={cn(
            "pointer-events-none absolute rounded-md border",
            SEGMENTED_ACTIVE_TAB_CLASS,
          )}
          initial={false}
          animate={{
            left: indicator.left,
            top: indicator.top,
            width: indicator.width,
            height: indicator.height,
          }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { type: "tween", duration: 0.22, ease: [0.32, 0.72, 0, 1] }
          }
        />
      ) : null}

      {options.map((tab) => {
        const isActive = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            ref={(node) => {
              if (node) buttonRefs.current.set(tab.id, node);
              else buttonRefs.current.delete(tab.id);
            }}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative z-10 flex shrink-0 items-center justify-center px-3 py-2.5 text-center text-sm leading-5 whitespace-nowrap select-none transition-colors duration-200 ease-out sm:px-5 sm:py-3",
              isActive ? "text-primary-active" : "text-muted-foreground hover:text-primary-active",
            )}
          >
            <span className="inline-grid place-items-center">
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
