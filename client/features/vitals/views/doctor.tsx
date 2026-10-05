"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DataTable,
  DataTableIdentity,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { ChevronIcon } from "@/components/shared/ChevronIcon";
import { TableSearch } from "@/components/shared/table-search";
import { PageHeader } from "@/components/shared/PageHeader";
import { AppPageFrame } from "@/features/dashboard/components/AppPageFrame";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import {
  dashboardPageShellClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import { getDoctorVitalsMonitor } from "@/features/patients/data/doctor-patients-data";
import type { DoctorVitalMonitorRow } from "@/lib/domain/doctor";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

function vitalStatusClass(status: DoctorVitalMonitorRow["status"]) {
  switch (status) {
    case "Critical":
      return "bg-destructive-muted text-destructive";
    case "Warning":
      return "bg-warning-muted text-warning";
    default:
      return "bg-success-muted text-success";
  }
}

function trendLabel(trend: DoctorVitalMonitorRow["trend"]) {
  if (trend === "up") return "↑";
  if (trend === "down") return "↓";
  return "→";
}

export function DoctorVitalsView() {
  const rows = getDoctorVitalsMonitor();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) =>
      [row.patientName, row.patientCode, row.metric, row.value, row.status].some(
        (value) => value.toLowerCase().includes(needle),
      ),
    );
  }, [query, rows]);

  const columns = useMemo<DataTableColumn<DoctorVitalMonitorRow>[]>(
    () => [
      {
        id: "patient",
        header: "Patient",
        sortValue: (row) => row.patientName,
        cell: (row) => (
          <Link
            href={`/patients/${row.patientId}/vitals`}
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
        id: "metric",
        header: "Metric",
        className: "w-40",
        sortValue: (row) => row.metric,
        filterValue: (row) => row.metric,
        cell: (row) => row.metric,
      },
      {
        id: "value",
        header: "Value",
        className: "w-32",
        cellClassName: "whitespace-nowrap tabular-nums",
        sortValue: (row) => row.value,
        cell: (row) => (
          <span>
            {row.value}{" "}
            <span className="text-muted-foreground">{trendLabel(row.trend)}</span>
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        className: "w-32",
        sortValue: (row) => row.status,
        filterValue: (row) => row.status,
        cell: (row) => (
          <span
            className={cn(
              statusBadgeClass,
              "shrink-0",
              vitalStatusClass(row.status),
            )}
          >
            {row.status}
          </span>
        ),
      },
      {
        id: "recordedAt",
        header: "Recorded",
        className: "w-40",
        cellClassName: "whitespace-nowrap",
        sortValue: (row) => row.recordedAt,
        cell: (row) => row.recordedAt,
      },
      {
        id: "chevron",
        header: <span className="sr-only">Open</span>,
        className: "w-12",
        cellClassName: "text-right",
        cell: (row) => (
          <Link
            href={`/patients/${row.patientId}/vitals`}
            aria-label={`Open vitals for ${row.patientName}`}
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
        <PageHeader
          title="Vitals Monitoring"
          subtitle="Monitor out-of-range readings across your patient panel."
        />

        <DataTable
          leading={
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2 className={cn(typo.headingL)}>Recent readings</h2>
              <p className={typo.bodyM}>
                Critical and warning vitals surface first for clinical follow-up.
              </p>
            </div>
          }
          tools={
            <TableSearch
              value={query}
              onChange={setQuery}
              placeholder="Search vitals…"
              aria-label="Search vitals"
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
