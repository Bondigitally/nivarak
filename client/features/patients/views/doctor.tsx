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
import { PatientAvatar } from "@/components/shared/PatientAvatar";
import { PatientRiskBadge } from "@/components/shared/PatientRiskBadge";
import { AppPageFrame } from "@/features/dashboard/components/AppPageFrame";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import {
  dashboardPageShellClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import { getDoctorPatients } from "@/features/patients/data/doctor-patients-data";
import type { DoctorPatientRow } from "@/lib/domain/doctor";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

function carePlanStatusClass(status: DoctorPatientRow["carePlanStatus"]) {
  switch (status) {
    case "Active":
      return "bg-success-muted text-success";
    case "Pending Review":
      return "bg-warning-muted text-warning";
    case "Draft":
      return "bg-info-muted text-info";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function DoctorPatientsView() {
  const patients = getDoctorPatients();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return patients;
    return patients.filter((row) =>
      [row.name, row.code, row.assignedNurse, row.carePlanStatus].some((value) =>
        value.toLowerCase().includes(needle),
      ),
    );
  }, [patients, query]);

  const columns = useMemo<DataTableColumn<DoctorPatientRow>[]>(
    () => [
      {
        id: "patient",
        header: "Patient",
        sortValue: (row) => row.name,
        cell: (row) => (
          <Link href={`/patients/${row.id}`} className="block min-w-0">
            <DataTableIdentity
              leading={
                <PatientAvatar
                  initials={row.initials}
                  riskLevel={row.riskLevel}
                  size="sm"
                />
              }
              title={row.name}
              subtitle={row.code}
            />
          </Link>
        ),
      },
      {
        id: "demographics",
        header: "Age / Gender",
        className: "w-32",
        sortValue: (row) => row.age,
        sortKind: "number",
        cell: (row) => (
          <span className="whitespace-nowrap">
            {row.age} / {row.gender}
          </span>
        ),
      },
      {
        id: "risk",
        header: "Risk",
        className: "w-32",
        sortValue: (row) => row.riskLevel,
        cell: (row) => <PatientRiskBadge level={row.riskLevel} />,
      },
      {
        id: "lastVisit",
        header: "Last Visit",
        className: "w-36",
        cellClassName: "whitespace-nowrap",
        sortValue: (row) => Date.parse(row.lastVisit),
        sortKind: "date",
        cell: (row) => row.lastVisit,
      },
      {
        id: "carePlan",
        header: "Care Plan",
        className: "w-40",
        sortValue: (row) => row.carePlanStatus,
        filterValue: (row) => row.carePlanStatus,
        cell: (row) => (
          <span
            className={cn(
              statusBadgeClass,
              "shrink-0",
              carePlanStatusClass(row.carePlanStatus),
            )}
          >
            {row.carePlanStatus}
          </span>
        ),
      },
      {
        id: "nurse",
        header: "Nurse",
        className: "w-40",
        sortValue: (row) => row.assignedNurse,
        cell: (row) => (
          <span className="truncate">{row.assignedNurse}</span>
        ),
      },
      {
        id: "chevron",
        header: <span className="sr-only">Open</span>,
        className: "w-12",
        cellClassName: "text-right",
        cell: (row) => (
          <Link
            href={`/patients/${row.id}`}
            aria-label={`Open ${row.name}`}
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
          title="Patients"
          subtitle={`${patients.length} patients under your clinical care.`}
        />

        <DataTable
          leading={
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2 className={cn(typo.headingL)}>Patient roster</h2>
              <p className={typo.bodyM}>
                Review risk, care-plan status, and assigned nursing coverage.
              </p>
            </div>
          }
          tools={
            <TableSearch
              value={query}
              onChange={setQuery}
              placeholder="Search patients…"
              aria-label="Search patients"
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
