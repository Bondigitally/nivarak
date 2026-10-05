"use client";

import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { CheckboxIndicator } from "@/components/shared/checkbox-indicator";
import {
  dashboardCardClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import { PatientChartShell } from "@/features/patients/components/PatientChartShell";
import { getDoctorPatientById } from "@/features/patients/data/doctor-patients-data";
import { getCarePlanGoal } from "@/features/patients/data/patient-chart-data";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

export function DoctorGoalDetail({
  patientId,
  goalId,
}: {
  patientId: string;
  goalId: string;
}) {
  const patient = getDoctorPatientById(patientId);
  const goal = getCarePlanGoal(patientId, goalId);

  if (!patient || !goal) notFound();

  return (
    <PatientChartShell
      patientId={patientId}
      showKpis={false}
      title="Goal detail"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title={goal.title}
          subtitle={`${patient.name} · Owner ${goal.owner} · Due ${goal.dueLabel}`}
        />
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
      </div>

      <div className={cn(dashboardCardClass, "flex flex-col gap-3 p-5")}>
        <div className="flex items-center justify-between gap-2">
          <h2 className={typo.headingL}>Progress</h2>
          <span className={cn(typo.headingS, "tabular-nums")}>
            {goal.progressPct}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${goal.progressPct}%` }}
          />
        </div>
      </div>

      <div className={cn(dashboardCardClass, "flex flex-col gap-3 p-5")}>
        <h2 className={typo.headingL}>Interventions</h2>
        <ul className="flex flex-col gap-2">
          {goal.interventions.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <CheckboxIndicator checked={item.done} className="mt-0.5" />
              <span
                className={cn(
                  typo.bodyM,
                  item.done && "text-muted-foreground line-through",
                )}
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className={cn(dashboardCardClass, "overflow-hidden p-0")}>
        <div className="border-b border-divider px-5 py-4">
          <h2 className={typo.headingL}>Progress log</h2>
        </div>
        {goal.progressLog.length === 0 ? (
          <p className={cn(typo.bodyM, "px-5 py-6 text-muted-foreground")}>
            No progress entries yet.
          </p>
        ) : (
          <ul>
            {goal.progressLog.map((entry) => (
              <li
                key={entry.id}
                className="border-b border-divider px-5 py-4 last:border-b-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={cn(typo.headingS, "text-sm")}>{entry.author}</p>
                  <span className={cn(typo.caption, "text-muted-foreground")}>
                    {entry.date}
                  </span>
                </div>
                <p className={cn(typo.bodyM, "mt-1 text-muted-foreground")}>
                  {entry.note}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PatientChartShell>
  );
}
