export type IaspRedFlagId =
  | "two_or_more_falls"
  | "missed_incorrect_medicines"
  | "unsafe_decisions"
  | "significant_weight_loss"
  | "social_isolation"
  | "recurrent_hospital_admissions"
  | "caregiver_struggling"
  | "no_emergency_response";

export type IaspRedFlagOption = {
  id: IaspRedFlagId;
  label: string;
  /** Short chip label on the review screen. */
  shortLabel: string;
};

export const IASP_RED_FLAG_OPTIONS: readonly IaspRedFlagOption[] = [
  {
    id: "two_or_more_falls",
    label: "Two or more falls in the last 6 months",
    shortLabel: "Recent history of falls",
  },
  {
    id: "missed_incorrect_medicines",
    label: "Missed or taken medications incorrectly",
    shortLabel: "Medication errors",
  },
  {
    id: "unsafe_decisions",
    label: "Recently made unsafe decisions",
    shortLabel: "Unsafe decisions",
  },
  {
    id: "significant_weight_loss",
    label: "Significant or unexplained weight loss",
    shortLabel: "Unexplained weight loss",
  },
  {
    id: "social_isolation",
    label: "Showing signs of social isolation",
    shortLabel: "Social isolation",
  },
  {
    id: "recurrent_hospital_admissions",
    label: "Recurrent hospital admissions",
    shortLabel: "Recurrent admissions",
  },
  {
    id: "caregiver_struggling",
    label: "Primary caregiver is struggling or absent",
    shortLabel: "Caregiver struggling",
  },
  {
    id: "no_emergency_response",
    label: "Cannot summon help in an emergency",
    shortLabel: "No emergency response",
  },
] as const;

export const IASP_RED_FLAGS_HELPER =
  "Select any urgent concerns that may require immediate professional attention.";
