"use client";

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import {
  DataTable,
  DataTableIdentity,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { TableSearch } from "@/components/shared/table-search";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  EditMedicationDialog,
  type MedicationEditFocusField,
} from "@/features/patients/components/EditMedicationDialog";
import { MedicationActionsMenu } from "@/features/patients/components/MedicationActionsMenu";
import { ViewMedicationDialog } from "@/features/patients/components/ViewMedicationDialog";
import {
  getPatientMedicationRouteLabel,
  type PatientMedicationRow,
  type PatientMedicationStatus,
} from "@/features/patients/data/patient-chart-data";
import { ICON_SIZE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

/** Table column id → dialog focus field (actions excluded). */
const COLUMN_FOCUS_FIELD: Record<string, MedicationEditFocusField> = {
  medication: "name",
  dose: "dose",
  freq: "frequency",
  route: "route",
  duration: "duration",
  // Auto / display-only columns fall back to name
  prescribedBy: "name",
  lastModified: "name",
  lastModifiedBy: "name",
};

function PrescriberAvatar({
  src,
  name,
}: {
  src: string;
  name: string;
}) {
  if (!src) {
    return (
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-medium text-muted-foreground"
        aria-hidden
      >
        {name.trim().slice(0, 1).toUpperCase() || "?"}
      </span>
    );
  }

  return (
    <span className="relative flex size-9 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
      <Image
        src={src}
        alt=""
        width={72}
        height={72}
        quality={90}
        sizes="36px"
        className="size-full object-cover"
      />
      <span className="sr-only">{name}</span>
    </span>
  );
}

type MedicationStatusFilter = "all" | PatientMedicationStatus;

const STATUS_FILTERS: MedicationStatusFilter[] = [
  "all",
  "Active",
  "On hold",
  "Discontinued",
];

const STATUS_TAB_LABEL: Record<MedicationStatusFilter, string> = {
  all: "All",
  Active: "Active",
  "On hold": "On Hold",
  Discontinued: "Discontinued",
};

function lastModifiedMs(row: PatientMedicationRow) {
  return Date.parse(row.lastModified);
}

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

function createEmptyMedication(): PatientMedicationRow {
  return {
    id: `med-${Date.now()}`,
    name: "",
    dose: "",
    frequency: "BD",
    route: "oral",
    duration: "",
    since: "",
    status: "Active",
    prescribedBy: "",
    prescriberQualification: "",
    prescriberAvatarUrl: "",
    lastModified: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    lastModifiedBy: "",
    lastModifiedByQualification: "",
    lastModifiedByAvatarUrl: "",
    tags: [],
  };
}

export function PatientMedicationsTable({
  data,
}: {
  data: PatientMedicationRow[];
}) {
  const [rows, setRows] = useState<PatientMedicationRow[]>(data);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<MedicationStatusFilter>("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"edit" | "add">("edit");
  const [editingRow, setEditingRow] = useState<PatientMedicationRow | null>(
    null,
  );
  const [focusField, setFocusField] =
    useState<MedicationEditFocusField>("name");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewingRow, setViewingRow] = useState<PatientMedicationRow | null>(
    null,
  );

  const statusCounts = useMemo(() => {
    const counts: Record<MedicationStatusFilter, number> = {
      all: rows.length,
      Active: 0,
      "On hold": 0,
      Discontinued: 0,
    };
    for (const row of rows) {
      counts[row.status] += 1;
    }
    return counts;
  }, [rows]);

  const statusTabs = useMemo(
    () =>
      STATUS_FILTERS.map((id) => ({
        id,
        label: `${STATUS_TAB_LABEL[id]} (${statusCounts[id]})`,
      })),
    [statusCounts],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) {
        return false;
      }
      if (!needle) return true;
      const routeLabel = getPatientMedicationRouteLabel(
        row.route,
        row.routeOther,
      );
      return [
        row.name,
        row.dose,
        row.frequency,
        routeLabel,
        row.routeOther ?? "",
        row.duration,
        formatDurationDate(row.duration),
        row.since,
        row.status,
        row.prescribedBy,
        row.prescriberQualification,
        row.lastModified,
        row.lastModifiedBy,
        row.lastModifiedByQualification,
      ].some((value) => value.toLowerCase().includes(needle));
    });
  }, [rows, query, statusFilter]);

  function openEdit(
    row: PatientMedicationRow,
    field: MedicationEditFocusField = "name",
  ) {
    setEditorMode("edit");
    setFocusField(field);
    setEditingRow(row);
    setEditorOpen(true);
  }

  function openView(row: PatientMedicationRow) {
    setViewingRow(row);
    setViewerOpen(true);
  }

  function openAdd() {
    setEditorMode("add");
    setFocusField("name");
    setEditingRow(createEmptyMedication());
    setEditorOpen(true);
  }

  function editableCell(
    columnId: string,
    row: PatientMedicationRow,
    children: ReactNode,
  ) {
    const field = COLUMN_FOCUS_FIELD[columnId] ?? "name";
    return (
      <div
        className="min-h-10 w-full"
        onDoubleClick={(event) => {
          event.stopPropagation();
          openEdit(row, field);
        }}
      >
        {children}
      </div>
    );
  }

  function handleSave(next: PatientMedicationRow) {
    setRows((prev) => {
      const exists = prev.some((row) => row.id === next.id);
      if (exists) {
        return prev.map((row) => (row.id === next.id ? next : row));
      }
      return [next, ...prev];
    });
    if (statusFilter !== "all" && next.status !== statusFilter) {
      setStatusFilter("all");
    }
  }

  const columns = useMemo<DataTableColumn<PatientMedicationRow>[]>(
    () => [
      {
        id: "medication",
        header: "Medication",
        sortValue: (row) => row.name,
        filterValue: (row) => row.name,
        cell: (row) =>
          editableCell(
            "medication",
            row,
            <span className="font-medium text-foreground">{row.name}</span>,
          ),
      },
      {
        id: "dose",
        header: "Dose",
        className: "w-24",
        cellClassName: "whitespace-nowrap tabular-nums",
        sortValue: (row) => row.dose,
        cell: (row) =>
          editableCell(
            "dose",
            row,
            <span className="font-medium text-foreground">{row.dose}</span>,
          ),
      },
      {
        id: "freq",
        header: "Freq",
        className: "w-20",
        cellClassName: "whitespace-nowrap",
        sortValue: (row) => row.frequency,
        filterValue: (row) => row.frequency,
        cell: (row) => editableCell("freq", row, row.frequency),
      },
      {
        id: "route",
        header: "Route",
        className: "w-36",
        cellClassName: "whitespace-nowrap",
        sortValue: (row) =>
          getPatientMedicationRouteLabel(row.route, row.routeOther),
        filterValue: (row) =>
          getPatientMedicationRouteLabel(row.route, row.routeOther),
        cell: (row) =>
          editableCell(
            "route",
            row,
            getPatientMedicationRouteLabel(row.route, row.routeOther),
          ),
      },
      {
        id: "duration",
        header: "Duration",
        className: "w-44",
        sortValue: (row) => row.duration,
        filterValue: (row) => row.status,
        cell: (row) =>
          editableCell(
            "duration",
            row,
            <div className="min-w-0">
              <p className="truncate text-sm leading-5 text-foreground">
                {row.since ? `Since ${row.since}` : "—"}
              </p>
              <p
                className={cn(
                  typo.caption,
                  "mt-0.5 text-muted-foreground",
                )}
              >
                {row.status}
                {row.duration
                  ? ` · Until ${formatDurationDate(row.duration)}`
                  : null}
              </p>
            </div>,
          ),
      },
      {
        id: "prescribedBy",
        header: "Prescribed by",
        className: "w-48",
        sortValue: (row) => row.prescribedBy,
        filterValue: (row) => row.prescribedBy,
        cell: (row) =>
          editableCell(
            "prescribedBy",
            row,
            row.prescribedBy ? (
              <DataTableIdentity
                leading={
                  <PrescriberAvatar
                    src={row.prescriberAvatarUrl}
                    name={row.prescribedBy}
                  />
                }
                title={row.prescribedBy}
                subtitle={row.prescriberQualification}
              />
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
          ),
      },
      {
        id: "lastModified",
        header: "Last Modified",
        className: "w-36",
        cellClassName: "whitespace-nowrap",
        sortValue: (row) => lastModifiedMs(row),
        sortKind: "date",
        cell: (row) => editableCell("lastModified", row, row.lastModified),
      },
      {
        id: "lastModifiedBy",
        header: "Last modified by",
        className: "w-48",
        sortValue: (row) => row.lastModifiedBy,
        filterValue: (row) => row.lastModifiedBy,
        cell: (row) =>
          editableCell(
            "lastModifiedBy",
            row,
            row.lastModifiedBy ? (
              <DataTableIdentity
                leading={
                  <PrescriberAvatar
                    src={row.lastModifiedByAvatarUrl}
                    name={row.lastModifiedBy}
                  />
                }
                title={row.lastModifiedBy}
                subtitle={row.lastModifiedByQualification}
              />
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
          ),
      },
      {
        id: "actions",
        header: <span className="sr-only">Action</span>,
        className: "w-14",
        cellClassName: "text-right",
        cell: (row) => (
          <MedicationActionsMenu
            medicationName={row.name || "medication"}
            onEdit={() => openEdit(row, "name")}
            onView={() => openView(row)}
          />
        ),
      },
    ],
    // openEdit/openView use setState only — stable enough for cell handlers
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h1 className={cn(typo.headingXl, "leading-[30px]")}>Medication</h1>
          <p className={typo.bodyM}>
            Active prescription details and refill status
          </p>
        </div>
        <SegmentedControl
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusTabs}
          ariaLabel="Medication status"
          layoutId="patientMedicationsStatusTabs"
          surface="card"
          variant="inset"
          className="shrink-0"
        />
      </div>

      <DataTable
        leading={
          <TableSearch
            value={query}
            onChange={setQuery}
            placeholder="Search medications…"
            aria-label="Search medications"
          />
        }
        tools={
          <Button
            type="button"
            variant="primary-outline"
            className="shrink-0"
            onClick={openAdd}
          >
            <AppIcon icon={Add01Icon} size={ICON_SIZE} />
            Add medicine
          </Button>
        }
        columns={columns}
        data={filtered}
        getRowId={(row) => row.id}
        defaultPageSize={15}
        empty={
          <p
            className={cn(
              typo.bodyM,
              "px-5 py-10 text-center text-muted-foreground",
            )}
          >
            {rows.length === 0
              ? "No medications on file. Add a medicine to get started."
              : "No medications match your filters."}
          </p>
        }
      />

      <EditMedicationDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        medication={editingRow}
        mode={editorMode}
        focusField={focusField}
        onSave={handleSave}
      />

      <ViewMedicationDialog
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        medication={viewingRow}
      />
    </div>
  );
}
