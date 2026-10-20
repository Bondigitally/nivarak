import { PatientVitalsPageContent } from "@/features/patients/components/PatientVitalsPageContent";

export default async function PatientVitalsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PatientVitalsPageContent patientId={id} />;
}
