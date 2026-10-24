import { EMPTY_IASP_ABOUT_YOU, type IaspAboutYouValues } from "./iasp-about-you-data";
import type { IaspAnswerId } from "./iasp-questionnaire-data";
import type { IaspRedFlagId } from "./iasp-red-flags-data";

/**
 * Linear step order of the IASP flow.
 * intro → about → questions → redFlags → review → results
 * Steps are advanced sequentially; navigating back is allowed from any step.
 */
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
  /**
   * Slide animation direction: +1 = forward (next question), -1 = back.
   * Drives the `x` offset in questionPageVariants inside IaspQuestionsStep.
   */
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

/** Compact answered map for session sync / complete payloads. */
export function toIaspAnswersPayload(
  answers: IaspAnswersMap,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [questionId, answer] of Object.entries(answers)) {
    if (answer) out[questionId] = answer;
  }
  return out;
}

/**
 * Session-scoped draft key — cleared when the tab closes or when
 * `hasIaspProgress` returns false (empty/default state).
 */
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
      aboutYou.livingSituation ||
      aboutYou.livingSituationOther,
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
