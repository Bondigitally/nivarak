"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { radius } from "@/lib/tokens/radius";
import { cn } from "@/lib/utils";

export type SegmentedControlOption<T extends string = string> = {
  id: T;
  label: string;
};

/**
 * Proud-tab segmented control (reference: taller selected pill over a shorter track).
 * Radius stays Rule 3 `rounded-md` — not pill.
 *
 * Track fill is neutral — table header on canvas, secondary on white cards.
 */
export const SEGMENTED_TRACK_CLASS = "bg-segmented-track";
/** @deprecated Prefer `surface="card"` — uses `bg-segmented-track-on-card`. */
export const SEGMENTED_TRACK_SURFACE_CLASS = "bg-segmented-track-on-card";
const SEGMENTED_TRACK_BY_SURFACE = {
  canvas: SEGMENTED_TRACK_CLASS,
  card: "bg-segmented-track-on-card",
} as const;

export type SegmentedControlSurface = keyof typeof SEGMENTED_TRACK_BY_SURFACE;

const SEGMENTED_ACTIVE_TAB_CLASS =
  "border border-border bg-card shadow-[0_1px_2px_rgba(17,24,39,0.06)]";

/** Tab = Button Default height (44px). Track behind is slightly shorter so the tab sits proud. */
const SEGMENTED_MOBILE_TRIGGER_CLASS = cn(
  "flex h-dash-control min-h-dash-control w-full items-center justify-between gap-2 border border-border bg-card px-5 text-left text-sm leading-5 md:hidden",
  radius.md,
);
/** Scrollport pads vertically so the proud active pill border/shadow isn't clipped. */
const SEGMENTED_SCROLL_CLASS =
  "max-w-full overflow-x-auto overscroll-x-contain py-1 scrollbar-none [&::-webkit-scrollbar]:hidden";
const SEGMENTED_LIST_CLASS = cn(
  "relative flex h-dash-control min-h-dash-control w-fit items-stretch overflow-hidden",
  radius.md,
);
/** 40px track centered behind 44px tabs — fill comes from `surface`, not baked in here. */
const SEGMENTED_TRACK_BAR_LAYOUT_CLASS =
  "pointer-events-none absolute top-1/2 right-0 left-0 z-0 h-10 -translate-y-1/2";
const SEGMENTED_SEGMENT_CLASS = cn(
  radius.md,
  "relative z-10 flex h-full shrink-0 items-center justify-center px-5 text-center text-sm leading-5 whitespace-nowrap select-none transition-colors duration-200 ease-out",
);

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  layoutId: _layoutId = "segmentedControlActiveTab",
  surface = "canvas",
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly SegmentedControlOption<T>[];
  ariaLabel: string;
  /** Unique when multiple controls can mount on the same page. */
  layoutId?: string;
  /** Kept for API compatibility — canvas vs card track shades. */
  surface?: SegmentedControlSurface;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef(new Map<T, HTMLButtonElement>());
  const [indicator, setIndicator] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const selected = options.find((tab) => tab.id === value);
  const collapseOnMobile = options.length > 2;

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
    <div className={cn("min-w-0", className)}>
      {collapseOnMobile ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={ariaLabel}
              className={cn(
                SEGMENTED_MOBILE_TRIGGER_CLASS,
                "font-semibold text-foreground",
                "outline-none transition-colors hover:text-foreground",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              )}
            >
              <span className="min-w-0 truncate">{selected?.label}</span>
              <AppIcon
                icon={ArrowDown01Icon}
                className="shrink-0 text-muted-foreground"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="min-w-(--radix-dropdown-menu-trigger-width) w-(--radix-dropdown-menu-trigger-width) p-1"
          >
            {options.map((tab) => (
              <DropdownMenuItem
                key={tab.id}
                className={cn(
                  "cursor-pointer px-2.5 py-2",
                  tab.id === value && "font-semibold text-foreground",
                )}
                onSelect={() => onChange(tab.id)}
              >
                {tab.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      <div
        className={cn(
          SEGMENTED_SCROLL_CLASS,
          collapseOnMobile ? "hidden md:block" : "block",
        )}
      >
        <div
          ref={listRef}
          role="tablist"
          aria-label={ariaLabel}
          className={SEGMENTED_LIST_CLASS}
        >
          <div
            aria-hidden
            className={cn(
              SEGMENTED_TRACK_BAR_LAYOUT_CLASS,
              radius.md,
              SEGMENTED_TRACK_BY_SURFACE[surface],
            )}
          />

          {indicator.width > 0 ? (
            <motion.div
              aria-hidden
              className={cn(
                "pointer-events-none absolute z-[1]",
                radius.md,
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
                  SEGMENTED_SEGMENT_CLASS,
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
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
      </div>
    </div>
  );
}
