export const IASP_RELATIONSHIP_OPTIONS = [
  "Spouse / Partner",
  "Son / Daughter",
  "Sibling",
  "Other family member",
  "Friend",
  "Professional caregiver",
] as const;

export const IASP_LOCATION_OPTIONS = [
  "Same household",
  "Same city",
  "Same state",
  "Different state",
  "Outside India",
] as const;

export const IASP_VISIT_FREQUENCY_OPTIONS = [
  "Daily",
  "Several times a week",
  "Weekly",
  "Monthly",
  "A few times a year",
  "Rarely / remotely",
] as const;

export const IASP_LIVING_SITUATION_OPTIONS = [
  "Lives alone",
  "Lives with spouse / partner",
  "Lives with family",
  "Lives with caregiver",
  "Assisted living / facility",
] as const;

export type IaspAboutYouValues = {
  relationship: string | null;
  age: string;
  location: string | null;
  visitFrequency: string | null;
  livingSituation: string | null;
};

export const EMPTY_IASP_ABOUT_YOU: IaspAboutYouValues = {
  relationship: null,
  age: "",
  location: null,
  visitFrequency: null,
  livingSituation: null,
};

export function isIaspAboutYouComplete(values: IaspAboutYouValues): boolean {
  const age = Number(values.age);
  return (
    Boolean(values.relationship) &&
    Boolean(values.location) &&
    Boolean(values.visitFrequency) &&
    Boolean(values.livingSituation) &&
    Number.isFinite(age) &&
    age >= 18 &&
    age <= 120
  );
}
