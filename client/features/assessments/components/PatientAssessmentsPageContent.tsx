"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import {
  dashboardCardClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import { PatientChartShell } from "@/features/patients/components/PatientChartShell";
import {
  getDoctorAssessmentsForPatient,
  getDoctorPatientById,
  riskToBadgeLevel,
} from "@/features/patients/data/doctor-patients-data";
import { PatientRiskBadge } from "@/components/shared/PatientRiskBadge";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

export function PatientAssessmentsPageContent({
  patientId,
}: {
  patientId: string;
}) {
  const patient = getDoctorPatientById(patientId);
  if (!patient) notFound();

  const assessments = getDoctorAssessmentsForPatient(patientId);

  return (
    <PatientChartShell patientId={patientId} showKpis={false}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="Assessments"
          subtitle={`IAS-P and CGA history for ${patient.name}.`}
        />
        <Button asChild size="sm">
          <Link href={`/patients/${patientId}/assessments/cga-new`}>
            Start CGA
          </Link>
        </Button>
      </div>

      {assessments.length === 0 ? (
        <div
          className={cn(
            dashboardCardClass,
            "flex min-h-48 flex-col items-center justify-center gap-2 p-6 text-center",
          )}
        >
          <p className={typo.headingL}>No assessments yet</p>
          <p className={cn(typo.bodyM, "text-muted-foreground")}>
            Start a CGA for this patient.
          </p>
        </div>
      ) : (
        <div className={cn(dashboardCardClass, "overflow-hidden p-0")}>
          <ul>
            {assessments.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/patients/${patientId}/assessments/${a.id}`}
                  className="flex items-start justify-between gap-3 border-b border-divider px-5 py-4 transition-colors last:border-b-0 hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className={cn(typo.headingS, "text-sm")}>
                      {a.type} · {a.scoreLabel}
                    </p>
                    <p
                      className={cn(
                        typo.caption,
                        "mt-0.5 text-muted-foreground",
                      )}
                    >
                      {a.date} · {a.clinician}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={cn(
                        statusBadgeClass,
                        a.status === "Signed"
                          ? "bg-success-muted text-success"
                          : a.status === "Needs review"
                            ? "bg-warning-muted text-warning"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {a.status}
                    </span>
                    {a.riskLevel ? (
                      <PatientRiskBadge level={riskToBadgeLevel(a.riskLevel)} />
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </PatientChartShell>
  );
}
