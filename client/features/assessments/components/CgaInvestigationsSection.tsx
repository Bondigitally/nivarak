"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { dashboardCardClass } from "@/features/dashboard/data/dashboard-styles";
import {
  CGA_IMAGING_MODALITY_OPTIONS,
  CGA_INVESTIGATION_STATUS_OPTIONS,
  CGA_LAB_CATALOG,
  CGA_PENDING_CATEGORY_OPTIONS,
  CGA_PENDING_STATUS_OPTIONS,
  CGA_QUALITATIVE_RESULT_OPTIONS,
  emptyImagingRow,
  emptyLabRow,
  emptyPendingRow,
  findLabCatalogItem,
  type CgaImagingRow,
  type CgaInvestigationStatus,
  type CgaLabResultType,
  type CgaLabRow,
  type CgaPendingRow,
  type CgaPendingStatus,
} from "@/features/assessments/data/cga-investigations-data";
import { statusBadgeClass } from "@/lib/tokens/status-badges";
import { radius } from "@/lib/tokens/radius";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

const fieldLabelClass = typo.label;
const fieldHintClass = cn(typo.caption, "text-muted-foreground");
const fieldStackClass = "flex flex-col gap-1.5";
const sectionDescClass = cn(typo.caption, "mt-0.5 text-muted-foreground");

const cardShellClass = cn(
  radius.md,
  "border border-border bg-card p-4 shadow-none",
);

const addActionClass = cn(
  typo.button,
  "inline-flex h-9 items-center rounded-md px-2 text-primary transition-colors",
  "hover:bg-primary/10",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
);

const removeActionClass = cn(
  typo.button,
  "inline-flex h-8 shrink-0 items-center rounded-md px-2 text-muted-foreground transition-colors",
  "hover:bg-destructive-muted hover:text-destructive",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
);

const findingsClass = cn(fieldTextareaClassName, "min-h-[5.5rem]");

type SelectOption = { value: string; label: string };

function InvSelect({
  id,
  value,
  options,
  onChange,
  placeholder = "Select…",
  "aria-label": ariaLabel,
}: {
  id?: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  "aria-label"?: string;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuWidth, setMenuWidth] = useState<number>();
  const selected = options.find((item) => item.value === value);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const syncWidth = () => setMenuWidth(el.getBoundingClientRect().width);
    syncWidth();
    const observer = new ResizeObserver(syncWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          aria-label={ariaLabel}
          className={cn(
            fieldInputClassName,
            "flex items-center justify-between gap-2 text-left",
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
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="start"
        sideOffset={6}
        avoidCollisions={false}
        style={menuWidth ? { width: menuWidth } : undefined}
        className={cn(
          "max-w-[calc(100vw-2rem)] overflow-hidden rounded-md border-border bg-card p-0 shadow-md",
          !menuWidth && "w-[min(20rem,calc(100vw-2.5rem))]",
          typo.input,
        )}
      >
        <div className="max-h-56 overflow-y-auto overscroll-contain p-1.5">
          {options.map((item) => {
            const isSelected = item.value === value;
            return (
              <DropdownMenuItem
                key={item.value}
                onSelect={() => onChange(item.value)}
                className={cn(
                  "cursor-pointer rounded-sm px-3 py-2",
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

/** Searchable test-name field with catalog suggestions + free-text custom names. */
function LabTestCombobox({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (next: {
    testName: string;
    unit?: string;
    resultType?: CgaLabResultType;
  }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [...CGA_LAB_CATALOG];
    return CGA_LAB_CATALOG.filter((item) =>
      item.name.toLowerCase().includes(needle),
    );
  }, [query]);

  function commitCustom(name: string) {
    const trimmed = name.trim();
    const catalog = findLabCatalogItem(trimmed);
    if (catalog) {
      onChange({
        testName: catalog.name,
        unit: catalog.unit ?? "",
        resultType: catalog.resultType,
      });
    } else {
      onChange({ testName: trimmed, resultType: "text" });
    }
    setQuery(trimmed);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-autocomplete="list"
        value={query}
        placeholder="Search or type test name"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onBlur={() => {
          // Defer so option click can commit first.
          window.setTimeout(() => {
            if (!rootRef.current?.contains(document.activeElement)) {
              commitCustom(query);
            }
          }, 120);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (filtered[0] && query.trim()) {
              const first = filtered[0];
              onChange({
                testName: first.name,
                unit: first.unit ?? "",
                resultType: first.resultType,
              });
              setQuery(first.name);
              setOpen(false);
            } else {
              commitCustom(query);
            }
          }
          if (e.key === "Escape") {
            setOpen(false);
            inputRef.current?.blur();
          }
        }}
        className={fieldInputClassName}
      />
      {open && (
        <div
          id={`${id}-listbox`}
          role="listbox"
          className={cn(
            "absolute z-30 mt-1.5 w-full overflow-hidden rounded-md border border-border bg-card shadow-md",
          )}
        >
          <div className="max-h-52 overflow-y-auto overscroll-contain p-1.5">
            {filtered.length === 0 ? (
              <button
                type="button"
                role="option"
                className={cn(
                  typo.input,
                  "flex w-full cursor-pointer rounded-sm px-3 py-2 text-left hover:bg-accent",
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => commitCustom(query)}
              >
                Use “{query.trim() || "custom test"}”
              </button>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  className={cn(
                    typo.input,
                    "flex w-full cursor-pointer rounded-sm px-3 py-2 text-left hover:bg-accent",
                    item.name === value && "bg-background",
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange({
                      testName: item.name,
                      unit: item.unit ?? "",
                      resultType: item.resultType,
                    });
                    setQuery(item.name);
                    setOpen(false);
                  }}
                >
                  <span className="min-w-0 flex-1 truncate">{item.name}</span>
                  {item.unit ? (
                    <span className="ml-2 shrink-0 text-muted-foreground">
                      {item.unit}
                    </span>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function investigationStatusClass(status: CgaInvestigationStatus | ""): string {
  switch (status) {
    case "ordered":
      return "border-border bg-muted/60 text-muted-foreground";
    case "completed":
      return "border-info/25 bg-info-muted text-info";
    case "reviewed":
      return "border-primary/20 bg-primary/5 text-primary";
    default:
      return "border-border bg-muted/60 text-muted-foreground";
  }
}

function pendingStatusClass(status: CgaPendingStatus | ""): string {
  switch (status) {
    case "ordered":
      return "border-border bg-muted/60 text-muted-foreground";
    case "awaiting":
      return "border-warning/25 bg-warning-muted text-warning";
    case "completed":
      return "border-info/25 bg-info-muted text-info";
    case "cancelled":
      return "border-destructive/20 bg-destructive-muted text-destructive";
    default:
      return "border-border bg-muted/60 text-muted-foreground";
  }
}

function statusLabel(
  status: string,
  options: readonly { id: string; label: string }[],
): string {
  return options.find((o) => o.id === status)?.label ?? status;
}

export function CgaInvestigationsSection({
  labs,
  imaging,
  pending,
  onLabsChange,
  onImagingChange,
  onPendingChange,
}: {
  labs: CgaLabRow[];
  imaging: CgaImagingRow[];
  pending: CgaPendingRow[];
  onLabsChange: (next: CgaLabRow[]) => void;
  onImagingChange: (next: CgaImagingRow[]) => void;
  onPendingChange: (next: CgaPendingRow[]) => void;
}) {
  function updateLab(id: string, patch: Partial<CgaLabRow>) {
    onLabsChange(labs.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function updateImaging(id: string, patch: Partial<CgaImagingRow>) {
    onImagingChange(
      imaging.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  function updatePending(id: string, patch: Partial<CgaPendingRow>) {
    onPendingChange(
      pending.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  const statusOptions = CGA_INVESTIGATION_STATUS_OPTIONS.map((o) => ({
    value: o.id,
    label: o.label,
  }));
  const modalityOptions = CGA_IMAGING_MODALITY_OPTIONS.map((o) => ({
    value: o.id,
    label: o.label,
  }));
  const categoryOptions = CGA_PENDING_CATEGORY_OPTIONS.map((o) => ({
    value: o.id,
    label: o.label,
  }));
  const pendingStatusOptions = CGA_PENDING_STATUS_OPTIONS.map((o) => ({
    value: o.id,
    label: o.label,
  }));
  const qualitativeOptions = CGA_QUALITATIVE_RESULT_OPTIONS.map((o) => ({
    value: o.id,
    label: o.label,
  }));

  return (
    <div className="flex w-full flex-col gap-5">
      {/* Relevant Labs */}
      <section className={cn(dashboardCardClass, "overflow-visible p-0")}>
        <div className="border-b border-divider px-5 py-4">
          <h3 className={typo.headingL}>Relevant Labs</h3>
          <p className={sectionDescClass}>
            Record laboratory investigations with results when available.
          </p>
        </div>
        <div className="flex flex-col gap-3 px-5 py-4">
          {labs.length === 0 ? (
            <p className={cn(typo.bodyS, "text-muted-foreground")}>
              No laboratory investigations added yet.
            </p>
          ) : (
            labs.map((row, index) => {
              const resultRequired = row.status !== "ordered";
              return (
                <article key={row.id} className={cardShellClass}>
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn(
                          typo.caption,
                          "tabular-nums text-muted-foreground",
                        )}
                      >
                        Lab {index + 1}
                      </span>
                      {row.status ? (
                        <span
                          className={cn(
                            statusBadgeClass,
                            "border",
                            investigationStatusClass(row.status),
                          )}
                        >
                          {statusLabel(
                            row.status,
                            CGA_INVESTIGATION_STATUS_OPTIONS,
                          )}
                        </span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className={removeActionClass}
                      onClick={() =>
                        onLabsChange(labs.filter((r) => r.id !== row.id))
                      }
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className={cn(fieldStackClass, "sm:col-span-2 lg:col-span-1")}>
                      <label
                        className={fieldLabelClass}
                        htmlFor={`cga-lab-test-${row.id}`}
                      >
                        Test name
                      </label>
                      <LabTestCombobox
                        id={`cga-lab-test-${row.id}`}
                        value={row.testName}
                        onChange={({ testName, unit, resultType }) => {
                          updateLab(row.id, {
                            testName,
                            ...(unit !== undefined ? { unit } : {}),
                            ...(resultType
                              ? {
                                  resultType,
                                  result:
                                    resultType !== row.resultType
                                      ? ""
                                      : row.result,
                                }
                              : {}),
                          });
                        }}
                      />
                    </div>

                    <div className={fieldStackClass}>
                      <label
                        className={fieldLabelClass}
                        htmlFor={`cga-lab-result-${row.id}`}
                      >
                        Result
                        {!resultRequired ? (
                          <span className="font-normal text-muted-foreground">
                            {" "}
                            (optional until completed)
                          </span>
                        ) : null}
                      </label>
                      {row.resultType === "qualitative" ? (
                        <InvSelect
                          id={`cga-lab-result-${row.id}`}
                          value={row.result}
                          options={qualitativeOptions}
                          onChange={(next) =>
                            updateLab(row.id, { result: next })
                          }
                          placeholder="Select result"
                          aria-label="Qualitative result"
                        />
                      ) : (
                        <input
                          id={`cga-lab-result-${row.id}`}
                          type={
                            row.resultType === "numeric" ? "number" : "text"
                          }
                          inputMode={
                            row.resultType === "numeric" ? "decimal" : undefined
                          }
                          step="any"
                          value={row.result}
                          onChange={(e) =>
                            updateLab(row.id, { result: e.target.value })
                          }
                          placeholder={
                            row.resultType === "numeric"
                              ? "e.g. 12.5"
                              : "Enter result"
                          }
                          className={fieldInputClassName}
                        />
                      )}
                    </div>

                    <div className={fieldStackClass}>
                      <label
                        className={fieldLabelClass}
                        htmlFor={`cga-lab-unit-${row.id}`}
                      >
                        Unit
                      </label>
                      <input
                        id={`cga-lab-unit-${row.id}`}
                        type="text"
                        value={row.unit}
                        onChange={(e) =>
                          updateLab(row.id, { unit: e.target.value })
                        }
                        placeholder="e.g. g/dL"
                        className={fieldInputClassName}
                      />
                    </div>

                    <div className={fieldStackClass}>
                      <label
                        className={fieldLabelClass}
                        htmlFor={`cga-lab-ref-${row.id}`}
                      >
                        Reference range
                      </label>
                      <input
                        id={`cga-lab-ref-${row.id}`}
                        type="text"
                        value={row.referenceRange}
                        onChange={(e) =>
                          updateLab(row.id, {
                            referenceRange: e.target.value,
                          })
                        }
                        placeholder="Optional — enter if known"
                        className={fieldInputClassName}
                      />
                      <p className={fieldHintClass}>
                        Leave blank when no verified range is available.
                      </p>
                    </div>

                    <div className={fieldStackClass}>
                      <label
                        className={fieldLabelClass}
                        htmlFor={`cga-lab-date-${row.id}`}
                      >
                        Test date
                      </label>
                      <input
                        id={`cga-lab-date-${row.id}`}
                        type="date"
                        value={row.testDate}
                        onChange={(e) =>
                          updateLab(row.id, { testDate: e.target.value })
                        }
                        className={fieldInputClassName}
                      />
                    </div>

                    <div className={fieldStackClass}>
                      <label
                        className={fieldLabelClass}
                        htmlFor={`cga-lab-status-${row.id}`}
                      >
                        Status
                      </label>
                      <InvSelect
                        id={`cga-lab-status-${row.id}`}
                        value={row.status}
                        options={statusOptions}
                        onChange={(next) =>
                          updateLab(row.id, {
                            status: next as CgaInvestigationStatus,
                          })
                        }
                        placeholder="Select status"
                      />
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
        <div className="border-t border-divider px-5 py-3">
          <button
            type="button"
            className={addActionClass}
            onClick={() => onLabsChange([...labs, emptyLabRow()])}
          >
            + Add investigation
          </button>
        </div>
      </section>

      {/* Imaging */}
      <section className={cn(dashboardCardClass, "overflow-visible p-0")}>
        <div className="border-b border-divider px-5 py-4">
          <h3 className={typo.headingL}>Imaging</h3>
          <p className={sectionDescClass}>
            Capture modality, site, and radiology findings for each study.
          </p>
        </div>
        <div className="flex flex-col gap-3 px-5 py-4">
          {imaging.length === 0 ? (
            <p className={cn(typo.bodyS, "text-muted-foreground")}>
              No imaging studies added yet.
            </p>
          ) : (
            imaging.map((row, index) => {
              const findingsRequired = row.status !== "ordered";
              return (
                <article key={row.id} className={cardShellClass}>
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn(
                          typo.caption,
                          "tabular-nums text-muted-foreground",
                        )}
                      >
                        Study {index + 1}
                      </span>
                      {row.status ? (
                        <span
                          className={cn(
                            statusBadgeClass,
                            "border",
                            investigationStatusClass(row.status),
                          )}
                        >
                          {statusLabel(
                            row.status,
                            CGA_INVESTIGATION_STATUS_OPTIONS,
                          )}
                        </span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className={removeActionClass}
                      onClick={() =>
                        onImagingChange(imaging.filter((r) => r.id !== row.id))
                      }
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className={fieldStackClass}>
                      <label
                        className={fieldLabelClass}
                        htmlFor={`cga-img-modality-${row.id}`}
                      >
                        Modality
                      </label>
                      <InvSelect
                        id={`cga-img-modality-${row.id}`}
                        value={row.modality}
                        options={modalityOptions}
                        onChange={(next) =>
                          updateImaging(row.id, {
                            modality: next as CgaImagingRow["modality"],
                          })
                        }
                        placeholder="Select modality"
                      />
                    </div>

                    <div className={cn(fieldStackClass, "sm:col-span-1 lg:col-span-2")}>
                      <label
                        className={fieldLabelClass}
                        htmlFor={`cga-img-region-${row.id}`}
                      >
                        Body region / site
                      </label>
                      <input
                        id={`cga-img-region-${row.id}`}
                        type="text"
                        value={row.bodyRegion}
                        onChange={(e) =>
                          updateImaging(row.id, {
                            bodyRegion: e.target.value,
                          })
                        }
                        placeholder="e.g. Chest, Lumbar spine"
                        className={fieldInputClassName}
                      />
                    </div>

                    <div className={fieldStackClass}>
                      <label
                        className={fieldLabelClass}
                        htmlFor={`cga-img-date-${row.id}`}
                      >
                        Examination date
                      </label>
                      <input
                        id={`cga-img-date-${row.id}`}
                        type="date"
                        value={row.examDate}
                        onChange={(e) =>
                          updateImaging(row.id, { examDate: e.target.value })
                        }
                        className={fieldInputClassName}
                      />
                    </div>

                    <div className={cn(fieldStackClass, "sm:col-span-2 lg:col-span-4")}>
                      <label
                        className={fieldLabelClass}
                        htmlFor={`cga-img-findings-${row.id}`}
                      >
                        Findings / impression
                        {!findingsRequired ? (
                          <span className="font-normal text-muted-foreground">
                            {" "}
                            (optional until completed)
                          </span>
                        ) : null}
                      </label>
                      <textarea
                        id={`cga-img-findings-${row.id}`}
                        value={row.findings}
                        onChange={(e) =>
                          updateImaging(row.id, { findings: e.target.value })
                        }
                        rows={4}
                        placeholder="Radiology impression or key findings"
                        className={findingsClass}
                      />
                    </div>

                    <div className={cn(fieldStackClass, "sm:col-span-1 lg:col-span-2")}>
                      <label
                        className={fieldLabelClass}
                        htmlFor={`cga-img-report-${row.id}`}
                      >
                        Report attachment
                      </label>
                      <div className="flex min-w-0 items-center gap-2">
                        <input
                          id={`cga-img-report-${row.id}`}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.dicom,application/pdf,image/*"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            updateImaging(row.id, {
                              reportName: file?.name ?? "",
                            });
                          }}
                        />
                        <label
                          htmlFor={`cga-img-report-${row.id}`}
                          className={cn(
                            fieldInputClassName,
                            "flex cursor-pointer items-center truncate",
                            !row.reportName && "text-placeholder",
                          )}
                        >
                          {row.reportName || "Choose file…"}
                        </label>
                        {row.reportName ? (
                          <button
                            type="button"
                            className={removeActionClass}
                            onClick={() =>
                              updateImaging(row.id, { reportName: "" })
                            }
                          >
                            Clear
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className={cn(fieldStackClass, "sm:col-span-1 lg:col-span-2")}>
                      <label
                        className={fieldLabelClass}
                        htmlFor={`cga-img-status-${row.id}`}
                      >
                        Status
                      </label>
                      <InvSelect
                        id={`cga-img-status-${row.id}`}
                        value={row.status}
                        options={statusOptions}
                        onChange={(next) =>
                          updateImaging(row.id, {
                            status: next as CgaInvestigationStatus,
                          })
                        }
                        placeholder="Select status"
                      />
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
        <div className="border-t border-divider px-5 py-3">
          <button
            type="button"
            className={addActionClass}
            onClick={() => onImagingChange([...imaging, emptyImagingRow()])}
          >
            + Add imaging study
          </button>
        </div>
      </section>

      {/* Pending Investigations */}
      <section className={cn(dashboardCardClass, "overflow-hidden p-0")}>
        <div className="border-b border-divider px-5 py-4">
          <h3 className={typo.headingL}>Pending Investigations</h3>
          <p className={sectionDescClass}>
            Track ordered work still awaiting results or review.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-200 text-left">
            <thead>
              <tr className="border-b border-divider bg-muted/40 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Investigation</th>
                <th className="px-2 py-3 font-medium">Category</th>
                <th className="px-2 py-3 font-medium">Ordered</th>
                <th className="px-2 py-3 font-medium">Expected</th>
                <th className="px-2 py-3 font-medium">Status</th>
                <th className="w-20 px-2 py-3">
                  <span className="sr-only">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className={cn(
                      typo.bodyS,
                      "px-4 py-6 text-muted-foreground",
                    )}
                  >
                    No pending investigations.
                  </td>
                </tr>
              ) : (
                pending.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-divider last:border-0"
                  >
                    <td className="px-3 py-2 align-middle">
                      <input
                        value={row.name}
                        onChange={(e) =>
                          updatePending(row.id, { name: e.target.value })
                        }
                        placeholder="Investigation name"
                        className={cn(
                          fieldInputClassName,
                          "min-w-40 border-transparent bg-transparent px-2",
                          "hover:border-border hover:bg-card",
                          "focus-visible:bg-card",
                          "font-medium",
                        )}
                        aria-label="Investigation name"
                      />
                    </td>
                    <td className="px-2 py-2 align-middle">
                      <div className="min-w-28">
                        <InvSelect
                          value={row.category}
                          options={categoryOptions}
                          onChange={(next) =>
                            updatePending(row.id, {
                              category: next as CgaPendingRow["category"],
                            })
                          }
                          placeholder="Category"
                          aria-label="Category"
                        />
                      </div>
                    </td>
                    <td className="px-2 py-2 align-middle">
                      <input
                        type="date"
                        value={row.orderedDate}
                        onChange={(e) =>
                          updatePending(row.id, {
                            orderedDate: e.target.value,
                          })
                        }
                        className={cn(fieldInputClassName, "min-w-36")}
                        aria-label="Ordered date"
                      />
                    </td>
                    <td className="px-2 py-2 align-middle">
                      <input
                        type="date"
                        value={row.expectedDate}
                        onChange={(e) =>
                          updatePending(row.id, {
                            expectedDate: e.target.value,
                          })
                        }
                        className={cn(fieldInputClassName, "min-w-36")}
                        aria-label="Expected date"
                      />
                    </td>
                    <td className="px-2 py-2 align-middle">
                      <div className="flex min-w-40 flex-col gap-1.5">
                        <InvSelect
                          value={row.status}
                          options={pendingStatusOptions}
                          onChange={(next) =>
                            updatePending(row.id, {
                              status: next as CgaPendingStatus,
                            })
                          }
                          placeholder="Status"
                          aria-label="Status"
                        />
                        {row.status ? (
                          <span
                            className={cn(
                              statusBadgeClass,
                              "w-fit border",
                              pendingStatusClass(row.status),
                            )}
                          >
                            {statusLabel(row.status, CGA_PENDING_STATUS_OPTIONS)}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-2 py-2 align-middle">
                      <button
                        type="button"
                        className={removeActionClass}
                        onClick={() =>
                          onPendingChange(
                            pending.filter((r) => r.id !== row.id),
                          )
                        }
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-divider px-5 py-3">
          <button
            type="button"
            className={addActionClass}
            onClick={() => onPendingChange([...pending, emptyPendingRow()])}
          >
            + Add pending investigation
          </button>
        </div>
      </section>
    </div>
  );
}
