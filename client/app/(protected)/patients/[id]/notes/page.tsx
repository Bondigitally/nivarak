import { PatientNotesPageContent } from "@/features/patients/components/PatientNotesPageContent";

export default async function PatientNotesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PatientNotesPageContent patientId={id} />;
}
