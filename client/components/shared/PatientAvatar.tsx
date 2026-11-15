import Image from "next/image";
import { cn } from "@/lib/utils";
import { riskConfig } from "@/lib/tokens/status-badges";
import type { RiskLevel } from "@/lib/domain";

type PatientAvatarProps = {
  initials: string;
  riskLevel?: RiskLevel;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Optional profile photo — falls back to initials when omitted. */
  src?: string;
};

const sizeClasses = {
  sm: "size-9 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-sm",
};

const sizePx = {
  sm: 36,
  md: 40,
  lg: 48,
} as const;

export function PatientAvatar({
  initials,
  riskLevel = "low",
  size = "sm",
  className,
  src,
}: PatientAvatarProps) {
  const risk = riskConfig(riskLevel);

  if (src) {
    return (
      <span
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full border border-border bg-muted",
          sizeClasses[size],
          className,
        )}
      >
        <Image
          src={src}
          alt=""
          width={sizePx[size] * 2}
          height={sizePx[size] * 2}
          quality={90}
          sizes={`${sizePx[size]}px`}
          className="size-full object-cover"
        />
        <span className="sr-only">{initials}</span>
      </span>
    );
  }

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
