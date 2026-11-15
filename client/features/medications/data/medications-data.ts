export type DosePeriod = "morning" | "evening";

export type DoseMealTiming = "pre-meal" | "post-meal";

export type DoseStatus = "taken" | "skipped" | null;

export type MedicationDose = {
  id: string;
  period: DosePeriod;
  mealTiming?: DoseMealTiming;
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
    id: "med-omeprazole",
    name: "Omeprazole",
    dosage: "20 mg",
    frequencyLabel: "Once daily",
    doses: [
      {
        id: "omeprazole-evening",
        period: "evening",
        mealTiming: "pre-meal",
        status: "taken",
      },
    ],
  },
  {
    id: "med-metformin",
    name: "Metformin",
    dosage: "500 mg",
    frequencyLabel: "Twice daily",
    doses: [
      {
        id: "metformin-morning",
        period: "morning",
        mealTiming: "post-meal",
        status: null,
      },
      {
        id: "metformin-evening",
        period: "evening",
        mealTiming: "post-meal",
        status: null,
      },
    ],
  },
  {
    id: "med-losartan",
    name: "Losartan",
    dosage: "50 mg",
    frequencyLabel: "Once daily",
    doses: [
      {
        id: "losartan-morning",
        period: "morning",
        mealTiming: "pre-meal",
        status: null,
      },
    ],
  },
];
