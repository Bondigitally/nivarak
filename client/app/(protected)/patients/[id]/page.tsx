import { PatientChartPageContent } from "@/features/patients/components/PatientChartPageContent";

export default async function PatientChartPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PatientChartPageContent patientId={id} />;
}
