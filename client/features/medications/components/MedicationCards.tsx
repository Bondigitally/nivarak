"use client";

/**
 * MedicationCards renders today's scheduled medications with per-dose
 * adherence controls (taken / skipped / pending).
 *
 * All dose times are displayed in the patient's local timezone as returned
 * by the medications API (once integrated — currently mock data).
 *
 * Adherence button clicks update local component state only; persistence
 * to the backend is a TODO once the medication adherence API is available.
 */

import { useState } from "react";
import type { IconSvgElement } from "@hugeicons/react";
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
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
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
  { label: string; bg: string; text: string; icon: IconSvgElement }
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

const ADHERENCE_ACTIONS: {
  value: Exclude<DoseStatus, null>;
  label: string;
  icon: IconSvgElement;
  activeClass: string;
}[] = [
  {
    value: "taken",
    label: "Taken",
    icon: Tick02Icon,
    activeClass:
      "border-success text-success hover:bg-success/5 hover:text-success active:bg-success/10 active:text-success",
  },
  {
    value: "skipped",
    label: "Skipped",
    icon: Cancel01Icon,
    activeClass:
      "border-destructive text-destructive hover:bg-destructive/5 hover:text-destructive active:bg-destructive/10 active:text-destructive",
  },
];

function PeriodBadge({ period, dimmed = false }: { period: DosePeriod; dimmed?: boolean }) {
  const style = PERIOD_STYLES[period];
  return (
    <span
      className={cn(
        statusBadgeClass,
        "gap-1 border border-transparent transition-colors duration-200",
        dimmed
          ? "border-border bg-muted text-tertiary-foreground"
          : [style.bg, style.text, "border-border/60"],
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
  return (
    <div className="flex shrink-0 items-center gap-2">
      {ADHERENCE_ACTIONS.map((action) => {
        const active = status === action.value;
        return (
          <Button
            key={action.value}
            type="button"
            variant="secondary"
            aria-pressed={active}
            onClick={() => onChange(active ? null : action.value)}
            className={cn(
              "min-w-29 justify-center gap-1 border border-border bg-card",
              "shadow-[0_1px_2px_rgba(17,24,39,0.04)] dark:shadow-[0_0_0_1px_var(--border),0_1px_2px_rgba(0,0,0,0.25)]",
              active && action.activeClass,
            )}
          >
            <AppIcon icon={action.icon} />
            {action.label}
          </Button>
        );
      })}
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
  const muted = dimmed ? "text-tertiary-foreground" : "text-muted-foreground";

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
        <span className={cn("text-base font-normal leading-6 transition-colors duration-200", muted)}>
          {medication.dosage}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <span className={cn("inline-flex items-center gap-1 transition-colors duration-200", muted)}>
          <AppIcon icon={RepeatIcon} />
          <span className={cn(typo.button, muted)}>{medication.frequencyLabel}</span>
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
  const allTaken = medication.doses.every((dose) => dose.status === "taken");
  const singleDose = !isMultiDose ? medication.doses[0] : null;

  return (
    <article
      className={cn(
        dashboardCardClass,
        "flex flex-col gap-4 p-6 transition-colors duration-200",
        !isMultiDose && "sm:flex-row sm:items-center sm:justify-between",
        allTaken && "bg-muted/30",
      )}
    >
      <MedicationMeta
        medication={medication}
        showPeriodBadge={!isMultiDose}
        dimmed={allTaken}
      />
      {singleDose ? (
        <AdherenceButtons
          status={singleDose.status}
          onChange={(status) => onDoseChange(singleDose.id, status)}
        />
      ) : (
        <div className="flex flex-col gap-2 border-t border-border pt-4.25">
          {medication.doses.map((dose, index) => (
            <DoseRow
              key={dose.id}
              dose={dose}
              onChange={(status) => onDoseChange(dose.id, status)}
              className={cn(index > 0 && "border-t border-dashed border-border pt-2")}
            />
          ))}
        </div>
      )}
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
