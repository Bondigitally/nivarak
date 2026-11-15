"use client";

import { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  getLocalTimeZone,
  parseDate,
  today,
  type CalendarDate,
  type DateValue,
} from "@internationalized/date";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { useUserRole } from "@/components/layout/user-role-context";
import { Button } from "@/components/ui/button";
import { JollyDatePicker } from "@/components/ui/date-range-picker";
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  dialogCloseButtonClass,
  dialogPrimitiveContentClass,
  useDialogPortalContainer,
} from "@/components/ui/dialog";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import {
  PATIENT_MEDICATION_FREQUENCY_OPTIONS,
  PATIENT_MEDICATION_ROUTE_OPTIONS,
  type PatientMedicationFrequency,
  type PatientMedicationRoute,
  type PatientMedicationRow,
} from "@/features/patients/data/patient-chart-data";
import { getCurrentUserProfile } from "@/lib/auth/current-user-profile";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

/** Dialog fields that can receive focus after open (e.g. from row double-click). */
export type MedicationEditFocusField =
  | "name"
  | "dose"
  | "frequency"
  | "route"
  | "routeOther"
  | "duration";

const FOCUS_FIELD_ELEMENT_ID: Record<MedicationEditFocusField, string> = {
  name: "med-name",
  dose: "med-dose",
  frequency: "med-freq",
  route: "med-route",
  routeOther: "med-route-other",
  duration: "med-duration",
};

type MedicationDraft = {
  name: string;
  dose: string;
  frequency: PatientMedicationFrequency;
  route: PatientMedicationRoute;
  routeOther: string;
  duration: string;
  since: string;
};

function formatDisplayDate(date = new Date()) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toIsoDateInput(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return "";
  return new Date(parsed).toISOString().slice(0, 10);
}

function toDateValue(iso: string): DateValue | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  try {
    return parseDate(iso);
  } catch {
    return null;
  }
}

/** Course end date: today or later, and not before the since date when that is later. */
function medicationDurationMinDate(sinceDisplay: string): CalendarDate {
  const todayDate = today(getLocalTimeZone());
  const sinceMs = Date.parse(sinceDisplay);
  if (Number.isNaN(sinceMs)) return todayDate;
  const sinceIso = new Date(sinceMs).toISOString().slice(0, 10);
  try {
    const sinceDate = parseDate(sinceIso);
    return sinceDate.compare(todayDate) > 0 ? sinceDate : todayDate;
  } catch {
    return todayDate;
  }
}

function focusDialogField(fieldId: string) {
  const el = document.getElementById(fieldId);
  if (!el) return;

  const target =
    el instanceof HTMLInputElement || el instanceof HTMLButtonElement
      ? el
      : el.querySelector("input, button");

  if (!(target instanceof HTMLElement)) return;
  target.focus();
  if (target instanceof HTMLInputElement && target.type !== "date") {
    target.select();
  }
}

function normalizeFrequency(value: string): PatientMedicationFrequency {
  return value === "OD" ? "OD" : "BD";
}

function toDraft(row: PatientMedicationRow, mode: "edit" | "add"): MedicationDraft {
  return {
    name: row.name,
    dose: row.dose,
    frequency: normalizeFrequency(row.frequency),
    route: row.route,
    routeOther: row.routeOther ?? "",
    duration: toIsoDateInput(row.duration),
    since: mode === "add" ? formatDisplayDate() : row.since || formatDisplayDate(),
  };
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: string;
}) {
  return (
    <label htmlFor={htmlFor} className={typo.label}>
      {children}
    </label>
  );
}

/** Nested menus / calendar popovers must stack above dialog shell (z-100). */
const dialogOverlayClass = "z-110";

/**
 * Medication dialog sections use fixed inset (not `px-dash-pad-x`) so padding
 * cannot collapse against the page shell token or lose a twMerge conflict.
 * Corner radii match the shell so header/footer never square-bleed the card.
 */
const medicationDialogHeaderClass =
  "flex flex-row items-start justify-between gap-4 border-b border-border bg-card px-8 py-5 text-left";
const medicationDialogBodyClass =
  "flex min-h-0 flex-col gap-5 overflow-x-hidden overflow-y-auto overscroll-contain bg-card px-8 py-5";
const medicationDialogFooterClass =
  "flex flex-row items-center justify-end gap-3 border-t border-border bg-card px-8 py-5";

function isPortaledOverlayTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      [
        "[data-radix-dropdown-menu-content]",
        "[data-radix-popper-content-wrapper]",
        "[data-radix-menu-content]",
        ".react-aria-Popover",
        "[data-trigger='DatePicker']",
      ].join(", "),
    ),
  );
}

export function EditMedicationDialog({
  open,
  onOpenChange,
  medication,
  mode,
  onSave,
  focusField = "name",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication: PatientMedicationRow | null;
  mode: "edit" | "add";
  onSave: (next: PatientMedicationRow) => void;
  /** Which control to focus after the dialog opens (defaults to name). */
  focusField?: MedicationEditFocusField;
}) {
  const { role } = useUserRole();
  const clinician = getCurrentUserProfile(role);
  const [draft, setDraft] = useState<MedicationDraft | null>(null);
  const draftSourceKey =
    open && medication ? `${medication.id}:${mode}` : null;
  const focusedSourceKeyRef = useRef<string | null>(null);
  const hydratedSourceKeyRef = useRef<string | null>(null);

  // Hydrate draft only when the dialog opens for a new row / mode — not on each keystroke.
  if (draftSourceKey !== hydratedSourceKeyRef.current) {
    hydratedSourceKeyRef.current = draftSourceKey;
    setDraft(
      draftSourceKey && open && medication
        ? toDraft(medication, mode)
        : null,
    );
  }

  useEffect(() => {
    if (!open) {
      focusedSourceKeyRef.current = null;
    }
  }, [open]);

  const draftReady = draft != null;

  // Focus once after draft exists — `draftReady` avoids per-keystroke re-select (not `draft` itself).
  useEffect(() => {
    if (!open || !draftSourceKey || !draftReady) return;
    if (focusedSourceKeyRef.current === draftSourceKey) return;

    focusedSourceKeyRef.current = draftSourceKey;

    const resolved: MedicationEditFocusField =
      focusField === "routeOther" && medication?.route !== "other"
        ? "route"
        : focusField;

    const id = window.setTimeout(() => {
      focusDialogField(FOCUS_FIELD_ELEMENT_ID[resolved]);
    }, 0);
    return () => window.clearTimeout(id);
  }, [open, draftSourceKey, focusField, draftReady]);

  function updateDraft<K extends keyof MedicationDraft>(
    key: K,
    value: MedicationDraft[K],
  ) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function handleSave() {
    if (!medication || !draft) return;
    const name = draft.name.trim();
    if (!name) return;

    const routeOther =
      draft.route === "other" ? draft.routeOther.trim() : undefined;
    const modifiedAt = formatDisplayDate();
    const qualification = clinician.designation?.trim() || "";

    onSave({
      ...medication,
      name,
      dose: draft.dose.trim(),
      frequency: draft.frequency,
      route: draft.route,
      routeOther: routeOther || undefined,
      duration: draft.duration,
      since: draft.since,
      // Status is not edited in the dialog — preserve existing / default.
      status: medication.status,
      prescribedBy:
        mode === "add" ? clinician.displayName : medication.prescribedBy,
      prescriberQualification:
        mode === "add" ? qualification : medication.prescriberQualification,
      prescriberAvatarUrl:
        mode === "add" ? clinician.avatarUrl : medication.prescriberAvatarUrl,
      lastModified: modifiedAt,
      lastModifiedBy: clinician.displayName,
      lastModifiedByQualification: qualification,
      lastModifiedByAvatarUrl: clinician.avatarUrl,
    });
    onOpenChange(false);
  }

  const title = mode === "add" ? "Add medicine" : "Edit medicine";
  const canSave = Boolean(draft?.name.trim());
  const { contentRef, portalContainer } = useDialogPortalContainer();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={contentRef}
          className={cn(
            dialogPrimitiveContentClass("max-w-lg"),
            // Grid keeps header/footer sized to content and gives the body a
            // bounded scrollport, so fields never paint under the footer.
            // Overflow stays hidden so rounded corners clip cleanly.
            "grid max-h-[min(calc(100dvh-1.5rem),880px)] grid-rows-[auto_minmax(0,1fr)_auto]",
          )}
          onOpenAutoFocus={(event) => {
            // Defer to focusField effect so the double-clicked column wins.
            event.preventDefault();
          }}
          onPointerDownOutside={(event) => {
            if (isPortaledOverlayTarget(event.target)) {
              event.preventDefault();
            }
          }}
          onInteractOutside={(event) => {
            if (isPortaledOverlayTarget(event.target)) {
              event.preventDefault();
            }
          }}
          onFocusOutside={(event) => {
            if (isPortaledOverlayTarget(event.target)) {
              event.preventDefault();
            }
          }}
        >
          <div className={medicationDialogHeaderClass}>
            <div className="min-w-0 flex-1 pr-3">
              <DialogTitle className={cn(typo.headingXl, "text-foreground")}>
                {title}
              </DialogTitle>
              <DialogDescription
                className={cn(typo.bodyM, "mt-1 text-muted-foreground")}
              >
                Update dose, frequency, route, and course details.
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

          {draft ? (
            <div className={medicationDialogBodyClass}>
              <div className="flex flex-col gap-auth-field">
                <FieldLabel htmlFor="med-name">Medication</FieldLabel>
                <Input
                  id="med-name"
                  name="medicationName"
                  type="text"
                  value={draft.name}
                  onChange={(e) => updateDraft("name", e.target.value)}
                  placeholder="e.g. Metformin"
                  autoComplete="off"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                <div className="flex flex-col gap-auth-field">
                  <FieldLabel htmlFor="med-dose">Dose</FieldLabel>
                  <Input
                    id="med-dose"
                    value={draft.dose}
                    onChange={(e) => updateDraft("dose", e.target.value)}
                    placeholder="e.g. 500 mg"
                    autoComplete="off"
                  />
                </div>
                <div className="flex flex-col gap-auth-field">
                  <FieldLabel htmlFor="med-freq">Freq</FieldLabel>
                  <FormSelect
                    id="med-freq"
                    value={draft.frequency}
                    aria-label="Frequency"
                    options={PATIENT_MEDICATION_FREQUENCY_OPTIONS.map(
                      (freq) => ({ value: freq, label: freq }),
                    )}
                    onChange={(value) =>
                      updateDraft(
                        "frequency",
                        value as PatientMedicationFrequency,
                      )
                    }
                    placeholder="Select frequency"
                    contentClassName={dialogOverlayClass}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-auth-field">
                <FieldLabel htmlFor="med-route">Route</FieldLabel>
                <FormSelect
                  id="med-route"
                  value={draft.route}
                  aria-label="Route"
                  options={PATIENT_MEDICATION_ROUTE_OPTIONS.map((opt) => ({
                    value: opt.id,
                    label: opt.label,
                  }))}
                  onChange={(value) =>
                    updateDraft("route", value as PatientMedicationRoute)
                  }
                  placeholder="Select route"
                  contentClassName={dialogOverlayClass}
                />
              </div>

              {draft.route === "other" ? (
                <div className="flex flex-col gap-auth-field">
                  <FieldLabel htmlFor="med-route-other">
                    Specify route
                  </FieldLabel>
                  <Input
                    id="med-route-other"
                    value={draft.routeOther}
                    onChange={(e) => updateDraft("routeOther", e.target.value)}
                    placeholder="Enter custom route"
                    autoComplete="off"
                  />
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                <div className="flex flex-col gap-auth-field">
                  <FieldLabel htmlFor="med-since">Since</FieldLabel>
                  <Input
                    id="med-since"
                    value={draft.since}
                    readOnly
                    tabIndex={-1}
                    className="cursor-default bg-muted/40 text-muted-foreground"
                    aria-readonly="true"
                  />
                </div>
                <div className="flex flex-col gap-auth-field">
                  <FieldLabel htmlFor="med-duration">Duration</FieldLabel>
                  <JollyDatePicker
                    id="med-duration"
                    showLabel={false}
                    aria-label="Duration"
                    minValue={medicationDurationMinDate(draft.since)}
                    value={toDateValue(draft.duration)}
                    onChange={(value) =>
                      updateDraft(
                        "duration",
                        value ? value.toString() : "",
                      )
                    }
                    className="w-full"
                    portalContainer={portalContainer}
                    popoverClassName={cn(
                      dialogOverlayClass,
                      "pointer-events-auto",
                    )}
                  />
                </div>
              </div>
            </div>
          ) : null}

          <div className={medicationDialogFooterClass}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="button" disabled={!canSave} onClick={handleSave}>
              {mode === "add" ? "Add medicine" : "Save changes"}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
