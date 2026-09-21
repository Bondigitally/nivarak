"use client";

import { cva, type VariantProps } from "class-variance-authority";
import {
  Button as AriaButton,
  composeRenderProps,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";

import { cn } from "@/lib/utils";

/**
 * React Aria button for date/calendar chrome.
 * Keeps the app `Button` (Radix/motion) untouched.
 */
const ariaButtonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    "data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2",
    "focus-visible:outline-none",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground data-[hovered]:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground data-[hovered]:bg-destructive/90",
        outline:
          "bg-muted text-muted-foreground data-[hovered]:bg-table-header data-[hovered]:text-accent-foreground",
        secondary:
          "bg-muted text-secondary-foreground data-[hovered]:bg-table-header",
        ghost:
          "data-[hovered]:bg-muted data-[hovered]:text-accent-foreground",
        link: "text-primary underline-offset-4 data-[hovered]:underline data-[hovered]:text-ring",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface AriaIconButtonProps
  extends AriaButtonProps,
    VariantProps<typeof ariaButtonVariants> {}

function AriaIconButton({
  className,
  variant,
  size,
  ...props
}: AriaIconButtonProps) {
  return (
    <AriaButton
      className={composeRenderProps(className, (className) =>
        cn(ariaButtonVariants({ variant, size, className })),
      )}
      {...props}
    />
  );
}

export { AriaIconButton, ariaButtonVariants };
export type { AriaIconButtonProps };
