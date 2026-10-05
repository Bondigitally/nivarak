import { DoctorGoalDetail } from "@/features/care-plan/components/DoctorGoalDetail";

export default async function PatientCarePlanGoalPage({
  params,
}: {
  params: Promise<{ id: string; goalId: string }>;
}) {
  const { id, goalId } = await params;
  return <DoctorGoalDetail patientId={id} goalId={goalId} />;
}
