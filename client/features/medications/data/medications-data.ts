export type DosePeriod = "morning" | "evening";

export type DoseStatus = "taken" | "skipped" | null;

export type MedicationDose = {
  id: string;
  period: DosePeriod;
  status: DoseStatus;
};

export type MedicationItem = {
  id: string;
  name: string;
  dosage: string;
  frequencyLabel: string;
  doses: MedicationDose[];
};

/** Sample payload matching the filled Figma Medications screen (936:4907). */
export const MOCK_TODAY_MEDICATIONS: MedicationItem[] = [
  {
    id: "med-atorvastatin",
    name: "Atorvastatin",
    dosage: "20mg",
    frequencyLabel: "Once daily",
    doses: [{ id: "atorvastatin-evening", period: "evening", status: "taken" }],
  },
  {
    id: "med-metformin",
    name: "Metformin",
    dosage: "500mg",
    frequencyLabel: "Twice daily",
    doses: [
      { id: "metformin-morning", period: "morning", status: null },
      { id: "metformin-evening", period: "evening", status: null },
    ],
  },
  {
    id: "med-lisinopril",
    name: "Lisinopril",
    dosage: "10mg",
    frequencyLabel: "Once daily",
    doses: [{ id: "lisinopril-morning", period: "morning", status: null }],
  },
];
