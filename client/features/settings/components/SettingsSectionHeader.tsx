import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

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
        size={19}
        strokeWidth={1.5}
        color="currentColor"
        className="size-4.75 shrink-0 text-foreground"
      absoluteStrokeWidth />
      <h2 className={typo.headingXl}>{title}</h2>
    </div>
  );
}
