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
      className={cn(typo.error, "min-h-auth-error truncate", className)}
      role={error ? "alert" : undefined}
      aria-hidden={!error}
    >
      {error?.split("\n")[0] ?? ""}
    </p>
  );
}
