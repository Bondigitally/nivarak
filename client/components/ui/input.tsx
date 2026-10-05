import * as React from "react";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

/**
 * Product form-control chrome (Rule 2 — 44px / `rounded-md`).
 * Use for native inputs, textareas, and select-like triggers that match auth/settings fields.
 */
export const fieldInputClassName = cn(
  "h-11 w-full rounded-md border border-border bg-card px-4",
  typo.input,
  "placeholder:text-placeholder placeholder:font-sans",
  "transition-[border-color,box-shadow] duration-150 ease-in-out",
  "hover:border-border",
  "focus-visible:border-border-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          fieldInputClassName,
          "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/30",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
