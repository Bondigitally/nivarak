import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

const DOSE_AMOUNT_RE = /^([\d.,]+)\s*(.*)$/i;

export function MedicationDoseLabel({
  dose,
  variant = "prominent",
  className,
  dimmed = false,
}: {
  dose: string;
  /** `prominent` — overview column; `inline` — beside drug name on cards */
  variant?: "prominent" | "inline";
  className?: string;
  dimmed?: boolean;
}) {
  const match = dose.trim().match(DOSE_AMOUNT_RE);
  const muted = dimmed ? "text-tertiary-foreground" : undefined;

  const wrapperClass = cn(
    variant === "prominent"
      ? cn(
          typo.headingM,
          "font-bold tracking-tight tabular-nums text-foreground",
        )
      : cn(typo.headingS, "font-medium tabular-nums text-muted-foreground"),
    muted,
    className,
  );

  if (!match) {
    return <span className={wrapperClass}>{dose}</span>;
  }

  const [, amount, unit] = match;
  const unitClass =
    variant === "prominent"
      ? cn(
          "ml-1 text-sm font-semibold leading-5",
          dimmed ? "text-tertiary-foreground" : "text-foreground",
        )
      : cn(
          "ml-0.5 font-normal",
          dimmed ? "text-tertiary-foreground" : "text-foreground",
        );

  return (
    <span className={wrapperClass}>
      {amount}
      {unit ? <span className={unitClass}>{unit}</span> : null}
    </span>
  );
}
