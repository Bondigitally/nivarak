import { WriteClinicalNotePage } from "@/features/clinical-notes/components/WriteClinicalNotePage";

export default async function PatientNewNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WriteClinicalNotePage patientId={id} />;
}
