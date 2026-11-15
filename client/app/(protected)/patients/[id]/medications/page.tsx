import { PatientMedicationsPageContent } from "@/features/patients/components/PatientMedicationsPageContent";

export default async function PatientMedicationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PatientMedicationsPageContent patientId={id} />;
}
