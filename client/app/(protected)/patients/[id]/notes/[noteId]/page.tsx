import { NoteDetailPage } from "@/features/clinical-notes/components/NoteDetailPage";

export default async function PatientNoteDetailPage({
  params,
}: {
  params: Promise<{ id: string; noteId: string }>;
}) {
  const { id, noteId } = await params;
  return <NoteDetailPage patientId={id} noteId={noteId} />;
}
