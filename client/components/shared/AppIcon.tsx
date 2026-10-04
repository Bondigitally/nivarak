"use client";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { ICON_SIZE, ICON_STROKE, iconSizeClass } from "@/lib/icons";
import { cn } from "@/lib/utils";

type AppIconProps = {
  icon: IconSvgElement;
  size?: number;
  className?: string;
  color?: string;
  "aria-hidden"?: boolean | "true" | "false";
};

/** Consistent Hugeicons chrome — tokens from `@/lib/icons`, stroke 1.5, absolute stroke width. */
export function AppIcon({
  icon,
  size = ICON_SIZE,
  className,
  color = "currentColor",
  ...rest
}: AppIconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={ICON_STROKE}
      absoluteStrokeWidth
      color={color}
      className={cn("block shrink-0", iconSizeClass(size), className)}
      {...rest}
    />
  );
}
