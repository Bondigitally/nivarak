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

export const IASP_MIN_AGE = 18;
export const IASP_MAX_AGE = 120;

export function sanitizeIaspAgeInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 3);
}

export function getIaspAgeError(age: string): string | null {
  if (!age) return null;

  const value = Number(age);
  if (!Number.isFinite(value)) return null;

  if (value < IASP_MIN_AGE) {
    return `Age must be at least ${IASP_MIN_AGE}.`;
  }
  if (value > IASP_MAX_AGE) {
    return `Age must be ${IASP_MAX_AGE} or below.`;
  }

  return null;
}

export function isIaspAboutYouComplete(values: IaspAboutYouValues): boolean {
  const age = Number(values.age);
  return (
    Boolean(values.relationship) &&
    Boolean(values.location) &&
    Boolean(values.visitFrequency) &&
    Boolean(values.livingSituation) &&
    Number.isFinite(age) &&
    age >= IASP_MIN_AGE &&
    age <= IASP_MAX_AGE
  );
}
