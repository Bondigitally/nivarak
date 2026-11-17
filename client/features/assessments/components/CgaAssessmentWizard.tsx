"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Add01Icon,
  Alert02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowRight04Icon,
  Chart01Icon,
  Delete02Icon,
  InformationCircleIcon,
  ViewIcon,
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
  fieldInputClassName,
  fieldTextareaClassName,
} from "@/components/ui/input";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
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
import { CgaDatePicker } from "@/features/assessments/components/CgaDatePicker";
import { CgaInvestigationsSection } from "@/features/assessments/components/CgaInvestigationsSection";
import { CgaMedicalHistorySection } from "@/features/assessments/components/CgaMedicalHistorySection";
import {
  CgaRevealDetails,
  cgaOtherFieldKey,
  isCgaOtherSelected,
} from "@/features/assessments/components/CgaRevealDetails";
import { CgaSelect } from "@/features/assessments/components/CgaSelect";
import { CgaTimePicker } from "@/features/assessments/components/CgaTimePicker";
import { CgaVisitDetailsLanguageField } from "@/features/assessments/components/CgaVisitDetailsLanguageField";
import {
  approximateDobFromAge,
  CGA_ADHERENCE_OPTIONS,
  CGA_ADMINISTRATION_OPTIONS,
  CGA_4AT_ACUTE_CHANGE_OPTIONS,
  CGA_4AT_ALERTNESS_OPTIONS,
  CGA_4AT_AMT4_OPTIONS,
  CGA_4AT_ATTENTION_OPTIONS,
  CGA_AFFECT_OPTIONS,
  CGA_ALERTNESS_OPTIONS,
  CGA_ANXIETY_OPTIONS,
  CGA_CAM_CONSCIOUSNESS_OPTIONS,
  CGA_COGNITION_LIMITS,
  CGA_COGNITION_ORIENTATION_OPTIONS,
  CGA_COGNITION_RESCREEN_MONTHS,
  CGA_DELIRIUM_RISK_OPTIONS,
  CGA_GENDER_OPTIONS,
  CGA_INFORMANT_REPORT_OPTIONS,
  CGA_LANGUAGE_COMMUNICATION_OPTIONS,
  CGA_LIVING_SITUATION_OPTIONS,
  CGA_LONELINESS_OPTIONS,
  CGA_MEMORY_IMPRESSION_OPTIONS,
  CGA_ACP_DISCUSSED_OPTIONS,
  CGA_ALCOHOL_INTAKE_OPTIONS,
  CGA_APPETITE_OPTIONS,
  CGA_CARER_WISHES_AWARENESS_OPTIONS,
  CGA_CPR_DECISION_OPTIONS,
  CGA_HYDRATION_OPTIONS,
  CGA_PALLIATIVE_NEEDS_OPTIONS,
  CGA_PREFERRED_PLACE_OPTIONS,
  CGA_PROGNOSIS_AWARENESS_OPTIONS,
  CGA_MUST_LIMITS,
  CGA_ORAL_HEALTH_EATING_OPTIONS,
  CGA_PHYSICAL_LIMITS,
  CGA_SWALLOWING_OPTIONS,
  CGA_TASTE_CHANGES_OPTIONS,
  CGA_BALANCE_IMPRESSION_OPTIONS,
  CGA_BARTHEL_ITEMS,
  CGA_BARTHEL_LEVEL_OPTIONS,
  barthelItemFieldId,
  barthelScoreForLevel,
  CGA_CHAIR_STAND_OPTIONS,
  CGA_BATHROOM_SAFETY_OPTIONS,
  CGA_BONE_RISK_FACTOR_OPTIONS,
  CGA_BONE_TREATMENT_OPTIONS,
  CGA_CARER_STRAIN_OPTIONS,
  CGA_COMMUNITY_PARTICIPATION_OPTIONS,
  CGA_DRIVING_TRANSPORT_OPTIONS,
  CGA_FINANCIAL_SITUATION_OPTIONS,
  CGA_FRAILTY_FLAG_OPTIONS,
  CGA_HOME_SAFETY_DEVICE_OPTIONS,
  CGA_HOME_STAIRS_OPTIONS,
  CGA_CARE_PLAN_ACTION_OPTIONS,
  CGA_CARE_PLAN_ACTION_STATUS_OPTIONS,
  CGA_CARE_PLAN_REFERRAL_TO_OPTIONS,
  CGA_CARE_PLAN_REFERRAL_URGENCY_OPTIONS,
  CGA_CARE_PLAN_RESPONSIBLE_OPTIONS,
  CGA_CARE_PLAN_REVIEW_TYPE_OPTIONS,
  CGA_CAPACITY_TODAY_OPTIONS,
  CGA_DECISION_MAKER_OPTIONS,
  CGA_FORMAL_CAPACITY_ASSESSMENT_OPTIONS,
  CGA_LPA_OPTIONS,
  CGA_PROBLEM_DOMAINS,
  CGA_PROBLEM_PRIORITY_OPTIONS,
  ensureCarePlanActionRows,
  ensureCarePlanReferralRows,
  ensureProblemRows,
  CGA_NOTTINGHAM_ITEMS,
  CGA_NOTTINGHAM_LEVEL_OPTIONS,
  CGA_NOCTURIA_OPTIONS,
  CGA_PRIMARY_CARER_OPTIONS,
  CGA_PROPERTY_TYPE_OPTIONS,
  CGA_SOCIAL_ENGAGEMENT_OPTIONS,
  CGA_URGENCY_TOILET_OPTIONS,
  CGA_URINARY_EXAM_OPTIONS,
  CGA_URINARY_ONSET_OPTIONS,
  CGA_URINARY_SEVERITY_OPTIONS,
  CGA_URINARY_TYPE_OPTIONS,
  nottinghamItemFieldId,
  CGA_ENVIRONMENTAL_HAZARDS_OPTIONS,
  CGA_FALLS_12M_OPTIONS,
  CGA_FALLS_CIRCUMSTANCES_OPTIONS,
  CGA_FALLS_CONSEQUENCES_OPTIONS,
  CGA_FEAR_OF_FALLING_OPTIONS,
  CGA_FRAGILITY_FRACTURE_OPTIONS,
  CGA_GAIT_PATTERN_OPTIONS,
  CGA_GDS15_LIMITS,
  CGA_OSTEOPOROSIS_DIAGNOSIS_OPTIONS,
  CGA_PHQ2_SCREEN_OPTIONS,
  CGA_PSYCHOMOTOR_OPTIONS,
  CGA_OUTDOOR_MOBILITY_OPTIONS,
  CGA_SLEEP_OPTIONS,
  CGA_SUICIDAL_IDEATION_OPTIONS,
  CGA_WALKING_AIDS_OPTIONS,
  CGA_NUTRITIONAL_APPEARANCE_OPTIONS,
  CGA_POSTURAL_BP_OPTIONS,
  CGA_RELATIONSHIP_OPTIONS,
  CGA_YES_NO_OPTIONS,
  CGA_SYSTEMIC_EXAM_FIELDS,
  CGA_SECTIONS,
  CGA_DESIGNATION_OPTIONS,
  CGA_SIGN_OFF_INFORMED_OPTIONS,
  mapPatientGenderToCga,
  type CgaCarePlanActionRow,
  type CgaCarePlanReferralRow,
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
import { BADGE_ICON_SIZE, DROPDOWN_CHEVRON_SIZE, ICON_SIZE } from "@/lib/icons";
import { CGA_SECTION_SHELL_CLASS } from "@/features/assessments/data/cga-ui-tokens";
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
  layout?: "wrap" | "stack" | "equal";
}) {
  const selected = Array.isArray(value) ? value : value ? [value] : [];

  return (
    <div
      role={multi ? "group" : "radiogroup"}
      aria-label={ariaLabel}
      className={cn(
        "flex gap-2",
        layout === "stack"
          ? "flex-col"
          : layout === "equal"
            ? "w-full"
            : "flex-wrap",
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
              layout === "equal" && "min-w-0 flex-1 justify-center",
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

function FieldOtherDetails({
  fieldId,
  fieldLabel,
  open,
  value,
  onChange,
}: {
  fieldId: string;
  fieldLabel: string;
  open: boolean;
  value: string;
  onChange: (next: string) => void;
}) {
  const otherId = `cga-field-${fieldId}-other`;
  return (
    <CgaRevealDetails open={open}>
      <input
        id={otherId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Specify ${fieldLabel.toLowerCase()}…`}
        aria-label={`${fieldLabel} details`}
        className={fieldInputClassName}
        autoComplete="off"
      />
    </CgaRevealDetails>
  );
}

function FieldRenderer({
  field,
  value,
  otherValue,
  onChange,
  onOtherChange,
}: {
  field: CgaField;
  value: string | string[] | undefined;
  otherValue?: string;
  onChange: (next: string | string[]) => void;
  onOtherChange?: (next: string) => void;
}) {
  const inputId = `cga-field-${field.id}`;
  const otherText = typeof otherValue === "string" ? otherValue : "";
  const supportsOther =
    (field.kind === "select" ||
      field.kind === "radio" ||
      field.kind === "chips" ||
      field.kind === "checkbox-list") &&
    field.options.some((opt) => opt.id === "other");
  const otherOpen = supportsOther && isCgaOtherSelected(value);

  function setValue(next: string | string[]) {
    onChange(next);
  }

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

  if (field.kind === "date") {
    return (
      <div className={fieldStackClass}>
        <FieldLabel htmlFor={inputId}>{field.label}</FieldLabel>
        <CgaDatePicker
          id={inputId}
          aria-label={field.label}
          value={typeof value === "string" ? value : ""}
          onChange={(next) => onChange(next)}
        />
      </div>
    );
  }

  if (field.kind === "text") {
    return (
      <div className={fieldStackClass}>
        <FieldLabel htmlFor={inputId}>{field.label}</FieldLabel>
        <input
          id={inputId}
          type="text"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={fieldInputClassName}
        />
        {field.hint ? <p className={fieldHintClass}>{field.hint}</p> : null}
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
          onChange={setValue}
          placeholder={field.placeholder ?? "Select…"}
        />
        <FieldOtherDetails
          fieldId={field.id}
          fieldLabel={field.label}
          open={otherOpen}
          value={otherText}
          onChange={(next) => onOtherChange?.(next)}
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
                  onChange={() => setValue(opt.id)}
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
        <FieldOtherDetails
          fieldId={field.id}
          fieldLabel={field.label}
          open={otherOpen}
          value={otherText}
          onChange={(next) => onOtherChange?.(next)}
        />
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
          onChange={setValue}
          ariaLabel={field.label}
        />
        <FieldOtherDetails
          fieldId={field.id}
          fieldLabel={field.label}
          open={otherOpen}
          value={otherText}
          onChange={(next) => onOtherChange?.(next)}
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
                    setValue(
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
        <FieldOtherDetails
          fieldId={field.id}
          fieldLabel={field.label}
          open={otherOpen}
          value={otherText}
          onChange={(next) => onOtherChange?.(next)}
        />
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
        data-cga-callout=""
        className={cn(
          radius.md,
          "flex items-start gap-3 bg-info-muted px-4 py-3",
        )}
        role="note"
      >
        <AppIcon
          icon={InformationCircleIcon}
          size={BADGE_ICON_SIZE}
          className="mt-0.5 shrink-0 text-info"
        />
        <p className={cn(typo.bodyS, "text-info")}>
          Demographics and contact information sync to the patient chart
          automatically upon save.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">

        <div className="grid grid-cols-1 gap-4 sm:col-span-1 sm:grid-cols-2">
          <div className={fieldStackClass}>
            <FieldLabel htmlFor="cga-visit-date">Visit Date</FieldLabel>
            <CgaDatePicker
              id="cga-visit-date"
              aria-label="Visit Date"
              value={strValue(values.visitDate)}
              onChange={(next) => setField("visitDate", next)}
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
                  onClick={() => {
                    if (opt.id === "other") {
                      setField("gender", opt.id);
                      return;
                    }
                    onChange({
                      ...values,
                      gender: opt.id,
                      genderOther: "",
                    });
                  }}
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
          <CgaRevealDetails open={gender === "other"}>
            <input
              id="cga-gender-other"
              type="text"
              value={strValue(values.genderOther)}
              onChange={(e) => setField("genderOther", e.target.value)}
              placeholder="Specify gender…"
              aria-label="Gender details"
              autoComplete="off"
              className={fieldInputClassName}
            />
          </CgaRevealDetails>
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
          <FieldLabel htmlFor="cga-mobile">Patient Mobile Number</FieldLabel>
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
          <CgaVisitDetailsLanguageField
            value={languages}
            onChange={(next) => setField("language", next)}
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-family-contact-name">
            Family Contact Name
          </FieldLabel>
          <input
            id="cga-family-contact-name"
            type="text"
            value={strValue(values.familyContactName)}
            onChange={(e) => setField("familyContactName", e.target.value)}
            className={fieldInputClassName}
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-family-contact-phone">
            Family Contact Phone
          </FieldLabel>
          <PhoneField
            id="cga-family-contact-phone"
            showLabel={false}
            showError={false}
            value={phoneFieldValue(values.familyContactPhone)}
            onChange={(next) => setField("familyContactPhone", next)}
            placeholder="9823456789"
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
        data-cga-callout=""
        className={cn(radius.md, "bg-warning-muted px-4 py-3.5")}
        role="note"
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
                <th data-cga-edit-only="" className="w-12 px-2 py-3">
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
                  <td data-cga-edit-only="" className="px-2 py-2">
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
        <div
          data-cga-edit-only=""
          className="border-t border-divider px-5 py-3"
        >
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
                <th data-cga-edit-only="" className="w-12 px-2 py-3">
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
                  <td data-cga-edit-only="" className="px-2 py-2">
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
        <div
          data-cga-edit-only=""
          className="border-t border-divider px-5 py-3"
        >
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
          onClick={() => {
            if (stoppedMeds) {
              onValuesChange({
                ...values,
                stoppedMeds: "false",
                stoppedMedsNotes: "",
              });
              return;
            }
            setField("stoppedMeds", "true");
          }}
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

      <CgaRevealDetails open={stoppedMeds}>
        <textarea
          id="cga-stopped-meds-notes"
            value={
            typeof values.stoppedMedsNotes === "string"
              ? values.stoppedMedsNotes
              : ""
          }
          onChange={(e) => setField("stoppedMedsNotes", e.target.value)}
          placeholder="Which medications were stopped, and why?"
          rows={3}
          className={cgaTextareaClass}
        />
      </CgaRevealDetails>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-adherence">Adherence</FieldLabel>
          <CgaSelect
            id="cga-adherence"
            aria-label="Adherence"
            value={typeof values.adherence === "string" ? values.adherence : ""}
            options={CGA_ADHERENCE_OPTIONS.map((opt) => ({
              value: opt.id,
              label: opt.label,
            }))}
            placeholder="Select adherence"
            onChange={(next) => setField("adherence", next)}
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-administration">Administration</FieldLabel>
          <CgaSelect
            id="cga-administration"
            aria-label="Administration"
              value={
                typeof values.administration === "string"
                  ? values.administration
                  : ""
              }
            options={CGA_ADMINISTRATION_OPTIONS.map((opt) => ({
              value: opt.id,
              label: opt.label,
            }))}
            placeholder="Select administration"
            onChange={(next) => setField("administration", next)}
          />
        </div>
      </div>

      <div className={cn(fieldStackClass, "w-full")}>
            <p className={fieldLabelClass}>Storage Details</p>
            <ChipGroup
              ariaLabel="Storage Details"
          layout="equal"
              options={[
                { id: "original", label: "Original packaging" },
                { id: "dosette", label: "Dosette box" },
                { id: "blister", label: "Blister pack" },
                { id: "other", label: "Other" },
              ]}
              value={typeof values.storage === "string" ? values.storage : ""}
          onChange={(v) => {
            const next = typeof v === "string" ? v : "";
            if (next === "other") {
              setField("storage", next);
              return;
            }
            onValuesChange({
              ...values,
              storage: next,
              storageOther: "",
            });
          }}
        />
        <CgaRevealDetails open={values.storage === "other"}>
          <input
            id="cga-storage-other"
            type="text"
            value={
              typeof values.storageOther === "string" ? values.storageOther : ""
            }
            onChange={(e) => setField("storageOther", e.target.value)}
            placeholder="Specify storage details…"
            aria-label="Storage details"
            autoComplete="off"
            className={fieldInputClassName}
          />
        </CgaRevealDetails>
      </div>

      <div className={fieldStackClass}>
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
      </div>
    </div>
  );
}

const EXAM_NOTES_MAX = 500;
const METRIC_LIMIT_ERROR =
  "Value exceeds the allowed limit for this measurement.";

const physicalMetricInputClass = cn(
  fieldInputClassName,
  typo.input,
  "h-11 font-normal tabular-nums [appearance:textfield]",
  "placeholder:font-normal placeholder:text-placeholder",
  "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
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

function computeBmi(weightKg: string, heightCm: string): string {
  const weight = Number(weightKg);
  const height = Number(heightCm);
  if (
    !Number.isFinite(weight) ||
    !Number.isFinite(height) ||
    weight <= 0 ||
    height <= 0
  ) {
    return "0.0";
  }
  const meters = height / 100;
  const bmi = weight / (meters * meters);
  if (!Number.isFinite(bmi)) return "0.0";
  return bmi.toFixed(1);
}

function PhysicalAssessmentSection({
  values,
  onChange,
}: {
  values: CgaSectionValues;
  onChange: (next: CgaSectionValues) => void;
}) {
  const [limitError, setLimitError] = useState(false);

  function applyMetric(
    result: MetricParseResult,
    apply: (value: string) => void,
  ) {
    if (result.exceeded) setLimitError(true);
    else setLimitError(false);
    apply(result.value);
  }

  // Migrate legacy single "bp" value ("128/82") into systolic/diastolic once.
  const legacyBp = strValue(values.bp);
  const systolic =
    strValue(values.bpSystolic) ||
    (legacyBp.includes("/") ? (legacyBp.split("/")[0]?.trim() ?? "") : "");
  const diastolic =
    strValue(values.bpDiastolic) ||
    (legacyBp.includes("/") ? (legacyBp.split("/")[1]?.trim() ?? "") : "");
  const pulse = strValue(values.hr);
  const spo2 = strValue(values.spo2);
  const temp = strValue(values.temp);
  const weight = strValue(values.weight);
  const heightCm = strValue(values.heightCm);
  const bmi = computeBmi(weight, heightCm);
  const examNotes = strValue(values.examNotes).slice(0, EXAM_NOTES_MAX);

  useEffect(() => {
    if (strValue(values.weightUnit) === "kg") return;
    onChange({ ...values, weightUnit: "kg" });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only kg default
  }, []);

  function setBp(nextSystolic: string, nextDiastolic: string) {
    onChange({
      ...values,
      bpSystolic: nextSystolic,
      bpDiastolic: nextDiastolic,
      bp:
        nextSystolic && nextDiastolic
          ? `${nextSystolic}/${nextDiastolic}`
          : "",
      weightUnit: "kg",
      bmi,
    });
  }

  function setMetric(id: string, next: string) {
    const nextWeight = id === "weight" ? next : weight;
    const nextHeight = id === "heightCm" ? next : heightCm;
      onChange({
        ...values,
      [id]: next,
      weightUnit: "kg",
      bmi: computeBmi(nextWeight, nextHeight),
    });
  }

  function setSystemicFindings(fieldId: string, next: string | string[]) {
    const otherKey = `${fieldId}Other`;
    const clearingOther = !isCgaOtherSelected(next);
    onChange({
      ...values,
      [fieldId]: next,
      weightUnit: "kg",
      bmi,
      ...(clearingOther ? { [otherKey]: "" } : {}),
    });
  }

  function onSystemicChange(
    fieldId: string,
    multi: boolean,
    next: string | string[],
  ) {
    if (!multi || !Array.isArray(next)) {
      setSystemicFindings(fieldId, next);
      return;
    }
    const prev = Array.isArray(values[fieldId])
      ? (values[fieldId] as string[])
      : [];
    // Selecting Normal clears other findings; selecting a finding clears Normal.
    if (next.includes("normal") && !prev.includes("normal")) {
      setSystemicFindings(fieldId, ["normal"]);
      return;
    }
    if (next.includes("normal") && next.length > 1) {
      setSystemicFindings(
        fieldId,
        next.filter((id) => id !== "normal"),
      );
      return;
    }
    setSystemicFindings(fieldId, next);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h3 className={typo.headingL}>4.1 Vitals (baseline)</h3>
        <p className={cn(typo.caption, "text-muted-foreground")}>
          Clinical approval needed
        </p>
      </div>

      <div
        className={cn(
          "grid grid-cols-2 gap-x-3 gap-y-4",
          "sm:grid-cols-3",
          "xl:grid-cols-[minmax(0,1.35fr)_repeat(6,minmax(0,1fr))]",
        )}
      >
        <div className={cn(fieldStackClass, "col-span-2 sm:col-span-1")}>
          <FieldLabel>BP (sitting)</FieldLabel>
          <div className="flex h-11 min-w-0 items-center gap-1.5">
            <input
              id="cga-bp-systolic"
              type="number"
              inputMode="numeric"
              min={CGA_PHYSICAL_LIMITS.bpSystolic.min}
              max={CGA_PHYSICAL_LIMITS.bpSystolic.max}
              autoComplete="off"
              aria-label={`Systolic blood pressure, max ${CGA_PHYSICAL_LIMITS.bpSystolic.max} mmHg`}
              placeholder="Systolic"
              value={systolic}
              onChange={(e) => {
                const result = clampIntMetric(
                  e.target.value,
                  CGA_PHYSICAL_LIMITS.bpSystolic.max,
                );
                applyMetric(result, (next) => setBp(next, diastolic));
              }}
              className={cn(physicalMetricInputClass, "min-w-0 flex-1 px-2.5")}
            />
            <span
              className={cn(
                typo.input,
                "shrink-0 px-0.5 font-normal text-muted-foreground/70",
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
              placeholder="Diastolic"
              value={diastolic}
              onChange={(e) => {
                const result = clampIntMetric(
                  e.target.value,
                  CGA_PHYSICAL_LIMITS.bpDiastolic.max,
                );
                applyMetric(result, (next) => setBp(systolic, next));
              }}
              className={cn(physicalMetricInputClass, "min-w-0 flex-1 px-2.5")}
            />
          </div>
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-pulse">Pulse</FieldLabel>
          <input
            id="cga-pulse"
            type="number"
            inputMode="numeric"
            min={CGA_PHYSICAL_LIMITS.hr.min}
            max={CGA_PHYSICAL_LIMITS.hr.max}
            autoComplete="off"
            placeholder="e.g., 72 bpm"
            value={pulse}
            onChange={(e) => {
              const result = clampIntMetric(
                e.target.value,
                CGA_PHYSICAL_LIMITS.hr.max,
              );
              applyMetric(result, (next) => setMetric("hr", next));
            }}
            className={physicalMetricInputClass}
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-spo2">SpO2</FieldLabel>
          <input
            id="cga-spo2"
            type="number"
            inputMode="numeric"
            min={CGA_PHYSICAL_LIMITS.spo2.min}
            max={CGA_PHYSICAL_LIMITS.spo2.max}
            autoComplete="off"
            placeholder="e.g., 98 %"
            value={spo2}
            onChange={(e) => {
              const result = clampIntMetric(
                e.target.value,
                CGA_PHYSICAL_LIMITS.spo2.max,
              );
              applyMetric(result, (next) => setMetric("spo2", next));
            }}
            className={physicalMetricInputClass}
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-temp">Temp</FieldLabel>
          <input
            id="cga-temp"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="e.g., 36.5 °C"
            value={temp}
            onChange={(e) => {
              const result = clampDecimalMetric(
                e.target.value,
                CGA_PHYSICAL_LIMITS.temp.max,
              );
              applyMetric(result, (next) => setMetric("temp", next));
            }}
            className={physicalMetricInputClass}
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-weight">Weight (kg)</FieldLabel>
            <input
              id="cga-weight"
              type="text"
              inputMode="decimal"
              autoComplete="off"
            placeholder="e.g., 72.5 kg"
              value={weight}
              onChange={(e) => {
                const result = clampDecimalMetric(
                  e.target.value,
                CGA_PHYSICAL_LIMITS.weightKg.max,
              );
              applyMetric(result, (next) => setMetric("weight", next));
            }}
            className={physicalMetricInputClass}
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-height">Height (cm)</FieldLabel>
          <input
            id="cga-height"
            type="number"
            inputMode="numeric"
            min={CGA_PHYSICAL_LIMITS.heightCm.min}
            max={CGA_PHYSICAL_LIMITS.heightCm.max}
            autoComplete="off"
            placeholder="e.g., 165 cm"
            value={heightCm}
            onChange={(e) => {
              const result = clampIntMetric(
                e.target.value,
                CGA_PHYSICAL_LIMITS.heightCm.max,
              );
              applyMetric(result, (next) => setMetric("heightCm", next));
            }}
            className={physicalMetricInputClass}
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-bmi">BMI</FieldLabel>
          <div className="cursor-not-allowed">
            <input
              id="cga-bmi"
              type="text"
              disabled
              aria-disabled="true"
              value={bmi || "0.0"}
              className={cn(
                cgaReadonlyInputClass,
                typo.input,
                "h-11 cursor-not-allowed font-normal tabular-nums opacity-100",
              )}
            />
          </div>
        </div>
      </div>

      <FieldErrorMessage error={limitError ? METRIC_LIMIT_ERROR : null} />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-postural-bp">
            <span className="inline-flex items-center gap-1">
              Postural BP (lying
              <AppIcon
                icon={ArrowRight04Icon}
                size={BADGE_ICON_SIZE}
                className="text-muted-foreground"
              />
              standing)
            </span>
          </FieldLabel>
          <CgaSelect
            id="cga-postural-bp"
            aria-label="Postural BP lying to standing"
            value={strValue(values.posturalBp)}
            options={CGA_POSTURAL_BP_OPTIONS.map((opt) => ({
              value: opt.id,
              label: opt.label,
            }))}
            placeholder="Select postural BP"
            onChange={(next) => setMetric("posturalBp", next)}
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-nutritional-appearance">
            Nutritional appearance
          </FieldLabel>
          <CgaSelect
            id="cga-nutritional-appearance"
            aria-label="Nutritional appearance"
            value={strValue(values.nutritionalAppearance)}
            options={CGA_NUTRITIONAL_APPEARANCE_OPTIONS.map((opt) => ({
              value: opt.id,
              label: opt.label,
            }))}
            placeholder="Select nutritional appearance"
            onChange={(next) => setMetric("nutritionalAppearance", next)}
          />
        </div>
      </div>

      <div
        data-cga-callout=""
        className={cn(
          radius.md,
          "flex items-start gap-3 bg-warning-muted px-4 py-3",
        )}
        role="note"
      >
        <AppIcon
          icon={Alert02Icon}
          size={BADGE_ICON_SIZE}
          className="mt-0.5 shrink-0 text-warning"
        />
        <p className={cn(typo.bodyS, "text-warning")}>
          Check lying BP after 5 min, then immediate / 1 min / 3 min standing.
          Postural hypotension = drop &gt;20 mmHg systolic or &gt;10 mmHg
          diastolic with symptoms.
        </p>
      </div>

      <div className="flex flex-col gap-4 border-t border-divider pt-5">
        <div className="flex flex-col gap-1">
          <h3 className={typo.headingL}>4.2 Systemic examination</h3>
        </div>

        <div
          data-cga-callout=""
          className={cn(
            radius.md,
            "flex items-start gap-3 bg-warning-muted px-4 py-3",
          )}
          role="note"
        >
          <AppIcon
            icon={Alert02Icon}
            size={BADGE_ICON_SIZE}
            className="mt-0.5 shrink-0 text-warning"
          />
          <p className={cn(typo.bodyS, "text-warning")}>
            Document all systems. Note findings relevant to active diagnoses.
            Describe all abnormals.
          </p>
          </div>

        <div className="flex flex-col gap-5">
          {CGA_SYSTEMIC_EXAM_FIELDS.map((field) => {
            const raw = values[field.id];
            const value = field.multi
              ? Array.isArray(raw)
                ? raw
                : []
              : typeof raw === "string"
                ? raw
                : "";
            const otherKey = `${field.id}Other`;
            const otherValue =
              typeof values[otherKey] === "string"
                ? (values[otherKey] as string)
                : "";
            const showOther =
              field.options.some((opt) => opt.id === "other") &&
              isCgaOtherSelected(value);

            return (
              <div key={field.id} className={fieldStackClass}>
                <p className={fieldLabelClass}>{field.label}</p>
                <ChipGroup
                  ariaLabel={field.label}
                  options={field.options}
                  value={value}
                  multi={field.multi}
                  onChange={(next) =>
                    onSystemicChange(field.id, field.multi, next)
                  }
                />
                <CgaRevealDetails open={showOther}>
                  <input
                    id={`cga-${field.id}-other`}
                    type="text"
                    value={otherValue}
                    onChange={(e) => setMetric(otherKey, e.target.value)}
                    placeholder={`Specify ${field.label.toLowerCase()}…`}
                    aria-label={`${field.label} details`}
                    autoComplete="off"
                    className={fieldInputClassName}
                  />
                </CgaRevealDetails>
              </div>
            );
          })}
        </div>
      </div>

      <div className={fieldStackClass}>
        <FieldLabel htmlFor="cga-exam-notes">Examination notes</FieldLabel>
        <textarea
          id="cga-exam-notes"
          value={examNotes}
          maxLength={EXAM_NOTES_MAX}
          rows={5}
          placeholder="Add relevant findings, observations, or comments..."
          onChange={(e) =>
            setMetric("examNotes", e.target.value.slice(0, EXAM_NOTES_MAX))
          }
          className={cn(fieldTextareaClassName, "min-h-[8.5rem] w-full resize-y")}
        />
      </div>
    </div>
  );
}

function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  const today = todayIsoDate();
  const defaultDesignation = clinician.designation ?? "Geriatrician";

  function setField(id: string, next: string | string[]) {
    onChange({ ...values, [id]: next });
  }

  useEffect(() => {
    const next: CgaSectionValues = { ...values };
    let changed = false;
    if (strValue(values.signer) !== signer) {
      next.signer = signer;
      changed = true;
    }
    if (strValue(values.signOffDate) !== today) {
      next.signOffDate = today;
      changed = true;
    }
    if (!strValue(values.designation)) {
      next.designation = defaultDesignation;
      changed = true;
    }
    if (changed) onChange(next);
    // Keep clinician name/date locked; seed designation once when empty.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signer, today, defaultDesignation]);

  const informedFindings = Array.isArray(values.informedFindings)
    ? values.informedFindings
    : [];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-sign-clinician">
            Assessing clinician name
          </FieldLabel>
          <input
            id="cga-sign-clinician"
            type="text"
            value={signer}
            readOnly
            disabled
            tabIndex={-1}
            aria-readonly="true"
            className={cgaReadonlyInputClass}
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-sign-designation">
            Designation / Qualification
          </FieldLabel>
          <CgaSelect
            id="cga-sign-designation"
            aria-label="Designation / Qualification"
            value={strValue(values.designation, defaultDesignation)}
            options={CGA_DESIGNATION_OPTIONS.map((label) => ({
              value: label,
              label,
            }))}
            onChange={(next) => setField("designation", next)}
            placeholder="Select…"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className={cn(fieldStackClass, "w-fit")}>
          <FieldLabel htmlFor="cga-sign-date">Date</FieldLabel>
          <input
            id="cga-sign-date"
            type="text"
            size={10}
            value={(() => {
              const iso = strValue(values.signOffDate, today);
              const [y, m, d] = iso.split("-");
              return y && m && d ? `${d}/${m}/${y}` : iso;
            })()}
            readOnly
            disabled
            tabIndex={-1}
            aria-readonly="true"
      className={cn(
              cgaReadonlyInputClass,
              "w-auto min-w-0 shrink-0 px-3 tabular-nums",
            )}
          />
        </div>

        <div className={cn(fieldStackClass, "w-fit")}>
          <FieldLabel htmlFor="cga-sign-time">
            Time assessment completed
          </FieldLabel>
          <CgaTimePicker
            id="cga-sign-time"
            aria-label="Time assessment completed"
            value={strValue(values.timeCompleted)}
            onChange={(next) => setField("timeCompleted", next)}
          />
        </div>

        <div className={cn(fieldStackClass, "w-fit")}>
          <FieldLabel htmlFor="cga-sign-duration">
            Total visit duration (mins)
          </FieldLabel>
          <input
            id="cga-sign-duration"
            type="text"
            inputMode="numeric"
            value={strValue(values.visitDurationMins)}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
              setField("visitDurationMins", digits);
            }}
            placeholder="e.g. 45"
            autoComplete="off"
            className={cn(fieldInputClassName, "w-24 shrink-0")}
          />
        </div>
      </div>

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>Patient / family informed of findings</p>
        <ChipGroup
          ariaLabel="Patient / family informed of findings"
          options={CGA_SIGN_OFF_INFORMED_OPTIONS}
          value={informedFindings}
          multi
          onChange={(next) => setField("informedFindings", next)}
        />
      </div>

      <div className={fieldStackClass}>
        <FieldLabel htmlFor="cga-sign-summary-impression">
          Summary impression / key clinical concerns for supervising clinician
        </FieldLabel>
        <textarea
          id="cga-sign-summary-impression"
          value={strValue(values.summaryImpression)}
          onChange={(e) => setField("summaryImpression", e.target.value)}
          placeholder="Document summary impression and key clinical concerns…"
          rows={4}
          className={cgaTextareaClass}
        />
      </div>
    </div>
  );
}

function ProblemListSection({
  problems,
  onProblemsChange,
  callout,
}: {
  problems: CgaProblemRow[];
  onProblemsChange: (next: CgaProblemRow[]) => void;
  callout?: CgaSection["callout"];
}) {
  const rows = ensureProblemRows(problems);

  function updateProblem(id: string, patch: Partial<CgaProblemRow>) {
    onProblemsChange(
      rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {callout ? <MobilityCaution>{callout.body}</MobilityCaution> : null}

      <div className={cn(dashboardCardClass, "overflow-hidden p-0")}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] table-fixed text-left">
            <thead>
              <tr className="border-b border-divider bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th
                  className={cn(
                    fieldLabelClass,
                    "w-12 min-w-0 truncate px-3 py-3 font-medium whitespace-nowrap text-muted-foreground",
                  )}
                >
                  #
                </th>
                <th
                  className={cn(
                    fieldLabelClass,
                    "w-[22%] min-w-0 truncate px-3 py-3 font-medium whitespace-nowrap text-muted-foreground",
                  )}
                >
                  Domain
                </th>
                <th
                  className={cn(
                    fieldLabelClass,
                    "w-[40%] min-w-0 truncate px-3 py-3 font-medium whitespace-nowrap text-muted-foreground",
                  )}
                >
                  Problem / issue identified
                </th>
                <th
                  className={cn(
                    fieldLabelClass,
                    "min-w-0 truncate px-3 py-3 font-medium whitespace-nowrap text-muted-foreground",
                  )}
                >
                  Priority
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const domainMeta = CGA_PROBLEM_DOMAINS.find(
                  (domain) => domain.id === row.domainId,
                );
            return (
                  <tr
                    key={row.id}
                    className="border-b border-divider align-top last:border-0"
                  >
                    <td className="min-w-0 px-3 py-2.5 align-top">
                      <span
                className={cn(
                          typo.bodyM,
                          "tabular-nums text-muted-foreground",
                        )}
                      >
                        {domainMeta?.number ?? ""}
                      </span>
                    </td>
                    <td className="min-w-0 px-3 py-2.5 align-top">
                      <span className={cn(typo.bodyM, "text-foreground")}>
                        {row.domain}
                      </span>
                    </td>
                    <td className="min-w-0 px-3 py-2.5 align-top">
                <input
                        value={row.problem}
                        onChange={(e) =>
                          updateProblem(row.id, { problem: e.target.value })
                        }
                        placeholder=""
                        className={cn(fieldInputClassName, "font-medium")}
                        aria-label={`${row.domain} problem`}
                      />
                    </td>
                    <td className="min-w-0 px-3 py-2.5 align-top">
                      <CgaSelect
                        id={`cga-problem-priority-${row.id}`}
                        aria-label={`${row.domain} priority`}
                        value={row.priority}
                        options={CGA_PROBLEM_PRIORITY_OPTIONS.map((opt) => ({
                          value: opt.id,
                          label: opt.label,
                        }))}
                        onChange={(next) =>
                          updateProblem(row.id, {
                            priority:
                              next === "high" ||
                              next === "medium" ||
                              next === "low"
                                ? next
                                : "",
                          })
                        }
                        placeholder="Select…"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function cognitionDaysUntilDue(lastUpdated: string): number | null {
  if (!lastUpdated.trim()) return null;
  const last = new Date(`${lastUpdated}T00:00:00`);
  if (Number.isNaN(last.getTime())) return null;
  const due = new Date(last);
  due.setMonth(due.getMonth() + CGA_COGNITION_RESCREEN_MONTHS);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

function CognitionSection({
  values,
  onChange,
  callout,
}: {
  values: CgaSectionValues;
  onChange: (next: CgaSectionValues) => void;
  callout?: CgaSection["callout"];
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

  const lastUpdated = strValue(values.cognitionLastUpdated);
  const daysUntilDue = cognitionDaysUntilDue(lastUpdated);
  const dueStatus =
    daysUntilDue == null
      ? "Every 4 months"
      : daysUntilDue > 0
        ? `Every 4 months (Needs to be updated in ${daysUntilDue} days)`
        : daysUntilDue === 0
          ? "Every 4 months (Needs to be updated today)"
          : `Every 4 months (Overdue by ${Math.abs(daysUntilDue)} days)`;

  // Legacy drafts may store MoCA as "26/30" — show the numerator only.
  const mocaStored = strValue(values.moca);
  const moca = mocaStored.includes("/")
    ? (mocaStored.split("/")[0]?.trim() ?? "")
    : mocaStored;

  return (
    <div className="flex flex-col gap-5">
      {callout ? <MobilityCaution>{callout.body}</MobilityCaution> : null}

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h3 className={typo.headingL}>7.1 Screening tool</h3>
          <p className={cn(typo.bodyS, "text-muted-foreground")}>
            Last updated — {dueStatus}
          </p>
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-cognition-last-updated">
            Last updated
          </FieldLabel>
          <CgaDatePicker
            id="cga-cognition-last-updated"
            aria-label="Last updated"
            value={lastUpdated}
            onChange={(next) => setField("cognitionLastUpdated", next)}
          />
        </div>

        <FieldErrorMessage error={limitError ? METRIC_LIMIT_ERROR : null} />

        <div className="flex flex-col gap-3">
          <p className={fieldLabelClass}>GP-Cog (informant score)</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={fieldStackClass}>
              <FieldLabel htmlFor="cga-gpcog-score">Score / 6</FieldLabel>
              <input
                id="cga-gpcog-score"
                type="text"
                inputMode="numeric"
                value={strValue(values.gpcogScore)}
                onChange={(e) => {
                  const result = clampIntMetric(
                    e.target.value,
                    CGA_COGNITION_LIMITS.gpcog.max,
                  );
                  applyMetric(result, (next) => setField("gpcogScore", next));
                }}
                placeholder="0–6"
                autoComplete="off"
                className={fieldInputClassName}
              />
            </div>
            <div className={fieldStackClass}>
              <FieldLabel htmlFor="cga-gpcog-interpretation">
                Interpretation
              </FieldLabel>
              <input
                id="cga-gpcog-interpretation"
                type="text"
                value={strValue(values.gpcogInterpretation)}
                onChange={(e) =>
                  setField("gpcogInterpretation", e.target.value)
                }
                placeholder="Interpretation"
                autoComplete="off"
                className={fieldInputClassName}
              />
            </div>
          </div>
          <MobilityCaution>
            GP-Cog: patient ≤5 and/or informant ≤3 suggests further assessment
            needed.
          </MobilityCaution>
        </div>

        <div className="flex flex-col gap-3">
          <p className={fieldLabelClass}>MoCA (if used)</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={fieldStackClass}>
              <FieldLabel htmlFor="cga-moca">Score / 30</FieldLabel>
              <input
                id="cga-moca"
                type="text"
                inputMode="numeric"
                value={moca}
                onChange={(e) => {
                  const result = clampIntMetric(
                    e.target.value,
                    CGA_COGNITION_LIMITS.moca.max,
                  );
                  applyMetric(result, (next) => setField("moca", next));
                }}
                placeholder="0–30"
                autoComplete="off"
                className={fieldInputClassName}
              />
            </div>
            <div className={fieldStackClass}>
              <FieldLabel htmlFor="cga-moca-interpretation">
                Interpretation
              </FieldLabel>
              <input
                id="cga-moca-interpretation"
                type="text"
                value={strValue(values.mocaInterpretation)}
                onChange={(e) =>
                  setField("mocaInterpretation", e.target.value)
                }
                placeholder="Interpretation"
                autoComplete="off"
                className={fieldInputClassName}
              />
            </div>
          </div>
          <MobilityCaution>
            MoCA: ≥26 normal; 18–25 mild impairment; &lt;18 moderate-severe.
          </MobilityCaution>
        </div>

        <div className="flex flex-col gap-3">
          <p className={fieldLabelClass}>AMTS (if used)</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={fieldStackClass}>
              <FieldLabel htmlFor="cga-amts-score">Score / 10</FieldLabel>
              <input
                id="cga-amts-score"
                type="text"
                inputMode="numeric"
                value={strValue(values.amtsScore)}
                onChange={(e) => {
                  const result = clampIntMetric(
                    e.target.value,
                    CGA_COGNITION_LIMITS.amts.max,
                  );
                  applyMetric(result, (next) => setField("amtsScore", next));
                }}
                placeholder="0–10"
                autoComplete="off"
                className={fieldInputClassName}
              />
            </div>
            <div className={fieldStackClass}>
              <FieldLabel htmlFor="cga-amts-interpretation">
                Interpretation
              </FieldLabel>
              <input
                id="cga-amts-interpretation"
                type="text"
                value={strValue(values.amtsInterpretation)}
                onChange={(e) =>
                  setField("amtsInterpretation", e.target.value)
                }
                placeholder="Interpretation"
                autoComplete="off"
                className={fieldInputClassName}
              />
            </div>
          </div>
          <MobilityCaution>
            AMTS: ≥8 normal; 7 borderline; ≤6 suggests cognitive impairment.
          </MobilityCaution>
        </div>
      </div>

      <div className="flex flex-col gap-5 border-t border-divider pt-5">
        <h3 className={typo.headingL}>7.2 Cognitive observations (any change?)</h3>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Alertness / attention</p>
          <ChipGroup
            ariaLabel="Alertness / attention"
            options={CGA_ALERTNESS_OPTIONS}
            value={strValue(values.alertnessAttention)}
            onChange={(next) =>
                    setField(
                "alertnessAttention",
                typeof next === "string" ? next : "",
              )
            }
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Orientation</p>
          <ChipGroup
            ariaLabel="Orientation"
            options={CGA_COGNITION_ORIENTATION_OPTIONS}
            value={
              Array.isArray(values.cognitionOrientation)
                ? values.cognitionOrientation
                : []
            }
            multi
            onChange={(next) => {
              if (!Array.isArray(next)) {
                setField("cognitionOrientation", next);
                return;
              }
              const prev = Array.isArray(values.cognitionOrientation)
                ? values.cognitionOrientation
                : [];
              if (
                next.includes("fully-oriented") &&
                !prev.includes("fully-oriented")
              ) {
                setField("cognitionOrientation", ["fully-oriented"]);
                return;
              }
              if (next.includes("fully-oriented") && next.length > 1) {
                setField(
                  "cognitionOrientation",
                  next.filter((item) => item !== "fully-oriented"),
                );
                return;
              }
              setField("cognitionOrientation", next);
            }}
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Memory (clinical impression)</p>
          <ChipGroup
            ariaLabel="Memory clinical impression"
            options={CGA_MEMORY_IMPRESSION_OPTIONS}
            value={strValue(values.memoryImpression)}
            onChange={(next) =>
              setField(
                "memoryImpression",
                typeof next === "string" ? next : "",
              )
            }
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Language / communication</p>
          <ChipGroup
            ariaLabel="Language / communication"
            options={CGA_LANGUAGE_COMMUNICATION_OPTIONS}
            value={
              Array.isArray(values.languageCommunication)
                ? values.languageCommunication
                : []
            }
            multi
            onChange={(next) => {
              if (!Array.isArray(next)) {
                setField("languageCommunication", next);
                return;
              }
              const prev = Array.isArray(values.languageCommunication)
                ? values.languageCommunication
                : [];
              if (next.includes("normal") && !prev.includes("normal")) {
                setField("languageCommunication", ["normal"]);
                return;
              }
              if (next.includes("normal") && next.length > 1) {
                setField(
                  "languageCommunication",
                  next.filter((item) => item !== "normal"),
                );
                return;
              }
              setField("languageCommunication", next);
            }}
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Informant report (last 12 months)</p>
          <ChipGroup
            ariaLabel="Informant report last 12 months"
            options={CGA_INFORMANT_REPORT_OPTIONS}
            value={strValue(values.informantReport)}
            onChange={(next) =>
              setField("informantReport", typeof next === "string" ? next : "")
            }
          />
      </div>

      <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Delirium risk</p>
          <ChipGroup
            ariaLabel="Delirium risk"
            options={CGA_DELIRIUM_RISK_OPTIONS}
            value={strValue(values.deliriumRisk)}
            onChange={(next) =>
              setField("deliriumRisk", typeof next === "string" ? next : "")
            }
          />
          <MobilityCaution>
            Use 4AT for rapid delirium screen if acute confusion present.
            Delirium = acute onset + inattention + fluctuating course.
          </MobilityCaution>
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-cognitive-observations">
            Cognitive assessment detail / clinical observations
          </FieldLabel>
          <textarea
            id="cga-cognitive-observations"
            value={strValue(values.cognitiveObservations)}
            onChange={(e) =>
              setField("cognitiveObservations", e.target.value)
            }
            placeholder="Document cognitive assessment detail and clinical observations…"
            rows={4}
            className={cgaTextareaClass}
          />
        </div>
      </div>
    </div>
  );
}

function MobilityCaution({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-cga-callout=""
      className={cn(
        radius.md,
        "flex items-start gap-3 bg-warning-muted px-4 py-3",
      )}
      role="note"
    >
      <AppIcon
        icon={Alert02Icon}
        size={BADGE_ICON_SIZE}
        className="mt-0.5 shrink-0 text-warning"
      />
      <p className={cn(typo.bodyS, "text-warning")}>{children}</p>
    </div>
  );
}

function MobilityFallsSection({
  values,
  onChange,
  callout,
}: {
  values: CgaSectionValues;
  onChange: (next: CgaSectionValues) => void;
  callout?: CgaSection["callout"];
}) {
  const falls12m = strValue(values.falls12m);
  const hasFalls = falls12m === "one" || falls12m === "twoPlus";
  const circumstances = Array.isArray(values.fallsCircumstances)
    ? values.fallsCircumstances
    : [];
  const consequences = Array.isArray(values.fallsConsequences)
    ? values.fallsConsequences
    : [];
  const fearOfFalling = strValue(values.fearOfFalling);
  const visitParamsChecked = values.mobilityVisitParams === "true";
  const walkingAids = Array.isArray(values.walkingAids)
    ? values.walkingAids
    : [];
  const outdoorMobility = strValue(values.outdoorMobility);
  const chairStand = strValue(values.chairStand);
  const gaitPattern = Array.isArray(values.gaitPattern)
    ? values.gaitPattern
    : [];
  const balanceImpression = strValue(values.balanceImpression);
  const environmentalHazards = Array.isArray(values.environmentalHazards)
    ? values.environmentalHazards
    : [];

  function setField(id: string, next: string | string[]) {
    onChange({ ...values, [id]: next });
  }

  function setMultiWithNoneExclusive(
    id: string,
    next: string | string[],
  ) {
    if (!Array.isArray(next)) {
      setField(id, next);
      return;
    }
    const prev = Array.isArray(values[id]) ? (values[id] as string[]) : [];
    if (next.includes("none") && !prev.includes("none")) {
      setField(id, ["none"]);
      return;
    }
    if (next.includes("none") && next.length > 1) {
      setField(
        id,
        next.filter((item) => item !== "none"),
      );
      return;
    }
    setField(id, next);
  }

  function setMultiWithNormalExclusive(
    id: string,
    next: string | string[],
  ) {
    if (!Array.isArray(next)) {
      setField(id, next);
      return;
    }
    const prev = Array.isArray(values[id]) ? (values[id] as string[]) : [];
    if (next.includes("normal") && !prev.includes("normal")) {
      setField(id, ["normal"]);
      return;
    }
    if (next.includes("normal") && next.length > 1) {
      setField(
        id,
        next.filter((item) => item !== "normal"),
      );
      return;
    }
    setField(id, next);
  }

  return (
    <div className="flex flex-col gap-5">
      {callout ? (
        <MobilityCaution>{callout.body}</MobilityCaution>
      ) : null}

      <div className="flex flex-col gap-5">
        <h3 className={typo.headingL}>5.1 Falls history</h3>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Falls in last 12 months</p>
          <ChipGroup
            ariaLabel="Falls in last 12 months"
            options={CGA_FALLS_12M_OPTIONS}
            value={falls12m}
            onChange={(next) => {
              const value = typeof next === "string" ? next : "";
              if (value === "none" || value === "") {
                onChange({
                  ...values,
                  falls12m: value || "none",
                  fallsCircumstances: [],
                  lastFall: "",
                  medicalAttentionSought: "",
                });
                return;
              }
              setField("falls12m", value);
            }}
          />
        </div>

        <CgaRevealDetails open={hasFalls}>
          <div className="flex flex-col gap-5">
            <div className={fieldStackClass}>
              <p className={fieldLabelClass}>
                If falls occurred - circumstances
              </p>
              <ChipGroup
                ariaLabel="If falls occurred - circumstances"
                options={CGA_FALLS_CIRCUMSTANCES_OPTIONS}
                value={circumstances}
                multi
                onChange={(next) => setField("fallsCircumstances", next)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className={fieldStackClass}>
                <FieldLabel htmlFor="cga-last-fall">
                  Last fall (date / approximate)
                </FieldLabel>
        <input
                  id="cga-last-fall"
          type="text"
                  value={strValue(values.lastFall)}
                  onChange={(e) => setField("lastFall", e.target.value)}
                  placeholder="e.g. Mar 2026 or ~3 weeks ago"
                  autoComplete="off"
                  className={fieldInputClassName}
        />
      </div>

              <div className={fieldStackClass}>
                <FieldLabel htmlFor="cga-medical-attention">
                  Was medical attention sought?
                </FieldLabel>
                <input
                  id="cga-medical-attention"
                  type="text"
                  value={strValue(values.medicalAttentionSought)}
                  onChange={(e) =>
                    setField("medicalAttentionSought", e.target.value)
                  }
                  placeholder="e.g. Yes - ED visit / No / GP review"
                  autoComplete="off"
                  className={fieldInputClassName}
                />
              </div>
            </div>
          </div>
        </CgaRevealDetails>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Consequences of falls</p>
          <ChipGroup
            ariaLabel="Consequences of falls"
            options={CGA_FALLS_CONSEQUENCES_OPTIONS}
            value={consequences}
            multi
            onChange={(next) =>
              setMultiWithNoneExclusive("fallsConsequences", next)
            }
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Fear of falling</p>
          <ChipGroup
            ariaLabel="Fear of falling"
            options={CGA_FEAR_OF_FALLING_OPTIONS}
            value={fearOfFalling}
            onChange={(next) =>
              setField("fearOfFalling", typeof next === "string" ? next : "")
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 border-t border-divider pt-5">
        <h3 className={typo.headingL}>5.2 Mobility assessment</h3>

        <section className={cn(dashboardCardClass, "p-5")}>
          <button
            type="button"
            role="checkbox"
            aria-checked={visitParamsChecked}
            aria-required="true"
            onClick={() =>
              setField(
                "mobilityVisitParams",
                visitParamsChecked ? "false" : "true",
              )
            }
            className={cn(
              "flex w-full items-center gap-3 text-left transition-colors",
              "rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            )}
          >
            <CheckboxIndicator checked={visitParamsChecked} />
            <span className={cn(typo.bodyM, "font-medium text-foreground")}>
              Visit parameters recorded for this assessment
              <span className="text-destructive"> *</span>
            </span>
          </button>
    </section>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Walking aids</p>
          <ChipGroup
            ariaLabel="Walking aids"
            options={CGA_WALKING_AIDS_OPTIONS}
            value={walkingAids}
            multi
            onChange={(next) =>
              setMultiWithNoneExclusive("walkingAids", next)
            }
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Outdoor mobility</p>
          <ChipGroup
            ariaLabel="Outdoor mobility"
            options={CGA_OUTDOOR_MOBILITY_OPTIONS}
            value={outdoorMobility}
            onChange={(next) =>
              setField("outdoorMobility", typeof next === "string" ? next : "")
            }
          />
        </div>

        <div className="flex flex-col gap-3">
          <p className={fieldLabelClass}>Timed Up and Go (TUG)</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={fieldStackClass}>
              <FieldLabel htmlFor="cga-tug-time">Time (secs)</FieldLabel>
              <input
                id="cga-tug-time"
                type="text"
                inputMode="decimal"
                value={strValue(values.tugTime)}
                onChange={(e) => setField("tugTime", e.target.value)}
                placeholder="secs"
                autoComplete="off"
                className={fieldInputClassName}
              />
            </div>
            <div className={fieldStackClass}>
              <FieldLabel htmlFor="cga-tug-interpretation">
                Interpretation
              </FieldLabel>
              <input
                id="cga-tug-interpretation"
                type="text"
                value={strValue(values.tugInterpretation)}
                onChange={(e) => setField("tugInterpretation", e.target.value)}
                placeholder="Interpretation"
                autoComplete="off"
                className={fieldInputClassName}
              />
            </div>
          </div>
          <MobilityCaution>
            Normal &lt;12 secs (age 65-99). &gt;12 secs: mobility impairment.
            Note: only perform if the patient can walk without aid.
          </MobilityCaution>
        </div>

        <div className="flex flex-col gap-3">
          <p className={fieldLabelClass}>180-degree turn test</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={fieldStackClass}>
              <FieldLabel htmlFor="cga-turn-steps">Steps to turn</FieldLabel>
              <input
                id="cga-turn-steps"
                type="text"
                inputMode="numeric"
                value={strValue(values.turnSteps)}
                onChange={(e) => setField("turnSteps", e.target.value)}
                placeholder="steps"
                autoComplete="off"
                className={fieldInputClassName}
              />
            </div>
            <div className={fieldStackClass}>
              <FieldLabel htmlFor="cga-turn-interpretation">
                Interpretation
              </FieldLabel>
              <input
                id="cga-turn-interpretation"
                type="text"
                value={strValue(values.turnInterpretation)}
                onChange={(e) =>
                  setField("turnInterpretation", e.target.value)
                }
                placeholder="Interpretation"
                autoComplete="off"
                className={fieldInputClassName}
              />
            </div>
          </div>
          <MobilityCaution>
            ≥5 steps: increased falls risk / balance impairment.
          </MobilityCaution>
        </div>

        <div className="flex flex-col gap-3">
          <p className={fieldLabelClass}>Gait speed (4 metres)</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={fieldStackClass}>
              <FieldLabel htmlFor="cga-gait-time">Time (secs)</FieldLabel>
              <input
                id="cga-gait-time"
                type="text"
                inputMode="decimal"
                value={strValue(values.gaitSpeedTime)}
                onChange={(e) => setField("gaitSpeedTime", e.target.value)}
                placeholder="secs"
                autoComplete="off"
                className={fieldInputClassName}
              />
            </div>
            <div className={fieldStackClass}>
              <FieldLabel htmlFor="cga-gait-interpretation">
                Interpretation
              </FieldLabel>
              <input
                id="cga-gait-interpretation"
                type="text"
                value={strValue(values.gaitSpeedInterpretation)}
                onChange={(e) =>
                  setField("gaitSpeedInterpretation", e.target.value)
                }
                placeholder="Interpretation"
                autoComplete="off"
                className={fieldInputClassName}
              />
            </div>
          </div>
          <MobilityCaution>
            &gt;5 secs (i.e. &lt;0.8 m/s): slow gait speed - higher falls and
            mortality risk.
          </MobilityCaution>
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Chair stand (without arms)</p>
          <ChipGroup
            ariaLabel="Chair stand without arms"
            options={CGA_CHAIR_STAND_OPTIONS}
            value={chairStand}
            onChange={(next) =>
              setField("chairStand", typeof next === "string" ? next : "")
            }
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Gait pattern observed</p>
          <ChipGroup
            ariaLabel="Gait pattern observed"
            options={CGA_GAIT_PATTERN_OPTIONS}
            value={gaitPattern}
            multi
            onChange={(next) =>
              setMultiWithNormalExclusive("gaitPattern", next)
            }
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Balance (clinical impression)</p>
          <ChipGroup
            ariaLabel="Balance clinical impression"
            options={CGA_BALANCE_IMPRESSION_OPTIONS}
            value={balanceImpression}
            onChange={(next) =>
              setField(
                "balanceImpression",
                typeof next === "string" ? next : "",
              )
            }
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-mobility-observations">
            Mobility / gait / falls observations
          </FieldLabel>
          <textarea
            id="cga-mobility-observations"
            value={strValue(values.mobilityObservations)}
            onChange={(e) => setField("mobilityObservations", e.target.value)}
            placeholder="Document mobility, gait, and falls observations…"
            rows={4}
            className={cgaTextareaClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 border-t border-divider pt-5">
        <div className="flex flex-col gap-1">
          <h3 className={typo.headingL}>
            5.3 Environmental fall hazards observed
          </h3>
          <p className={cn(typo.caption, "text-muted-foreground")}>
            If highlighted
          </p>
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Hazards</p>
          <ChipGroup
            ariaLabel="Environmental fall hazards"
            options={CGA_ENVIRONMENTAL_HAZARDS_OPTIONS}
            value={environmentalHazards}
            multi
            onChange={(next) =>
              setMultiWithNoneExclusive("environmentalHazards", next)
            }
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-environmental-observations">
            Environmental observations / recommendations
          </FieldLabel>
          <textarea
            id="cga-environmental-observations"
            value={strValue(values.environmentalObservations)}
            onChange={(e) =>
              setField("environmentalObservations", e.target.value)
            }
            placeholder="Document environmental observations and recommendations…"
            rows={4}
            className={cgaTextareaClass}
          />
        </div>
      </div>
    </div>
  );
}

function BoneHealthSection({
  values,
  onChange,
}: {
  values: CgaSectionValues;
  onChange: (next: CgaSectionValues) => void;
}) {
  const fragility = Array.isArray(values.fragilityFractureHistory)
    ? values.fragilityFractureHistory
    : [];
  const osteoporosisDiagnosis = strValue(values.osteoporosisDiagnosis);
  const riskFactors = Array.isArray(values.boneRiskFactors)
    ? values.boneRiskFactors
    : [];
  const treatment = Array.isArray(values.boneTreatment)
    ? values.boneTreatment
    : [];

  function setField(id: string, next: string | string[]) {
    onChange({ ...values, [id]: next });
  }

  function setMultiWithExclusiveIds(
    id: string,
    next: string | string[],
    exclusiveIds: readonly string[],
  ) {
    if (!Array.isArray(next)) {
      setField(id, next);
      return;
    }
    const prev = Array.isArray(values[id]) ? (values[id] as string[]) : [];
    for (const exclusive of exclusiveIds) {
      if (next.includes(exclusive) && !prev.includes(exclusive)) {
        setField(id, [exclusive]);
        return;
      }
    }
    if (
      next.some((item) => exclusiveIds.includes(item)) &&
      next.length > 1
    ) {
      setField(
        id,
        next.filter((item) => !exclusiveIds.includes(item)),
      );
      return;
    }
    setField(id, next);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>Fragility fracture history</p>
        <ChipGroup
          ariaLabel="Fragility fracture history"
          options={CGA_FRAGILITY_FRACTURE_OPTIONS}
          value={fragility}
          multi
          onChange={(next) =>
            setMultiWithExclusiveIds("fragilityFractureHistory", next, ["none"])
          }
        />
        <FieldOtherDetails
          fieldId="fragilityFractureHistory"
          fieldLabel="Other low-impact fracture"
          open={fragility.includes("other")}
          value={strValue(values.fragilityFractureOther)}
          onChange={(next) => setField("fragilityFractureOther", next)}
        />
      </div>

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>Osteoporosis diagnosis</p>
        <ChipGroup
          ariaLabel="Osteoporosis diagnosis"
          options={CGA_OSTEOPOROSIS_DIAGNOSIS_OPTIONS}
          value={osteoporosisDiagnosis}
          onChange={(next) =>
            setField(
              "osteoporosisDiagnosis",
              typeof next === "string" ? next : "",
            )
          }
        />
      </div>

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>Risk factors</p>
        <ChipGroup
          ariaLabel="Risk factors"
          options={CGA_BONE_RISK_FACTOR_OPTIONS}
          value={riskFactors}
          multi
          onChange={(next) => setField("boneRiskFactors", next)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-frax-score">
            FRAX / QFracture score (if available)
          </FieldLabel>
          <input
            id="cga-frax-score"
            type="text"
            value={strValue(values.fraxScore)}
            onChange={(e) => setField("fraxScore", e.target.value)}
            placeholder="e.g. FRAX major 18%"
            autoComplete="off"
            className={fieldInputClassName}
          />
        </div>
        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-dxa-result">
            DXA result (if available)
          </FieldLabel>
          <input
            id="cga-dxa-result"
            type="text"
            value={strValue(values.dxaResult)}
            onChange={(e) => setField("dxaResult", e.target.value)}
            placeholder="e.g. T-score -2.7 spine"
            autoComplete="off"
            className={fieldInputClassName}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-serum-calcium">Serum calcium</FieldLabel>
          <input
            id="cga-serum-calcium"
            type="text"
            value={strValue(values.serumCalcium)}
            onChange={(e) => setField("serumCalcium", e.target.value)}
            placeholder="e.g. 2.35 mmol/L"
            autoComplete="off"
            className={fieldInputClassName}
          />
        </div>
        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-alkaline-phosphatase">
            Alkaline phosphatase
          </FieldLabel>
          <input
            id="cga-alkaline-phosphatase"
            type="text"
            value={strValue(values.alkalinePhosphatase)}
            onChange={(e) => setField("alkalinePhosphatase", e.target.value)}
            placeholder="e.g. 95 U/L"
            autoComplete="off"
            className={fieldInputClassName}
          />
        </div>
        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-vitamin-d">Vitamin D (25-OH)</FieldLabel>
          <input
            id="cga-vitamin-d"
            type="text"
            value={strValue(values.vitaminD)}
            onChange={(e) => setField("vitaminD", e.target.value)}
            placeholder="e.g. 48 nmol/L"
            autoComplete="off"
            className={fieldInputClassName}
          />
        </div>
      </div>

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>Current bone health treatment</p>
        <ChipGroup
          ariaLabel="Current bone health treatment"
          options={CGA_BONE_TREATMENT_OPTIONS}
          value={treatment}
          multi
          onChange={(next) =>
            setMultiWithExclusiveIds("boneTreatment", next, [
              "none",
              "not-assessed",
            ])
          }
        />
        <FieldOtherDetails
          fieldId="boneTreatment"
          fieldLabel="Other treatment"
          open={treatment.includes("other")}
          value={strValue(values.boneTreatmentOther)}
          onChange={(next) => setField("boneTreatmentOther", next)}
        />
      </div>

      <div className={fieldStackClass}>
        <FieldLabel htmlFor="cga-bone-health-plan">
          Bone health assessment / plan
        </FieldLabel>
        <textarea
          id="cga-bone-health-plan"
          value={strValue(values.boneHealthPlan)}
          onChange={(e) => setField("boneHealthPlan", e.target.value)}
          placeholder="Document assessment findings and bone health plan…"
          rows={4}
          className={cgaTextareaClass}
        />
      </div>
    </div>
  );
}

function PsychologicalAssessmentSection({
  values,
  onChange,
  callout,
}: {
  values: CgaSectionValues;
  onChange: (next: CgaSectionValues) => void;
  callout?: CgaSection["callout"];
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

  return (
    <div className="flex flex-col gap-5">
      {callout ? <MobilityCaution>{callout.body}</MobilityCaution> : null}

      <div className="flex flex-col gap-3">
        <p className={fieldLabelClass}>
          Geriatric Depression Scale - GDS-15
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className={fieldStackClass}>
            <FieldLabel htmlFor="cga-gds15-score">Score / 15</FieldLabel>
            <input
              id="cga-gds15-score"
              type="text"
              inputMode="numeric"
              value={strValue(values.gds15Score)}
              onChange={(e) => {
                const result = clampIntMetric(
                  e.target.value,
                  CGA_GDS15_LIMITS.max,
                );
                applyMetric(result, (next) => setField("gds15Score", next));
              }}
              placeholder="0–15"
              autoComplete="off"
              className={fieldInputClassName}
            />
      </div>
          <div className={fieldStackClass}>
            <FieldLabel htmlFor="cga-gds15-interpretation">
              Interpretation
            </FieldLabel>
            <input
              id="cga-gds15-interpretation"
              type="text"
              value={strValue(values.gds15Interpretation)}
              onChange={(e) =>
                setField("gds15Interpretation", e.target.value)
              }
              placeholder="Interpretation"
              autoComplete="off"
              className={fieldInputClassName}
            />
          </div>
        </div>
        <FieldErrorMessage error={limitError ? METRIC_LIMIT_ERROR : null} />
        <MobilityCaution>
          GDS-15: 0–4 normal; 5–8 mild; 9–11 moderate; 12–15 severe depression.
        </MobilityCaution>
      </div>

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>PHQ-2 screen (if GDS not used)</p>
        <ChipGroup
          ariaLabel="PHQ-2 screen"
          options={CGA_PHQ2_SCREEN_OPTIONS}
          value={strValue(values.phq2Screen)}
          onChange={(next) =>
            setField("phq2Screen", typeof next === "string" ? next : "")
          }
        />
      </div>

      <div className="flex flex-col gap-5 border-t border-divider pt-5">
        <h3 className={typo.headingL}>8.1 Mood observations</h3>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Affect</p>
          <ChipGroup
            ariaLabel="Affect"
            options={CGA_AFFECT_OPTIONS}
            value={Array.isArray(values.affect) ? values.affect : []}
            multi
            onChange={(next) => setField("affect", next)}
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Psychomotor</p>
          <ChipGroup
            ariaLabel="Psychomotor"
            options={CGA_PSYCHOMOTOR_OPTIONS}
            value={strValue(values.psychomotor)}
            onChange={(next) =>
              setField("psychomotor", typeof next === "string" ? next : "")
            }
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Sleep</p>
          <ChipGroup
            ariaLabel="Sleep"
            options={CGA_SLEEP_OPTIONS}
            value={Array.isArray(values.sleep) ? values.sleep : []}
            multi
            onChange={(next) => {
              if (!Array.isArray(next)) {
                setField("sleep", next);
                return;
              }
              const prev = Array.isArray(values.sleep) ? values.sleep : [];
              if (next.includes("normal") && !prev.includes("normal")) {
                setField("sleep", ["normal"]);
                return;
              }
              if (next.includes("normal") && next.length > 1) {
                setField(
                  "sleep",
                  next.filter((item) => item !== "normal"),
                );
                return;
              }
              setField("sleep", next);
            }}
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Suicidal ideation</p>
          <ChipGroup
            ariaLabel="Suicidal ideation"
            options={CGA_SUICIDAL_IDEATION_OPTIONS}
            value={strValue(values.suicidalIdeation)}
            onChange={(next) =>
              setField("suicidalIdeation", typeof next === "string" ? next : "")
            }
          />
          <MobilityCaution>
            Risk factors for suicide in older people: male gender, social
            isolation, bereavement, chronic pain, alcohol use, previous
            attempts.
          </MobilityCaution>
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Anxiety</p>
          <ChipGroup
            ariaLabel="Anxiety"
            options={CGA_ANXIETY_OPTIONS}
            value={strValue(values.anxiety)}
            onChange={(next) =>
              setField("anxiety", typeof next === "string" ? next : "")
            }
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Loneliness / isolation</p>
          <ChipGroup
            ariaLabel="Loneliness / isolation"
            options={CGA_LONELINESS_OPTIONS}
            value={strValue(values.lonelinessIsolation)}
            onChange={(next) =>
              setField(
                "lonelinessIsolation",
                typeof next === "string" ? next : "",
              )
            }
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-psychological-plan">
            Psychological observations / management plan
          </FieldLabel>
          <textarea
            id="cga-psychological-plan"
            value={strValue(values.psychologicalPlan)}
            onChange={(e) => setField("psychologicalPlan", e.target.value)}
            placeholder="Document psychological observations and management plan…"
            rows={4}
            className={cgaTextareaClass}
          />
        </div>
      </div>
    </div>
  );
}

function FrailtyFlagsSection({
  values,
  onChange,
  callout,
}: {
  values: CgaSectionValues;
  onChange: (next: CgaSectionValues) => void;
  callout?: CgaSection["callout"];
}) {
  const frailtyFlags = Array.isArray(values.frailtyFlags)
    ? values.frailtyFlags
    : [];

  return (
    <div className="flex flex-col gap-5">
      {callout ? <MobilityCaution>{callout.body}</MobilityCaution> : null}

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>Flags present</p>
        <ChipGroup
          ariaLabel="Frailty syndrome summary flags"
          options={CGA_FRAILTY_FLAG_OPTIONS}
          value={frailtyFlags}
          multi
          onChange={(next) =>
            onChange({ ...values, frailtyFlags: next })
          }
        />
      </div>
    </div>
  );
}

function CarePlanSection({
  values,
  onChange,
  carePlanActions,
  onCarePlanActionsChange,
  carePlanReferrals,
  onCarePlanReferralsChange,
  callout,
}: {
  values: CgaSectionValues;
  onChange: (next: CgaSectionValues) => void;
  carePlanActions: CgaCarePlanActionRow[];
  onCarePlanActionsChange: (next: CgaCarePlanActionRow[]) => void;
  carePlanReferrals: CgaCarePlanReferralRow[];
  onCarePlanReferralsChange: (next: CgaCarePlanReferralRow[]) => void;
  callout?: CgaSection["callout"];
}) {
  const actionRows = ensureCarePlanActionRows(carePlanActions);
  const referralRows = ensureCarePlanReferralRows(carePlanReferrals);

  function setField(id: string, next: string) {
    onChange({ ...values, [id]: next });
  }

  function updateAction(
    id: string,
    patch: Partial<CgaCarePlanActionRow>,
  ) {
    onCarePlanActionsChange(
      actionRows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  function updateReferral(
    id: string,
    patch: Partial<CgaCarePlanReferralRow>,
  ) {
    onCarePlanReferralsChange(
      referralRows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {callout ? <MobilityCaution>{callout.body}</MobilityCaution> : null}

      <div className="flex flex-col gap-5">
        <h3 className={typo.headingL}>18.1 What matters most to the patient</h3>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-patient-goal-1">
            Patient&apos;s goals in their own words (Goal 1)
          </FieldLabel>
          <textarea
            id="cga-patient-goal-1"
            value={strValue(values.patientGoal1)}
            onChange={(e) => setField("patientGoal1", e.target.value)}
            placeholder="Document the patient's first goal in their own words…"
            rows={4}
            className={cgaTextareaClass}
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-patient-goal-2">
            Patient&apos;s goals in their own words (Goal 2)
          </FieldLabel>
          <textarea
            id="cga-patient-goal-2"
            value={strValue(values.patientGoal2)}
            onChange={(e) => setField("patientGoal2", e.target.value)}
            placeholder="Document the patient's second goal in their own words…"
            rows={4}
            className={cgaTextareaClass}
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-family-carer-priorities">
            Family / carer concerns and priorities
          </FieldLabel>
          <textarea
            id="cga-family-carer-priorities"
            value={strValue(values.familyCarerPriorities)}
            onChange={(e) => setField("familyCarerPriorities", e.target.value)}
            placeholder="Document family or carer concerns and priorities…"
            rows={4}
            className={cgaTextareaClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-divider pt-5">
        <h3 className={typo.headingL}>18.2 Action plan</h3>
        <div className={cn(dashboardCardClass, "overflow-hidden p-0")}>
      <div className="overflow-x-auto">
            <table className="w-full min-w-[56rem] table-fixed text-left">
          <thead>
            <tr className="border-b border-divider bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th
                    className={cn(
                      fieldLabelClass,
                      "w-12 min-w-0 truncate px-3 py-3 font-medium whitespace-nowrap text-muted-foreground",
                    )}
                  >
                    #
                  </th>
                  <th
                    className={cn(
                      fieldLabelClass,
                      "w-[32%] min-w-0 truncate px-3 py-3 font-medium whitespace-nowrap text-muted-foreground",
                    )}
                  >
                    Action / intervention
                  </th>
                  <th
                    className={cn(
                      fieldLabelClass,
                      "w-[20%] min-w-0 truncate px-3 py-3 font-medium whitespace-nowrap text-muted-foreground",
                    )}
                  >
                    Responsible person
                  </th>
                  <th
                    className={cn(
                      fieldLabelClass,
                      "w-[22%] min-w-0 truncate px-3 py-3 font-medium whitespace-nowrap text-muted-foreground",
                    )}
                  >
                    Timeframe
                  </th>
                  <th
                    className={cn(
                      fieldLabelClass,
                      "min-w-0 truncate px-3 py-3 font-medium whitespace-nowrap text-muted-foreground",
                    )}
                  >
                    Status
              </th>
            </tr>
          </thead>
          <tbody>
                {actionRows.map((row) => (
              <tr
                key={row.id}
                    className="border-b border-divider align-top last:border-0"
              >
                    <td className="min-w-0 px-3 py-2.5 align-top">
                  <span
                    className={cn(
                      typo.bodyM,
                          "tabular-nums text-muted-foreground",
                    )}
                  >
                        {row.number}
                  </span>
                </td>
                    <td className="min-w-0 px-3 py-2.5 align-top">
                      <div className="flex min-w-0 flex-col gap-2">
                        <CgaSelect
                          id={`cga-care-action-${row.id}`}
                          aria-label={`Action ${row.number}`}
                          value={row.action}
                          options={CGA_CARE_PLAN_ACTION_OPTIONS.map((opt) => ({
                            value: opt.id,
                            label: opt.label,
                          }))}
                          onChange={(next) =>
                            updateAction(row.id, {
                              action: next,
                              ...(next === "other"
                                ? {}
                                : { actionOther: "" }),
                            })
                          }
                          placeholder="Select…"
                        />
                        <CgaRevealDetails open={row.action === "other"}>
                  <input
                            value={row.actionOther}
                    onChange={(e) =>
                              updateAction(row.id, {
                                actionOther: e.target.value,
                              })
                    }
                            placeholder="Describe action / intervention"
                    className={cn(cgaTableInputClass, "font-medium")}
                            aria-label={`Action ${row.number} other`}
                  />
                        </CgaRevealDetails>
                      </div>
                </td>
                    <td className="min-w-0 px-3 py-2.5 align-top">
                      <CgaSelect
                        id={`cga-care-responsible-${row.id}`}
                        aria-label={`Responsible person ${row.number}`}
                        value={row.responsible}
                        options={CGA_CARE_PLAN_RESPONSIBLE_OPTIONS.map(
                          (opt) => ({
                            value: opt.id,
                            label: opt.label,
                          }),
                        )}
                        onChange={(next) =>
                          updateAction(row.id, {
                            responsible:
                              next === "patient" ||
                              next === "doctor" ||
                              next === "carer" ||
                              next === "nurse"
                                ? next
                                : "",
                          })
                        }
                        placeholder="Select…"
                  />
                </td>
                    <td className="min-w-0 px-3 py-2.5 align-top">
                      <CgaDatePicker
                        id={`cga-care-timeframe-${row.id}`}
                        aria-label={`Timeframe ${row.number}`}
                        value={row.timeframe}
                        onChange={(next) =>
                          updateAction(row.id, { timeframe: next })
                        }
                      />
                    </td>
                    <td className="min-w-0 px-3 py-2.5 align-top">
                      <CgaSelect
                        id={`cga-care-status-${row.id}`}
                        aria-label={`Status ${row.number}`}
                        value={row.status}
                        options={CGA_CARE_PLAN_ACTION_STATUS_OPTIONS.map(
                          (opt) => ({
                            value: opt.id,
                            label: opt.label,
                          }),
                        )}
                        onChange={(next) =>
                          updateAction(row.id, {
                            status:
                              next === "high" ||
                              next === "medium" ||
                              next === "low"
                                ? next
                                : "",
                          })
                        }
                        placeholder="Priority…"
                      />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-divider pt-5">
        <h3 className={typo.headingL}>18.3 Referrals made / planned</h3>
        <div className={cn(dashboardCardClass, "overflow-hidden p-0")}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] table-fixed text-left">
              <thead>
                <tr className="border-b border-divider bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th
          className={cn(
                      fieldLabelClass,
                      "w-[28%] min-w-0 truncate px-3 py-3 font-medium whitespace-nowrap text-muted-foreground",
                    )}
                  >
                    Referral to
                  </th>
                  <th
                    className={cn(
                      fieldLabelClass,
                      "w-[30%] min-w-0 truncate px-3 py-3 font-medium whitespace-nowrap text-muted-foreground",
                    )}
                  >
                    Reason
                  </th>
                  <th
                    className={cn(
                      fieldLabelClass,
                      "w-[18%] min-w-0 truncate px-3 py-3 font-medium whitespace-nowrap text-muted-foreground",
                    )}
                  >
                    Urgency
                  </th>
                  <th
                    className={cn(
                      fieldLabelClass,
                      "min-w-0 truncate px-3 py-3 font-medium whitespace-nowrap text-muted-foreground",
                    )}
                  >
                    Date sent
                  </th>
                </tr>
              </thead>
              <tbody>
                {referralRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-divider align-top last:border-0"
                  >
                    <td className="min-w-0 px-3 py-2.5 align-top">
                      <div className="flex min-w-0 flex-col gap-2">
                        <CgaSelect
                          id={`cga-care-referral-to-${row.id}`}
                          aria-label={`Referral to ${row.number}`}
                          value={row.referralTo}
                          options={CGA_CARE_PLAN_REFERRAL_TO_OPTIONS.map(
                            (opt) => ({
                              value: opt.id,
                              label: opt.label,
                            }),
                          )}
                          onChange={(next) =>
                            updateReferral(row.id, {
                              referralTo: next,
                              ...(next === "other"
                                ? {}
                                : { referralToOther: "" }),
                            })
                          }
                          placeholder="Select…"
                        />
                        <CgaRevealDetails open={row.referralTo === "other"}>
                          <input
                            value={row.referralToOther}
                            onChange={(e) =>
                              updateReferral(row.id, {
                                referralToOther: e.target.value,
                              })
                            }
                            placeholder="Specify referral destination"
                            className={cn(cgaTableInputClass, "font-medium")}
                            aria-label={`Referral to ${row.number} other`}
                          />
                        </CgaRevealDetails>
      </div>
                    </td>
                    <td className="min-w-0 px-3 py-2.5 align-top">
                      <input
                        value={row.reason}
                        onChange={(e) =>
                          updateReferral(row.id, { reason: e.target.value })
                        }
                        placeholder="Reason"
                        className={cn(cgaTableInputClass, "font-medium")}
                        aria-label={`Referral reason ${row.number}`}
                      />
                    </td>
                    <td className="min-w-0 px-3 py-2.5 align-top">
                      <CgaSelect
                        id={`cga-care-referral-urgency-${row.id}`}
                        aria-label={`Referral urgency ${row.number}`}
                        value={row.urgency}
                        options={CGA_CARE_PLAN_REFERRAL_URGENCY_OPTIONS.map(
                          (opt) => ({
                            value: opt.id,
                            label: opt.label,
                          }),
                        )}
                        onChange={(next) =>
                          updateReferral(row.id, {
                            urgency:
                              next === "routine" ||
                              next === "soon" ||
                              next === "urgent"
                                ? next
                                : "",
                          })
                        }
                        placeholder="Select…"
                      />
                    </td>
                    <td className="min-w-0 px-3 py-2.5 align-top">
                      <CgaDatePicker
                        id={`cga-care-referral-date-${row.id}`}
                        aria-label={`Date sent ${row.number}`}
                        value={row.dateSent}
                        onChange={(next) =>
                          updateReferral(row.id, { dateSent: next })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 border-t border-divider pt-5">
        <h3 className={typo.headingL}>18.4 Escalation plan</h3>
        <MobilityCaution>
          Document clearly so patient, family and carer know what to do if
          condition changes between reviews.
        </MobilityCaution>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-escalation-gp">
            Signs / symptoms requiring prompt GP or specialist contact
          </FieldLabel>
          <textarea
            id="cga-escalation-gp"
            value={strValue(values.escalationGpContact)}
            onChange={(e) => setField("escalationGpContact", e.target.value)}
            placeholder="Document signs or symptoms requiring prompt GP or specialist contact…"
            rows={4}
            className={cgaTextareaClass}
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-escalation-emergency">
            Signs / symptoms requiring emergency services (999 / ambulance)
          </FieldLabel>
          <textarea
            id="cga-escalation-emergency"
            value={strValue(values.escalationEmergency)}
            onChange={(e) => setField("escalationEmergency", e.target.value)}
            placeholder="Document signs or symptoms requiring emergency services…"
            rows={4}
            className={cgaTextareaClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 border-t border-divider pt-5">
        <h3 className={typo.headingL}>18.5 Review plan</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className={fieldStackClass}>
            <FieldLabel htmlFor="cga-next-scheduled-review">
              Next scheduled review
            </FieldLabel>
            <CgaDatePicker
              id="cga-next-scheduled-review"
              aria-label="Next scheduled review"
              value={strValue(values.nextScheduledReview)}
              onChange={(next) => setField("nextScheduledReview", next)}
            />
          </div>
          <div className={fieldStackClass}>
            <p className={fieldLabelClass}>
              Review type (home visit / teleconsult / clinic)
            </p>
            <ChipGroup
              ariaLabel="Review type"
              options={CGA_CARE_PLAN_REVIEW_TYPE_OPTIONS}
              value={strValue(values.reviewType)}
              onChange={(next) =>
                setField("reviewType", typeof next === "string" ? next : "")
              }
            />
          </div>
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-other-review-arrangements">
            Other review / follow-up arrangements
          </FieldLabel>
          <textarea
            id="cga-other-review-arrangements"
            value={strValue(values.otherReviewArrangements)}
            onChange={(e) =>
              setField("otherReviewArrangements", e.target.value)
            }
            placeholder="Document other review or follow-up arrangements…"
            rows={4}
            className={cgaTextareaClass}
          />
        </div>
      </div>
    </div>
  );
}

function MentalCapacitySection({
  values,
  onChange,
  callout,
}: {
  values: CgaSectionValues;
  onChange: (next: CgaSectionValues) => void;
  callout?: CgaSection["callout"];
}) {
  function setField(id: string, next: string) {
    onChange({ ...values, [id]: next });
  }

  const decisionMaker = strValue(values.decisionMaker);
  const namedDecisionMakerOpen =
    decisionMaker === "family-member" || decisionMaker === "legal-guardian";

  return (
    <div className="flex flex-col gap-5">
      {callout ? <MobilityCaution>{callout.body}</MobilityCaution> : null}

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>
          Capacity (re: decisions discussed today)
        </p>
        <ChipGroup
          ariaLabel="Capacity regarding decisions discussed today"
          options={CGA_CAPACITY_TODAY_OPTIONS}
          value={strValue(values.capacityToday)}
          onChange={(next) =>
            setField("capacityToday", typeof next === "string" ? next : "")
          }
        />
      </div>

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>Formal capacity assessment performed</p>
        <ChipGroup
          ariaLabel="Formal capacity assessment performed"
          options={CGA_FORMAL_CAPACITY_ASSESSMENT_OPTIONS}
          value={strValue(values.formalCapacityAssessment)}
          onChange={(next) =>
            setField(
              "formalCapacityAssessment",
              typeof next === "string" ? next : "",
            )
          }
        />
      </div>

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>Lasting Power of Attorney in place</p>
        <ChipGroup
          ariaLabel="Lasting Power of Attorney in place"
          options={CGA_LPA_OPTIONS}
          value={strValue(values.lastingPowerOfAttorney)}
          onChange={(next) =>
            setField(
              "lastingPowerOfAttorney",
              typeof next === "string" ? next : "",
            )
          }
        />
      </div>

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>Named next of kin / decision-maker</p>
        <ChipGroup
          ariaLabel="Named next of kin or decision-maker"
          options={CGA_DECISION_MAKER_OPTIONS}
          value={decisionMaker}
          onChange={(next) => {
            const value = typeof next === "string" ? next : "";
            if (value === "patient") {
              onChange({
                ...values,
                decisionMaker: value,
                namedDecisionMaker: "",
              });
              return;
            }
            setField("decisionMaker", value);
          }}
        />
      </div>

      <CgaRevealDetails open={namedDecisionMakerOpen}>
        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-named-decision-maker">
            Named decision-maker / attorney (if applicable)
          </FieldLabel>
          <input
            id="cga-named-decision-maker"
            type="text"
            value={strValue(values.namedDecisionMaker)}
            onChange={(e) => setField("namedDecisionMaker", e.target.value)}
            placeholder="Name of decision-maker or attorney"
            autoComplete="off"
            className={fieldInputClassName}
          />
        </div>
      </CgaRevealDetails>

      <div className={fieldStackClass}>
        <FieldLabel htmlFor="cga-mental-capacity-notes">
          Mental capacity notes
        </FieldLabel>
        <textarea
          id="cga-mental-capacity-notes"
          value={strValue(values.mentalCapacityNotes)}
          onChange={(e) => setField("mentalCapacityNotes", e.target.value)}
          placeholder="Document mental capacity notes…"
          rows={4}
          className={cgaTextareaClass}
        />
      </div>
    </div>
  );
}

function EndOfLifeSection({
  values,
  onChange,
  callout,
}: {
  values: CgaSectionValues;
  onChange: (next: CgaSectionValues) => void;
  callout?: CgaSection["callout"];
}) {
  function setField(id: string, next: string | string[]) {
    onChange({ ...values, [id]: next });
  }

  function setMultiWithExclusiveIds(
    id: string,
    next: string | string[],
    exclusiveIds: readonly string[],
  ) {
    if (!Array.isArray(next)) {
      setField(id, next);
      return;
    }
    const prev = Array.isArray(values[id]) ? (values[id] as string[]) : [];
    for (const exclusive of exclusiveIds) {
      if (next.includes(exclusive) && !prev.includes(exclusive)) {
        setField(id, [exclusive]);
        return;
      }
    }
    if (
      next.some((item) => exclusiveIds.includes(item)) &&
      next.length > 1
    ) {
      setField(
        id,
        next.filter((item) => !exclusiveIds.includes(item)),
      );
      return;
    }
    setField(id, next);
  }

  const acpDiscussed = Array.isArray(values.acpDiscussed)
    ? values.acpDiscussed
    : [];

  return (
    <div className="flex flex-col gap-5">
      {callout ? <MobilityCaution>{callout.body}</MobilityCaution> : null}

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>Prognosis awareness</p>
        <ChipGroup
          ariaLabel="Prognosis awareness"
          options={CGA_PROGNOSIS_AWARENESS_OPTIONS}
          value={strValue(values.prognosisAwareness)}
          onChange={(next) =>
            setField("prognosisAwareness", typeof next === "string" ? next : "")
          }
        />
      </div>

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>Advance care planning discussed</p>
        <ChipGroup
          ariaLabel="Advance care planning discussed"
          options={CGA_ACP_DISCUSSED_OPTIONS}
          value={acpDiscussed}
          multi
          onChange={(next) =>
            setMultiWithExclusiveIds("acpDiscussed", next, ["not-yet"])
          }
        />
      </div>

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>
          Preferred place of care (if discussed)
        </p>
        <ChipGroup
          ariaLabel="Preferred place of care"
          options={CGA_PREFERRED_PLACE_OPTIONS}
          value={strValue(values.preferredPlaceOfCare)}
          onChange={(next) =>
            setField(
              "preferredPlaceOfCare",
              typeof next === "string" ? next : "",
            )
          }
        />
      </div>

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>CPR decision (if discussed)</p>
        <ChipGroup
          ariaLabel="CPR decision"
          options={CGA_CPR_DECISION_OPTIONS}
          value={strValue(values.cprDecision)}
          onChange={(next) =>
            setField("cprDecision", typeof next === "string" ? next : "")
          }
        />
      </div>

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>Palliative / supportive care needs</p>
        <ChipGroup
          ariaLabel="Palliative / supportive care needs"
          options={CGA_PALLIATIVE_NEEDS_OPTIONS}
          value={strValue(values.palliativeNeeds)}
          onChange={(next) =>
            setField("palliativeNeeds", typeof next === "string" ? next : "")
          }
        />
      </div>

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>
          Carer awareness of patient&apos;s wishes
        </p>
        <ChipGroup
          ariaLabel="Carer awareness of patient's wishes"
          options={CGA_CARER_WISHES_AWARENESS_OPTIONS}
          value={strValue(values.carerWishesAwareness)}
          onChange={(next) =>
            setField(
              "carerWishesAwareness",
              typeof next === "string" ? next : "",
            )
          }
        />
      </div>

      <div className={fieldStackClass}>
        <FieldLabel htmlFor="cga-eol-notes">
          End of life / advance care planning notes
        </FieldLabel>
        <textarea
          id="cga-eol-notes"
          value={strValue(values.eolAcpNotes)}
          onChange={(e) => setField("eolAcpNotes", e.target.value)}
          placeholder="Document end of life and advance care planning notes…"
          rows={4}
          className={cgaTextareaClass}
        />
      </div>
    </div>
  );
}

function NutritionalAssessmentSection({
  values,
  onChange,
  callout,
}: {
  values: CgaSectionValues;
  onChange: (next: CgaSectionValues) => void;
  callout?: CgaSection["callout"];
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

  const weightToday = strValue(values.weightTodayKg);
  const weightThreeMonths = strValue(values.weightThreeMonthsKg);
  const todayNum = Number(weightToday);
  const priorNum = Number(weightThreeMonths);
  const weightChangeKg =
    weightToday !== "" &&
    weightThreeMonths !== "" &&
    Number.isFinite(todayNum) &&
    Number.isFinite(priorNum)
      ? (todayNum - priorNum).toFixed(1)
      : "";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <p className={fieldLabelClass}>MUST score</p>
        <div className="grid gap-4 sm:grid-cols-2">
        <div className={fieldStackClass}>
            <FieldLabel htmlFor="cga-must-score">Score</FieldLabel>
          <input
              id="cga-must-score"
              type="text"
            inputMode="numeric"
              value={strValue(values.mustScore)}
            onChange={(e) => {
              const result = clampIntMetric(
                e.target.value,
                  CGA_MUST_LIMITS.max,
              );
                applyMetric(result, (next) => setField("mustScore", next));
            }}
              placeholder="0–6"
              autoComplete="off"
            className={fieldInputClassName}
          />
          </div>
          <div className={fieldStackClass}>
            <FieldLabel htmlFor="cga-must-interpretation">
              Interpretation
            </FieldLabel>
            <input
              id="cga-must-interpretation"
              type="text"
              value={strValue(values.mustInterpretation)}
              onChange={(e) =>
                setField("mustInterpretation", e.target.value)
              }
              placeholder="Interpretation"
              autoComplete="off"
              className={fieldInputClassName}
            />
          </div>
        </div>
        <FieldErrorMessage error={limitError ? METRIC_LIMIT_ERROR : null} />
        {callout ? <MobilityCaution>{callout.body}</MobilityCaution> : null}
        </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-weight-today">Weight today (kg)</FieldLabel>
          <input
            id="cga-weight-today"
            type="text"
            inputMode="decimal"
            value={weightToday}
            onChange={(e) => {
              const result = clampDecimalMetric(
                e.target.value,
                CGA_PHYSICAL_LIMITS.weightKg.max,
              );
              applyMetric(result, (next) => setField("weightTodayKg", next));
            }}
            placeholder="e.g. 62.5"
            autoComplete="off"
            className={fieldInputClassName}
          />
        </div>
        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-weight-three-months">
            Weight 3 months ago (patient report)
          </FieldLabel>
          <input
            id="cga-weight-three-months"
            type="text"
            inputMode="decimal"
            value={weightThreeMonths}
            onChange={(e) => {
              const result = clampDecimalMetric(
                e.target.value,
                CGA_PHYSICAL_LIMITS.weightKg.max,
              );
              applyMetric(result, (next) =>
                setField("weightThreeMonthsKg", next),
              );
            }}
            placeholder="e.g. 65.0"
            autoComplete="off"
            className={fieldInputClassName}
          />
        </div>
        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-weight-change">Weight change (kg)</FieldLabel>
          <input
            id="cga-weight-change"
            type="text"
            value={weightChangeKg}
            readOnly
            placeholder="Auto-calculated"
            className={fieldInputClassName}
            aria-live="polite"
          />
        </div>
      </div>

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>Appetite</p>
        <ChipGroup
          ariaLabel="Appetite"
          options={CGA_APPETITE_OPTIONS}
          value={strValue(values.appetite)}
          onChange={(next) =>
            setField("appetite", typeof next === "string" ? next : "")
          }
        />
      </div>

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>Swallowing</p>
        <ChipGroup
          ariaLabel="Swallowing"
          options={CGA_SWALLOWING_OPTIONS}
          value={strValue(values.swallowing)}
          onChange={(next) =>
            setField("swallowing", typeof next === "string" ? next : "")
          }
        />
      </div>

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>Oral health (impact on eating)</p>
        <ChipGroup
          ariaLabel="Oral health impact on eating"
          options={CGA_ORAL_HEALTH_EATING_OPTIONS}
          value={strValue(values.oralHealthEating)}
          onChange={(next) =>
            setField("oralHealthEating", typeof next === "string" ? next : "")
          }
        />
      </div>

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>Taste changes</p>
        <ChipGroup
          ariaLabel="Taste changes"
          options={CGA_TASTE_CHANGES_OPTIONS}
          value={strValue(values.tasteChanges)}
          onChange={(next) =>
            setField("tasteChanges", typeof next === "string" ? next : "")
          }
        />
      </div>

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>Hydration</p>
        <ChipGroup
          ariaLabel="Hydration"
          options={CGA_HYDRATION_OPTIONS}
          value={strValue(values.hydration)}
          onChange={(next) =>
            setField("hydration", typeof next === "string" ? next : "")
          }
        />
      </div>

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>Alcohol intake</p>
        <ChipGroup
          ariaLabel="Alcohol intake"
          options={CGA_ALCOHOL_INTAKE_OPTIONS}
          value={strValue(values.alcoholIntake)}
          onChange={(next) =>
            setField("alcoholIntake", typeof next === "string" ? next : "")
          }
        />
      </div>

      <div className={fieldStackClass}>
        <FieldLabel htmlFor="cga-dietary-plan">
          Dietary history / observations / plan (include protein, vitamin D,
          calcium assessment)
        </FieldLabel>
        <textarea
          id="cga-dietary-plan"
          value={strValue(values.dietaryPlan)}
          onChange={(e) => setField("dietaryPlan", e.target.value)}
          placeholder="Document dietary history, observations, and plan…"
          rows={4}
          className={cgaTextareaClass}
        />
      </div>
    </div>
  );
}

function UrinaryIncontinenceSection({
  values,
  onChange,
  callout,
}: {
  values: CgaSectionValues;
  onChange: (next: CgaSectionValues) => void;
  callout?: CgaSection["callout"];
}) {
  function setField(id: string, next: string | string[]) {
    onChange({ ...values, [id]: next });
  }

  function setMultiWithExclusiveIds(
    id: string,
    next: string | string[],
    exclusiveIds: readonly string[],
  ) {
    if (!Array.isArray(next)) {
      setField(id, next);
      return;
    }
    const prev = Array.isArray(values[id]) ? (values[id] as string[]) : [];
    for (const exclusive of exclusiveIds) {
      if (next.includes(exclusive) && !prev.includes(exclusive)) {
        setField(id, [exclusive]);
        return;
      }
    }
    if (
      next.some((item) => exclusiveIds.includes(item)) &&
      next.length > 1
    ) {
      setField(
        id,
        next.filter((item) => !exclusiveIds.includes(item)),
      );
      return;
    }
    setField(id, next);
  }

  const urinaryType = Array.isArray(values.urinaryType)
    ? values.urinaryType
    : [];
  const urinaryExam = Array.isArray(values.urinaryExam)
    ? values.urinaryExam
    : [];

  return (
    <div className="flex flex-col gap-5">
      {callout ? <MobilityCaution>{callout.body}</MobilityCaution> : null}

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>Incontinence type</p>
        <ChipGroup
          ariaLabel="Incontinence type"
          options={CGA_URINARY_TYPE_OPTIONS}
          value={urinaryType}
          multi
          onChange={(next) => setField("urinaryType", next)}
        />
      </div>

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>Onset</p>
        <ChipGroup
          ariaLabel="Onset"
          options={CGA_URINARY_ONSET_OPTIONS}
          value={strValue(values.urinaryOnset)}
          onChange={(next) =>
            setField("urinaryOnset", typeof next === "string" ? next : "")
          }
        />
      </div>

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>Severity</p>
        <ChipGroup
          ariaLabel="Severity"
          options={CGA_URINARY_SEVERITY_OPTIONS}
          value={strValue(values.urinarySeverity)}
          onChange={(next) =>
            setField("urinarySeverity", typeof next === "string" ? next : "")
          }
        />
      </div>

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>Nocturia</p>
        <ChipGroup
          ariaLabel="Nocturia"
          options={CGA_NOCTURIA_OPTIONS}
          value={strValue(values.nocturia)}
          onChange={(next) =>
            setField("nocturia", typeof next === "string" ? next : "")
          }
        />
      </div>

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>Urgency to toilet (falls risk)</p>
        <ChipGroup
          ariaLabel="Urgency to toilet"
          options={CGA_URGENCY_TOILET_OPTIONS}
          value={strValue(values.urgencyToToilet)}
          onChange={(next) =>
            setField("urgencyToToilet", typeof next === "string" ? next : "")
          }
        />
      </div>

      <div className={fieldStackClass}>
        <p className={fieldLabelClass}>Relevant examination</p>
        <ChipGroup
          ariaLabel="Relevant examination"
          options={CGA_URINARY_EXAM_OPTIONS}
          value={urinaryExam}
          multi
          onChange={(next) =>
            setMultiWithExclusiveIds("urinaryExam", next, [
              "normal",
              "not-examined",
            ])
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-urine-dipstick">
            Urine dipstick result
          </FieldLabel>
          <input
            id="cga-urine-dipstick"
            type="text"
            value={strValue(values.urineDipstick)}
            onChange={(e) => setField("urineDipstick", e.target.value)}
            placeholder="e.g. Leukocytes +, nitrites neg"
            autoComplete="off"
            className={fieldInputClassName}
          />
        </div>
        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>MSU sent?</p>
          <ChipGroup
            ariaLabel="MSU sent"
            options={CGA_YES_NO_OPTIONS}
            value={strValue(values.msuSent)}
            onChange={(next) =>
              setField("msuSent", typeof next === "string" ? next : "")
            }
          />
        </div>
      </div>

      <div className={fieldStackClass}>
        <FieldLabel htmlFor="cga-incontinence-plan">
          Incontinence assessment / management plan
        </FieldLabel>
        <textarea
          id="cga-incontinence-plan"
          value={strValue(values.incontinencePlan)}
          onChange={(e) => setField("incontinencePlan", e.target.value)}
          placeholder="Document incontinence assessment and management plan…"
          rows={4}
          className={cgaTextareaClass}
        />
      </div>
    </div>
  );
}

function SocialEnvironmentalSection({
  values,
  onChange,
}: {
  values: CgaSectionValues;
  onChange: (next: CgaSectionValues) => void;
}) {
  function setField(id: string, next: string | string[]) {
    onChange({ ...values, [id]: next });
  }

  function setMultiWithExclusiveIds(
    id: string,
    next: string | string[],
    exclusiveIds: readonly string[],
  ) {
    if (!Array.isArray(next)) {
      setField(id, next);
      return;
    }
    const prev = Array.isArray(values[id]) ? (values[id] as string[]) : [];
    for (const exclusive of exclusiveIds) {
      if (next.includes(exclusive) && !prev.includes(exclusive)) {
        setField(id, [exclusive]);
        return;
      }
    }
    if (
      next.some((item) => exclusiveIds.includes(item)) &&
      next.length > 1
    ) {
      setField(
        id,
        next.filter((item) => !exclusiveIds.includes(item)),
      );
      return;
    }
    setField(id, next);
  }

  const primaryCarer = Array.isArray(values.primaryCarer)
    ? values.primaryCarer
    : [];
  const communityParticipation = Array.isArray(values.communityParticipation)
    ? values.communityParticipation
    : [];
  const bathroomSafety = Array.isArray(values.bathroomSafety)
    ? values.bathroomSafety
    : [];
  const safetyDevices = Array.isArray(values.homeSafetyDevices)
    ? values.homeSafetyDevices
    : [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-5">
        <h3 className={typo.headingL}>11.1 Social circumstances</h3>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Primary carer / support</p>
          <ChipGroup
            ariaLabel="Primary carer / support"
            options={CGA_PRIMARY_CARER_OPTIONS}
            value={primaryCarer}
            multi
            onChange={(next) =>
              setMultiWithExclusiveIds("primaryCarer", next, ["none"])
            }
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Carer strain</p>
          <ChipGroup
            ariaLabel="Carer strain"
            options={CGA_CARER_STRAIN_OPTIONS}
            value={strValue(values.carerStrain)}
            onChange={(next) =>
              setField("carerStrain", typeof next === "string" ? next : "")
            }
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Social engagement</p>
          <ChipGroup
            ariaLabel="Social engagement"
            options={CGA_SOCIAL_ENGAGEMENT_OPTIONS}
            value={strValue(values.socialEngagement)}
            onChange={(next) =>
              setField("socialEngagement", typeof next === "string" ? next : "")
            }
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Community participation</p>
          <ChipGroup
            ariaLabel="Community participation"
            options={CGA_COMMUNITY_PARTICIPATION_OPTIONS}
            value={communityParticipation}
            multi
            onChange={(next) =>
              setMultiWithExclusiveIds("communityParticipation", next, ["none"])
            }
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Driving / transport</p>
          <ChipGroup
            ariaLabel="Driving / transport"
            options={CGA_DRIVING_TRANSPORT_OPTIONS}
            value={strValue(values.drivingTransport)}
            onChange={(next) =>
              setField("drivingTransport", typeof next === "string" ? next : "")
            }
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>
            Financial situation (care planning relevance)
          </p>
          <ChipGroup
            ariaLabel="Financial situation"
            options={CGA_FINANCIAL_SITUATION_OPTIONS}
            value={strValue(values.financialSituation)}
            onChange={(next) =>
              setField(
                "financialSituation",
                typeof next === "string" ? next : "",
              )
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 border-t border-divider pt-5">
        <h3 className={typo.headingL}>11.2 Home environment</h3>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Property type</p>
          <ChipGroup
            ariaLabel="Property type"
            options={CGA_PROPERTY_TYPE_OPTIONS}
            value={strValue(values.propertyType)}
            onChange={(next) =>
              setField("propertyType", typeof next === "string" ? next : "")
            }
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Stairs / steps</p>
          <ChipGroup
            ariaLabel="Stairs / steps"
            options={CGA_HOME_STAIRS_OPTIONS}
            value={strValue(values.homeStairs)}
            onChange={(next) =>
              setField("homeStairs", typeof next === "string" ? next : "")
            }
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Bathroom safety</p>
          <ChipGroup
            ariaLabel="Bathroom safety"
            options={CGA_BATHROOM_SAFETY_OPTIONS}
            value={bathroomSafety}
            multi
            onChange={(next) =>
              setMultiWithExclusiveIds("bathroomSafety", next, ["safe"])
            }
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Safety devices</p>
          <ChipGroup
            ariaLabel="Safety devices"
            options={CGA_HOME_SAFETY_DEVICE_OPTIONS}
            value={safetyDevices}
            multi
            onChange={(next) =>
              setMultiWithExclusiveIds("homeSafetyDevices", next, ["none"])
            }
          />
        </div>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-social-env-plan">
            Social / environmental observations / referrals
          </FieldLabel>
          <textarea
            id="cga-social-env-plan"
            value={strValue(values.socialEnvironmentalPlan)}
            onChange={(e) =>
              setField("socialEnvironmentalPlan", e.target.value)
            }
            placeholder="Document social and environmental observations or referrals…"
            rows={4}
            className={cgaTextareaClass}
          />
        </div>
      </div>
    </div>
  );
}

function FunctionalAssessmentSection({
  values,
  onChange,
  callout,
}: {
  values: CgaSectionValues;
  onChange: (next: CgaSectionValues) => void;
  callout?: CgaSection["callout"];
}) {
  function setField(id: string, next: string | string[]) {
    onChange({ ...values, [id]: next });
  }

  const barthelLevels = CGA_BARTHEL_ITEMS.map((item) =>
    strValue(values[barthelItemFieldId(item.id)]),
  );
  const barthelComplete = barthelLevels.every((level) => level !== "");
  const barthelTotal = barthelComplete
    ? CGA_BARTHEL_ITEMS.reduce((sum, item, index) => {
        const score = barthelScoreForLevel(item.id, barthelLevels[index] ?? "");
        return sum + (score ?? 0);
      }, 0)
    : null;

  return (
    <div className="flex flex-col gap-5">
      {callout ? <MobilityCaution>{callout.body}</MobilityCaution> : null}

      <div className="flex flex-col gap-5">
        <h3 className={typo.headingL}>
          10.1 Barthel Index - Activities of Daily Living
        </h3>

        {CGA_BARTHEL_ITEMS.map((item) => {
          const fieldId = barthelItemFieldId(item.id);
          const level = strValue(values[fieldId]);
          return (
            <div key={item.id} className={fieldStackClass}>
              <p className={fieldLabelClass}>
                {item.label} ({item.max})
              </p>
              <ChipGroup
                ariaLabel={`${item.label} Barthel level`}
                options={CGA_BARTHEL_LEVEL_OPTIONS}
                value={level}
                layout="equal"
                onChange={(next) =>
                  setField(fieldId, typeof next === "string" ? next : "")
                }
              />
            </div>
          );
        })}

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>TOTAL BARTHEL SCORE / 100</p>
          <p
            className={cn(typo.headingS, "tabular-nums text-foreground")}
            aria-live="polite"
          >
            {barthelTotal == null ? "—" : String(barthelTotal)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5 border-t border-divider pt-5">
        <h3 className={typo.headingL}>
          10.2 Nottingham Extended ADL - Instrumental Activities
        </h3>

        {CGA_NOTTINGHAM_ITEMS.map((item) => {
          const fieldId = nottinghamItemFieldId(item.id);
          return (
            <div key={item.id} className={fieldStackClass}>
              <p className={fieldLabelClass}>{item.label}</p>
              <ChipGroup
                ariaLabel={`${item.label} Nottingham level`}
                options={CGA_NOTTINGHAM_LEVEL_OPTIONS}
                value={strValue(values[fieldId])}
                layout="equal"
                onChange={(next) =>
                  setField(fieldId, typeof next === "string" ? next : "")
                }
              />
            </div>
          );
        })}

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-functional-trajectory">
            Functional trajectory - change from prior level (patient / family
            report)
          </FieldLabel>
          <textarea
            id="cga-functional-trajectory"
            value={strValue(values.functionalTrajectory)}
            onChange={(e) => setField("functionalTrajectory", e.target.value)}
            placeholder="Document change from prior functional level…"
            rows={4}
            className={cgaTextareaClass}
          />
        </div>
      </div>
    </div>
  );
}

function DeliriumAssessmentSection({
  values,
  onChange,
  callout,
}: {
  values: CgaSectionValues;
  onChange: (next: CgaSectionValues) => void;
  callout?: CgaSection["callout"];
}) {
  function setField(id: string, next: string | string[]) {
    onChange({ ...values, [id]: next });
  }

  const alertness = strValue(values.at4Alertness);
  const amt4 = strValue(values.at4Amt4);
  const attention = strValue(values.at4Attention);
  const acuteChange = strValue(values.at4AcuteChange);
  const itemScores = [alertness, amt4, attention, acuteChange];
  const totalComplete = itemScores.every((score) => score !== "");
  const totalScore = totalComplete
    ? itemScores.reduce((sum, score) => sum + Number(score), 0)
    : null;

  return (
    <div className="flex flex-col gap-5">
      {callout ? <MobilityCaution>{callout.body}</MobilityCaution> : null}

      <div className="flex flex-col gap-5">
        <h3 className={typo.headingL}>9.1 4AT rapid assessment</h3>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Alertness (AVPU)</p>
          <ChipGroup
            ariaLabel="Alertness AVPU score"
            options={CGA_4AT_ALERTNESS_OPTIONS}
            value={alertness}
            onChange={(next) =>
              setField("at4Alertness", typeof next === "string" ? next : "")
            }
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>AMT4 (age, DOB, place, year)</p>
          <ChipGroup
            ariaLabel="AMT4 score"
            options={CGA_4AT_AMT4_OPTIONS}
            value={amt4}
            onChange={(next) =>
              setField("at4Amt4", typeof next === "string" ? next : "")
            }
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>
            Attention (months of year backwards)
          </p>
          <ChipGroup
            ariaLabel="Attention score"
            options={CGA_4AT_ATTENTION_OPTIONS}
            value={attention}
            onChange={(next) =>
              setField("at4Attention", typeof next === "string" ? next : "")
            }
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>Acute change / fluctuating course</p>
          <ChipGroup
            ariaLabel="Acute change or fluctuating course score"
            options={CGA_4AT_ACUTE_CHANGE_OPTIONS}
            value={acuteChange}
            onChange={(next) =>
              setField("at4AcuteChange", typeof next === "string" ? next : "")
            }
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>TOTAL 4AT SCORE / 12</p>
          <p
            className={cn(typo.headingS, "tabular-nums text-foreground")}
            aria-live="polite"
          >
            {totalScore == null ? "—" : String(totalScore)}
          </p>
        </div>

        <MobilityCaution>
          4AT ≥4: possible delirium. 1–3: possible cognitive impairment. 0:
          delirium / severe cognitive impairment unlikely.
        </MobilityCaution>
      </div>

      <div className="flex flex-col gap-5 border-t border-divider pt-5">
        <h3 className={typo.headingL}>
          9.2 CAM criteria (if delirium suspected)
        </h3>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>1. Acute onset & fluctuating course</p>
          <ChipGroup
            ariaLabel="CAM acute onset and fluctuating course"
            options={CGA_YES_NO_OPTIONS}
            value={strValue(values.camAcuteFluctuating)}
            onChange={(next) =>
              setField(
                "camAcuteFluctuating",
                typeof next === "string" ? next : "",
              )
            }
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>2. Inattention</p>
          <ChipGroup
            ariaLabel="CAM inattention"
            options={CGA_YES_NO_OPTIONS}
            value={strValue(values.camInattention)}
            onChange={(next) =>
              setField("camInattention", typeof next === "string" ? next : "")
            }
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>3. Disorganised thinking</p>
          <ChipGroup
            ariaLabel="CAM disorganised thinking"
            options={CGA_YES_NO_OPTIONS}
            value={strValue(values.camDisorganisedThinking)}
            onChange={(next) =>
              setField(
                "camDisorganisedThinking",
                typeof next === "string" ? next : "",
              )
            }
          />
        </div>

        <div className={fieldStackClass}>
          <p className={fieldLabelClass}>4. Altered consciousness</p>
          <ChipGroup
            ariaLabel="CAM altered consciousness"
            options={CGA_CAM_CONSCIOUSNESS_OPTIONS}
            value={strValue(values.camAlteredConsciousness)}
            onChange={(next) =>
              setField(
                "camAlteredConsciousness",
                typeof next === "string" ? next : "",
              )
            }
          />
        </div>

        <MobilityCaution>
          CAM diagnosis: features 1 AND 2, plus EITHER 3 OR 4.
        </MobilityCaution>

        <div className={fieldStackClass}>
          <FieldLabel htmlFor="cga-delirium-plan">
            Delirium assessment observations / precipitants / management plan
          </FieldLabel>
          <textarea
            id="cga-delirium-plan"
            value={strValue(values.deliriumPlan)}
            onChange={(e) => setField("deliriumPlan", e.target.value)}
            placeholder="Document observations, precipitants, and management plan…"
            rows={4}
            className={cgaTextareaClass}
          />
        </div>
      </div>
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
          data-cga-callout=""
          className={cn(
            radius.md,
            "flex items-start gap-3 px-4 py-3",
            section.callout.tone === "warning"
              ? "bg-warning-muted"
              : "bg-info-muted",
          )}
          role="note"
        >
          <AppIcon
            icon={
              section.callout.tone === "warning"
                ? Alert02Icon
                : InformationCircleIcon
            }
            size={BADGE_ICON_SIZE}
            className={cn(
              "mt-0.5 shrink-0",
              section.callout.tone === "warning" ? "text-warning" : "text-info",
            )}
          />
          <div className="min-w-0 flex-1">
            {section.callout.title ? (
          <p
            className={cn(
              typo.headingS,
                  section.callout.tone === "warning"
                    ? "text-warning"
                    : "text-info",
            )}
          >
            {section.callout.title}
          </p>
            ) : null}
            <p
              className={cn(
                typo.bodyS,
                section.callout.tone === "warning"
                  ? "text-warning"
                  : "text-info",
                section.callout.title && "mt-1 text-muted-foreground",
              )}
            >
            {section.callout.body}
          </p>
          </div>
        </div>
      ) : null}
      <div
        className={cn(
          dashboardCardClass,
          "grid grid-cols-1 gap-x-4 gap-y-5 p-5 sm:grid-cols-2",
        )}
      >
        {section.fields.map((field) => {
          const otherKey = cgaOtherFieldKey(field.id);
          const otherRaw = values[otherKey];
          return (
          <FieldRenderer
            key={field.id}
            field={field}
            value={values[field.id]}
              otherValue={typeof otherRaw === "string" ? otherRaw : ""}
              onChange={(next) => {
                const clearingOther =
                  (field.kind === "select" ||
                    field.kind === "radio" ||
                    field.kind === "chips" ||
                    field.kind === "checkbox-list") &&
                  field.options.some((opt) => opt.id === "other") &&
                  !isCgaOtherSelected(next);
                onChange({
                  ...values,
                  [field.id]: next,
                  ...(clearingOther ? { [otherKey]: "" } : {}),
                });
              }}
              onOtherChange={(next) =>
                onChange({ ...values, [otherKey]: next })
              }
            />
          );
        })}
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
  const [reviewMode, setReviewMode] = useState(false);
  const reviewToastLockRef = useRef(false);
  const reviewToastLockTimeoutRef = useRef<number | null>(null);
  const reviewModeLabelId = "cga-review-mode-label";
  const reviewModeSwitchId = "cga-review-mode-switch";
  const REVIEW_MODE_EDIT_BLOCKED =
    "No edits or changes are allowed while in Review Mode. Turn off Review Mode to make changes.";
  const REVIEW_MODE_ON =
    "Review Mode is on. Fields are read-only until you turn it off.";
  const REVIEW_MODE_TOAST_LOCK_MS = 600;

  useEffect(() => {
    saveCgaDraft(draft);
  }, [draft]);

  useEffect(() => {
    return () => {
      if (reviewToastLockTimeoutRef.current != null) {
        window.clearTimeout(reviewToastLockTimeoutRef.current);
      }
    };
  }, []);

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

  function notifyReviewEditBlocked() {
    // Same click can hit pointer capture + onChange; only toast once per gesture.
    if (reviewToastLockRef.current) return;
    reviewToastLockRef.current = true;
    toast.error(REVIEW_MODE_EDIT_BLOCKED);
    if (reviewToastLockTimeoutRef.current != null) {
      window.clearTimeout(reviewToastLockTimeoutRef.current);
    }
    reviewToastLockTimeoutRef.current = window.setTimeout(() => {
      reviewToastLockRef.current = false;
      reviewToastLockTimeoutRef.current = null;
    }, REVIEW_MODE_TOAST_LOCK_MS);
  }

  function isReviewCalloutTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false;
    return Boolean(target.closest("[data-cga-callout], [role='note']"));
  }

  function isReviewFormControlTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false;
    if (isReviewCalloutTarget(target)) return false;
    return Boolean(
      target.closest(
        [
          "input",
          "textarea",
          "select",
          "button",
          "label",
          '[role="button"]',
          '[role="combobox"]',
          '[role="listbox"]',
          '[role="option"]',
          '[role="radio"]',
          '[role="checkbox"]',
          '[role="switch"]',
          '[role="menuitem"]',
          '[role="menuitemradio"]',
          "[contenteditable]",
          "a[href]",
        ].join(", "),
      ),
    );
  }

  function handleReviewFormPointerDown(
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    if (!reviewMode) return;
    if (!isReviewFormControlTarget(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    notifyReviewEditBlocked();
  }

  function setSectionValues(next: CgaSectionValues) {
    if (reviewMode) {
      notifyReviewEditBlocked();
      return;
    }
    updateDraft({
      valuesBySection: {
        ...draft.valuesBySection,
        [section.id]: next,
      },
    });
  }

  function updateDraftUnlessReview(patch: Partial<CgaDraftState>) {
    if (reviewMode) {
      notifyReviewEditBlocked();
      return;
    }
    updateDraft(patch);
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
          <div className="flex flex-wrap items-center gap-3">
            <div
              className={cn(
                radius.full,
                "inline-flex h-11 shrink-0 items-center gap-2 px-6 transition-colors duration-200",
                reviewMode ? "bg-info-muted" : "bg-muted",
              )}
            >
              <AppIcon
                icon={ViewIcon}
                size={ICON_SIZE}
                className="shrink-0 text-info"
                aria-hidden
              />
              <span
                id={reviewModeLabelId}
                className="whitespace-nowrap text-[13.5px] font-medium text-info"
              >
                Review Mode
              </span>
              <ToggleSwitch
                id={reviewModeSwitchId}
                labelledBy={reviewModeLabelId}
                checked={reviewMode}
                onCheckedChange={(next) => {
                  setReviewMode(next);
                  if (next) toast.info(REVIEW_MODE_ON);
                }}
                tone="info"
              />
            </div>
            <Link
              href={`/patients/${patientId}/vitals`}
              className={cn(
                "inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-[#f5edfc] px-6 text-[13.5px] font-medium text-[#5c2882]",
                "transition-colors hover:bg-primary/15",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              )}
              aria-label={`Open ${patient.name}'s vitals chart`}
            >
              <AppIcon icon={Chart01Icon} size={ICON_SIZE} />
              Open patient chart
              <ChevronIcon direction="right" size={BADGE_ICON_SIZE} />
            </Link>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-2 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:items-stretch lg:overflow-hidden xl:grid-cols-[16rem_minmax(0,1fr)]">
          <nav
            className={cn(
              CGA_SECTION_SHELL_CLASS,
              "group/thin-scroll flex flex-col p-2",
              "lg:h-full lg:min-h-0 lg:overflow-hidden",
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
                        radius.lg,
                        "flex w-full items-center px-3 py-2.5 text-left transition-colors",
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
                        {s.shortTitle ?? s.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div
            className={cn(
              CGA_SECTION_SHELL_CLASS,
              "flex min-w-0 flex-col transition-[border-color,box-shadow] duration-200",
              "lg:min-h-0 lg:overflow-hidden",
              reviewMode &&
                "border-info shadow-[0_0_0_3px_rgba(37,99,235,0.12),0_8px_28px_rgba(37,99,235,0.14)]",
            )}
          >
            <div className="flex shrink-0 flex-col gap-4 border-b border-divider p-4 sm:p-5">
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
                "flex flex-col gap-4 p-4 sm:p-5",
                "lg:thin-hover-scroll lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain",
              )}
            >
              <div
                className="relative min-w-0"
                data-review-mode={reviewMode ? "true" : undefined}
                aria-readonly={reviewMode || undefined}
                onPointerDownCapture={handleReviewFormPointerDown}
              >
                {reviewMode ? (
                  <p className="sr-only" role="status">
                    Review mode is on. Fields are read-only.
                  </p>
                ) : null}
                <div
                  className={cn(
                    "min-w-0",
                    reviewMode &&
                      [
                        "select-text [&_input]:caret-transparent [&_textarea]:caret-transparent",
                        /* Hide edit chrome so review feels fully read-only. */
                        "[&_[data-cga-edit-only]]:hidden",
                        "[&_[data-slot=calendar-button]]:hidden",
                      ].join(" "),
                  )}
                >
              {section.id === "visit-details" ? (
                <VisitDetailsSection
                  patient={patient}
                  values={sectionValues}
                  onChange={setSectionValues}
                />
                ) : section.id === "medical-history" ? (
                  <CgaMedicalHistorySection
                    values={sectionValues}
                    activeDiagnoses={draft.activeDiagnoses ?? []}
                    pastSurgeries={draft.pastSurgeries ?? []}
                    hospitalisations={draft.hospitalisations ?? []}
                    onValuesChange={setSectionValues}
                    onActiveDiagnosesChange={(activeDiagnoses) =>
                      updateDraftUnlessReview({ activeDiagnoses })
                    }
                    onPastSurgeriesChange={(pastSurgeries) =>
                      updateDraftUnlessReview({ pastSurgeries })
                    }
                    onHospitalisationsChange={(hospitalisations) =>
                      updateDraftUnlessReview({ hospitalisations })
                    }
                  />
              ) : section.id === "medications" ? (
                <MedicationsSection
                  values={sectionValues}
                  medications={draft.medications}
                  otcMedications={draft.otcMedications ?? []}
                  onValuesChange={setSectionValues}
                    onMedicationsChange={(medications) =>
                      updateDraftUnlessReview({ medications })
                    }
                    onOtcMedicationsChange={(otcMedications) =>
                      updateDraftUnlessReview({ otcMedications })
                    }
                />
              ) : section.id === "physical" ? (
                <PhysicalAssessmentSection
                  values={sectionValues}
                  onChange={setSectionValues}
                />
                ) : section.id === "mobility-falls" ? (
                  <MobilityFallsSection
                    values={sectionValues}
                    onChange={setSectionValues}
                    callout={section.callout}
                  />
                ) : section.id === "bone-health" ? (
                  <BoneHealthSection
                    values={sectionValues}
                    onChange={setSectionValues}
                  />
              ) : section.id === "cognition" ? (
                <CognitionSection
                  values={sectionValues}
                  onChange={setSectionValues}
                    callout={section.callout}
                  />
                ) : section.id === "mood" ? (
                  <PsychologicalAssessmentSection
                    values={sectionValues}
                    onChange={setSectionValues}
                    callout={section.callout}
                  />
                ) : section.id === "delirium" ? (
                  <DeliriumAssessmentSection
                    values={sectionValues}
                    onChange={setSectionValues}
                    callout={section.callout}
                  />
                ) : section.id === "function" ? (
                  <FunctionalAssessmentSection
                    values={sectionValues}
                    onChange={setSectionValues}
                    callout={section.callout}
                  />
                ) : section.id === "social-home" ? (
                  <SocialEnvironmentalSection
                    values={sectionValues}
                    onChange={setSectionValues}
                  />
                ) : section.id === "continence" ? (
                  <UrinaryIncontinenceSection
                    values={sectionValues}
                    onChange={setSectionValues}
                    callout={section.callout}
                  />
                ) : section.id === "nutrition" ? (
                  <NutritionalAssessmentSection
                    values={sectionValues}
                    onChange={setSectionValues}
                    callout={section.callout}
                  />
                ) : section.id === "advance-care" ? (
                  <EndOfLifeSection
                    values={sectionValues}
                    onChange={setSectionValues}
                    callout={section.callout}
                  />
                ) : section.id === "frailty-flags" ? (
                  <FrailtyFlagsSection
                    values={sectionValues}
                    onChange={setSectionValues}
                    callout={section.callout}
                />
              ) : section.id === "problem-list" ? (
                <ProblemListSection
                  problems={draft.problems ?? []}
                  onProblemsChange={(problems) =>
                    updateDraftUnlessReview({ problems })
                  }
                  callout={section.callout}
                />
              ) : section.id === "care-plan" ? (
                <CarePlanSection
                  values={sectionValues}
                  onChange={setSectionValues}
                  carePlanActions={draft.carePlanActions ?? []}
                  onCarePlanActionsChange={(carePlanActions) =>
                    updateDraftUnlessReview({ carePlanActions })
                  }
                  carePlanReferrals={draft.carePlanReferrals ?? []}
                  onCarePlanReferralsChange={(carePlanReferrals) =>
                    updateDraftUnlessReview({ carePlanReferrals })
                  }
                  callout={section.callout}
                />
              ) : section.id === "capacity" ? (
                <MentalCapacitySection
                  values={sectionValues}
                  onChange={setSectionValues}
                  callout={section.callout}
                />
              ) : section.id === "investigations" ? (
                <CgaInvestigationsSection
                  labs={draft.labs ?? []}
                  testsRequestedToday={
                    typeof sectionValues.testsRequestedToday === "string"
                      ? sectionValues.testsRequestedToday
                      : ""
                  }
                  onLabsChange={(labs) => updateDraftUnlessReview({ labs })}
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
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-divider p-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (reviewMode) {
                    notifyReviewEditBlocked();
                    return;
                  }
                  handleSaveDraft();
                }}
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
                  <AppIcon icon={ArrowLeft01Icon} size={BADGE_ICON_SIZE} />
                  Previous
                </Button>
                <Button
                  type="button"
                  disabled={!reviewMode && !canContinue}
                  title={
                    reviewMode
                      ? "Turn off Review Mode to edit and continue"
                      : canContinue
                        ? undefined
                        : "Fill in all fields in this section to continue"
                  }
                  onClick={() => {
                    if (reviewMode) {
                      notifyReviewEditBlocked();
                      return;
                    }
                    markCompleteAndGo(sectionIndex + 1);
                  }}
                >
                  {sectionIndex >= CGA_SECTIONS.length - 1
                    ? "Sign & finish"
                    : "Save & continue"}
                  <AppIcon icon={ArrowRight01Icon} size={BADGE_ICON_SIZE} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppPageFrame>
  );
}
