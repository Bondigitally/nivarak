/**
 * Schedule / meal chips — Figma MedicationsCard (2444:2438).
 * Soft tinted fills + darker label text; shared by patient meds page and
 * doctor chart overview medications card.
 */
export const medicationScheduleBadgeClass = {
  morning: "bg-[rgba(255,251,235,0.9)] text-[#92400e]",
  evening: "bg-[rgba(239,246,255,0.9)] text-[#1d4ed8]",
  "pre-meal": "bg-[rgba(250,245,255,0.9)] text-[#7e22ce]",
  "post-meal": "bg-[rgba(236,253,245,0.9)] text-[#065f46]",
} as const;

/** Compact “Refill soon” chip next to the med name (Figma 2444:2492). */
export const medicationRefillSoonBadgeClass =
  "bg-[#fef3c7] font-semibold text-[#92400e]";

export type MedicationScheduleBadgeKind =
  keyof typeof medicationScheduleBadgeClass;
