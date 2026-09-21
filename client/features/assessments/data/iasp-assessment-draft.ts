import { EMPTY_IASP_ABOUT_YOU, type IaspAboutYouValues } from "./iasp-about-you-data";
import {
  IASP_SECTIONS,
  type IaspAnswerId,
} from "./iasp-questionnaire-data";
import type { IaspRedFlagId } from "./iasp-red-flags-data";

export type IaspFlowStep =
  | "intro"
  | "about"
  | "questions"
  | "redFlags"
  | "review"
  | "results";

export type IaspAnswersMap = Record<string, IaspAnswerId | undefined>;

export type IaspFlowState = {
  step: IaspFlowStep;
  aboutYou: IaspAboutYouValues;
  pageIndex: number;
  pageDirection: number;
  answers: IaspAnswersMap;
  redFlags: IaspRedFlagId[];
  autoAdvance: boolean;
};

export const INITIAL_IASP_FLOW_STATE: IaspFlowState = {
  step: "intro",
  aboutYou: EMPTY_IASP_ABOUT_YOU,
  pageIndex: 0,
  pageDirection: 1,
  answers: {},
  redFlags: [],
  autoAdvance: true,
};

/** Pre-filled state for dev/testing the results step without answering every question. */
export function createIaspResultsPreviewState(): IaspFlowState {
  const sampleAnswers: IaspAnswerId[] = [
    "independent",
    "assistance",
    "dependent",
    "assistance",
  ];
  const answers: IaspAnswersMap = {};
  let index = 0;

  for (const section of IASP_SECTIONS) {
    for (const question of section.questions) {
      answers[question.id] = sampleAnswers[index % sampleAnswers.length];
      index += 1;
    }
  }

  return {
    step: "results",
    aboutYou: {
      relationship: "Son / Daughter",
      age: "72",
      location: "Same city",
      visitFrequency: "Weekly",
      livingSituation: "Lives with family",
    },
    pageIndex: 0,
    pageDirection: 1,
    answers,
    redFlags: ["two_or_more_falls"],
    autoAdvance: true,
  };
}

export function isIaspResultsPreviewEnabled(): boolean {
  return process.env.NODE_ENV === "development";
}

const DRAFT_KEY = "nivarak:iasp-assessment-draft";

export function hasIaspProgress(state: IaspFlowState): boolean {
  if (state.step !== "intro") return true;
  if (Object.keys(state.answers).length > 0) return true;
  if (state.redFlags.length > 0) return true;
  const { aboutYou } = state;
  return Boolean(
    aboutYou.relationship ||
      aboutYou.age ||
      aboutYou.location ||
      aboutYou.visitFrequency ||
      aboutYou.livingSituation,
  );
}

function isFlowStep(value: unknown): value is IaspFlowStep {
  return (
    value === "intro" ||
    value === "about" ||
    value === "questions" ||
    value === "redFlags" ||
    value === "review" ||
    value === "results"
  );
}

export function saveIaspDraft(state: IaspFlowState): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function loadIaspDraft(): IaspFlowState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<IaspFlowState>;
    if (!isFlowStep(parsed.step)) return null;
    const state: IaspFlowState = {
      ...INITIAL_IASP_FLOW_STATE,
      ...parsed,
      aboutYou: {
        ...EMPTY_IASP_ABOUT_YOU,
        ...(parsed.aboutYou ?? {}),
      },
      answers: parsed.answers ?? {},
      redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
      pageIndex:
        typeof parsed.pageIndex === "number" ? parsed.pageIndex : 0,
      pageDirection:
        typeof parsed.pageDirection === "number" ? parsed.pageDirection : 1,
      autoAdvance:
        typeof parsed.autoAdvance === "boolean" ? parsed.autoAdvance : true,
    };

    if (!hasIaspProgress(state)) {
      clearIaspDraft();
      return null;
    }

    return state;
  } catch {
    return null;
  }
}

export function clearIaspDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // Ignore storage failures.
  }
}
