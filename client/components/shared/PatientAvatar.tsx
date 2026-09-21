import { cn } from "@/lib/utils";
import { riskConfig } from "@/lib/tokens/status-badges";
import type { RiskLevel } from "@/lib/domain";

type PatientAvatarProps = {
  initials: string;
  riskLevel?: RiskLevel;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "size-9 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-sm",
};

export function PatientAvatar({
  initials,
  riskLevel = "low",
  size = "sm",
  className,
}: PatientAvatarProps) {
  const risk = riskConfig(riskLevel);

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        sizeClasses[size],
        risk.avatar,
        className,
      )}
    >
      {initials}
    </span>
  );
}
