"use client";

import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  dashboardCardClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import { PatientChartShell } from "@/features/patients/components/PatientChartShell";
import {
  getDoctorNoteById,
  getDoctorPatientById,
} from "@/features/patients/data/doctor-patients-data";
import { getSoapNoteContent } from "@/features/patients/data/patient-chart-data";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { key: "subjective" as const, label: "Subjective" },
  { key: "objective" as const, label: "Objective" },
  { key: "assessment" as const, label: "Assessment" },
  { key: "plan" as const, label: "Plan" },
];

export function NoteDetailPage({
  patientId,
  noteId,
}: {
  patientId: string;
  noteId: string;
}) {
  const patient = getDoctorPatientById(patientId);
  const note = getDoctorNoteById(noteId);
  const soap = getSoapNoteContent(noteId);

  if (!patient || !note || note.patientId !== patientId) notFound();

  return (
    <PatientChartShell
      patientId={patientId}
      showKpis={false}
      title="Clinical note"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title={note.title}
          subtitle={`${note.type} · ${patient.name} · ${note.date} · ${note.author}`}
        />
        <span
          className={cn(
            statusBadgeClass,
            note.status === "Signed"
              ? "bg-success-muted text-success"
              : "bg-muted text-muted-foreground",
          )}
        >
          {note.status}
        </span>
      </div>

      {SECTIONS.map((section) => (
        <div
          key={section.key}
          className={cn(dashboardCardClass, "flex flex-col gap-2 p-5")}
        >
          <h2 className={typo.headingL}>{section.label}</h2>
          <p
            className={cn(
              typo.bodyM,
              "whitespace-pre-wrap text-muted-foreground",
            )}
          >
            {soap[section.key] || "—"}
          </p>
        </div>
      ))}

      {note.status === "Signed" && soap.signedBy ? (
        <div className={cn(dashboardCardClass, "flex flex-col gap-1 p-5")}>
          <h2 className={typo.headingL}>Signature</h2>
          <p className={cn(typo.bodyM, "font-medium")}>{soap.signedBy}</p>
          <p className={cn(typo.caption, "text-muted-foreground")}>
            {soap.signedAt}
          </p>
        </div>
      ) : null}
    </PatientChartShell>
  );
}
