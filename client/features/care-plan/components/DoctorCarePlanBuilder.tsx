"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { CheckboxIndicator } from "@/components/shared/checkbox-indicator";
import { Button } from "@/components/ui/button";
import {
  fieldInputClassName,
  fieldTextareaClassName,
} from "@/components/ui/input";
import { dashboardCardClass } from "@/features/dashboard/data/dashboard-styles";
import { PatientChartShell } from "@/features/patients/components/PatientChartShell";
import { getDoctorPatientById } from "@/features/patients/data/doctor-patients-data";
import { getCarePlanDetail } from "@/features/patients/data/patient-chart-data";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

export function DoctorCarePlanBuilder({ patientId }: { patientId: string }) {
  const router = useRouter();
  const patient = getDoctorPatientById(patientId);
  const detail = getCarePlanDetail(patientId);

  const [summary, setSummary] = useState(detail.summary);
  const [checks, setChecks] = useState(detail.interventionsChecklist);
  const [goalTitles, setGoalTitles] = useState(
    () => detail.goals.map((g) => g.title),
  );

  if (!patient) notFound();

  function toggleCheck(id: string) {
    setChecks((current) =>
      current.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  }

  function handleSave() {
    router.push(`/patients/${patientId}/care-plan`);
  }

  return (
    <PatientChartShell
      patientId={patientId}
      showKpis={false}
      title="Edit care plan"
    >
      <PageHeader
        title="Edit care plan"
        subtitle={`${patient.name} (${patient.code})`}
      />

      <div className={cn(dashboardCardClass, "flex flex-col gap-3 p-5")}>
        <label htmlFor="cp-summary" className={typo.headingS}>
          Summary
        </label>
        <textarea
          id="cp-summary"
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className={cn(
            fieldTextareaClassName,
          )}
        />
      </div>

      <div className={cn(dashboardCardClass, "flex flex-col gap-4 p-5")}>
        <h2 className={typo.headingL}>Goals</h2>
        {goalTitles.map((title, index) => (
          <div key={`goal-${index}`} className="flex flex-col gap-2">
            <label
              htmlFor={`goal-${index}`}
              className={cn(typo.caption, "text-muted-foreground")}
            >
              Goal {index + 1}
            </label>
            <input
              id={`goal-${index}`}
              value={title}
              onChange={(e) => {
                const next = [...goalTitles];
                next[index] = e.target.value;
                setGoalTitles(next);
              }}
              className={fieldInputClassName}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="primary-outline"
          size="sm"
          className="w-fit"
          onClick={() => setGoalTitles((g) => [...g, "New goal"])}
        >
          Add goal
        </Button>
      </div>

      <div className={cn(dashboardCardClass, "flex flex-col gap-3 p-5")}>
        <h2 className={typo.headingL}>Interventions checklist</h2>
        <ul className="flex flex-col gap-2">
          {checks.map((item) => (
            <li key={item.id}>
              <label className="group flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={item.checked}
                  onChange={() => toggleCheck(item.id)}
                />
                <CheckboxIndicator checked={item.checked} className="mt-0.5" />
                <span className={typo.bodyM}>{item.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="cta" onClick={handleSave}>
          Save care plan
        </Button>
        <Button asChild variant="secondary" size="cta">
          <Link href={`/patients/${patientId}/care-plan`}>Cancel</Link>
        </Button>
      </div>
    </PatientChartShell>
  );
}
