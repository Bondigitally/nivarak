import { notFound } from "next/navigation";
import { CgaAssessmentWizard } from "@/features/assessments/components/CgaAssessmentWizard";
import { DoctorAssessmentDetail } from "@/features/assessments/components/DoctorAssessmentDetail";
import { getDoctorPatientById } from "@/features/patients/data/doctor-patients-data";

export default async function PatientAssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string; assessmentId: string }>;
}) {
  const { id, assessmentId } = await params;

  if (assessmentId === "cga-new") {
    if (!getDoctorPatientById(id)) notFound();
    return <CgaAssessmentWizard patientId={id} />;
  }

  return (
    <DoctorAssessmentDetail patientId={id} assessmentId={assessmentId} />
  );
}
