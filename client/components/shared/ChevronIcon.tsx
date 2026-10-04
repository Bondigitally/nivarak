import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { ICON_SIZE, ICON_STROKE, iconSizeClass } from "@/lib/icons";
import { cn } from "@/lib/utils";

const CHEVRONS = {
  down: ChevronDown,
  up: ChevronUp,
  left: ChevronLeft,
  right: ChevronRight,
} as const;

type ChevronDirection = keyof typeof CHEVRONS;

/**
 * Lucide chevrons only — all other icons use Hugeicons via AppIcon.
 */
export function ChevronIcon({
  direction = "down",
  size = ICON_SIZE,
  className,
}: {
  direction?: ChevronDirection;
  size?: number;
  className?: string;
}) {
  const Icon = CHEVRONS[direction];
  return (
    <Icon
      size={size}
      strokeWidth={ICON_STROKE}
      className={cn("shrink-0", iconSizeClass(size), className)}
      aria-hidden
    />
  );
}
