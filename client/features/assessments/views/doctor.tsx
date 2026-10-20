"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DataTable,
  DataTableIdentity,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { TableSearch } from "@/components/shared/table-search";
import { PageHeader } from "@/components/shared/PageHeader";
import { PatientRiskBadge } from "@/components/shared/PatientRiskBadge";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { AssessmentActionsMenu } from "@/features/assessments/components/AssessmentActionsMenu";
import { AppPageFrame } from "@/features/dashboard/components/AppPageFrame";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import {
  dashboardPageShellClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import {
  getDoctorAssessments,
  riskToBadgeLevel,
} from "@/features/patients/data/doctor-patients-data";
import type {
  DoctorAssessmentRow,
  DoctorAssessmentType,
} from "@/lib/domain/doctor";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

type AssessmentTab = "all" | DoctorAssessmentType | "Draft";

const TABS: { id: AssessmentTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "IAS-P", label: "IAS-P" },
  { id: "CGA", label: "CGA" },
  { id: "Draft", label: "Draft" },
];

function assessmentStatusClass(status: DoctorAssessmentRow["status"]) {
  switch (status) {
    case "Signed":
      return "bg-success-muted text-success";
    case "Needs review":
      return "bg-warning-muted text-warning";
    case "In progress":
      return "bg-info-muted text-info";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function typeBadgeClass(type: DoctorAssessmentType) {
  return type === "CGA"
    ? "bg-info-muted text-info"
    : "bg-primary/10 text-primary";
}

export function DoctorAssessmentsView() {
  const assessments = getDoctorAssessments();
  const [tab, setTab] = useState<AssessmentTab>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return assessments.filter((row) => {
      const matchTab =
        tab === "all"
          ? true
          : tab === "Draft"
            ? row.status === "Draft"
            : row.type === tab;
      if (!matchTab) return false;
      if (!needle) return true;
      return [row.patientName, row.patientCode, row.type, row.status, row.clinician]
        .some((value) => value.toLowerCase().includes(needle));
    });
  }, [assessments, query, tab]);

  const columns = useMemo<DataTableColumn<DoctorAssessmentRow>[]>(
    () => [
      {
        id: "patient",
        header: "Patient",
        sortValue: (row) => row.patientName,
        cell: (row) => (
          <Link
            href={`/patients/${row.patientId}/assessments/${row.id}`}
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
        id: "type",
        header: "Type",
        className: "w-28",
        sortValue: (row) => row.type,
        filterValue: (row) => row.type,
        cell: (row) => (
          <span
            className={cn(statusBadgeClass, "shrink-0", typeBadgeClass(row.type))}
          >
            {row.type}
          </span>
        ),
      },
      {
        id: "score",
        header: "Score",
        className: "w-40",
        cellClassName: "whitespace-nowrap",
        sortValue: (row) => row.scoreLabel,
        cell: (row) => row.scoreLabel,
      },
      {
        id: "status",
        header: "Status",
        className: "w-48",
        sortValue: (row) => row.status,
        filterValue: (row) => row.status,
        cell: (row) => (
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                statusBadgeClass,
                "shrink-0",
                assessmentStatusClass(row.status),
              )}
            >
              {row.status}
            </span>
            {row.riskLevel ? (
              <PatientRiskBadge level={riskToBadgeLevel(row.riskLevel)} />
            ) : null}
          </div>
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
        id: "clinician",
        header: "Clinician",
        className: "w-36",
        sortValue: (row) => row.clinician,
        cell: (row) => (
          <span className="truncate">{row.clinician}</span>
        ),
      },
      {
        id: "actions",
        header: <span className="sr-only">Actions</span>,
        className: "w-14",
        cellClassName: "text-right",
        cell: () => <AssessmentActionsMenu />,
      },
    ],
    [],
  );

  return (
    <AppPageFrame>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <PageHeader
          title="Assessments"
          subtitle="Review IAS-P and CGA results across your patient panel."
        />

        <DataTable
          leading={
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2 className={cn(typo.headingL)}>Assessment list</h2>
              <p className={typo.bodyM}>
                Filter by instrument or draft status, then open a patient chart.
              </p>
            </div>
          }
          tools={
            <TableSearch
              value={query}
              onChange={setQuery}
              placeholder="Search assessments…"
              aria-label="Search assessments"
            />
          }
          subheader={
            <SegmentedControl
              value={tab}
              onChange={setTab}
              options={TABS}
              ariaLabel="Assessment type"
              layoutId="doctorAssessmentsTabs"
              surface="card"
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
