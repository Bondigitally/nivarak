"use client";

import { notFound } from "next/navigation";
import { PatientChartShell } from "@/features/patients/components/PatientChartShell";
import { PatientMedicationsTable } from "@/features/patients/components/PatientMedicationsTable";
import { getDoctorPatientById } from "@/features/patients/data/doctor-patients-data";
import { getPatientMedications } from "@/features/patients/data/patient-chart-data";

export function PatientMedicationsPageContent({
  patientId,
}: {
  patientId: string;
}) {
  const patient = getDoctorPatientById(patientId);
  if (!patient) notFound();

  const medications = getPatientMedications(patientId);

  return (
    <PatientChartShell patientId={patientId} showKpis={false}>
      <PatientMedicationsTable data={medications} />
    </PatientChartShell>
  );
}
