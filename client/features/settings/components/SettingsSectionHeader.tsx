import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { cardTitleClass } from "@/features/dashboard/data/dashboard-styles";
import { cn } from "@/lib/utils";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";

export function SettingsSectionHeader({
  icon,
  title,
  className,
}: {
  icon: IconSvgElement;
  title: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <HugeiconsIcon
        icon={icon}
        size={ICON_SIZE}
        strokeWidth={ICON_STROKE}
        color="currentColor"
        className="size-4.75 shrink-0 text-foreground"
      absoluteStrokeWidth />
      <h2 className={cardTitleClass}>{title}</h2>
    </div>
  );
}
