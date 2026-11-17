"use client";

import { cn } from "@/lib/utils";

/**
 * Animated expand/collapse for conditional details (falls circumstances, Other, etc.).
 * Uses grid-template-rows so open content is never stuck at height 0.
 */
export function CgaRevealDetails({
  open,
  children,
  className,
}: {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        className,
      )}
      aria-hidden={!open}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={cn(
            "transition-[padding,visibility] duration-200 ease-out",
            open ? "visible pt-0" : "invisible",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function isCgaOtherSelected(
  value: string | string[] | undefined,
): boolean {
  if (Array.isArray(value)) return value.includes("other");
  return value === "other";
}

export function cgaOtherFieldKey(fieldId: string) {
  return `${fieldId}Other`;
}
