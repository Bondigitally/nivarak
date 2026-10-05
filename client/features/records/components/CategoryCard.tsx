"use client";

import { cn } from "@/lib/utils";
import { radius } from "@/lib/tokens/radius";
import {
  cardLiftActiveClass,
  cardLiftHoverClass,
  cardLiftHoverWashClass,
  cardLiftTransitionClass,
  cardShadowClass,
} from "@/lib/tokens/elevation";
import { cardTitleClass } from "@/features/dashboard/data/dashboard-styles";

export function CategoryCard({
  label,
  count,
  updated,
  iconSrc,
  selected = false,
  onSelect,
}: {
  label: string;
  count: string;
  updated: string;
  iconSrc: string;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "group relative isolate overflow-hidden",
        "@container flex min-w-0 w-full flex-col items-start gap-3 bg-card p-5 text-left",
        radius.lg,
        cardShadowClass,
        cardLiftTransitionClass,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        "@min-[304px]:flex-row @min-[304px]:items-center @min-[304px]:gap-2 @min-[304px]:p-6",
        selected
          ? "border border-primary"
          : cn(cardLiftHoverClass, cardLiftActiveClass),
      )}
    >
      {selected ? (
        <span
          aria-hidden
          className={cn(cardLiftHoverWashClass, "opacity-100")}
        />
      ) : (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 z-0 opacity-0",
            "bg-linear-to-br from-muted via-muted/40 to-transparent",
            "motion-safe:transition-opacity motion-safe:duration-220 motion-safe:ease-out",
            "motion-safe:group-hover:opacity-100",
          )}
        />
      )}
      <div
        className={cn(
          "relative z-1 flex size-12 shrink-0 items-center justify-center border border-border bg-table-header p-2",
          radius.md,
          "motion-safe:transition-transform motion-safe:duration-220 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
          !selected && "motion-safe:group-hover:scale-[1.04]",
        )}
      >
        <div className="relative size-8">
          <img
            src={iconSrc}
            alt=""
            width={64}
            height={64}
            decoding="async"
            draggable={false}
            className="pointer-events-none size-8 max-w-none object-contain"
          />
        </div>
      </div>
      <div className="relative z-1 flex min-w-0 w-full flex-1 flex-col gap-1">
        <div className="flex w-full min-w-0 items-start gap-2">
          <h3 className={cn(cardTitleClass, "min-w-0 flex-1 truncate")}>
            {label}
          </h3>
          <span className="shrink-0 whitespace-nowrap pt-1 font-sans text-sm font-normal leading-5 text-tertiary-foreground">
            {count}
          </span>
        </div>
        <p className="w-full font-sans text-sm font-normal leading-5 text-tertiary-foreground">
          {updated}
        </p>
      </div>
    </button>
  );
}
