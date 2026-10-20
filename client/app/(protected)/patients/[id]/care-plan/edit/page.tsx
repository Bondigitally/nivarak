import { DoctorCarePlanBuilder } from "@/features/care-plan/components/DoctorCarePlanBuilder";

export default async function PatientCarePlanEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DoctorCarePlanBuilder patientId={id} />;
}
