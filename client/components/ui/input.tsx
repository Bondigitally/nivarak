import * as React from "react";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

/** WebKit autofill — keep filled fields on `bg-card` / foreground text (no gray/yellow). */
export const fieldInputAutofillClassName =
  "[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_var(--card)] [&:-webkit-autofill]:[-webkit-text-fill-color:var(--foreground)] [&:-webkit-autofill]:[caret-color:var(--foreground)] [&:-webkit-autofill]:transition-[background-color_99999s_ease-out_0s] [&:-webkit-autofill:hover]:shadow-[inset_0_0_0_1000px_var(--card)] [&:-webkit-autofill:focus]:shadow-[inset_0_0_0_1000px_var(--card)]";

/**
 * Product form-control chrome (Rule 2 — 44px / `rounded-md`).
 * Use for native inputs, textareas, and select-like triggers that match auth/settings fields.
 */
export const fieldInputClassName = cn(
  "h-11 w-full rounded-md border border-border bg-card px-4",
  typo.input,
  "placeholder:text-placeholder placeholder:font-sans",
  fieldInputAutofillClassName,
  "transition-[border-color,box-shadow] duration-150 ease-in-out",
  "hover:border-border",
  "focus-visible:border-border-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

/** Dropdown / combobox trigger — same 44px chrome as {@link fieldInputClassName}. */
export const fieldSelectTriggerClassName = cn(
  fieldInputClassName,
  "inline-flex items-center justify-between gap-2 text-left",
);

/** Multiline fields — min height matches single-line inputs. */
export const fieldTextareaClassName = cn(
  fieldInputClassName,
  "h-auto min-h-11 resize-y py-3 leading-6",
);

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          fieldInputClassName,
          "aria-invalid:border-destructive aria-invalid:ring-destructive/30",
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
