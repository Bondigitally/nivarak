import { cn } from "@/lib/utils";
import { riskConfig } from "@/lib/tokens/status-badges";
import { statusBadgeClass } from "@/features/dashboard/data/dashboard-styles";
import type { RiskLevel } from "@/lib/domain";

type PatientRiskBadgeProps = {
  level: RiskLevel;
  className?: string;
};

export function PatientRiskBadge({ level, className }: PatientRiskBadgeProps) {
  const risk = riskConfig(level);

  return (
    <span className={cn(statusBadgeClass, "shrink-0", risk.badge, className)}>
      {risk.label}
    </span>
  );
}
