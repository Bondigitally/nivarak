"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import "@/features/marketing/components/FlowButton.flow.css";

type FlowButtonProps = {
  text?: string;
  href: string;
  className?: string;
  onClick?: ComponentPropsWithoutRef<typeof Link>["onClick"];
};

/**
 * Brand purple pill → white inverse on hover, with rounded-square morph.
 * Border stays on the outer element; fill + arrows are clipped inside.
 */
export function FlowButton({
  text = "Log in",
  href,
  className,
  onClick,
}: FlowButtonProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flow-btn group relative inline-flex items-center justify-center",
        "min-h-[var(--density-control-h)] cursor-pointer",
        "rounded-[100px]",
        "border border-solid border-[var(--color-primary)]",
        "bg-[var(--color-primary)]",
        "px-8 py-3 text-[length:var(--type-body-m-size)] font-medium",
        "no-underline",
        "transition-[border-radius,color,transform] duration-[400ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
        "active:scale-[0.95]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        "focus-visible:outline-[var(--color-border-focus)]",
        "motion-reduce:active:scale-100",
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      >
        <span className="flow-btn__fill" />
        <ArrowRight className="flow-btn__arrow stroke-current fill-none" />
      </span>

      <span className="flow-btn__label">{text}</span>
    </Link>
  );
}
