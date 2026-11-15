"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { UserAdd01Icon } from "@hugeicons/core-free-icons";
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
import { AppIcon } from "@/components/shared/AppIcon";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { AppPageFrame } from "@/features/dashboard/components/AppPageFrame";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import {
  dashboardPageShellClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import { getDoctorPatients } from "@/features/patients/data/doctor-patients-data";
import type { DoctorPatientRow } from "@/lib/domain/doctor";
import { BADGE_ICON_SIZE, ICON_SIZE } from "@/lib/icons";
import { cn } from "@/lib/utils";

type CarePlanFilter =
  | "all"
  | Exclude<DoctorPatientRow["carePlanStatus"], "None">;

const CARE_PLAN_FILTERS: CarePlanFilter[] = [
  "all",
  "Active",
  "Pending Review",
  "Draft",
];

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
  const [carePlanFilter, setCarePlanFilter] = useState<CarePlanFilter>("all");

  const carePlanCounts = useMemo(() => {
    const counts: Record<CarePlanFilter, number> = {
      all: patients.length,
      Active: 0,
      "Pending Review": 0,
      Draft: 0,
    };
    for (const row of patients) {
      if (row.carePlanStatus === "None") continue;
      counts[row.carePlanStatus] += 1;
    }
    return counts;
  }, [patients]);

  const carePlanTabs = useMemo(
    () =>
      CARE_PLAN_FILTERS.map((id) => ({
        id,
        label: `${id === "all" ? "All" : id} (${carePlanCounts[id]})`,
      })),
    [carePlanCounts],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return patients.filter((row) => {
      if (carePlanFilter !== "all" && row.carePlanStatus !== carePlanFilter) {
        return false;
      }
      if (!needle) return true;
      return [row.name, row.code, row.assignedNurse, row.carePlanStatus].some(
        (value) => value.toLowerCase().includes(needle),
      );
    });
  }, [carePlanFilter, patients, query]);

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
                  src={row.avatarUrl}
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
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
          <PageHeader
            title="Patients"
            subtitle="Review risk, care-plan status, and assigned nursing coverage."
          />
          <SegmentedControl
            value={carePlanFilter}
            onChange={setCarePlanFilter}
            options={carePlanTabs}
            ariaLabel="Care plan status"
            layoutId="doctorPatientsCarePlanTabs"
            surface="card"
            variant="inset"
            className="shrink-0"
          />
        </div>

        <DataTable
          toolbar={false}
          leading={
            <TableSearch
              value={query}
              onChange={setQuery}
              placeholder="Search patients…"
              aria-label="Search patients"
            />
          }
          tools={
            <Button
              type="button"
              variant="secondary"
              className="shrink-0 border border-border bg-transparent hover:bg-accent"
              asChild
            >
              <Link href="/patients/new">
                <AppIcon icon={UserAdd01Icon} size={ICON_SIZE} />
                Add new patient
              </Link>
            </Button>
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
