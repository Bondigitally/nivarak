"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { fieldInputClassName } from "@/components/ui/input";
import { dashboardCardClass } from "@/features/dashboard/data/dashboard-styles";
import { PatientChartShell } from "@/features/patients/components/PatientChartShell";
import { getDoctorPatientById } from "@/features/patients/data/doctor-patients-data";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

const SOAP_FIELDS = [
  {
    id: "subjective",
    label: "Subjective",
    placeholder: "Patient-reported symptoms and history…",
  },
  {
    id: "objective",
    label: "Objective",
    placeholder: "Exam findings, vitals, labs…",
  },
  {
    id: "assessment",
    label: "Assessment",
    placeholder: "Clinical impression…",
  },
  {
    id: "plan",
    label: "Plan",
    placeholder: "Orders, education, follow-up…",
  },
] as const;

export function WriteClinicalNotePage({ patientId }: { patientId: string }) {
  const router = useRouter();
  const patient = getDoctorPatientById(patientId);
  const [title, setTitle] = useState("Clinical follow-up");
  const [fields, setFields] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });

  if (!patient) notFound();

  function updateField(key: keyof typeof fields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function handleSaveDraft() {
    router.push(`/patients/${patientId}/notes`);
  }

  function handleSign() {
    router.push(`/patients/${patientId}/notes`);
  }

  return (
    <PatientChartShell
      patientId={patientId}
      showKpis={false}
      title="Write clinical note"
    >
      <PageHeader
        title="Write clinical note"
        subtitle={`SOAP note for ${patient.name} (${patient.code})`}
      />

      <div className={cn(dashboardCardClass, "flex flex-col gap-3 p-5")}>
        <label htmlFor="note-title" className={typo.headingS}>
          Title
        </label>
        <input
          id="note-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={fieldInputClassName}
        />
      </div>

      {SOAP_FIELDS.map((field) => (
        <div
          key={field.id}
          className={cn(dashboardCardClass, "flex flex-col gap-3 p-5")}
        >
          <label htmlFor={field.id} className={typo.headingS}>
            {field.label}
          </label>
          <textarea
            id={field.id}
            rows={4}
            value={fields[field.id]}
            onChange={(e) => updateField(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={cn(
              fieldInputClassName,
              "h-auto min-h-11 resize-y py-3 leading-6",
            )}
          />
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="cta" onClick={handleSaveDraft}>
          Save draft
        </Button>
        <Button type="button" size="cta" onClick={handleSign}>
          Sign &amp; lock
        </Button>
      </div>
    </PatientChartShell>
  );
}
