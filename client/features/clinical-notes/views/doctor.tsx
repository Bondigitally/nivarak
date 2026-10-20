"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Add01Icon } from "@hugeicons/core-free-icons";
import {
  DataTable,
  DataTableIdentity,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { ChevronIcon } from "@/components/shared/ChevronIcon";
import { TableSearch } from "@/components/shared/table-search";
import { PageHeader } from "@/components/shared/PageHeader";
import { AppIcon } from "@/components/shared/AppIcon";
import { Button } from "@/components/ui/button";
import { AppPageFrame } from "@/features/dashboard/components/AppPageFrame";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import {
  dashboardPageShellClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import { getClinicalNotes } from "@/features/clinical-notes/data/clinical-notes-data";
import type { DoctorNoteRow } from "@/lib/domain/doctor";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

function noteStatusClass(status: DoctorNoteRow["status"]) {
  return status === "Signed"
    ? "bg-success-muted text-success"
    : "bg-muted text-muted-foreground";
}

function noteTypeClass(type: DoctorNoteRow["type"]) {
  switch (type) {
    case "SOAP":
      return "bg-info-muted text-info";
    case "Progress":
      return "bg-primary/10 text-primary";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function DoctorClinicalNotesView() {
  const notes = getClinicalNotes();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return notes;
    return notes.filter((row) =>
      [row.patientName, row.patientCode, row.title, row.type, row.author].some(
        (value) => value.toLowerCase().includes(needle),
      ),
    );
  }, [notes, query]);

  const columns = useMemo<DataTableColumn<DoctorNoteRow>[]>(
    () => [
      {
        id: "patient",
        header: "Patient",
        sortValue: (row) => row.patientName,
        cell: (row) => (
          <Link
            href={`/patients/${row.patientId}/notes/${row.id}`}
            className="block min-w-0"
          >
            <DataTableIdentity
              title={row.patientName}
              subtitle={row.patientCode}
            />
          </Link>
        ),
      },
      {
        id: "note",
        header: "Note",
        sortValue: (row) => row.title,
        cell: (row) => (
          <Link
            href={`/patients/${row.patientId}/notes/${row.id}`}
            className="block min-w-0"
          >
            <DataTableIdentity title={row.title} />
          </Link>
        ),
      },
      {
        id: "type",
        header: "Type",
        className: "w-28",
        sortValue: (row) => row.type,
        filterValue: (row) => row.type,
        cell: (row) => (
          <span
            className={cn(
              statusBadgeClass,
              "shrink-0",
              noteTypeClass(row.type),
            )}
          >
            {row.type}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        className: "w-28",
        sortValue: (row) => row.status,
        filterValue: (row) => row.status,
        cell: (row) => (
          <span
            className={cn(
              statusBadgeClass,
              "shrink-0",
              noteStatusClass(row.status),
            )}
          >
            {row.status}
          </span>
        ),
      },
      {
        id: "date",
        header: "Date",
        className: "w-36",
        cellClassName: "whitespace-nowrap",
        sortValue: (row) => Date.parse(row.date),
        sortKind: "date",
        cell: (row) => row.date,
      },
      {
        id: "author",
        header: "Author",
        className: "w-36",
        sortValue: (row) => row.author,
        cell: (row) => <span className="truncate">{row.author}</span>,
      },
      {
        id: "chevron",
        header: <span className="sr-only">Open</span>,
        className: "w-12",
        cellClassName: "text-right",
        cell: (row) => (
          <Link
            href={`/patients/${row.patientId}/notes/${row.id}`}
            aria-label={`Open note ${row.title}`}
            className="inline-flex text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronIcon direction="right" size={BADGE_ICON_SIZE} />
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <AppPageFrame>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <div className="flex min-w-0 items-start justify-between gap-4">
          <PageHeader
            title="Clinical Notes"
            subtitle="SOAP, progress, and consult notes across your panel."
          />
          <Button type="button" variant="default" size="sm" asChild>
            <Link href="/clinical/notes/new">
              <AppIcon icon={Add01Icon} size={16} />
              Write Note
            </Link>
          </Button>
        </div>

        <DataTable
          leading={
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2 className={cn(typo.headingL)}>Recent notes</h2>
              <p className={typo.bodyM}>
                Open a note to review or continue drafting documentation.
              </p>
            </div>
          }
          tools={
            <TableSearch
              value={query}
              onChange={setQuery}
              placeholder="Search notes…"
              aria-label="Search clinical notes"
            />
          }
          columns={columns}
          data={filtered}
          getRowId={(row) => row.id}
          defaultPageSize={15}
        />
      </DashboardReveal>
    </AppPageFrame>
  );
}
