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
import { getDoctorCarePlans } from "@/features/patients/data/doctor-patients-data";
import type { DoctorCarePlanRow } from "@/lib/domain/doctor";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

function carePlanStatusClass(status: DoctorCarePlanRow["status"]) {
  switch (status) {
    case "Active":
    case "Completed":
      return "bg-success-muted text-success";
    case "Pending Review":
      return "bg-warning-muted text-warning";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function DoctorCarePlansView() {
  const plans = getDoctorCarePlans();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return plans;
    return plans.filter((row) =>
      [row.patientName, row.patientCode, row.status, row.owner].some((value) =>
        value.toLowerCase().includes(needle),
      ),
    );
  }, [plans, query]);

  const columns = useMemo<DataTableColumn<DoctorCarePlanRow>[]>(
    () => [
      {
        id: "patient",
        header: "Patient",
        sortValue: (row) => row.patientName,
        cell: (row) => (
          <Link
            href={`/patients/${row.patientId}/care-plan`}
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
        id: "status",
        header: "Status",
        className: "w-40",
        sortValue: (row) => row.status,
        filterValue: (row) => row.status,
        cell: (row) => (
          <span
            className={cn(
              statusBadgeClass,
              "shrink-0",
              carePlanStatusClass(row.status),
            )}
          >
            {row.status}
          </span>
        ),
      },
      {
        id: "goals",
        header: "Goals",
        className: "w-24",
        sortValue: (row) => row.goalsCount,
        sortKind: "number",
        cell: (row) => (
          <span className="tabular-nums">{row.goalsCount}</span>
        ),
      },
      {
        id: "updated",
        header: "Last Updated",
        className: "w-36",
        cellClassName: "whitespace-nowrap",
        sortValue: (row) => Date.parse(row.lastUpdated),
        sortKind: "date",
        cell: (row) => row.lastUpdated,
      },
      {
        id: "owner",
        header: "Owner",
        className: "w-36",
        sortValue: (row) => row.owner,
        cell: (row) => <span className="truncate">{row.owner}</span>,
      },
      {
        id: "chevron",
        header: <span className="sr-only">Open</span>,
        className: "w-12",
        cellClassName: "text-right",
        cell: (row) => (
          <Link
            href={`/patients/${row.patientId}/care-plan`}
            aria-label={`Open care plan for ${row.patientName}`}
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
          title="Care Plans"
          subtitle="Track active plans, drafts, and items pending your review."
        />

        <DataTable
          leading={
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2 className={cn(typo.headingL)}>Care plan roster</h2>
              <p className={typo.bodyM}>
                Open a patient plan to review goals, referrals, and ownership.
              </p>
            </div>
          }
          tools={
            <TableSearch
              value={query}
              onChange={setQuery}
              placeholder="Search care plans…"
              aria-label="Search care plans"
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
