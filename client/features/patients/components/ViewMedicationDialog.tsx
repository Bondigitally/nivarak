"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  dialogBodyShellClass,
  dialogCloseButtonClass,
  dialogFooterShellClass,
  dialogHeaderShellClass,
  dialogPrimitiveContentClass,
} from "@/components/ui/dialog";
import {
  getPatientMedicationRouteLabel,
  type PatientMedicationRow,
} from "@/features/patients/data/patient-chart-data";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

function formatDurationDate(value: string) {
  if (!value) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = Date.parse(`${value}T00:00:00`);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }
  return value;
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className={cn(typo.caption, "text-muted-foreground")}>{label}</p>
      <p className={cn(typo.bodyM, "break-words text-foreground")}>
        {value || "—"}
      </p>
    </div>
  );
}

export function ViewMedicationDialog({
  open,
  onOpenChange,
  medication,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication: PatientMedicationRow | null;
}) {
  if (!medication) return null;

  const routeLabel = getPatientMedicationRouteLabel(
    medication.route,
    medication.routeOther,
  );
  const prescribedBy = medication.prescriberQualification
    ? `${medication.prescribedBy} · ${medication.prescriberQualification}`
    : medication.prescribedBy;
  const lastModifiedBy = medication.lastModifiedByQualification
    ? `${medication.lastModifiedBy} · ${medication.lastModifiedByQualification}`
    : medication.lastModifiedBy;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            dialogPrimitiveContentClass("max-w-lg"),
            "max-h-[min(92vh,720px)]",
          )}
        >
          <div className={dialogHeaderShellClass}>
            <div className="min-w-0">
              <DialogTitle className={cn(typo.headingXl, "text-foreground")}>
                Medication details
              </DialogTitle>
              <DialogDescription
                className={cn(typo.bodyM, "mt-1 text-muted-foreground")}
              >
                Prescription summary for this medication.
              </DialogDescription>
            </div>
            <DialogPrimitive.Close
              className={cn(
                "inline-flex items-center justify-center",
                dialogCloseButtonClass,
              )}
              aria-label="Close"
            >
              <AppIcon icon={Cancel01Icon} size={BADGE_ICON_SIZE} />
            </DialogPrimitive.Close>
          </div>

          <div className={cn(dialogBodyShellClass, "gap-5 sm:gap-5")}>
            <DetailItem label="Medication" value={medication.name} />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <DetailItem label="Dose" value={medication.dose} />
              <DetailItem label="Freq" value={medication.frequency} />
            </div>

            <DetailItem label="Route" value={routeLabel} />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <DetailItem label="Since" value={medication.since} />
              <DetailItem
                label="Duration"
                value={formatDurationDate(medication.duration)}
              />
            </div>

            <DetailItem label="Status" value={medication.status} />
            <DetailItem label="Prescribed by" value={prescribedBy} />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <DetailItem label="Last modified" value={medication.lastModified} />
              <DetailItem label="Last modified by" value={lastModifiedBy} />
            </div>
          </div>

          <div
            className={cn(
              dialogFooterShellClass,
              "flex-row justify-end gap-2",
            )}
          >
            <Button type="button" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
