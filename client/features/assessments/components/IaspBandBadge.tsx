import { CheckmarkSquare02Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { iaspBandBadgeClass } from "@/features/assessments/data/iasp-assessment-styles";
import { getIaspBand } from "@/features/assessments/data/iasp-scoring";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { cn } from "@/lib/utils";

/** Assessment results — solid filled band pill (dashboard uses `IaspBandPingBadge`). */
export function IaspBandBadge({
  percentage,
  className,
}: {
  percentage: number;
  className?: string;
}) {
  const band = getIaspBand(percentage);

  return (
    <span className={cn(iaspBandBadgeClass, band.badgeClass, className)}>
      <AppIcon icon={CheckmarkSquare02Icon} size={BADGE_ICON_SIZE} />
      {band.label}
    </span>
  );
}
