"use client";

import {
  ArrowRight02Icon,
  Calendar03Icon,
  Call02Icon,
  CheckmarkCircle02Icon,
  ClipboardIcon,
  ComputerIcon,
  EyeIcon,
  Facebook02Icon,
  FavouriteIcon,
  GaugeIcon,
  HandHeartIcon,
  HouseHeartIcon,
  InstagramIcon,
  Leaf01Icon,
  Linkedin02Icon,
  Location01Icon,
  Mail02Icon,
  UserGroupIcon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { ChevronIcon } from "@/components/shared/ChevronIcon";
import { ICON_STROKE } from "@/lib/icons";
import { cn } from "@/lib/utils";

const MARKETING_ICONS = {
  "i-heart": FavouriteIcon,
  "i-clipboard": ClipboardIcon,
  "i-dial": GaugeIcon,
  "i-monitor": ComputerIcon,
  "i-users": UserMultipleIcon,
  "i-eye": EyeIcon,
  "i-family": HouseHeartIcon,
  "i-leaf": Leaf01Icon,
  "i-hand-heart": HandHeartIcon,
  "i-arrow": ArrowRight02Icon,
  "i-phone": Call02Icon,
  "i-mail": Mail02Icon,
  "i-map": Location01Icon,
  "i-calendar": Calendar03Icon,
  "i-check-circle": CheckmarkCircle02Icon,
  "i-fb": Facebook02Icon,
  "i-insta": InstagramIcon,
  "i-in": Linkedin02Icon,
  "i-users-group": UserGroupIcon,
} as const satisfies Record<string, IconSvgElement>;

export type MarketingIconName = keyof typeof MARKETING_ICONS | "i-chevron";

type IconProps = {
  name: MarketingIconName | (string & {});
  className?: string;
};

/**
 * Marketing icons: Hugeicons everywhere, Lucide only for chevrons.
 * Keeps the `icon` class so existing marketing CSS size/rotate rules apply.
 */
export function Icon({ name, className }: IconProps) {
  const classes = cn("icon shrink-0", className);

  if (name === "i-chevron") {
    return <ChevronIcon direction="down" className={classes} />;
  }

  const icon = MARKETING_ICONS[name as keyof typeof MARKETING_ICONS];
  if (!icon) return null;

  return (
    <HugeiconsIcon
      icon={icon}
      size={24}
      strokeWidth={ICON_STROKE}
      absoluteStrokeWidth
      color="currentColor"
      className={classes}
      aria-hidden
    />
  );
}
