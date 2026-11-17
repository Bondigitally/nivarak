"use client";

import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import {
  getLocalTimeZone,
  parseDate,
  today,
  type DateValue,
} from "@internationalized/date";
import { AppIcon } from "@/components/shared/AppIcon";
import { JollyDatePicker } from "@/components/ui/date-range-picker";
import { FormSelect } from "@/components/ui/form-select";
import {
  fieldInputClassName,
  fieldTextareaClassName,
} from "@/components/ui/input";
import { dashboardCardClass } from "@/features/dashboard/data/dashboard-styles";
import {
  CGA_ICD_DIAGNOSIS_OPTIONS,
  CGA_ICD_OTHER_VALUE,
  CGA_TREATING_SPECIALITY_OPTIONS,
  emptyActiveDiagnosisRow,
  emptyHospitalisationRow,
  emptyPastSurgeryRow,
  type CgaActiveDiagnosisRow,
  type CgaHospitalisationRow,
  type CgaPastSurgeryRow,
} from "@/features/assessments/data/cga-medical-history-data";
import type { CgaSectionValues } from "@/features/assessments/data/cga-assessment-draft";
import { CgaRevealDetails } from "@/features/assessments/components/CgaRevealDetails";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { radius } from "@/lib/tokens/radius";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

const fieldLabelClass = typo.label;
const fieldStackClass = "flex flex-col gap-2";
const cgaTextareaClass = cn(fieldTextareaClassName, "min-h-[6rem]");
const cgaMedicalHistoryTableInputClass = cn(
  fieldInputClassName,
  "min-w-0 truncate px-2 whitespace-nowrap",
  "hover:border-muted-foreground/30 hover:bg-muted/30",
);

/** Same corner radius as {@link jollyDatePickerFieldGroupClassName} (`rounded-md`). */
const cgaMedicalHistoryTableDateFieldRadiusClass = radius.md;

const cgaMedicalHistoryDateRangeFieldGroupClass = cn(
  cgaMedicalHistoryTableDateFieldRadiusClass,
  "h-11 w-fit max-w-full flex-nowrap",
  "hover:border-muted-foreground/30 hover:bg-muted/30",
);
const cgaMedicalHistoryTableDatePickerClass = "w-fit max-w-full";
/** Match {@link jollyDatePickerInputClassName} slot — do not override width/height. */
const cgaMedicalHistoryTableDateInputClassName =
  "text-sm leading-5 tabular-nums";

/** Keeps FormSelect triggers within table columns; label truncates in FormSelect. */
const cgaMedicalHistoryTableSelectClass = "w-full min-w-0";
const cgaMedicalHistoryTableCellClass = "min-w-0 px-2 py-2";
const cgaMedicalHistoryIndexCellClass = "w-10 min-w-10 shrink-0 px-2 py-2";
const cgaMedicalHistoryActionCellClass = "w-10 min-w-10 shrink-0 px-2 py-2";
const cgaMedicalHistoryTableRowClass =
  "border-b border-divider align-top last:border-0";
const cgaMedicalHistoryTableHeaderClass =
  "min-w-0 truncate px-2 py-3 font-medium whitespace-nowrap";
const cgaMedicalHistoryDurationChipClass = cn(
  cgaMedicalHistoryTableDateFieldRadiusClass,
  "bg-primary/5 px-2 py-1",
  typo.caption,
  "text-primary",
);

function formatDiagnosisDurationValue(duration: {
  years: number;
  days: number;
}): string {
  const yearUnit = duration.years === 1 ? "year" : "years";
  const dayUnit = duration.days === 1 ? "day" : "days";
  if (duration.years === 0 && duration.days === 0) {
    return "0 days";
  }
  const parts: string[] = [];
  if (duration.years > 0) {
    parts.push(`${duration.years} ${yearUnit}`);
  }
  if (duration.days > 0) {
    parts.push(`${duration.days} ${dayUnit}`);
  }
  return parts.join(" ");
}

function isoFromDateValue(value: DateValue): string {
  return `${value.year}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}`;
}

/**
 * Duration from onset through end (inclusive of calendar span).
 * When end is empty, uses today (ongoing active diagnosis).
 */
function diagnosisDurationParts(
  onsetDate: string,
  endDate: string,
): { years: number; days: number } | null {
  if (!onsetDate.trim()) return null;
  try {
    const start = parseDate(onsetDate.trim());
    const end = endDate.trim()
      ? parseDate(endDate.trim())
      : today(getLocalTimeZone());
    if (end.compare(start) < 0) return null;

    let years = 0;
    let cursor = start;
    while (true) {
      const nextYear = cursor.add({ years: 1 });
      if (nextYear.compare(end) <= 0) {
        years += 1;
        cursor = nextYear;
      } else {
        break;
      }
    }

    let days = 0;
    while (cursor.compare(end) < 0) {
      cursor = cursor.add({ days: 1 });
      days += 1;
    }

    return { years, days };
  } catch {
    return null;
  }
}

function surgeryDateValue(surgeryDate: string): DateValue | null {
  if (!surgeryDate.trim()) return null;
  try {
    return parseDate(surgeryDate.trim());
  } catch {
    return null;
  }
}

function admissionDateValue(admissionDate: string): DateValue | null {
  if (!admissionDate.trim()) return null;
  try {
    return parseDate(admissionDate.trim());
  } catch {
    return null;
  }
}

export function CgaMedicalHistorySection({
  values,
  activeDiagnoses,
  pastSurgeries,
  hospitalisations,
  onValuesChange,
  onActiveDiagnosesChange,
  onPastSurgeriesChange,
  onHospitalisationsChange,
}: {
  values: CgaSectionValues;
  activeDiagnoses: CgaActiveDiagnosisRow[];
  pastSurgeries: CgaPastSurgeryRow[];
  hospitalisations: CgaHospitalisationRow[];
  onValuesChange: (next: CgaSectionValues) => void;
  onActiveDiagnosesChange: (next: CgaActiveDiagnosisRow[]) => void;
  onPastSurgeriesChange: (next: CgaPastSurgeryRow[]) => void;
  onHospitalisationsChange: (next: CgaHospitalisationRow[]) => void;
}) {
  const rangePopoverPortal =
    typeof document !== "undefined" ? document.body : null;

  function setField(id: string, next: string) {
    onValuesChange({ ...values, [id]: next });
  }

  function updateDiagnosisRow(
    id: string,
    patch: Partial<CgaActiveDiagnosisRow>,
  ) {
    onActiveDiagnosesChange(
      activeDiagnoses.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  function removeDiagnosisRow(id: string) {
    onActiveDiagnosesChange(activeDiagnoses.filter((row) => row.id !== id));
  }

  function updateSurgeryRow(id: string, patch: Partial<CgaPastSurgeryRow>) {
    onPastSurgeriesChange(
      pastSurgeries.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  function removeSurgeryRow(id: string) {
    onPastSurgeriesChange(pastSurgeries.filter((row) => row.id !== id));
  }

  function updateHospitalisationRow(
    id: string,
    patch: Partial<CgaHospitalisationRow>,
  ) {
    onHospitalisationsChange(
      hospitalisations.map((row) =>
        row.id === id ? { ...row, ...patch } : row,
      ),
    );
  }

  function removeHospitalisationRow(id: string) {
    onHospitalisationsChange(hospitalisations.filter((row) => row.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div>
          <h3 className={typo.headingL}>2.1 Active diagnoses</h3>
          <p className={cn(typo.caption, "mt-1 text-muted-foreground")}>
            For each active problem, record coded or free-text diagnosis, onset
            date, treating specialty, and where care is provided.
          </p>
        </div>
        <div className={cn(dashboardCardClass, "overflow-hidden p-0")}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[54rem] table-fixed text-left">
            <thead>
              <tr className="border-b border-divider bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className={cn(cgaMedicalHistoryIndexCellClass, "py-3 font-medium")}>
                  #
                </th>
                <th className={cn(cgaMedicalHistoryTableHeaderClass, "w-[26%]")}>
                  Diagnosis
                </th>
                <th
                  className={cn(
                    cgaMedicalHistoryTableHeaderClass,
                    "w-[18%] min-w-[12.5rem]",
                  )}
                >
                  Duration / onset
                </th>
                <th
                  className={cn(
                    cgaMedicalHistoryTableHeaderClass,
                    "w-[16%] min-w-[9rem]",
                  )}
                >
                  Speciality
                </th>
                <th className={cgaMedicalHistoryTableHeaderClass}>
                  Treating specialist / hospital
                </th>
                <th
                  data-cga-edit-only=""
                  className={cn(cgaMedicalHistoryActionCellClass, "py-3")}
                >
                  <span className="sr-only">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {activeDiagnoses.map((row, index) => (
                <tr key={row.id} className={cgaMedicalHistoryTableRowClass}>
                  <td className={cgaMedicalHistoryIndexCellClass}>
                    <span
                      className={cn(
                        typo.bodyM,
                        "tabular-nums font-medium text-muted-foreground",
                      )}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className={cgaMedicalHistoryTableCellClass}>
                    <div className="flex min-w-0 flex-col gap-2">
                      <FormSelect
                        id={`cga-dx-icd-${row.id}`}
                        aria-label={`Diagnosis ICD row ${index + 1}`}
                        enableHoverScroll
                        className={cgaMedicalHistoryTableSelectClass}
                        value={row.icdCode}
                        options={CGA_ICD_DIAGNOSIS_OPTIONS.map((opt) => ({
                          value: opt.value,
                          label: opt.label,
                        }))}
                        placeholder="ICD code / other"
                        onChange={(value) =>
                          updateDiagnosisRow(row.id, {
                            icdCode: value,
                            diagnosisOther:
                              value === CGA_ICD_OTHER_VALUE
                                ? row.diagnosisOther
                                : "",
                          })
                        }
                      />
                      <CgaRevealDetails
                        open={row.icdCode === CGA_ICD_OTHER_VALUE}
                      >
                        <input
                          value={row.diagnosisOther}
                          onChange={(e) =>
                            updateDiagnosisRow(row.id, {
                              diagnosisOther: e.target.value,
                            })
                          }
                          placeholder="Enter diagnosis"
                          className={cgaMedicalHistoryTableInputClass}
                        />
                      </CgaRevealDetails>
                    </div>
                  </td>
                  <td className={cgaMedicalHistoryTableCellClass}>
                    <div className="flex min-w-0 flex-col gap-2">
                      <JollyDatePicker
                        aria-label={`Onset from row ${index + 1}`}
                        showLabel={false}
                        inputPlaceholder="From"
                        className={cgaMedicalHistoryTableDatePickerClass}
                        portalContainer={rangePopoverPortal}
                        fieldGroupClassName={
                          cgaMedicalHistoryDateRangeFieldGroupClass
                        }
                        dateInputClassName={
                          cgaMedicalHistoryTableDateInputClassName
                        }
                        value={surgeryDateValue(row.onsetDate)}
                        onChange={(value) =>
                          updateDiagnosisRow(row.id, {
                            onsetDate: value ? isoFromDateValue(value) : "",
                          })
                        }
                      />
                      <JollyDatePicker
                        aria-label={`Onset to row ${index + 1}`}
                        showLabel={false}
                        inputPlaceholder="To"
                        className={cgaMedicalHistoryTableDatePickerClass}
                        portalContainer={rangePopoverPortal}
                        fieldGroupClassName={
                          cgaMedicalHistoryDateRangeFieldGroupClass
                        }
                        dateInputClassName={
                          cgaMedicalHistoryTableDateInputClassName
                        }
                        value={surgeryDateValue(row.endDate)}
                        onChange={(value) =>
                          updateDiagnosisRow(row.id, {
                            endDate: value ? isoFromDateValue(value) : "",
                          })
                        }
                      />
                      {(() => {
                        const duration = diagnosisDurationParts(
                          row.onsetDate,
                          row.endDate,
                        );
                        if (!duration) return null;
                        return (
                          <p className={cgaMedicalHistoryDurationChipClass}>
                            Duration:{" "}
                            <span className="font-semibold">
                              {formatDiagnosisDurationValue(duration)}
                            </span>
                          </p>
                        );
                      })()}
                    </div>
                  </td>
                  <td className={cgaMedicalHistoryTableCellClass}>
                    <FormSelect
                      id={`cga-dx-spec-${row.id}`}
                      aria-label={`Speciality row ${index + 1}`}
                      enableHoverScroll
                      className={cgaMedicalHistoryTableSelectClass}
                      value={row.speciality}
                      options={CGA_TREATING_SPECIALITY_OPTIONS.map((opt) => ({
                        value: opt.value,
                        label: opt.label,
                      }))}
                      placeholder="Speciality"
                      onChange={(value) =>
                        updateDiagnosisRow(row.id, { speciality: value })
                      }
                    />
                  </td>
                  <td className={cgaMedicalHistoryTableCellClass}>
                    <input
                      value={row.treatingSpecialistHospital}
                      onChange={(e) =>
                        updateDiagnosisRow(row.id, {
                          treatingSpecialistHospital: e.target.value,
                        })
                      }
                      placeholder="Specialist name / hospital"
                      className={cgaMedicalHistoryTableInputClass}
                    />
                  </td>
                  <td
                    data-cga-edit-only=""
                    className={cgaMedicalHistoryActionCellClass}
                  >
                    <button
                      type="button"
                      aria-label={`Remove diagnosis ${index + 1}`}
                      onClick={() => removeDiagnosisRow(row.id)}
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
              onActiveDiagnosesChange([
                ...activeDiagnoses,
                emptyActiveDiagnosisRow(),
              ])
            }
          >
            <AppIcon icon={Add01Icon} size={BADGE_ICON_SIZE} />
            Add diagnosis
          </button>
        </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h3 className={typo.headingL}>2.2 Relevant past medical history</h3>
          <p className={cn(typo.caption, "mt-1 text-muted-foreground")}>
            Record prior surgeries with the date performed and procedure name.
          </p>
        </div>
        <div className={cn(dashboardCardClass, "overflow-hidden p-0")}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] table-fixed text-left">
              <thead>
                <tr className="border-b border-divider bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className={cn(cgaMedicalHistoryIndexCellClass, "py-3 font-medium")}>
                    #
                  </th>
                  <th
                    className={cn(
                      cgaMedicalHistoryTableHeaderClass,
                      "w-[10.5rem]",
                    )}
                  >
                    Date
                  </th>
                  <th className={cn(cgaMedicalHistoryTableHeaderClass, "min-w-0")}>
                    Type of surgery
                  </th>
                  <th
                    data-cga-edit-only=""
                    className={cn(cgaMedicalHistoryActionCellClass, "py-3")}
                  >
                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pastSurgeries.map((row, index) => (
                  <tr key={row.id} className={cgaMedicalHistoryTableRowClass}>
                    <td className={cgaMedicalHistoryIndexCellClass}>
                      <span
                        className={cn(
                          typo.bodyM,
                          "tabular-nums font-medium text-muted-foreground",
                        )}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className={cgaMedicalHistoryTableCellClass}>
                      <JollyDatePicker
                        aria-label={`Surgery date row ${index + 1}`}
                        showLabel={false}
                        className={cgaMedicalHistoryTableDatePickerClass}
                        portalContainer={rangePopoverPortal}
                        fieldGroupClassName={
                          cgaMedicalHistoryDateRangeFieldGroupClass
                        }
                        dateInputClassName={cgaMedicalHistoryTableDateInputClassName}
                        value={surgeryDateValue(row.surgeryDate)}
                        onChange={(value) =>
                          updateSurgeryRow(row.id, {
                            surgeryDate: value
                              ? isoFromDateValue(value)
                              : "",
                          })
                        }
                      />
                    </td>
                    <td className={cgaMedicalHistoryTableCellClass}>
                      <input
                        value={row.surgeryType}
                        onChange={(e) =>
                          updateSurgeryRow(row.id, {
                            surgeryType: e.target.value,
                          })
                        }
                        placeholder="Procedure name"
                        className={cgaMedicalHistoryTableInputClass}
                      />
                    </td>
                    <td
                      data-cga-edit-only=""
                      className={cgaMedicalHistoryActionCellClass}
                    >
                      <button
                        type="button"
                        aria-label={`Remove surgery ${index + 1}`}
                        onClick={() => removeSurgeryRow(row.id)}
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
                onPastSurgeriesChange([
                  ...pastSurgeries,
                  emptyPastSurgeryRow(),
                ])
              }
            >
              <AppIcon icon={Add01Icon} size={BADGE_ICON_SIZE} />
              Add surgery
            </button>
          </div>
        </div>
      </section>

      <section className={fieldStackClass}>
        <h3 className={typo.headingL}>2.3 Relevant family history</h3>
        <textarea
          id="cga-family-history"
          value={
            typeof values.familyHistory === "string" ? values.familyHistory : ""
          }
          onChange={(e) => setField("familyHistory", e.target.value)}
          rows={3}
          placeholder="e.g. Father: diabetes; Mother: hypertension"
          className={cgaTextareaClass}
        />
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h3 className={typo.headingL}>
            2.4 Hospitalisation (In last 2 years)
          </h3>
          <p className={cn(typo.caption, "mt-1 text-muted-foreground")}>
            Record admissions in the last two years with reason, facility, length
            of stay, and outcome if known.
          </p>
        </div>
        <div className={cn(dashboardCardClass, "overflow-hidden p-0")}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] table-fixed text-left">
              <thead>
                <tr className="border-b border-divider bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className={cn(cgaMedicalHistoryIndexCellClass, "py-3 font-medium")}>
                    #
                  </th>
                  <th
                    className={cn(
                      cgaMedicalHistoryTableHeaderClass,
                      "w-[10.5rem]",
                    )}
                  >
                    Date
                  </th>
                  <th
                    className={cn(cgaMedicalHistoryTableHeaderClass, "w-[28%]")}
                  >
                    Reason / diagnosis
                  </th>
                  <th
                    className={cn(
                      cgaMedicalHistoryTableHeaderClass,
                      "w-[22%] min-w-[9rem]",
                    )}
                  >
                    Hospital
                  </th>
                  <th
                    className={cn(
                      cgaMedicalHistoryTableHeaderClass,
                      "w-[24%] min-w-[11rem]",
                    )}
                  >
                    Duration (Days) / outcome
                  </th>
                  <th
                    data-cga-edit-only=""
                    className={cn(cgaMedicalHistoryActionCellClass, "py-3")}
                  >
                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {hospitalisations.map((row, index) => (
                  <tr key={row.id} className={cgaMedicalHistoryTableRowClass}>
                    <td className={cgaMedicalHistoryIndexCellClass}>
                      <span
                        className={cn(
                          typo.bodyM,
                          "tabular-nums font-medium text-muted-foreground",
                        )}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className={cgaMedicalHistoryTableCellClass}>
                      <JollyDatePicker
                        aria-label={`Admission date row ${index + 1}`}
                        showLabel={false}
                        className={cgaMedicalHistoryTableDatePickerClass}
                        portalContainer={rangePopoverPortal}
                        fieldGroupClassName={
                          cgaMedicalHistoryDateRangeFieldGroupClass
                        }
                        dateInputClassName={cgaMedicalHistoryTableDateInputClassName}
                        value={admissionDateValue(row.admissionDate)}
                        onChange={(value) =>
                          updateHospitalisationRow(row.id, {
                            admissionDate: value
                              ? isoFromDateValue(value)
                              : "",
                          })
                        }
                      />
                    </td>
                    <td className={cgaMedicalHistoryTableCellClass}>
                      <div className="flex min-w-0 flex-col gap-2">
                        <FormSelect
                          id={`cga-hosp-icd-${row.id}`}
                          aria-label={`Hospitalisation diagnosis row ${index + 1}`}
                          enableHoverScroll
                          className={cgaMedicalHistoryTableSelectClass}
                          value={row.icdCode}
                          options={CGA_ICD_DIAGNOSIS_OPTIONS.map((opt) => ({
                            value: opt.value,
                            label: opt.label,
                          }))}
                          placeholder="ICD code / other"
                          onChange={(value) =>
                            updateHospitalisationRow(row.id, {
                              icdCode: value,
                              diagnosisOther:
                                value === CGA_ICD_OTHER_VALUE
                                  ? row.diagnosisOther
                                  : "",
                            })
                          }
                        />
                        <CgaRevealDetails
                          open={row.icdCode === CGA_ICD_OTHER_VALUE}
                        >
                          <input
                            value={row.diagnosisOther}
                            onChange={(e) =>
                              updateHospitalisationRow(row.id, {
                                diagnosisOther: e.target.value,
                              })
                            }
                            placeholder="Enter diagnosis"
                            className={cgaMedicalHistoryTableInputClass}
                          />
                        </CgaRevealDetails>
                      </div>
                    </td>
                    <td className={cgaMedicalHistoryTableCellClass}>
                      <input
                        value={row.hospital}
                        onChange={(e) =>
                          updateHospitalisationRow(row.id, {
                            hospital: e.target.value,
                          })
                        }
                        placeholder="Hospital name"
                        className={cgaMedicalHistoryTableInputClass}
                      />
                    </td>
                    <td className={cgaMedicalHistoryTableCellClass}>
                      <div className="flex min-w-0 flex-col gap-2">
                        <input
                          value={row.durationDays}
                          onChange={(e) =>
                            updateHospitalisationRow(row.id, {
                              durationDays: e.target.value,
                            })
                          }
                          placeholder="Days"
                          inputMode="numeric"
                          className={cgaMedicalHistoryTableInputClass}
                        />
                        <input
                          value={row.outcome}
                          onChange={(e) =>
                            updateHospitalisationRow(row.id, {
                              outcome: e.target.value,
                            })
                          }
                          placeholder="Outcome (optional)"
                          className={cgaMedicalHistoryTableInputClass}
                        />
                      </div>
                    </td>
                    <td
                      data-cga-edit-only=""
                      className={cgaMedicalHistoryActionCellClass}
                    >
                      <button
                        type="button"
                        aria-label={`Remove hospitalisation ${index + 1}`}
                        onClick={() => removeHospitalisationRow(row.id)}
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
                onHospitalisationsChange([
                  ...hospitalisations,
                  emptyHospitalisationRow(),
                ])
              }
            >
              <AppIcon icon={Add01Icon} size={BADGE_ICON_SIZE} />
              Add hospitalisation
            </button>
          </div>
        </div>
      </section>

      <section className={fieldStackClass}>
        <h3 className={typo.headingL}>2.5 Allergies</h3>
        <input
          id="cga-allergies"
          type="text"
          value={typeof values.allergies === "string" ? values.allergies : ""}
          onChange={(e) => setField("allergies", e.target.value)}
          placeholder="e.g. Penicillin"
          className={fieldInputClassName}
        />
      </section>
    </div>
  );
}