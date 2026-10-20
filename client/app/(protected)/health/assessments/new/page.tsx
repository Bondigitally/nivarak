import { redirect } from "next/navigation";

/** Legacy create-assessment page — Start CGA opens as a dialog on /health/assessments. */
export default function CreateAssessmentRoutePage() {
  redirect("/health/assessments");
}
