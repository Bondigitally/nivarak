import { DoctorCarePlanOverview } from "@/features/care-plan/components/DoctorCarePlanOverview";

export default async function PatientCarePlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DoctorCarePlanOverview patientId={id} />;
}
