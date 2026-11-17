"use client";

import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

/** Reserved one-line error slot so validation never shifts the form layout. */
export function FieldErrorMessage({
  error,
  className,
}: {
  error?: string | null;
  className?: string;
}) {
  return (
    <p
      className={cn(
        typo.error,
        // Fixed to leading-5 (20px) — min-h-auth-error can be shorter than
        // line-height when empty, which still shifted the layout on error.
        "h-5 truncate leading-5",
        className,
      )}
      role={error ? "alert" : undefined}
      aria-hidden={!error}
    >
      {error?.split("\n")[0] ?? "\u00A0"}
    </p>
  );
}
