import type { DoctorNoteRow } from "@/lib/domain/doctor";

const STORAGE_KEY = "nivarak:doctor-clinical-notes";

export const CLINICAL_NOTE_TYPE_OPTIONS = [
  { value: "SOAP", label: "SOAP" },
  { value: "Progress", label: "Progress" },
  { value: "Consult", label: "Consult" },
] as const;

export type ClinicalNoteType = DoctorNoteRow["type"];

export function loadStoredDoctorNotes(): DoctorNoteRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DoctorNoteRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDoctorNote(note: DoctorNoteRow) {
  if (typeof window === "undefined") return;
  try {
    const existing = loadStoredDoctorNotes().filter((n) => n.id !== note.id);
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([note, ...existing]),
    );
  } catch {
    /* ignore quota */
  }
}

export function formatNoteDate(date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
