"use client";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { ICON_SIZE, ICON_STROKE, BADGE_ICON_SIZE, INFO_ICON_SIZE } from "@/lib/icons";
import { cn } from "@/lib/utils";

type AppIconProps = {
  icon: IconSvgElement;
  size?: number;
  className?: string;
  color?: string;
  "aria-hidden"?: boolean | "true" | "false";
};

/** Consistent Hugeicons chrome — 19×19, stroke 1.5, absolute stroke width. */
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
      className={cn(
        "block shrink-0",
        size === ICON_SIZE && "size-[19px]",
        (size === BADGE_ICON_SIZE || size === INFO_ICON_SIZE) && "size-4",
        className,
      )}
      {...rest}
    />
  );
}
