"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IASP_ASSESSMENT_OPEN_HREF } from "@/features/assessments/lib/iasp-report-url";
import { cn } from "@/lib/utils";

type ArrowFillButtonProps = {
  text?: string;
  href?: string;
  className?: string;
  /** Inverse colors for brand / dark surfaces (white pill → purple fill). */
  variant?: "default" | "inverse";
};

/**
 * Solid purple pill — white circle expands from the arrow on hover.
 * Arrow is in-flow (shrink-0) so the label never overlaps it on narrow screens.
 */
export function ArrowFillButton({
  text = "Take a Free 3-Minute Assessment",
  href = IASP_ASSESSMENT_OPEN_HREF,
  className,
  variant = "default",
}: ArrowFillButtonProps) {
  const inverse = variant === "inverse";

  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex h-[var(--density-control-h-cta)] w-fit max-w-full",
        "cursor-pointer items-center gap-3 overflow-hidden rounded-full",
        "py-0 pl-5 pr-1.5",
        "text-[length:var(--type-button-size)] font-[number:var(--type-button-weight)]",
        "leading-none no-underline",
        inverse
          ? "border border-white bg-white"
          : "border border-[var(--color-primary)] bg-[var(--color-primary)]",
        className,
      )}
      /* Inline color beats inherited `.final-cta { color: inverse }` white. */
      style={{ color: inverse ? "var(--color-primary)" : "#ffffff" }}
    >
      <span
        className="relative z-1 min-w-0 truncate pb-px"
        style={{ color: inverse ? "var(--color-primary)" : "#ffffff" }}
      >
        {text}
      </span>

      {/* Expanding disc — starts over the arrow chip, fills the pill on hover */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute z-2 rounded-full",
          inverse ? "bg-[var(--color-primary)]" : "bg-white",
          "inset-y-[calc((100%-2.25rem)/2)] right-1.5 left-[calc(100%-0.375rem-2.25rem)]",
          "transition-all duration-[500ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
          "group-hover:inset-0",
          "motion-reduce:transition-none",
        )}
      />

      {/* Label reveal clipped to the expanding disc */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-2 flex items-center",
          "pl-5 pr-[calc(0.375rem+2.25rem+0.75rem)]",
          inverse ? "text-white" : "text-[var(--color-primary)]",
          "[clip-path:inset(calc((100%-2.25rem)/2)_0.375rem_calc((100%-2.25rem)/2)_calc(100%-0.375rem-2.25rem))]",
          "transition-all duration-[500ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
          "group-hover:[clip-path:inset(0_0_0_0)]",
          "motion-reduce:transition-none",
        )}
      >
        <span className="min-w-0 truncate pb-px">{text}</span>
      </span>

      <span
        aria-hidden
        className={cn(
          "relative z-3 inline-flex size-9 shrink-0 items-center justify-center",
          "overflow-hidden rounded-full",
          inverse ? "text-white" : "text-[var(--color-primary)]",
        )}
        style={{
          WebkitMaskImage: "-webkit-radial-gradient(white, black)",
          maskImage: "radial-gradient(white, black)",
        }}
      >
        <ArrowRight
          className={cn(
            "absolute top-1/2 left-1/2 size-4 origin-center scale-0",
            "translate-x-[-170%] -translate-y-1/2 text-current",
            "transition-transform duration-[500ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            "group-hover:-translate-x-1/2 group-hover:scale-100",
            "motion-reduce:transition-none",
          )}
          strokeWidth={1.8}
        />
        <ArrowRight
          className={cn(
            "absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2",
            "origin-center text-current",
            "transition-transform duration-[500ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            "group-hover:translate-x-[70%] group-hover:scale-0",
            "motion-reduce:transition-none",
          )}
          strokeWidth={1.8}
        />
      </span>
    </Link>
  );
}
