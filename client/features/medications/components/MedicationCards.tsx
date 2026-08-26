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
  { label: string; bg: string; text: string; icon: typeof Sun03Icon }
> = {
  morning: {
    label: "Morning",
    bg: "bg-[#E6F3FF]",
    text: "text-[#0066CC]",
    icon: Sun03Icon,
  },
  evening: {
    label: "Evening",
    bg: "bg-[#FFF2E6]",
    text: "text-[#CC6600]",
    icon: Moon02Icon,
  },
};

function PeriodBadge({ period }: { period: DosePeriod }) {
  const style = PERIOD_STYLES[period];
  return (
    <span
      className={cn(statusBadgeClass, "gap-1", style.bg, style.text)}
    >
      <HugeiconsIcon icon={style.icon} size={16} strokeWidth={1.75} color="currentColor" />
      {style.label}
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
            "border-[#34C759] text-[#34C759] hover:bg-[#34C759]/5 hover:text-[#34C759] active:bg-[#34C759]/10 active:text-[#34C759]",
        )}
      >
        <HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={1.75} color="currentColor" />
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
            "border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30]/5 hover:text-[#FF3B30] active:bg-[#FF3B30]/10 active:text-[#FF3B30]",
        )}
      >
        <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.75} color="currentColor" />
        Skipped
      </Button>
    </div>
  );
}

function MedicationMeta({
  medication,
  showPeriodBadge,
}: {
  medication: MedicationItem;
  showPeriodBadge: boolean;
}) {
  const singleDose = medication.doses.length === 1 ? medication.doses[0] : null;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className={cn(typo.headingXl, "text-[20px] leading-7.5 text-[#1F1A20]")}>
          {medication.name}
        </h2>
        <span className="text-base font-normal leading-6 text-[#4D4450]">{medication.dosage}</span>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <HugeiconsIcon icon={RepeatIcon} size={16} strokeWidth={1.75} color="currentColor" />
          <span className={cn(typo.button, "text-muted-foreground")}>
            {medication.frequencyLabel}
          </span>
        </span>
        {showPeriodBadge && singleDose ? <PeriodBadge period={singleDose.period} /> : null}
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
      <PeriodBadge period={dose.period} />
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

  if (!isMultiDose) {
    const dose = medication.doses[0];
    return (
      <article
        className={cn(
          dashboardCardClass,
          "flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between",
        )}
      >
        <MedicationMeta medication={medication} showPeriodBadge />
        <AdherenceButtons
          status={dose.status}
          onChange={(status) => onDoseChange(dose.id, status)}
        />
      </article>
    );
  }

  return (
    <article className={cn(dashboardCardClass, "flex flex-col gap-4 p-6")}>
      <MedicationMeta medication={medication} showPeriodBadge={false} />
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
