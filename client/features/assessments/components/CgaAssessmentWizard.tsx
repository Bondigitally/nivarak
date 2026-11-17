"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Add01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  Delete02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { ChevronIcon } from "@/components/shared/ChevronIcon";
import { CheckboxIndicator } from "@/components/shared/checkbox-indicator";
import { PatientAvatar } from "@/components/shared/PatientAvatar";
import { PatientRiskBadge } from "@/components/shared/PatientRiskBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FieldErrorMessage } from "@/components/ui/field-error-message";
import {
  fieldInputAutofillClassName,
  fieldInputClassName,
  fieldTextareaClassName,
} from "@/components/ui/input";
import { PhoneField } from "@/features/auth/components/primitives/PhoneField";
import { getDefaultCountry } from "@/features/auth/lib/country-codes";
import { AppPageFrame } from "@/features/dashboard/components/AppPageFrame";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import {
  dashboardCardClass,
  dashboardPageShellClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import { dashboardContentWidthClass } from "@/lib/tokens/page-shell";
import {
  clearCgaDraft,
  createEmptyCgaDraft,
  isCgaSectionFormFilled,
  loadCgaDraft,
  saveCgaDraft,
  type CgaDraftState,
  type CgaSectionValues,
} from "@/features/assessments/data/cga-assessment-draft";
import { CgaInvestigationsSection } from "@/features/assessments/components/CgaInvestigationsSection";
import {
  approximateDobFromAge,
  CGA_COGNITION_LIMITS,
  CGA_GENDER_OPTIONS,
  CGA_LANGUAGE_OPTIONS,
  CGA_LIVING_SITUATION_OPTIONS,
  CGA_ORIENTATION_OPTIONS,
  CGA_PHYSICAL_LIMITS,
  CGA_RELATIONSHIP_OPTIONS,
  CGA_SECTIONS,
  CGA_SIGN_OFF_ATTESTATION_OPTIONS,
  mapPatientGenderToCga,
  type CgaField,
  type CgaMedicationRow,
  type CgaOtcRow,
  type CgaProblemRow,
  type CgaSection,
} from "@/features/assessments/data/cga-sections-data";
import { getDoctorPatientById } from "@/features/patients/data/doctor-patients-data";
import type { DoctorPatientRow } from "@/lib/domain/doctor";
import { getCurrentUserProfile } from "@/lib/auth/current-user-profile";
import { useUserRole } from "@/components/layout/user-role-context";
import { BADGE_ICON_SIZE, ICON_SIZE } from "@/lib/icons";
import { radius } from "@/lib/tokens/radius";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

const fieldLabelClass = typo.label;
const fieldHintClass = cn(typo.caption, "text-muted-foreground");
const fieldStackClass = "flex flex-col gap-2";
const optionCardClass = cn(
  radius.md,
  "group flex cursor-pointer items-start gap-3 border bg-card px-4 py-3.5 transition-colors",
  "hover:border-foreground/15 hover:bg-accent/60",
  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/40",
);
const optionCardSelectedClass =
  "border-primary bg-primary/5 hover:bg-primary/5";

const cgaTextareaClass = cn(fieldTextareaClassName, "min-h-[6.5rem]");
const cgaTableInputClass = cn(
  fieldInputClassName,
  "min-w-0 border-transparent bg-transparent px-2",
  "hover:border-border hover:bg-card",
  "focus-visible:bg-card",
);
const cgaReadonlyInputClass = cn(
  fieldInputClassName,
  "cursor-default bg-muted text-muted-foreground focus-visible:border-border focus-visible:ring-0",
);
const cgaPillChipClass = cn(
  radius.full,
  typo.button,
  "h-11 border px-6 transition-colors",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
);

type CgaSelectOption = { value: string; label: string };

function toSelectOptions(
  options: readonly CgaSelectOption[] | readonly string[],
): CgaSelectOption[] {
  return options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt,
  );
}

/**
 * Auth PhoneField–style dropdown: field trigger + clean card menu.
 * Replaces native `<select>` chrome in the CGA wizard.
 */
function CgaSelect({
  id,
  value,
  options,
  onChange,
  placeholder = "Select…",
  disabled = false,
  muted = false,
  compact = false,
  "aria-label": ariaLabel,
}: {
  id?: string;
  value: string;
  options: readonly CgaSelectOption[] | readonly string[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  muted?: boolean;
  /** Inline chip-row trigger (language “Add…”). */
  compact?: boolean;
  "aria-label"?: string;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuWidth, setMenuWidth] = useState<number>();
  const items = useMemo(() => toSelectOptions(options), [options]);
  const selected = items.find((item) => item.value === value);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;

    const syncWidth = () => setMenuWidth(el.getBoundingClientRect().width);
    syncWidth();

    const observer = new ResizeObserver(syncWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, [compact]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          aria-label={ariaLabel}
          className={cn(
            compact
              ? cn(
                  typo.bodyS,
                  "inline-flex h-8 min-w-20 flex-1 items-center justify-between gap-2 rounded-sm px-1.5",
                  "text-muted-foreground outline-none transition-colors",
                  "hover:bg-background hover:text-foreground",
                  "focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring/40",
                )
              : cn(
                  fieldInputClassName,
                  "flex items-center justify-between gap-3 text-left",
                  muted && "bg-muted text-muted-foreground",
                ),
            "disabled:pointer-events-none",
          )}
        >
          <span
            className={cn(
              "min-w-0 flex-1 truncate",
              !selected && "text-placeholder",
            )}
          >
            {selected?.label ?? placeholder}
          </span>
          <ChevronIcon
            direction="down"
            size={compact ? BADGE_ICON_SIZE : ICON_SIZE}
            className="text-muted-foreground"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="start"
        sideOffset={8}
        avoidCollisions={false}
        style={menuWidth ? { width: Math.max(menuWidth, compact ? 160 : 0) } : undefined}
        className={cn(
          "max-w-[calc(100vw-2rem)] overflow-hidden rounded-md border-border bg-card p-0 shadow-md",
          !menuWidth && "w-[min(20rem,calc(100vw-2.5rem))]",
          typo.input,
        )}
      >
        <div className="max-h-64 overflow-y-auto overscroll-contain p-1.5">
          {items.map((item) => {
            const isSelected = item.value === value;
            return (
              <DropdownMenuItem
                key={item.value}
                onSelect={() => onChange(item.value)}
                className={cn(
                  "cursor-pointer gap-3 rounded-sm px-3 py-2.5",
                  typo.input,
                  isSelected && "bg-background text-foreground",
                )}
              >
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className={fieldLabelClass}>
      {children}
    </label>
  );
}

function RadioMark({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        radius.full,
        "relative mt-0.5 flex size-5 shrink-0 items-center justify-center border transition-colors",
        checked ? "border-primary bg-primary/10" : "border-border bg-card",
      )}
      aria-hidden
    >
      <span
        className={cn(
          radius.full,
          "size-2.5 bg-primary transition-opacity",
          checked ? "opacity-100" : "opacity-0",
        )}
      />
    </span>
  );
}

function ChipGroup({
  options,
  value,
  multi,
  onChange,
  ariaLabel,
  layout = "wrap",
}: {
  options: readonly { id: string; label: string }[];
  value: string | string[];
  multi?: boolean;
  onChange: (next: string | string[]) => void;
  ariaLabel?: string;
  layout?: "wrap" | "stack";
}) {
  const selected = Array.isArray(value) ? value : value ? [value] : [];

  return (
    <div
      role={multi ? "group" : "radiogroup"}
      aria-label={ariaLabel}
      className={cn(
        "flex gap-2",
        layout === "stack" ? "flex-col" : "flex-wrap",
      )}
    >
      {options.map((opt) => {
        const active = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={active}
            onClick={() => {
              if (multi) {
                const next = active
                  ? selected.filter((id) => id !== opt.id)
                  : [...selected, opt.id];
                onChange(next);
              } else {
                onChange(opt.id);
              }
            }}
            className={cn(
              radius.md,
              typo.button,
              "h-10 border px-3.5 transition-colors",
              layout === "stack" && "w-full justify-start text-left",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:bg-accent hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: CgaField;
  value: string | string[] | undefined;
  onChange: (next: string | string[]) => void;
}) {
  const inputId = `cga-field-${field.id}`;

  if (field.kind === "textarea") {
    return (
      <div className={cn(fieldStackClass, "sm:col-span-2")}>
        <FieldLabel htmlFor={inputId}>{field.label}</FieldLabel>
        <textarea
          id={inputId}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className={cgaTextareaClass}
        />
      </div>
    );
  }

  if (field.kind === "text" || field.kind === "date") {
    return (
      <div className={fieldStackClass}>
        <FieldLabel htmlFor={inputId}>{field.label}</FieldLabel>
        <input
          id={inputId}
          type={field.kind === "date" ? "date" : "text"}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={fieldInputClassName}
        />
        {field.kind === "text" && field.hint ? (
          <p className={fieldHintClass}>{field.hint}</p>
        ) : null}
      </div>
    );
  }

  if (field.kind === "select") {
    return (
      <div className={fieldStackClass}>
        <FieldLabel htmlFor={inputId}>{field.label}</FieldLabel>
        <CgaSelect
          id={inputId}
          value={typeof value === "string" ? value : ""}
          options={field.options.map((opt) => ({
            value: opt.id,
            label: opt.label,
          }))}
          onChange={onChange}
          placeholder={field.placeholder ?? "Select…"}
        />
      </div>
    );
  }

  if (field.kind === "radio") {
    return (
      <div
        role="radiogroup"
        aria-label={field.label}
        className={cn(fieldStackClass, "sm:col-span-2")}
      >
        <p className={fieldLabelClass}>{field.label}</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {field.options.map((opt) => {
            const checked = value === opt.id;
            return (
              <label
                key={opt.id}
                className={cn(
                  optionCardClass,
                  "h-full",
                  checked && optionCardSelectedClass,
                )}
              >
                <input
                  type="radio"
                  name={field.id}
                  checked={checked}
                  onChange={() => onChange(opt.id)}
                  className="sr-only"
                />
                <RadioMark checked={checked} />
                <span
                  className={cn(
                    typo.bodyM,
                    "font-medium text-foreground",
                  )}
                >
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  if (field.kind === "chips") {
    return (
      <div className={cn(fieldStackClass, "sm:col-span-2")}>
        <p className={fieldLabelClass}>{field.label}</p>
        <ChipGroup
          options={field.options}
          value={value ?? (field.multi ? [] : "")}
          multi={field.multi}
          onChange={onChange}
          ariaLabel={field.label}
        />
      </div>
    );
  }

  if (field.kind === "checkbox-list") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div
        role="group"
        aria-label={field.label}
        className={cn(fieldStackClass, "sm:col-span-2")}
      >
        <p className={fieldLabelClass}>{field.label}</p>
        <div className="flex flex-col gap-2">
          {field.options.map((opt) => {
            const checked = selected.includes(opt.id);
            return (
              <label
                key={opt.id}
                className={cn(
                  optionCardClass,
                  "items-center",
                  checked && optionCardSelectedClass,
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    onChange(
                      checked
                        ? selected.filter((id) => id !== opt.id)
                        : [...selected, opt.id],
                    );
                  }}
                  className="sr-only"
                />
                <CheckboxIndicator checked={checked} />
                <span className={cn(typo.bodyM, "font-medium text-foreground")}>
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}

function strValue(value: string | string[] | undefined, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

/** Normalize stored phone text for PhoneField (E.164, no spaces). */
function phoneFieldValue(value: string | string[] | undefined) {
  const raw = strValue(value).replace(/\s+/g, "");
  return raw || getDefaultCountry().dialCode;
}

function LanguageTagField({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const available = CGA_LANGUAGE_OPTIONS.filter((opt) => !value.includes(opt.id));

  function addLanguage(id: string) {
    if (!id || value.includes(id)) return;
    onChange([...value, id]);
  }

  function removeLanguage(id: string) {
    onChange(value.filter((v) => v !== id));
  }

  return (
    <div
      className={cn(
        fieldInputClassName,
        "flex h-auto min-h-11 flex-wrap items-center gap-2 py-1.5",
      )}
    >
      {value.map((id) => {
        const label =
          CGA_LANGUAGE_OPTIONS.find((opt) => opt.id === id)?.label ?? id;
        return (
          <span
            key={id}
            className={cn(
              radius.md,
              "inline-flex items-center gap-1 bg-muted px-2 py-1 text-xs font-medium text-foreground",
            )}
          >
            {label}
            <button
              type="button"
              aria-label={`Remove ${label}`}
              onClick={() => removeLanguage(id)}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <AppIcon icon={Cancel01Icon} size={10} />
            </button>
          </span>
        );
      })}
      {available.length > 0 ? (
        <CgaSelect
          compact
          aria-label="Add language"
          value=""
          placeholder="Add…"
          options={available.map((opt) => ({
            value: opt.id,
            label: opt.label,
          }))}
          onChange={(next) => {
            if (next) addLanguage(next);
          }}
        />
      ) : null}
    </div>
  );
}

function VisitDetailsSection({
  patient,
  values,
  onChange,
}: {
  patient: DoctorPatientRow;
  values: CgaSectionValues;
  onChange: (next: CgaSectionValues) => void;
}) {
  const { role } = useUserRole();
  const clinician = getCurrentUserProfile(role);

  function setField(id: string, next: string | string[]) {
    onChange({ ...values, [id]: next });
  }

  const gender =
    strValue(values.gender) || mapPatientGenderToCga(patient.gender);
  const languages = Array.isArray(values.language) ? values.language : [];
  const livingSituation = strValue(values.livingSituation);
  const patientName = strValue(values.patientName, patient.name);
  const patientAge = strValue(values.patientAge, String(patient.age));
  const dateOfBirth = strValue(
    values.dateOfBirth,
    approximateDobFromAge(patient.age),
  );
  const assessingClinician = clinician.displayName;
  const designation =
    clinician.designation ?? strValue(values.designation, "Geriatrician");

  // Keep draft in sync with the signed-in clinician profile (no manual select).
  useEffect(() => {
    const nextGender = gender;
    if (
      values.assessingClinician === assessingClinician &&
      values.designation === designation &&
      values.gender === nextGender
    ) {
      return;
    }
    onChange({
      ...values,
      assessingClinician,
      designation,
      gender: nextGender,
    });
    // Intentionally omit `values` / `onChange` to avoid update loops — only
    // re-sync when the signed-in clinician profile or derived gender changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessingClinician, designation, gender]);

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          radius.md,
          "flex items-start gap-3 border border-info/30 bg-info-muted px-4 py-3",
        )}
      >
        <AppIcon
          icon={InformationCircleIcon}
          size={ICON_SIZE}
          className="mt-0.5 shrink-0 text-info"
        />
        <p className={cn(typo.bodyS, "text-info")}>
          Demographics and contact information sync to the patient chart
          automatically upon save.
        </p>
      </div>

      <div
        className={cn(
          dashboardCardClass,
          "grid grid-cols-1 gap-x-6 gap-y-6 p-5 sm:grid-cols-2 sm:p-8",
        )}
      >
        <div className="grid grid-cols-1 gap-4 sm:col-span-1 sm:grid-cols-2">
          <div className={fieldStackClass}>
            <FieldLabel htmlFor="cga-visit-date">Visit Date</FieldLabel>
            <input
              id="cga-visit-date"
              type="date"
              value={strValue(values.visitDate)}
              onChange={(e) => setField("visitDate", e.target.value)}
              className={fieldInputClassName}
            />
          </div>
          <div className={fieldStackClass}>
            <FieldLabel htmlFor="cga-visit-time">Visit Time</FieldLabel>
            <input
              id="cga-visit-time"
              type="time"
              value={strValue(values.visitTime)}
              onChange={(e) => setField("visitTime", e.target.value)}
              className={fieldInputClassName}
            />
          </div>
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-visit-number">Visit Number</FieldLabel>
          <input
            id="cga-visit-number"
            readOnly
            value={strValue(values.visitNumber, "VIS-8472-A")}
            className={cgaReadonlyInputClass}
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-clinician">Assessing Clinician</FieldLabel>
          <input
            id="cga-clinician"
            readOnly
            value={assessingClinician}
            className={cgaReadonlyInputClass}
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-designation">Designation</FieldLabel>
          <input
            id="cga-designation"
            readOnly
            value={designation}
            className={cgaReadonlyInputClass}
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-patient-name">Patient Full Name</FieldLabel>
          <input
            id="cga-patient-name"
            readOnly
            value={patientName}
            className={cgaReadonlyInputClass}
          />
        </div>

        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
          <div className={fieldStackClass}>
            <FieldLabel htmlFor="cga-dob">Date of Birth</FieldLabel>
            <input
              id="cga-dob"
              readOnly
              value={dateOfBirth}
              className={cgaReadonlyInputClass}
            />
          </div>
          <div className={fieldStackClass}>
            <FieldLabel htmlFor="cga-age">Age</FieldLabel>
            <input
              id="cga-age"
              readOnly
              value={patientAge}
              className={cn(cgaReadonlyInputClass, "text-center font-semibold")}
            />
          </div>
        </div>

        <div className={cn(fieldStackClass, "sm:col-span-2")}>
          <p className={fieldLabelClass}>Gender</p>
          <div role="radiogroup" aria-label="Gender" className="flex flex-wrap gap-3">
            {CGA_GENDER_OPTIONS.map((opt) => {
              const active = gender === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setField("gender", opt.id)}
                  className={cn(
                    cgaPillChipClass,
                    active
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card text-foreground hover:border-foreground/20 hover:bg-accent",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className={cn(fieldStackClass, "sm:col-span-2")}>
          <FieldLabel htmlFor="cga-address">Address</FieldLabel>
          <textarea
            id="cga-address"
            value={strValue(values.address)}
            onChange={(e) => setField("address", e.target.value)}
            rows={3}
            className={cgaTextareaClass}
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-mobile">Mobile Numbers</FieldLabel>
          <PhoneField
            id="cga-mobile"
            showLabel={false}
            showError={false}
            value={phoneFieldValue(values.mobileNumbers)}
            onChange={(next) => setField("mobileNumbers", next)}
            placeholder="9823456789"
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Language</p>
          <LanguageTagField
            value={languages}
            onChange={(next) => setField("language", next)}
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-family-contact">
            Family Contact Name &amp; Phone
          </FieldLabel>
          <input
            id="cga-family-contact"
            type="text"
            value={strValue(values.familyContact)}
            onChange={(e) => setField("familyContact", e.target.value)}
            className={fieldInputClassName}
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-relationship">
            Relationship to Patient
          </FieldLabel>
          <CgaSelect
            id="cga-relationship"
            value={strValue(values.relationship)}
            options={CGA_RELATIONSHIP_OPTIONS}
            onChange={(next) => setField("relationship", next)}
            placeholder="Select relationship"
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-living-situation">
            Living Situation
          </FieldLabel>
          <CgaSelect
            id="cga-living-situation"
            value={livingSituation}
            options={CGA_LIVING_SITUATION_OPTIONS.map((opt) => ({
              value: opt.id,
              label: opt.label,
            }))}
            onChange={(next) => setField("livingSituation", next)}
            placeholder="Select living situation"
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-referral">Referral Source</FieldLabel>
          <input
            id="cga-referral"
            type="text"
            value={strValue(values.referralSource)}
            onChange={(e) => setField("referralSource", e.target.value)}
            className={fieldInputClassName}
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-gp">GP Name</FieldLabel>
          <input
            id="cga-gp"
            type="text"
            value={strValue(values.gpName)}
            onChange={(e) => setField("gpName", e.target.value)}
            className={fieldInputClassName}
          />
        </div>
      </div>
    </div>
  );
}

function MedicationsSection({
  values,
  medications,
  otcMedications,
  onValuesChange,
  onMedicationsChange,
  onOtcMedicationsChange,
}: {
  values: CgaSectionValues;
  medications: CgaMedicationRow[];
  otcMedications: CgaOtcRow[];
  onValuesChange: (next: CgaSectionValues) => void;
  onMedicationsChange: (next: CgaMedicationRow[]) => void;
  onOtcMedicationsChange: (next: CgaOtcRow[]) => void;
}) {
  function setField(id: string, next: string | string[]) {
    onValuesChange({ ...values, [id]: next });
  }

  function updateMed(id: string, patch: Partial<CgaMedicationRow>) {
    onMedicationsChange(
      medications.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  function removeMed(id: string) {
    onMedicationsChange(medications.filter((row) => row.id !== id));
  }

  function updateOtc(id: string, patch: Partial<CgaOtcRow>) {
    onOtcMedicationsChange(
      otcMedications.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  function removeOtc(id: string) {
    onOtcMedicationsChange(otcMedications.filter((row) => row.id !== id));
  }

  const stoppedMeds = values.stoppedMeds === "true";

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          radius.md,
          "border border-warning/30 bg-warning-muted px-4 py-3.5",
        )}
      >
        <p className={cn(typo.headingS, "text-warning")}>STOP/START Criteria</p>
        <p className={cn(typo.bodyS, "mt-1 text-muted-foreground")}>
          Review for potentially inappropriate medications and omitted clinical
          indications in older patients.
        </p>
      </div>

      <section className={cn(dashboardCardClass, "overflow-hidden p-0")}>
        <div className="border-b border-divider px-5 py-4">
          <h3 className={typo.headingL}>Current Prescription Medications</h3>
          <p className={cn(typo.caption, "mt-1")}>
            Edit cells inline. Flagged rows need deprescribing review.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-176 text-left">
            <thead>
              <tr className="border-b border-divider bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Drug</th>
                <th className="px-2 py-3 font-medium">Dose</th>
                <th className="px-2 py-3 font-medium">Freq</th>
                <th className="px-2 py-3 font-medium">Indication</th>
                <th className="px-2 py-3 font-medium">Flags</th>
                <th className="w-12 px-2 py-3">
                  <span className="sr-only">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {medications.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-divider last:border-0",
                    row.flag && "bg-destructive/3",
                  )}
                >
                  <td className="px-3 py-2">
                    <input
                      value={row.drug}
                      onChange={(e) =>
                        updateMed(row.id, { drug: e.target.value })
                      }
                      placeholder="Drug name"
                      className={cn(
                        cgaTableInputClass,
                        "font-medium",
                        row.flag && "text-destructive",
                      )}
                    />
                  </td>
                  <td className="px-1 py-2">
                    <input
                      value={row.dose}
                      onChange={(e) =>
                        updateMed(row.id, { dose: e.target.value })
                      }
                      placeholder="Dose"
                      className={cn(cgaTableInputClass, "w-20")}
                    />
                  </td>
                  <td className="px-1 py-2">
                    <input
                      value={row.frequency}
                      onChange={(e) =>
                        updateMed(row.id, { frequency: e.target.value })
                      }
                      placeholder="OD"
                      className={cn(cgaTableInputClass, "w-16")}
                    />
                  </td>
                  <td className="px-1 py-2">
                    <input
                      value={row.indication}
                      onChange={(e) =>
                        updateMed(row.id, { indication: e.target.value })
                      }
                      placeholder="Indication"
                      className={cgaTableInputClass}
                    />
                  </td>
                  <td className="px-2 py-2">
                    {row.flag ? (
                      <span
                        className={cn(
                          statusBadgeClass,
                          "border border-destructive-muted bg-destructive-muted text-destructive",
                        )}
                      >
                        {row.flag}
                      </span>
                    ) : (
                      <input
                        value={row.flag ?? ""}
                        onChange={(e) =>
                          updateMed(row.id, {
                            flag: e.target.value || undefined,
                          })
                        }
                        placeholder="—"
                        className={cn(cgaTableInputClass, "w-28 text-muted-foreground")}
                      />
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      aria-label={`Remove ${row.drug || "medication"}`}
                      onClick={() => removeMed(row.id)}
                      className={cn(
                        radius.md,
                        "inline-flex size-8 items-center justify-center text-muted-foreground transition-colors",
                        "hover:bg-destructive-muted hover:text-destructive",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                      )}
                    >
                      <AppIcon icon={Delete02Icon} size={BADGE_ICON_SIZE} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-divider px-5 py-3">
          <button
            type="button"
            className={cn(
              typo.button,
              "inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-primary transition-colors",
              "hover:bg-primary/10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            )}
            onClick={() =>
              onMedicationsChange([
                ...medications,
                {
                  id: `med-${Date.now()}`,
                  drug: "",
                  dose: "",
                  frequency: "",
                  indication: "",
                },
              ])
            }
          >
            <AppIcon icon={Add01Icon} size={BADGE_ICON_SIZE} />
            Add Medication
          </button>
        </div>
      </section>

      <section className={cn(dashboardCardClass, "overflow-hidden p-0")}>
        <div className="border-b border-divider px-5 py-4">
          <h3 className={typo.headingL}>Supplements &amp; OTC</h3>
          <p className={cn(typo.caption, "mt-1")}>
            List active over-the-counter medications
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-140 text-left">
            <thead>
              <tr className="border-b border-divider bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-2 py-3 font-medium">Dose</th>
                <th className="px-2 py-3 font-medium">Freq</th>
                <th className="px-2 py-3 font-medium">Notes</th>
                <th className="w-12 px-2 py-3">
                  <span className="sr-only">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {otcMedications.map((row) => (
                <tr key={row.id} className="border-b border-divider last:border-0">
                  <td className="px-3 py-2">
                    <input
                      value={row.drug}
                      onChange={(e) =>
                        updateOtc(row.id, { drug: e.target.value })
                      }
                      placeholder="Product name"
                      className={cn(cgaTableInputClass, "font-medium")}
                    />
                  </td>
                  <td className="px-1 py-2">
                    <input
                      value={row.dose}
                      onChange={(e) =>
                        updateOtc(row.id, { dose: e.target.value })
                      }
                      placeholder="Dose"
                      className={cn(cgaTableInputClass, "w-20")}
                    />
                  </td>
                  <td className="px-1 py-2">
                    <input
                      value={row.frequency}
                      onChange={(e) =>
                        updateOtc(row.id, { frequency: e.target.value })
                      }
                      placeholder="OD"
                      className={cn(cgaTableInputClass, "w-16")}
                    />
                  </td>
                  <td className="px-1 py-2">
                    <input
                      value={row.notes}
                      onChange={(e) =>
                        updateOtc(row.id, { notes: e.target.value })
                      }
                      placeholder="Notes"
                      className={cgaTableInputClass}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      aria-label={`Remove ${row.drug || "item"}`}
                      onClick={() => removeOtc(row.id)}
                      className={cn(
                        radius.md,
                        "inline-flex size-8 items-center justify-center text-muted-foreground transition-colors",
                        "hover:bg-destructive-muted hover:text-destructive",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                      )}
                    >
                      <AppIcon icon={Delete02Icon} size={BADGE_ICON_SIZE} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-divider px-5 py-3">
          <button
            type="button"
            className={cn(
              typo.button,
              "inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-primary transition-colors",
              "hover:bg-primary/10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            )}
            onClick={() =>
              onOtcMedicationsChange([
                ...otcMedications,
                {
                  id: `otc-${Date.now()}`,
                  drug: "",
                  dose: "",
                  frequency: "",
                  notes: "",
                },
              ])
            }
          >
            <AppIcon icon={Add01Icon} size={BADGE_ICON_SIZE} />
            Add OTC / Supplement
          </button>
        </div>
      </section>

      <section className={cn(dashboardCardClass, "p-5")}>
        <button
          type="button"
          role="checkbox"
          aria-checked={stoppedMeds}
          onClick={() =>
            setField("stoppedMeds", stoppedMeds ? "false" : "true")
          }
          className={cn(
            "flex w-full items-center gap-3 text-left transition-colors",
            "rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          )}
        >
          <CheckboxIndicator checked={stoppedMeds} />
          <span className={cn(typo.bodyM, "font-medium text-foreground")}>
            Patient has independently stopped one or more prescribed medications
          </span>
        </button>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={cn(dashboardCardClass, "flex flex-col gap-3 p-5")}>
          <p className={fieldLabelClass}>Adherence Assessment</p>
          <ChipGroup
            layout="stack"
            ariaLabel="Adherence Assessment"
            options={[
              { id: "full", label: "Full adherence" },
              { id: "partial", label: "Partial adherence" },
              { id: "poor", label: "Poor / Non-adherent" },
            ]}
            value={
              typeof values.adherence === "string" ? values.adherence : ""
            }
            onChange={(v) => setField("adherence", v as string)}
          />
        </section>

        <div className="flex flex-col gap-4">
          <section className={cn(dashboardCardClass, "flex flex-col gap-3 p-5")}>
            <p className={fieldLabelClass}>Administration</p>
            <ChipGroup
              ariaLabel="Administration"
              options={[
                { id: "self", label: "Self-administered" },
                { id: "caregiver", label: "Caregiver-assisted" },
                { id: "professional", label: "Professional" },
              ]}
              value={
                typeof values.administration === "string"
                  ? values.administration
                  : ""
              }
              onChange={(v) => setField("administration", v)}
            />
          </section>
          <section className={cn(dashboardCardClass, "flex flex-col gap-3 p-5")}>
            <p className={fieldLabelClass}>Storage Details</p>
            <ChipGroup
              ariaLabel="Storage Details"
              options={[
                { id: "original", label: "Original packaging" },
                { id: "dosette", label: "Dosette box" },
                { id: "blister", label: "Blister pack" },
                { id: "other", label: "Other" },
              ]}
              value={typeof values.storage === "string" ? values.storage : ""}
              onChange={(v) => setField("storage", v)}
            />
          </section>
        </div>
      </div>

      <section className={cn(dashboardCardClass, "flex flex-col gap-2 p-5")}>
        <FieldLabel htmlFor="cga-review-summary">
          Review Summary &amp; Action Plan
        </FieldLabel>
        <textarea
          id="cga-review-summary"
          value={
            typeof values.reviewSummary === "string" ? values.reviewSummary : ""
          }
          onChange={(e) => setField("reviewSummary", e.target.value)}
          placeholder="Enter clinical notes here..."
          rows={5}
          className={cgaTextareaClass}
        />
      </section>
    </div>
  );
}

const EXAM_NOTES_MAX = 500;
const METRIC_LIMIT_ERROR =
  "Value exceeds the allowed limit for this measurement.";

/** Weight field shell — input + unit selector as one control. */
const physicalWeightShellClassName = cn(
  "flex h-11 w-full items-center rounded-md border border-border bg-card",
  "transition-[border-color,box-shadow] duration-150 ease-in-out",
  "focus-within:border-border-focus focus-within:outline-none",
  "focus-within:shadow-[0_0_0_2px_color-mix(in_oklab,var(--ring)_40%,transparent)]",
);

type MetricParseResult = { value: string; exceeded: boolean };

/** Integer metric: digits only, never above `max` (empty allowed while typing). */
function clampIntMetric(raw: string, max: number): MetricParseResult {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return { value: "", exceeded: false };
  const n = Number(digits);
  if (!Number.isFinite(n)) return { value: "", exceeded: false };
  if (n > max) return { value: String(max), exceeded: true };
  return { value: String(n), exceeded: false };
}

/** Decimal metric: at most one fractional part, never above `max`. */
function clampDecimalMetric(
  raw: string,
  max: number,
  maxDecimals = 1,
): MetricParseResult {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return { value: "", exceeded: false };
  const parts = cleaned.split(".");
  const normalized =
    parts.length <= 1
      ? cleaned
      : `${parts[0]}.${parts.slice(1).join("").slice(0, maxDecimals)}`;
  // Allow trailing "." while typing (e.g. "72.")
  if (normalized.endsWith(".")) {
    const whole = Number(normalized.slice(0, -1));
    if (!Number.isFinite(whole)) return { value: "", exceeded: false };
    if (whole > max) return { value: String(max), exceeded: true };
    return { value: normalized, exceeded: false };
  }
  const n = Number(normalized);
  if (!Number.isFinite(n)) return { value: "", exceeded: false };
  if (n > max) return { value: String(max), exceeded: true };
  return { value: normalized, exceeded: false };
}

function weightMaxForUnit(unit: "kg" | "lbs") {
  return unit === "lbs"
    ? CGA_PHYSICAL_LIMITS.weightLbs.max
    : CGA_PHYSICAL_LIMITS.weightKg.max;
}

function PhysicalAssessmentSection({
  values,
  onChange,
}: {
  values: CgaSectionValues;
  onChange: (next: CgaSectionValues) => void;
}) {
  const [limitError, setLimitError] = useState(false);

  function setField(id: string, next: string) {
    onChange({ ...values, [id]: next });
  }

  function applyMetric(result: MetricParseResult, apply: (value: string) => void) {
    if (result.exceeded) setLimitError(true);
    else setLimitError(false);
    apply(result.value);
  }

  useEffect(() => {
    if (!strValue(values.weightUnit)) {
      onChange({ ...values, weightUnit: "kg" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only default
  }, []);

  // Migrate legacy single "bp" value ("128/82") into systolic/diastolic once.
  const legacyBp = strValue(values.bp);
  const systolic =
    strValue(values.bpSystolic) ||
    (legacyBp.includes("/") ? legacyBp.split("/")[0]?.trim() ?? "" : "");
  const diastolic =
    strValue(values.bpDiastolic) ||
    (legacyBp.includes("/") ? legacyBp.split("/")[1]?.trim() ?? "" : "");
  const hr = strValue(values.hr);
  const weight = strValue(values.weight);
  const weightUnit =
    strValue(values.weightUnit) === "lbs" ? "lbs" : "kg";
  const examNotes = strValue(values.examNotes).slice(0, EXAM_NOTES_MAX);

  function setBp(nextSystolic: string, nextDiastolic: string) {
    onChange({
      ...values,
      bpSystolic: nextSystolic,
      bpDiastolic: nextDiastolic,
      bp:
        nextSystolic && nextDiastolic
          ? `${nextSystolic}/${nextDiastolic}`
          : "",
    });
  }

  function setWeightUnit(nextUnit: "kg" | "lbs") {
    const result = clampDecimalMetric(weight, weightMaxForUnit(nextUnit));
    applyMetric(result, (nextWeight) => {
      onChange({
        ...values,
        weightUnit: nextUnit,
        weight: nextWeight,
      });
    });
  }

  return (
    <section
      className={cn(dashboardCardClass, "flex flex-col gap-5 p-5 sm:p-6")}
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Blood pressure</p>
          <div className="flex items-center gap-2.5">
            <input
              id="cga-bp-systolic"
              type="number"
              inputMode="numeric"
              min={CGA_PHYSICAL_LIMITS.bpSystolic.min}
              max={CGA_PHYSICAL_LIMITS.bpSystolic.max}
              autoComplete="off"
              aria-label={`Systolic blood pressure, max ${CGA_PHYSICAL_LIMITS.bpSystolic.max} mmHg`}
              placeholder="Systolic (mmHg)"
              value={systolic}
              onChange={(e) => {
                const result = clampIntMetric(
                  e.target.value,
                  CGA_PHYSICAL_LIMITS.bpSystolic.max,
                );
                applyMetric(result, (next) => setBp(next, diastolic));
              }}
              className={cn(
                fieldInputClassName,
                "min-w-0 flex-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
              )}
            />
            <span
              className={cn(
                typo.input,
                "shrink-0 text-muted-foreground",
              )}
              aria-hidden
            >
              /
            </span>
            <input
              id="cga-bp-diastolic"
              type="number"
              inputMode="numeric"
              min={CGA_PHYSICAL_LIMITS.bpDiastolic.min}
              max={CGA_PHYSICAL_LIMITS.bpDiastolic.max}
              autoComplete="off"
              aria-label={`Diastolic blood pressure, max ${CGA_PHYSICAL_LIMITS.bpDiastolic.max} mmHg`}
              placeholder="Diastolic (mmHg)"
              value={diastolic}
              onChange={(e) => {
                const result = clampIntMetric(
                  e.target.value,
                  CGA_PHYSICAL_LIMITS.bpDiastolic.max,
                );
                applyMetric(result, (next) => setBp(systolic, next));
              }}
              className={cn(
                fieldInputClassName,
                "min-w-0 flex-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
              )}
            />
          </div>
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-hr">Heart rate</FieldLabel>
          <input
            id="cga-hr"
            type="number"
            inputMode="numeric"
            min={CGA_PHYSICAL_LIMITS.hr.min}
            max={CGA_PHYSICAL_LIMITS.hr.max}
            autoComplete="off"
            placeholder="e.g., 78 bpm"
            value={hr}
            onChange={(e) => {
              const result = clampIntMetric(
                e.target.value,
                CGA_PHYSICAL_LIMITS.hr.max,
              );
              applyMetric(result, (next) => setField("hr", next));
            }}
            className={fieldInputClassName}
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-weight">Weight</FieldLabel>
          <div className={physicalWeightShellClassName}>
            <input
              id="cga-weight"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="e.g., 72.5"
              value={weight}
              onChange={(e) => {
                const result = clampDecimalMetric(
                  e.target.value,
                  weightMaxForUnit(weightUnit),
                );
                applyMetric(result, (next) => setField("weight", next));
              }}
              className={cn(
                "h-full min-w-0 flex-1 border-0 bg-transparent px-4 shadow-none",
                typo.input,
                fieldInputAutofillClassName,
                "outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0",
                "placeholder:text-placeholder",
              )}
            />
            <span aria-hidden className="h-6 w-px shrink-0 bg-border" />
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Weight unit"
                  className={cn(
                    "inline-flex h-full shrink-0 items-center gap-1 rounded-r-md px-3",
                    typo.input,
                    "text-foreground outline-none transition-colors hover:bg-accent/60",
                    "focus:outline-none focus-visible:bg-accent/60 focus-visible:ring-0",
                  )}
                >
                  <span className="tabular-nums">{weightUnit}</span>
                  <ChevronIcon
                    direction="down"
                    size={BADGE_ICON_SIZE}
                    className="text-muted-foreground"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="min-w-24 rounded-md border-border bg-card p-1.5 shadow-md"
              >
                {(["kg", "lbs"] as const).map((unit) => (
                  <DropdownMenuItem
                    key={unit}
                    onSelect={() => setWeightUnit(unit)}
                    className={cn(
                      "cursor-pointer rounded-sm px-3 py-2",
                      typo.input,
                      weightUnit === unit && "bg-background text-foreground",
                    )}
                  >
                    {unit}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {limitError ? (
        <FieldErrorMessage error={METRIC_LIMIT_ERROR} />
      ) : null}

      <div className={fieldStackClass}>
        <FieldLabel htmlFor="cga-exam-notes">Examination notes</FieldLabel>
        <textarea
          id="cga-exam-notes"
          value={examNotes}
          maxLength={EXAM_NOTES_MAX}
          rows={5}
          placeholder="Add relevant findings, observations, or comments..."
          onChange={(e) =>
            setField("examNotes", e.target.value.slice(0, EXAM_NOTES_MAX))
          }
          className={cn(fieldTextareaClassName, "min-h-[8.5rem] w-full resize-y")}
        />
      </div>
    </section>
  );
}

function SignOffSection({
  values,
  onChange,
}: {
  values: CgaSectionValues;
  onChange: (next: CgaSectionValues) => void;
}) {
  const { role } = useUserRole();
  const clinician = getCurrentUserProfile(role);
  const signer = clinician.displayName;

  function setField(id: string, next: string | string[]) {
    onChange({ ...values, [id]: next });
  }

  useEffect(() => {
    if (strValue(values.signer) === signer) return;
    onChange({ ...values, signer });
    // Keep signer locked to the logged-in clinician profile.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signer]);

  const attestation = Array.isArray(values.attestation)
    ? values.attestation
    : [];

  return (
    <section
      className={cn(
        dashboardCardClass,
        "grid grid-cols-1 gap-x-4 gap-y-5 p-5 sm:grid-cols-2 sm:p-6",
      )}
    >
      <div className={cn(fieldStackClass, "sm:col-span-2")}>
        <FieldLabel htmlFor="cga-sign-summary">Clinician summary</FieldLabel>
        <textarea
          id="cga-sign-summary"
          value={strValue(values.summary)}
          onChange={(e) => setField("summary", e.target.value)}
          placeholder="Overall impression and next steps…"
          rows={4}
          className={cgaTextareaClass}
        />
      </div>

      <div
        role="group"
        aria-label="Attestation"
        className={cn(fieldStackClass, "sm:col-span-2")}
      >
        <p className={fieldLabelClass}>Attestation</p>
        <div className="flex flex-col gap-2">
          {CGA_SIGN_OFF_ATTESTATION_OPTIONS.map((opt) => {
            const checked = attestation.includes(opt.id);
            return (
              <label
                key={opt.id}
                className={cn(
                  optionCardClass,
                  "items-center",
                  checked && optionCardSelectedClass,
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    setField(
                      "attestation",
                      checked
                        ? attestation.filter((id) => id !== opt.id)
                        : [...attestation, opt.id],
                    );
                  }}
                  className="sr-only"
                />
                <CheckboxIndicator checked={checked} />
                <span className={cn(typo.bodyM, "font-medium text-foreground")}>
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className={fieldStackClass}>
        <FieldLabel htmlFor="cga-signer">Signing clinician</FieldLabel>
        <input
          id="cga-signer"
          type="text"
          value={signer}
          readOnly
          tabIndex={-1}
          aria-readonly="true"
          className={cgaReadonlyInputClass}
        />
      </div>
    </section>
  );
}

function ProblemListSection({
  problems,
  onProblemsChange,
}: {
  problems: CgaProblemRow[];
  onProblemsChange: (next: CgaProblemRow[]) => void;
}) {
  function updateProblem(id: string, patch: Partial<CgaProblemRow>) {
    onProblemsChange(
      problems.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  function removeProblem(id: string) {
    onProblemsChange(problems.filter((row) => row.id !== id));
  }

  return (
    <section className={cn(dashboardCardClass, "overflow-hidden p-0")}>
      <div className="border-b border-divider px-5 py-4">
        <h3 className={typo.headingL}>Active problems</h3>
        <p className={cn(typo.caption, "mt-1")}>
          Prioritized list — highest priority first. Edit inline.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-140 text-left">
          <thead>
            <tr className="border-b border-divider bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th className="w-12 px-4 py-3 font-medium">#</th>
              <th className="px-2 py-3 font-medium">Problem</th>
              <th className="px-2 py-3 font-medium">Notes</th>
              <th className="w-12 px-2 py-3">
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {problems.map((row, index) => (
              <tr
                key={row.id}
                className="border-b border-divider last:border-0"
              >
                <td className="px-4 py-2">
                  <span
                    className={cn(
                      typo.bodyM,
                      "tabular-nums font-medium text-muted-foreground",
                    )}
                  >
                    {index + 1}
                  </span>
                </td>
                <td className="px-1 py-2">
                  <input
                    value={row.problem}
                    onChange={(e) =>
                      updateProblem(row.id, { problem: e.target.value })
                    }
                    placeholder="Describe the problem"
                    className={cn(cgaTableInputClass, "font-medium")}
                  />
                </td>
                <td className="px-1 py-2">
                  <input
                    value={row.notes}
                    onChange={(e) =>
                      updateProblem(row.id, { notes: e.target.value })
                    }
                    placeholder="Optional notes"
                    className={cgaTableInputClass}
                  />
                </td>
                <td className="px-2 py-2">
                  <button
                    type="button"
                    aria-label={`Remove problem ${index + 1}`}
                    onClick={() => removeProblem(row.id)}
                    className={cn(
                      radius.md,
                      "inline-flex size-8 items-center justify-center text-muted-foreground transition-colors",
                      "hover:bg-destructive-muted hover:text-destructive",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                    )}
                  >
                    <AppIcon icon={Delete02Icon} size={BADGE_ICON_SIZE} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-divider px-5 py-3">
        <button
          type="button"
          className={cn(
            typo.button,
            "inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-primary transition-colors",
            "hover:bg-primary/10",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          )}
          onClick={() =>
            onProblemsChange([
              ...problems,
              {
                id: `prob-${Date.now()}`,
                problem: "",
                notes: "",
              },
            ])
          }
        >
          <AppIcon icon={Add01Icon} size={BADGE_ICON_SIZE} />
          Add Problem
        </button>
      </div>
    </section>
  );
}

function CognitionSection({
  values,
  onChange,
}: {
  values: CgaSectionValues;
  onChange: (next: CgaSectionValues) => void;
}) {
  const [limitError, setLimitError] = useState(false);

  function setField(id: string, next: string | string[]) {
    onChange({ ...values, [id]: next });
  }

  function applyMetric(
    result: MetricParseResult,
    apply: (value: string) => void,
  ) {
    if (result.exceeded) setLimitError(true);
    else setLimitError(false);
    apply(result.value);
  }

  // Legacy drafts may store MoCA as "26/30" — show the numerator only.
  const mocaStored = strValue(values.moca);
  const moca = mocaStored.includes("/")
    ? mocaStored.split("/")[0]?.trim() ?? ""
    : mocaStored;
  const mmse = strValue(values.mmse);
  const cognitiveConcerns = strValue(values.cognitiveConcerns);
  const orientation =
    typeof values.orientation === "string" ? values.orientation : "";

  return (
    <section
      className={cn(dashboardCardClass, "flex flex-col gap-5 p-5 sm:p-6")}
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-moca">MoCA</FieldLabel>
          <input
            id="cga-moca"
            type="number"
            inputMode="numeric"
            min={CGA_COGNITION_LIMITS.moca.min}
            max={CGA_COGNITION_LIMITS.moca.max}
            autoComplete="off"
            placeholder="0–30"
            value={moca}
            onChange={(e) => {
              const result = clampIntMetric(
                e.target.value,
                CGA_COGNITION_LIMITS.moca.max,
              );
              applyMetric(result, (next) => setField("moca", next));
            }}
            className={fieldInputClassName}
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-mmse">MMSE</FieldLabel>
          <input
            id="cga-mmse"
            type="number"
            inputMode="numeric"
            min={CGA_COGNITION_LIMITS.mmse.min}
            max={CGA_COGNITION_LIMITS.mmse.max}
            autoComplete="off"
            placeholder="0–30"
            value={mmse}
            onChange={(e) => {
              const result = clampIntMetric(
                e.target.value,
                CGA_COGNITION_LIMITS.mmse.max,
              );
              applyMetric(result, (next) => setField("mmse", next));
            }}
            className={fieldInputClassName}
          />
        </div>
      </div>

      {limitError ? (
        <FieldErrorMessage error={METRIC_LIMIT_ERROR} />
      ) : null}

      <div className={fieldStackClass}>
        <FieldLabel htmlFor="cga-cognitive-concerns">
          Cognitive concerns
        </FieldLabel>
        <textarea
          id="cga-cognitive-concerns"
          value={cognitiveConcerns}
          rows={4}
          placeholder="Describe memory, attention, or other cognitive concerns..."
          onChange={(e) => setField("cognitiveConcerns", e.target.value)}
          className={cgaTextareaClass}
        />
      </div>

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>Orientation</p>
        <ChipGroup
          ariaLabel="Orientation"
          options={CGA_ORIENTATION_OPTIONS}
          value={orientation}
          onChange={(v) => setField("orientation", v as string)}
        />
      </div>
    </section>
  );
}

function GenericSectionForm({
  section,
  values,
  onChange,
}: {
  section: CgaSection;
  values: CgaSectionValues;
  onChange: (next: CgaSectionValues) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {section.description ? (
        <p className={cn(typo.bodyM, "text-muted-foreground")}>
          {section.description}
        </p>
      ) : null}
      {section.callout ? (
        <div
          className={cn(
            radius.md,
            "border px-4 py-3.5",
            section.callout.tone === "warning"
              ? "border-warning/30 bg-warning-muted"
              : "border-info/30 bg-info-muted",
          )}
        >
          <p
            className={cn(
              typo.headingS,
              section.callout.tone === "warning" ? "text-warning" : "text-info",
            )}
          >
            {section.callout.title}
          </p>
          <p className={cn(typo.bodyS, "mt-1 text-muted-foreground")}>
            {section.callout.body}
          </p>
        </div>
      ) : null}
      <div
        className={cn(
          dashboardCardClass,
          "grid grid-cols-1 gap-x-4 gap-y-5 p-5 sm:grid-cols-2",
        )}
      >
        {section.fields.map((field) => (
          <FieldRenderer
            key={field.id}
            field={field}
            value={values[field.id]}
            onChange={(next) => onChange({ ...values, [field.id]: next })}
          />
        ))}
      </div>
    </div>
  );
}

export function CgaAssessmentWizard({ patientId }: { patientId: string }) {
  const router = useRouter();
  const patient = getDoctorPatientById(patientId);
  const [draft, setDraft] = useState<CgaDraftState>(() => {
    // Load from localStorage synchronously on the client (safe — this component is "use client")
    const existing = typeof window !== "undefined" ? loadCgaDraft(patientId) : null;
    return existing ?? createEmptyCgaDraft(patientId);
  });
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    saveCgaDraft(draft);
  }, [draft]);

  const sectionIndex = useMemo(
    () => CGA_SECTIONS.findIndex((s) => s.id === draft.activeSectionId),
    [draft.activeSectionId],
  );
  const section = CGA_SECTIONS[Math.max(0, sectionIndex)] ?? CGA_SECTIONS[0];
  const sectionValues = draft.valuesBySection[section.id] ?? {};
  const canContinue = isCgaSectionFormFilled(section, draft);
  const allergy =
    (draft.valuesBySection["medical-history"]?.allergies as string) ||
    "Penicillin";

  function updateDraft(patch: Partial<CgaDraftState>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function setSectionValues(next: CgaSectionValues) {
    updateDraft({
      valuesBySection: {
        ...draft.valuesBySection,
        [section.id]: next,
      },
    });
  }

  function markCompleteAndGo(nextIndex: number) {
    if (!isCgaSectionFormFilled(section, draft)) return;
    const completed = new Set(draft.completedSectionIds);
    completed.add(section.id);
    const nextSection = CGA_SECTIONS[nextIndex];
    if (!nextSection) {
      // Finished — clear draft and go to review detail
      clearCgaDraft(patientId);
      router.push(`/patients/${patientId}/assessments/cga-1`);
      return;
    }
    updateDraft({
      completedSectionIds: Array.from(completed),
      activeSectionId: nextSection.id,
    });
  }

  function handleSaveDraft() {
    saveCgaDraft(draft);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1600);
  }

  if (!patient) {
    return (
      <AppPageFrame>
        <DashboardReveal className={cn(dashboardPageShellClass)}>
          <p className={typo.headingL}>Patient not found</p>
          <Button asChild variant="primary-outline">
            <Link href="/health/assessments">Back to assessments</Link>
          </Button>
        </DashboardReveal>
      </AppPageFrame>
    );
  }

  return (
    <AppPageFrame>
      <div
        data-cga-wizard
        className={cn(
          dashboardContentWidthClass,
          "flex w-full flex-col gap-dash-gap pt-dash-pad-y pb-5",
          "lg:pb-4",
        )}
      >
        <div className="flex shrink-0 flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/health/assessments" className="hover:text-foreground">
            Clinical
          </Link>
          <span aria-hidden>/</span>
          <Link href="/health/assessments" className="hover:text-foreground">
            Assessments
          </Link>
          <span aria-hidden>/</span>
          <span className="text-foreground">CGA</span>
        </div>

        <div
          className={cn(
            dashboardCardClass,
            "flex shrink-0 flex-wrap items-center justify-between gap-4 p-4",
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <PatientAvatar
              initials={patient.initials}
              riskLevel={patient.riskLevel}
              size="md"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className={typo.headingL}>{patient.name}</p>
                <PatientRiskBadge level={patient.riskLevel} />
                <span
                  className={cn(
                    statusBadgeClass,
                    "border border-destructive-muted bg-destructive-muted text-destructive",
                  )}
                >
                  Allergy: {allergy}
                </span>
              </div>
              <p className={cn(typo.bodyS, "text-muted-foreground")}>
                {patient.age}, {patient.gender} · {patient.code}
              </p>
            </div>
          </div>
          <Button asChild variant="primary-outline" size="sm">
            <Link href={`/patients/${patientId}/vitals`}>
              Open patient chart
            </Link>
          </Button>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:items-stretch lg:overflow-hidden xl:grid-cols-[16rem_minmax(0,1fr)]">
          <nav
            className={cn(
              "group/thin-scroll flex flex-col border border-border bg-card p-2",
              "lg:h-full lg:min-h-0 lg:overflow-hidden",
              radius.lg,
            )}
            aria-label="CGA sections"
          >
            <div className="shrink-0 border-b border-divider px-4 pb-3 pt-3">
              <h2 className="text-lg font-semibold leading-6 text-foreground">
                Sections
              </h2>
            </div>
            <ul
              className={cn(
                "flex flex-col gap-1 px-2 pb-4 pt-2",
                "lg:thin-hover-scroll lg:min-h-0 lg:flex-1 lg:overflow-x-hidden lg:overflow-y-auto",
              )}
            >
              {CGA_SECTIONS.map((s) => {
                const active = s.id === section.id;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => updateDraft({ activeSectionId: s.id })}
                      aria-current={active ? "step" : undefined}
                      className={cn(
                        "flex w-full items-center rounded-full px-3 py-2.5 text-left transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-tertiary-foreground hover:bg-accent/70 hover:text-muted-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "w-6 shrink-0 text-sm font-medium leading-5 tabular-nums",
                          active
                            ? "text-primary"
                            : "text-tertiary-foreground",
                        )}
                      >
                        {String(s.number).padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "min-w-0 truncate text-sm font-medium leading-5",
                          active
                            ? "text-primary"
                            : "text-tertiary-foreground",
                        )}
                      >
                        {s.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div
            className={cn(
              "flex min-w-0 flex-col gap-4",
              /* px/py gutter keeps card hairline shadows from clipping */
              "lg:min-h-0 lg:overflow-hidden lg:px-1.5 lg:py-1",
            )}
          >
            <div
              className={cn(
                dashboardCardClass,
                "flex shrink-0 flex-col gap-4 p-4 sm:p-5",
              )}
            >
              <div className="flex min-w-0 flex-wrap items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className={cn(typo.bodyL, "font-semibold text-primary")}>
                    Section {section.number} of {CGA_SECTIONS.length}
                  </p>
                  <h1 className={cn(typo.headingXxl, "mt-1")}>
                    {section.number}. {section.title}
                  </h1>
                </div>
                <p
                  className={cn(
                    typo.bodyL,
                    "shrink-0 tabular-nums text-muted-foreground",
                  )}
                  aria-hidden
                >
                  <span className="font-semibold text-primary">
                    {draft.completedSectionIds.length}
                  </span>
                  {" of "}
                  {CGA_SECTIONS.length} complete
                </p>
              </div>
              <div
                className="flex w-full gap-1"
                role="progressbar"
                aria-valuenow={draft.completedSectionIds.length}
                aria-valuemin={0}
                aria-valuemax={CGA_SECTIONS.length}
                aria-label={`${draft.completedSectionIds.length} of ${CGA_SECTIONS.length} sections complete`}
              >
                {CGA_SECTIONS.map((s) => (
                  <div
                    key={s.id}
                    className={cn(
                      "h-2 min-w-0 flex-1 rounded-full transition-colors duration-500 ease-out",
                      draft.completedSectionIds.includes(s.id)
                        ? "bg-primary"
                        : "bg-accent",
                    )}
                    aria-hidden
                  />
                ))}
              </div>
            </div>

            <div
              className={cn(
                "flex flex-col gap-4",
                "lg:thin-hover-scroll lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain",
                "lg:px-0.5 lg:py-1",
              )}
            >
              {section.id === "visit-details" ? (
                <VisitDetailsSection
                  patient={patient}
                  values={sectionValues}
                  onChange={setSectionValues}
                />
              ) : section.id === "medications" ? (
                <MedicationsSection
                  values={sectionValues}
                  medications={draft.medications}
                  otcMedications={draft.otcMedications ?? []}
                  onValuesChange={setSectionValues}
                  onMedicationsChange={(medications) =>
                    updateDraft({ medications })
                  }
                  onOtcMedicationsChange={(otcMedications) =>
                    updateDraft({ otcMedications })
                  }
                />
              ) : section.id === "physical" ? (
                <PhysicalAssessmentSection
                  values={sectionValues}
                  onChange={setSectionValues}
                />
              ) : section.id === "cognition" ? (
                <CognitionSection
                  values={sectionValues}
                  onChange={setSectionValues}
                />
              ) : section.id === "problem-list" ? (
                <ProblemListSection
                  problems={draft.problems ?? []}
                  onProblemsChange={(problems) => updateDraft({ problems })}
                />
              ) : section.id === "investigations" ? (
                <CgaInvestigationsSection
                  labs={draft.labs ?? []}
                  testsRequestedToday={
                    typeof sectionValues.testsRequestedToday === "string"
                      ? sectionValues.testsRequestedToday
                      : ""
                  }
                  onLabsChange={(labs) => updateDraft({ labs })}
                  onTestsRequestedTodayChange={(testsRequestedToday) =>
                    setSectionValues({
                      ...sectionValues,
                      testsRequestedToday,
                    })
                  }
                />
              ) : section.id === "sign-off" ? (
                <SignOffSection
                  values={sectionValues}
                  onChange={setSectionValues}
                />
              ) : (
                <GenericSectionForm
                  section={section}
                  values={sectionValues}
                  onChange={setSectionValues}
                />
              )}
            </div>

            <div
              className={cn(
                dashboardCardClass,
                "flex shrink-0 flex-wrap items-center justify-between gap-3 p-4",
              )}
            >
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveDraft}
              >
                {savedFlash ? "Draft saved" : "Save draft"}
              </Button>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="primary-outline"
                  disabled={sectionIndex <= 0}
                  onClick={() => {
                    const prev = CGA_SECTIONS[sectionIndex - 1];
                    if (prev) updateDraft({ activeSectionId: prev.id });
                  }}
                >
                  <AppIcon icon={ArrowLeft01Icon} />
                  Previous
                </Button>
                <Button
                  type="button"
                  disabled={!canContinue}
                  title={
                    canContinue
                      ? undefined
                      : "Fill in all fields in this section to continue"
                  }
                  onClick={() => markCompleteAndGo(sectionIndex + 1)}
                >
                  {sectionIndex >= CGA_SECTIONS.length - 1
                    ? "Sign & finish"
                    : "Save & continue"}
                  <AppIcon icon={ArrowRight01Icon} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppPageFrame>
  );
}
