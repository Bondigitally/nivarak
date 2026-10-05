"use client";

import Link from "next/link";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { PatientRiskBadge } from "@/components/shared/PatientRiskBadge";
import { Button } from "@/components/ui/button";
import {
  dashboardCardClass,
  dashboardGridClass,
  dashboardGridThirdClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import { PatientChartShell } from "@/features/patients/components/PatientChartShell";
import { PatientOverviewBloodPressureCard } from "@/features/patients/components/PatientOverviewBloodPressureCard";
import {
  PatientOverviewConcernsCard,
  PatientOverviewIaspPanel,
  PatientOverviewProxyCard,
} from "@/features/patients/components/PatientOverviewIaspPanel";
import {
  getDoctorAssessmentsForPatient,
  getDoctorNotesForPatient,
  riskToBadgeLevel,
} from "@/features/patients/data/doctor-patients-data";
import {
  getPatientChartActivity,
  getPatientMedications,
} from "@/features/patients/data/patient-chart-data";
import type { DoctorAssessmentRow, DoctorNoteRow } from "@/lib/domain/doctor";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

function OverviewPanel({ patientId }: { patientId: string }) {
  const activity = getPatientChartActivity(patientId);
  const meds = getPatientMedications(patientId);

  return (
    <div className="flex flex-col gap-4">
      <PatientOverviewIaspPanel patientId={patientId} />

      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <PatientOverviewBloodPressureCard />
        <PatientOverviewConcernsCard patientId={patientId} />
      </div>

      <div className={cn(dashboardGridClass, "items-stretch")}>
        <section className={cn(dashboardGridThirdClass, "min-h-0")}>
          <div
            className={cn(
              dashboardCardClass,
              "flex h-full flex-col overflow-hidden p-0",
            )}
          >
            <div className="flex flex-col gap-0.5 border-b border-divider px-4 py-4">
              <h2 className={typo.headingL}>Recent activity</h2>
              <p className={cn(typo.bodyM, "text-muted-foreground")}>
                Latest clinical events and care updates for this patient.
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              {activity.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-start justify-between gap-3 border-b border-divider px-4 py-4 transition-colors last:border-b-0 hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className={cn(typo.headingS, "text-sm")}>{item.title}</p>
                    <p
                      className={cn(
                        typo.bodyM,
                        "mt-0.5 text-muted-foreground",
                      )}
                    >
                      {item.detail}
                    </p>
                  </div>
                  <span
                    className={cn(
                      typo.caption,
                      "shrink-0 text-muted-foreground",
                    )}
                  >
                    {item.timeLabel}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={cn(dashboardGridThirdClass, "min-h-0")}>
          <PatientOverviewProxyCard patientId={patientId} />
        </section>

        <section className={cn(dashboardGridThirdClass, "min-h-0")}>
          <div
            className={cn(
              dashboardCardClass,
              "flex h-full flex-col overflow-hidden p-0",
            )}
          >
            <div className="flex items-start justify-between gap-2 border-b border-divider px-4 py-4">
              <div className="flex min-w-0 flex-col gap-0.5">
                <h2 className={typo.headingL}>Medications</h2>
                <p className={cn(typo.bodyM, "text-muted-foreground")}>
                  Active prescriptions and dosing schedule.
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="shrink-0">
                <Link href={`/patients/${patientId}/care-plan`}>View plan</Link>
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              {meds.map((med) => (
                <div
                  key={med.id}
                  className="flex items-start justify-between gap-3 border-b border-divider px-4 py-4 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className={cn(typo.headingS, "text-sm")}>{med.name}</p>
                    <p
                      className={cn(
                        typo.bodyM,
                        "mt-0.5 text-muted-foreground",
                      )}
                    >
                      {med.schedule}
                    </p>
                  </div>
                  <span className={cn(typo.bodyM, "shrink-0 font-medium")}>
                    {med.dose}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const assessmentColumns: DataTableColumn<DoctorAssessmentRow>[] = [
  {
    id: "type",
    header: "Type",
    cell: (row) => (
      <span className={cn(typo.bodyS, "font-medium")}>{row.type}</span>
    ),
    filterValue: (row) => row.type,
  },
  {
    id: "score",
    header: "Score",
    cell: (row) => (
      <span className={cn(typo.bodyS, "tabular-nums")}>{row.scoreLabel}</span>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => (
      <span
        className={cn(
          statusBadgeClass,
          row.status === "Signed"
            ? "bg-success-muted text-success"
            : row.status === "Needs review"
              ? "bg-warning-muted text-warning"
              : "bg-muted text-muted-foreground",
        )}
      >
        {row.status}
      </span>
    ),
    filterValue: (row) => row.status,
  },
  {
    id: "risk",
    header: "Risk",
    cell: (row) =>
      row.riskLevel ? (
        <PatientRiskBadge level={riskToBadgeLevel(row.riskLevel)} />
      ) : (
        <span className={cn(typo.bodyS, "text-muted-foreground")}>—</span>
      ),
  },
  {
    id: "date",
    header: "Date",
    cell: (row) => <span className={typo.bodyS}>{row.date}</span>,
  },
  {
    id: "action",
    header: "",
    cell: (row) => (
      <Button asChild variant="primary-outline" size="sm">
        <Link href={`/patients/${row.patientId}/assessments/${row.id}`}>
          Open
        </Link>
      </Button>
    ),
  },
];

export function AssessmentsPanel({ patientId }: { patientId: string }) {
  const rows = getDoctorAssessmentsForPatient(patientId);

  return (
    <DataTable
      columns={assessmentColumns}
      data={rows}
      getRowId={(row) => row.id}
      paginate={false}
      toolbar={false}
      empty={
        <p className={cn(typo.bodyM, "px-5 py-8 text-center text-muted-foreground")}>
          No assessments for this patient yet.
        </p>
      }
      leading={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className={typo.headingL}>Assessments</h2>
          <Button asChild size="sm">
            <Link href={`/health/assessments/new?patientId=${patientId}`}>
              Start assessment
            </Link>
          </Button>
        </div>
      }
    />
  );
}

const noteColumns: DataTableColumn<DoctorNoteRow>[] = [
  {
    id: "title",
    header: "Note",
    cell: (row) => (
      <div className="min-w-0">
        <p className={cn(typo.bodyS, "font-medium")}>{row.title}</p>
        <p className={cn(typo.caption, "text-muted-foreground")}>{row.type}</p>
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => (
      <span
        className={cn(
          statusBadgeClass,
          row.status === "Signed"
            ? "bg-success-muted text-success"
            : "bg-muted text-muted-foreground",
        )}
      >
        {row.status}
      </span>
    ),
  },
  {
    id: "date",
    header: "Date",
    cell: (row) => <span className={typo.bodyS}>{row.date}</span>,
  },
  {
    id: "author",
    header: "Author",
    cell: (row) => <span className={typo.bodyS}>{row.author}</span>,
  },
  {
    id: "action",
    header: "",
    cell: (row) => (
      <Button asChild variant="primary-outline" size="sm">
        <Link href={`/patients/${row.patientId}/notes/${row.id}`}>Open</Link>
      </Button>
    ),
  },
];

export function NotesPanel({ patientId }: { patientId: string }) {
  const rows = getDoctorNotesForPatient(patientId);

  return (
    <DataTable
      columns={noteColumns}
      data={rows}
      getRowId={(row) => row.id}
      paginate={false}
      toolbar={false}
      empty={
        <p className={cn(typo.bodyM, "px-5 py-8 text-center text-muted-foreground")}>
          No clinical notes yet.
        </p>
      }
      leading={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className={typo.headingL}>Clinical notes</h2>
          <Button asChild size="sm">
            <Link href={`/patients/${patientId}/notes/new`}>Write note</Link>
          </Button>
        </div>
      }
    />
  );
}

export function PatientChartPageContent({ patientId }: { patientId: string }) {
  return (
    <PatientChartShell patientId={patientId}>
      <OverviewPanel patientId={patientId} />
    </PatientChartShell>
  );
}
