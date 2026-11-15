"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/form-select";
import {
  fieldInputClassName,
  fieldTextareaClassName,
} from "@/components/ui/input";
import { useUserRole } from "@/components/layout/user-role-context";
import {
  CLINICAL_NOTE_TYPE_OPTIONS,
  formatNoteDate,
  saveDoctorNote,
  type ClinicalNoteType,
} from "@/features/clinical-notes/data/clinical-notes-store";
import { PatientChartShell } from "@/features/patients/components/PatientChartShell";
import { getDoctorPatientById } from "@/features/patients/data/doctor-patients-data";
import { getCurrentUserProfile } from "@/lib/auth/current-user-profile";
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
  const { role } = useUserRole();
  const patient = getDoctorPatientById(patientId);
  const [noteType, setNoteType] = useState<ClinicalNoteType>("SOAP");
  const [title, setTitle] = useState("Clinical follow-up");
  const [body, setBody] = useState("");
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

  function persistNote(status: "Draft" | "Signed") {
    const clinician = getCurrentUserProfile(role);
    saveDoctorNote({
      id: `note-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      patientCode: patient.code,
      type: noteType,
      title: title.trim() || "Untitled note",
      status,
      date: formatNoteDate(),
      author: clinician.displayName,
    });
    router.push(`/patients/${patientId}/notes`);
  }

  function handleSaveDraft() {
    persistNote("Draft");
  }

  function handleSign() {
    persistNote("Signed");
  }

  const typeLabel =
    CLINICAL_NOTE_TYPE_OPTIONS.find((o) => o.value === noteType)?.label ??
    noteType;

  return (
    <PatientChartShell
      patientId={patientId}
      showKpis={false}
      title="Write clinical note"
    >
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className={cn(typo.headingXl, "leading-[30px]")}>
            Write clinical note
          </h1>
          <p className={cn(typo.bodyM, "text-muted-foreground")}>
            {`${typeLabel} note for ${patient.name} (${patient.code})`}
          </p>
        </header>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="note-type" className={typo.headingS}>
              Note type
            </label>
            <FormSelect
              id="note-type"
              value={noteType}
              options={CLINICAL_NOTE_TYPE_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
              onChange={(next) => setNoteType(next as ClinicalNoteType)}
              placeholder="Select note type"
              aria-label="Note type"
            />
            <p className={cn(typo.caption, "text-muted-foreground")}>
              Card color on the notes list follows this type (SOAP, Progress, or
              Consult).
            </p>
          </div>

          <div className="flex flex-col gap-2">
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

          {noteType === "SOAP" ? (
            SOAP_FIELDS.map((field) => (
              <div key={field.id} className="flex flex-col gap-2">
                <label htmlFor={field.id} className={typo.headingS}>
                  {field.label}
                </label>
                <textarea
                  id={field.id}
                  rows={4}
                  value={fields[field.id]}
                  onChange={(e) => updateField(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className={fieldTextareaClassName}
                />
              </div>
            ))
          ) : (
            <div className="flex flex-col gap-2">
              <label htmlFor="note-body" className={typo.headingS}>
                Note
              </label>
              <textarea
                id="note-body"
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={
                  noteType === "Progress"
                    ? "Progress note details…"
                    : "Consult note details…"
                }
                className={fieldTextareaClassName}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              size="cta"
              onClick={handleSaveDraft}
            >
              Save draft
            </Button>
            <Button type="button" size="cta" onClick={handleSign}>
              Sign &amp; lock
            </Button>
          </div>
        </div>
      </div>
    </PatientChartShell>
  );
}
