"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Moon02Icon,
  RepeatIcon,
  Sun03Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/shared/AppIcon";
import { AnimatedStrikeText } from "@/components/shared/AnimatedStrikeText";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { dashboardCardClass, statusBadgeClass } from "@/features/dashboard/data/dashboard-styles";
import {
  MOCK_TODAY_MEDICATIONS,
  type DosePeriod,
  type DoseStatus,
  type MedicationDose,
  type MedicationItem,
} from "@/features/medications/data/medications-data";

const PERIOD_STYLES: Record<
  DosePeriod,
  { label: string; bg: string; text: string; icon: typeof Sun03Icon }
> = {
  morning: {
    label: "Morning",
    bg: "bg-info-muted",
    text: "text-info",
    icon: Sun03Icon,
  },
  evening: {
    label: "Evening",
    bg: "bg-warning-muted",
    text: "text-warning",
    icon: Moon02Icon,
  },
};

function PeriodBadge({ period, dimmed = false }: { period: DosePeriod; dimmed?: boolean }) {
  const style = PERIOD_STYLES[period];
  return (
    <span
      className={cn(
        statusBadgeClass,
        "gap-1 transition-colors duration-200",
        dimmed ? "bg-muted text-tertiary-foreground" : [style.bg, style.text],
      )}
    >
      <AppIcon icon={style.icon} size={BADGE_ICON_SIZE} />
      <AnimatedStrikeText active={dimmed}>{style.label}</AnimatedStrikeText>
    </span>
  );
}

function AdherenceButtons({
  status,
  onChange,
}: {
  status: DoseStatus;
  onChange: (next: DoseStatus) => void;
}) {
  const buttonClass =
    "min-w-[7.25rem] justify-center gap-1 shadow-[0_1px_2px_rgba(17,24,39,0.04)]";

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        aria-pressed={status === "taken"}
        onClick={() => onChange(status === "taken" ? null : "taken")}
        className={cn(
          buttonClass,
          status === "taken" &&
            "border-success text-success hover:bg-success/5 hover:text-success active:bg-success/10 active:text-success",
        )}
      >
        <HugeiconsIcon icon={Tick02Icon} size={19} strokeWidth={1.5} color="currentColor" absoluteStrokeWidth />
        Taken
      </Button>
      <Button
        type="button"
        variant="secondary"
        aria-pressed={status === "skipped"}
        onClick={() => onChange(status === "skipped" ? null : "skipped")}
        className={cn(
          buttonClass,
          status === "skipped" &&
            "border-destructive text-destructive hover:bg-destructive/5 hover:text-destructive active:bg-destructive/10 active:text-destructive",
        )}
      >
        <HugeiconsIcon icon={Cancel01Icon} size={19} strokeWidth={1.5} color="currentColor" absoluteStrokeWidth />
        Skipped
      </Button>
    </div>
  );
}

function MedicationMeta({
  medication,
  showPeriodBadge,
  dimmed = false,
}: {
  medication: MedicationItem;
  showPeriodBadge: boolean;
  dimmed?: boolean;
}) {
  const singleDose = medication.doses.length === 1 ? medication.doses[0] : null;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="min-w-0">
          <AnimatedStrikeText
            active={dimmed}
            className={cn(
              typo.headingXl,
              "text-[20px] leading-7.5 transition-colors duration-200",
              dimmed ? "text-tertiary-foreground" : "text-foreground",
            )}
          >
            {medication.name}
          </AnimatedStrikeText>
        </h2>
        <span
          className={cn(
            "text-base font-normal leading-6 transition-colors duration-200",
            dimmed ? "text-tertiary-foreground" : "text-muted-foreground",
          )}
        >
          {medication.dosage}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <span
          className={cn(
            "inline-flex items-center gap-1 transition-colors duration-200",
            dimmed ? "text-tertiary-foreground" : "text-muted-foreground",
          )}
        >
          <HugeiconsIcon icon={RepeatIcon} size={19} strokeWidth={1.5} color="currentColor" absoluteStrokeWidth />
          <span className={cn(typo.button, dimmed ? "text-tertiary-foreground" : "text-muted-foreground")}>
            {medication.frequencyLabel}
          </span>
        </span>
        {showPeriodBadge && singleDose ? (
          <PeriodBadge period={singleDose.period} dimmed={dimmed} />
        ) : null}
      </div>
    </div>
  );
}

function DoseRow({
  dose,
  onChange,
  className,
}: {
  dose: MedicationDose;
  onChange: (status: DoseStatus) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <PeriodBadge period={dose.period} dimmed={dose.status === "taken"} />
      <AdherenceButtons status={dose.status} onChange={onChange} />
    </div>
  );
}

function MedicationCard({
  medication,
  onDoseChange,
}: {
  medication: MedicationItem;
  onDoseChange: (doseId: string, status: DoseStatus) => void;
}) {
  const isMultiDose = medication.doses.length > 1;
  const allDosesTaken = medication.doses.every((dose) => dose.status === "taken");

  if (!isMultiDose) {
    const dose = medication.doses[0];
    const isTaken = dose.status === "taken";
    return (
      <article
        className={cn(
          dashboardCardClass,
          "flex flex-col gap-4 p-6 transition-colors duration-200 sm:flex-row sm:items-center sm:justify-between",
          isTaken && "bg-muted/30",
        )}
      >
        <MedicationMeta medication={medication} showPeriodBadge dimmed={isTaken} />
        <AdherenceButtons
          status={dose.status}
          onChange={(status) => onDoseChange(dose.id, status)}
        />
      </article>
    );
  }

  return (
    <article
      className={cn(
        dashboardCardClass,
        "flex flex-col gap-4 p-6 transition-colors duration-200",
        allDosesTaken && "bg-muted/30",
      )}
    >
      <MedicationMeta medication={medication} showPeriodBadge={false} dimmed={allDosesTaken} />
      <div className="flex flex-col gap-2 border-t border-border pt-4.25">
        {medication.doses.map((dose, index) => (
          <DoseRow
            key={dose.id}
            dose={dose}
            onChange={(status) => onDoseChange(dose.id, status)}
            className={cn(
              index > 0 && "border-t border-dashed border-border pt-2",
            )}
          />
        ))}
      </div>
    </article>
  );
}

export function MedicationCards({
  medications = MOCK_TODAY_MEDICATIONS,
}: {
  medications?: MedicationItem[];
}) {
  const [items, setItems] = useState(medications);

  function setDoseStatus(medicationId: string, doseId: string, status: DoseStatus) {
    setItems((current) =>
      current.map((medication) =>
        medication.id !== medicationId
          ? medication
          : {
              ...medication,
              doses: medication.doses.map((dose) =>
                dose.id === doseId ? { ...dose, status } : dose,
              ),
            },
      ),
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {items.map((medication) => (
        <MedicationCard
          key={medication.id}
          medication={medication}
          onDoseChange={(doseId, status) => setDoseStatus(medication.id, doseId, status)}
        />
      ))}
    </div>
  );
}
