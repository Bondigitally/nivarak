"use client";

import Link from "next/link";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Plant01Icon } from "@hugeicons/core-free-icons";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  dashboardCardClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import { CarePlanReviewDialog } from "@/features/care-plan/components/CarePlanReviewDialog";
import { PatientChartShell } from "@/features/patients/components/PatientChartShell";
import {
  getDoctorCarePlanForPatient,
  getDoctorPatientById,
} from "@/features/patients/data/doctor-patients-data";
import { getCarePlanDetail } from "@/features/patients/data/patient-chart-data";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

export function DoctorCarePlanOverview({ patientId }: { patientId: string }) {
  const patient = getDoctorPatientById(patientId);
  const row = getDoctorCarePlanForPatient(patientId);
  const detail = getCarePlanDetail(patientId);
  const [reviewOpen, setReviewOpen] = useState(false);

  if (!patient) notFound();

  const hasPlan =
    Boolean(row) ||
    (patient.carePlanStatus !== "None" && Boolean(detail));

  if (!hasPlan) {
    return (
      <PatientChartShell patientId={patientId} showKpis={false}>
        <div
          className={cn(
            dashboardCardClass,
            "flex min-h-60 flex-col items-center justify-center gap-4 p-6 text-center",
          )}
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <HugeiconsIcon
              icon={Plant01Icon}
              size={ICON_SIZE}
              strokeWidth={ICON_STROKE}
              color="currentColor"
              absoluteStrokeWidth
            />
          </span>
          <div>
            <h2 className={typo.headingL}>No care plan yet</h2>
            <p className={cn(typo.bodyM, "mt-1 text-muted-foreground")}>
              Create a draft care plan with goals and interventions.
            </p>
          </div>
          <Button asChild>
            <Link href={`/patients/${patientId}/care-plan/edit`}>
              Create care plan
            </Link>
          </Button>
        </div>
      </PatientChartShell>
    );
  }

  const status = row?.status ?? detail.status;
  const goals = detail.goals;

  return (
    <PatientChartShell patientId={patientId} showKpis={false}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className={typo.headingL}>Care plan</h2>
          <p className={cn(typo.bodyM, "mt-1 text-muted-foreground")}>
            {detail.summary}
          </p>
          <div className="mt-2">
            <span
              className={cn(
                statusBadgeClass,
                status === "Active"
                  ? "bg-success-muted text-success"
                  : status === "Pending Review"
                    ? "bg-warning-muted text-warning"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {status}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {status === "Pending Review" ? (
            <Button
              type="button"
              variant="primary-outline"
              onClick={() => setReviewOpen(true)}
            >
              Review
            </Button>
          ) : null}
          <Button asChild>
            <Link href={`/patients/${patientId}/care-plan/edit`}>Edit plan</Link>
          </Button>
        </div>
      </div>

      <div className={cn(dashboardCardClass, "overflow-hidden p-0")}>
        <div className="border-b border-divider px-5 py-4">
          <h3 className={typo.headingS}>Goals</h3>
        </div>
        {goals.length === 0 ? (
          <p className={cn(typo.bodyM, "px-5 py-6 text-muted-foreground")}>
            No goals defined yet.
          </p>
        ) : (
          <ul>
            {goals.map((goal) => (
              <li key={goal.id}>
                <Link
                  href={`/patients/${patientId}/care-plan/goals/${goal.id}`}
                  className="flex items-start justify-between gap-3 border-b border-divider px-5 py-4 transition-colors last:border-b-0 hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className={cn(typo.headingS, "text-sm")}>{goal.title}</p>
                    <p
                      className={cn(typo.caption, "mt-0.5 text-muted-foreground")}
                    >
                      {goal.owner} · Due {goal.dueLabel}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={cn(
                        statusBadgeClass,
                        goal.status === "On track"
                          ? "bg-success-muted text-success"
                          : goal.status === "At risk"
                            ? "bg-warning-muted text-warning"
                            : goal.status === "Completed"
                              ? "bg-info-muted text-info"
                              : "bg-muted text-muted-foreground",
                      )}
                    >
                      {goal.status}
                    </span>
                    <span
                      className={cn(
                        typo.caption,
                        "tabular-nums text-muted-foreground",
                      )}
                    >
                      {goal.progressPct}%
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={cn(dashboardCardClass, "flex flex-col gap-3 p-5")}>
        <h3 className={typo.headingS}>Interventions</h3>
        <ul className="flex flex-col gap-2">
          {detail.interventionsChecklist.map((item) => (
            <li
              key={item.id}
              className={cn(
                typo.bodyM,
                "flex items-center gap-2 text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  item.checked ? "bg-success" : "bg-border",
                )}
              />
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <CarePlanReviewDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        patientName={patient.name}
      />
    </PatientChartShell>
  );
}
