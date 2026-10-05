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
        <Button asChild size="sm">
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
        <div className={cn(dashboardCardClass, "overflow-hidden p-0")}>
          <ul>
            {notes.map((note) => (
              <li key={note.id}>
                <Link
                  href={`/patients/${patientId}/notes/${note.id}`}
                  className="flex items-start justify-between gap-3 border-b border-divider px-5 py-4 transition-colors last:border-b-0 hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className={cn(typo.headingS, "text-sm")}>{note.title}</p>
                    <p
                      className={cn(
                        typo.caption,
                        "mt-0.5 text-muted-foreground",
                      )}
                    >
                      {note.type} · {note.date} · {note.author}
                    </p>
                  </div>
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
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </PatientChartShell>
  );
}
