"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { ClinicalNoteCard } from "@/features/clinical-notes/components/ClinicalNoteCard";
import {
  dashboardCardClass,
  memberPortraitCardGridClass,
} from "@/features/dashboard/data/dashboard-styles";
import { PatientChartShell } from "@/features/patients/components/PatientChartShell";
import {
  getDoctorNotesForPatient,
  getDoctorPatientById,
} from "@/features/patients/data/doctor-patients-data";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

export function PatientNotesPageContent({ patientId }: { patientId: string }) {
  const patient = getDoctorPatientById(patientId);
  if (!patient) notFound();

  const notes = getDoctorNotesForPatient(patientId);

  return (
    <PatientChartShell patientId={patientId} showKpis={false}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="Clinical notes"
          subtitle="SOAP, progress, and consult notes for this patient."
        />
        <Button asChild variant="primary-outline" className="shrink-0">
          <Link href={`/patients/${patientId}/notes/new`}>Write note</Link>
        </Button>
      </div>

      {notes.length === 0 ? (
        <div
          className={cn(
            dashboardCardClass,
            "flex min-h-48 flex-col items-center justify-center gap-2 p-6 text-center",
          )}
        >
          <p className={typo.headingL}>No notes yet</p>
          <p className={cn(typo.bodyM, "text-muted-foreground")}>
            Document a SOAP or progress note for this patient.
          </p>
        </div>
      ) : (
        <div className={memberPortraitCardGridClass}>
          {notes.map((note) => (
            <ClinicalNoteCard key={note.id} note={note} showPatient={false} />
          ))}
        </div>
      )}
    </PatientChartShell>
  );
}
