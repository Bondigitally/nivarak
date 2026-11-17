import { radius } from "@/lib/tokens/radius";
import { cn } from "@/lib/utils";

/** Section nav + main panel shell (matches sidebar corner radius). */
export const CGA_SECTION_SHELL_CLASS = cn(
  radius.lg,
  "border border-border bg-card",
);