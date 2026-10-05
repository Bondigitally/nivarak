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
  FavouriteIcon,
  Hospital01Icon,
  InformationCircleIcon,
  UserGroupIcon,
  UserIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
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
import {
  fieldInputClassName,
  fieldTextareaClassName,
} from "@/components/ui/input";
import { AppPageFrame } from "@/features/dashboard/components/AppPageFrame";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import {
  dashboardCardClass,
  dashboardPageShellClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import {
  clearCgaDraft,
  createEmptyCgaDraft,
  isCgaSectionFormFilled,
  loadCgaDraft,
  saveCgaDraft,
  type CgaDraftState,
  type CgaSectionValues,
} from "@/features/assessments/data/cga-assessment-draft";
import {
  approximateDobFromAge,
  CGA_GENDER_OPTIONS,
  CGA_LANGUAGE_OPTIONS,
  CGA_LIVING_SITUATION_OPTIONS,
  CGA_RELATIONSHIP_OPTIONS,
  CGA_SECTIONS,
  mapPatientGenderToCga,
  type CgaField,
  type CgaMedicationRow,
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
  "border-primary bg-primary/5 shadow-[0_0_0_1px_var(--primary)] hover:bg-primary/5";
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

const LIVING_SITUATION_ICONS: Record<string, IconSvgElement> = {
  alone: UserIcon,
  spouse: FavouriteIcon,
  "adult-child": UserMultiple02Icon,
  "hired-help": UserGroupIcon,
  "care-home": Hospital01Icon,
};

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
}: {
  options: readonly { id: string; label: string }[];
  value: string | string[];
  multi?: boolean;
  onChange: (next: string | string[]) => void;
  ariaLabel?: string;
}) {
  const selected = Array.isArray(value) ? value : value ? [value] : [];

  return (
    <div
      role={multi ? "group" : "radiogroup"}
      aria-label={ariaLabel}
      className="flex flex-wrap gap-2"
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
          <input
            id="cga-mobile"
            type="text"
            value={strValue(values.mobileNumbers)}
            onChange={(e) => setField("mobileNumbers", e.target.value)}
            placeholder="+91 …"
            className={fieldInputClassName}
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

        <div className={cn(fieldStackClass, "sm:col-span-2")}>
          <p className={fieldLabelClass}>Living Situation</p>
          <div
            role="radiogroup"
            aria-label="Living Situation"
            className="flex flex-wrap gap-3"
          >
            {CGA_LIVING_SITUATION_OPTIONS.map((opt) => {
              const active = livingSituation === opt.id;
              const icon = LIVING_SITUATION_ICONS[opt.id] ?? UserIcon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setField("livingSituation", opt.id)}
                  className={cn(
                    radius.md,
                    "flex min-w-24 flex-1 flex-col items-center gap-2 border px-4 py-3 transition-colors sm:min-w-28 sm:flex-none",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                    active
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card text-foreground hover:border-foreground/20 hover:bg-accent",
                  )}
                >
                  <AppIcon
                    icon={icon}
                    size={ICON_SIZE}
                    className={active ? "text-primary" : "text-foreground"}
                  />
                  <span className={cn(typo.caption, "font-medium")}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
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
  onValuesChange,
  onMedicationsChange,
}: {
  values: CgaSectionValues;
  medications: CgaMedicationRow[];
  onValuesChange: (next: CgaSectionValues) => void;
  onMedicationsChange: (next: CgaMedicationRow[]) => void;
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

  const stoppedMeds = values.stoppedMeds === "true";

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          radius.md,
          "border border-warning/30 bg-warning-muted px-4 py-3.5",
        )}
      >
        <p className={cn(typo.headingS, "text-warning")}>STOPP/START Criteria</p>
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

      <section className={cn(dashboardCardClass, "flex flex-col gap-3 p-5")}>
        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-supplements">Supplements &amp; OTC</FieldLabel>
          <p className={fieldHintClass}>
            List active over-the-counter medications
          </p>
          <textarea
            id="cga-supplements"
            value={
              typeof values.supplements === "string" ? values.supplements : ""
            }
            onChange={(e) => setField("supplements", e.target.value)}
            rows={3}
            className={cgaTextareaClass}
          />
        </div>
        <label
          className={cn(
            optionCardClass,
            "items-center",
            stoppedMeds && optionCardSelectedClass,
          )}
        >
          <input
            type="checkbox"
            checked={stoppedMeds}
            onChange={(e) =>
              setField("stoppedMeds", e.target.checked ? "true" : "false")
            }
            className="sr-only"
          />
          <CheckboxIndicator checked={stoppedMeds} />
          <span className={cn(typo.bodyM, "font-medium text-foreground")}>
            Patient has independently stopped one or more prescribed medications
          </span>
        </label>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={cn(dashboardCardClass, "flex flex-col gap-3 p-5")}>
          <p className={fieldLabelClass}>Adherence Assessment</p>
          <div
            role="radiogroup"
            aria-label="Adherence Assessment"
            className="flex flex-col gap-2"
          >
            {(
              [
                { id: "full", label: "Full adherence" },
                { id: "partial", label: "Partial adherence" },
                { id: "poor", label: "Poor / Non-adherent" },
              ] as const
            ).map((opt) => {
              const checked = values.adherence === opt.id;
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
                    type="radio"
                    name="adherence"
                    checked={checked}
                    onChange={() => setField("adherence", opt.id)}
                    className="sr-only"
                  />
                  <RadioMark checked={checked} />
                  <span
                    className={cn(typo.bodyM, "font-medium text-foreground")}
                  >
                    {opt.label}
                  </span>
                </label>
              );
            })}
          </div>
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
  const [draft, setDraft] = useState<CgaDraftState>(() =>
    createEmptyCgaDraft(patientId),
  );
  const [hydrated, setHydrated] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    const existing = loadCgaDraft(patientId);
    setDraft(existing ?? createEmptyCgaDraft(patientId));
    setHydrated(true);
  }, [patientId]);

  useEffect(() => {
    if (!hydrated) return;
    saveCgaDraft(draft);
  }, [draft, hydrated]);

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
      {/*
        Single child so DashboardReveal's motion wrapper can fill height.
        Sections nav stays full-height; only the right column scrolls.
      */}
      <DashboardReveal
        className={cn(
          dashboardPageShellClass,
          "lg:h-[calc(100dvh-4rem)] lg:min-h-0 lg:overflow-hidden lg:pb-4 lg:[&>div]:flex lg:[&>div]:h-full lg:[&>div]:min-h-0 lg:[&>div]:flex-col",
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4">
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

          <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:items-stretch xl:grid-cols-[16rem_minmax(0,1fr)]">
            <nav
              className={cn(
                "group/thin-scroll flex min-h-0 flex-col overflow-hidden border border-border bg-card p-2",
                radius.lg,
              )}
              aria-label="CGA sections"
            >
              <div className="shrink-0 border-b border-divider px-4 pb-3 pt-3">
                <h2 className="text-lg font-semibold leading-6 text-foreground">
                  Sections
                </h2>
              </div>
              <ul className="thin-hover-scroll flex min-h-0 flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto px-2 pb-4 pt-2">
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

            <div className="flex min-h-0 min-w-0 flex-col gap-4 overflow-y-auto overscroll-contain px-1.5 py-1">
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
                    className={cn(typo.bodyL, "shrink-0 tabular-nums text-muted-foreground")}
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

              <div className="flex flex-col gap-4">
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
                    onValuesChange={setSectionValues}
                    onMedicationsChange={(medications) =>
                      updateDraft({ medications })
                    }
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
      </DashboardReveal>
    </AppPageFrame>
  );
}
