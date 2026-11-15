"use client";

import type { IconSvgElement } from "@hugeicons/react";
import {
  Moon02Icon,
  NoodlesIcon,
  SoupIcon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import {
  ViewAllLink,
} from "@/features/dashboard/components/EmptyState";
import {
  dashboardCardClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import type {
  PatientMedicationRow,
  PatientMedicationTag,
  PatientMedicationTagKind,
} from "@/features/patients/data/patient-chart-data";
import { getPatientMedications } from "@/features/patients/data/patient-chart-data";
import { MedicationDoseLabel } from "@/features/medications/components/MedicationDoseLabel";
import {
  medicationRefillSoonBadgeClass,
  medicationScheduleBadgeClass,
} from "@/features/medications/medication-schedule-badge-styles";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

const TAG_VISUAL: Record<
  PatientMedicationTagKind,
  { icon: IconSvgElement; chipClass: string }
> = {
  morning: {
    icon: Sun03Icon,
    chipClass: medicationScheduleBadgeClass.morning,
  },
  evening: {
    icon: Moon02Icon,
    chipClass: medicationScheduleBadgeClass.evening,
  },
  "pre-meal": {
    icon: NoodlesIcon,
    chipClass: medicationScheduleBadgeClass["pre-meal"],
  },
  "post-meal": {
    icon: SoupIcon,
    chipClass: medicationScheduleBadgeClass["post-meal"],
  },
};

function MedicationScheduleTag({ tag }: { tag: PatientMedicationTag }) {
  const visual = TAG_VISUAL[tag.kind];
  return (
    <span
      className={cn(
        statusBadgeClass,
        "gap-1 py-0.5 text-[13px] font-medium leading-5",
        visual.chipClass,
      )}
    >
      <AppIcon icon={visual.icon} size={BADGE_ICON_SIZE} />
      {tag.label}
    </span>
  );
}

function PatientMedicationRowItem({
  med,
  showDivider,
}: {
  med: PatientMedicationRow;
  showDivider: boolean;
}) {
  const refillUrgent =
    med.refillSoon ||
    (med.refillDaysLeft !== undefined && med.refillDaysLeft <= 7);

  return (
    <li
      className={cn(
        "py-3",
        showDivider && "border-b border-divider",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={cn(typo.headingS, "text-sm")}>{med.name}</p>
            {med.refillSoon ? (
              <span
                className={cn(
                  statusBadgeClass,
                  "rounded px-1.5 py-0.5 text-[10px] leading-[15px]",
                  medicationRefillSoonBadgeClass,
                )}
              >
                Refill soon
              </span>
            ) : null}
          </div>
          {med.tags.length > 0 ? (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {med.tags.map((tag) => (
                <MedicationScheduleTag
                  key={`${med.id}-${tag.kind}-${tag.label}`}
                  tag={tag}
                />
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 text-right">
          <MedicationDoseLabel dose={med.dose} variant="prominent" />
          {med.refillDaysLeft !== undefined ? (
            <span
              className={cn(
                typo.caption,
                refillUrgent ? "text-[#d97706]" : "text-muted-foreground",
              )}
            >
              {med.refillDaysLeft} days left
            </span>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export function PatientMedicationRows({
  medications,
  className,
}: {
  medications: PatientMedicationRow[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-col", className)}>
      {medications.map((med, index) => (
        <PatientMedicationRowItem
          key={med.id}
          med={med}
          showDivider={index < medications.length - 1}
        />
      ))}
    </ul>
  );
}

export function PatientOverviewMedicationsCard({
  patientId,
}: {
  patientId: string;
}) {
  const medications = getPatientMedications(patientId);

  return (
    <section
      className={cn(
        dashboardCardClass,
        "flex h-full min-h-0 flex-col overflow-hidden p-0",
      )}
    >
      <div className="flex items-start justify-between gap-2 px-4 pb-6 pt-4">
        <div className="min-w-0 flex flex-col gap-0.5">
          <h2 className={typo.headingL}>Medications</h2>
          <p className={cn(typo.bodyM, "text-muted-foreground")}>
            Active prescription details and refill status
          </p>
        </div>
        <ViewAllLink href={`/patients/${patientId}/medications`} />
      </div>

      {medications.length === 0 ? (
        <p
          className={cn(
            typo.bodyM,
            "px-4 py-8 text-center text-muted-foreground",
          )}
        >
          No active medications on file.
        </p>
      ) : (
        <PatientMedicationRows medications={medications} className="px-4" />
      )}
    </section>
  );
}
