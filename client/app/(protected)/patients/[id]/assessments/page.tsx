import { PatientAssessmentsPageContent } from "@/features/assessments/components/PatientAssessmentsPageContent";

export default async function PatientAssessmentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PatientAssessmentsPageContent patientId={id} />;
}
