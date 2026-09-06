"use client";

import { cn } from "@/lib/utils";
import { radius } from "@/lib/tokens/radius";

const CARD_SURFACE_TRANSITION =
  "motion-safe:transition-[transform_0.35s_cubic-bezier(0.2,0.8,0.2,1),box-shadow_0.35s_ease]";

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
  return (
    <button
      type="button"
      className={cn(
        "group relative isolate overflow-hidden",
        "@container flex min-w-0 w-full flex-col items-start gap-3 border border-solid border-border bg-card p-5 text-left",
        radius.lg,
        "shadow-[0px_2px_8px_rgba(17,24,39,0.05)]",
        CARD_SURFACE_TRANSITION,
        "motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0px_12px_32px_rgba(17,24,39,0.08)]",
        "motion-safe:active:-translate-y-px motion-safe:active:shadow-[0px_4px_14px_rgba(17,24,39,0.06)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        "@min-[304px]:flex-row @min-[304px]:items-center @min-[304px]:gap-2 @min-[304px]:p-6",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-0 opacity-0",
          "bg-linear-to-br from-foreground/3 to-foreground/1",
          "motion-safe:transition-opacity motion-safe:duration-350 motion-safe:ease-in-out",
          "motion-safe:group-hover:opacity-100",
        )}
      />
      <div
        className={cn(
          "relative z-1 flex size-12 shrink-0 items-center justify-center bg-table-header p-2",
          radius.md,
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
          <h3 className="min-w-0 flex-1 truncate font-sans text-xl font-semibold leading-7 text-foreground">
            {label}
          </h3>
          <span className="shrink-0 whitespace-nowrap pt-1 font-sans text-sm font-normal leading-5 text-tertiary-foreground">
            {count}
          </span>
        </div>
        <p className="w-full font-sans text-sm font-normal leading-5 text-tertiary-foreground">{updated}</p>
      </div>
    </button>
  );
}
