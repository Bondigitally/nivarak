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
  "Different country",
] as const;

export const IASP_VISIT_FREQUENCY_OPTIONS = [
  "Daily",
  "Several times a week",
  "Weekly",
  "Less than weekly",
  "Mostly by phone/video",
] as const;

export const IASP_LIVING_SITUATION_OTHER = "Other";

export const IASP_LIVING_SITUATION_OPTIONS = [
  "Alone",
  "With spouse",
  "With family",
  "With caregiver",
  IASP_LIVING_SITUATION_OTHER,
] as const;

export type IaspAboutYouValues = {
  relationship: string | null;
  age: string;
  location: string | null;
  visitFrequency: string | null;
  livingSituation: string | null;
  livingSituationOther: string;
};

export const EMPTY_IASP_ABOUT_YOU: IaspAboutYouValues = {
  relationship: null,
  age: "",
  location: null,
  visitFrequency: null,
  livingSituation: null,
  livingSituationOther: "",
};

export const IASP_MIN_AGE = 18;
export const IASP_MAX_AGE = 120;
export const IASP_LIVING_SITUATION_OTHER_MAX = 100;

export function sanitizeIaspAgeInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 3);
}

export function sanitizeIaspLivingSituationOther(value: string): string {
  return value.slice(0, IASP_LIVING_SITUATION_OTHER_MAX);
}

export function isIaspLivingSituationOther(
  livingSituation: string | null,
): boolean {
  return livingSituation === IASP_LIVING_SITUATION_OTHER;
}

export function getIaspLivingSituationDisplay(
  values: Pick<IaspAboutYouValues, "livingSituation" | "livingSituationOther">,
): string | null {
  if (!values.livingSituation) return null;
  return values.livingSituation;
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
  const livingOk =
    Boolean(values.livingSituation) &&
    (!isIaspLivingSituationOther(values.livingSituation) ||
      Boolean(values.livingSituationOther.trim()));

  return (
    Boolean(values.relationship) &&
    Boolean(values.location) &&
    Boolean(values.visitFrequency) &&
    livingOk &&
    Number.isFinite(age) &&
    age >= IASP_MIN_AGE &&
    age <= IASP_MAX_AGE
  );
}
