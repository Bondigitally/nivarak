import type { IaspAnswerId } from "./iasp-questionnaire-data";
import {
  IASP_QUESTION_PAGES,
  IASP_SCORED_QUESTION_COUNT,
  IASP_SECTIONS,
  findIaspQuestion,
  getIaspQuestionOptions,
  isIaspQuestionScored,
} from "./iasp-questionnaire-data";
import {
  IASP_RED_FLAG_OPTIONS,
  type IaspRedFlagId,
} from "./iasp-red-flags-data";

/** Internal max raw score (scored items × 2). Not shown in results UI. */
export const IASP_MAX_SCORE = IASP_SCORED_QUESTION_COUNT * 2;

type IaspRiskBand =
  | "strong_independent"
  | "independent_vulnerable"
  | "supported_independence"
  | "limited_independence"
  | "high_dependence";

export type { IaspRiskBand };

export type IaspBandResult = {
  band: IaspRiskBand;
  label: string;
  descriptionBefore: string;
  highlight: string;
  descriptionAfter: string;
  badgeClass: string;
};

const BAND_COPY: Record<IaspRiskBand, Omit<IaspBandResult, "band">> = {
  strong_independent: {
    label: "Strong Independence",
    descriptionBefore: "Maintains independence with minimal support. A ",
    highlight: "home care",
    descriptionAfter: " pathway is recommended.",
    badgeClass: "bg-success text-primary-foreground",
  },
  independent_vulnerable: {
    label: "Independent but Vulnerable",
    descriptionBefore: "Mostly independent with early support needs. A ",
    highlight: "home care",
    descriptionAfter: " pathway is recommended.",
    badgeClass: "bg-info text-primary-foreground",
  },
  supported_independence: {
    label: "Supported Independence",
    descriptionBefore:
      "Needs regular support to maintain independence. A ",
    highlight: "hybrid care model",
    descriptionAfter: " is recommended.",
    badgeClass: "bg-warning text-primary-foreground",
  },
  limited_independence: {
    label: "Limited Independence",
    descriptionBefore: "Needs structured clinical support. A ",
    highlight: "clinic care",
    descriptionAfter: " pathway is recommended.",
    badgeClass: "bg-attention text-primary-foreground",
  },
  high_dependence: {
    label: "High Dependence",
    descriptionBefore: "Requires intensive daily support. A ",
    highlight: "high-dependency",
    descriptionAfter: " pathway is recommended.",
    badgeClass: "bg-destructive text-primary-foreground",
  },
};

/** Ping badge tint + dot per band — dashboard hero (`IaspBandPingBadge`). */
export type IaspBandPingStyle = {
  shell: string;
  dot: string;
  pulse: boolean;
};

export const IASP_BAND_PING_STYLES: Record<IaspRiskBand, IaspBandPingStyle> = {
  strong_independent: {
    shell: "bg-success-muted text-success",
    dot: "bg-success",
    pulse: true,
  },
  independent_vulnerable: {
    shell: "bg-info-muted text-info",
    dot: "bg-info",
    pulse: true,
  },
  supported_independence: {
    shell: "bg-warning-muted text-warning",
    dot: "bg-warning",
    pulse: true,
  },
  limited_independence: {
    shell: "bg-attention-muted text-attention-foreground",
    dot: "bg-attention",
    pulse: true,
  },
  high_dependence: {
    shell: "bg-destructive-muted text-destructive",
    dot: "bg-destructive",
    pulse: true,
  },
};

const DEFAULT_ANSWER_BADGE: Record<
  IaspAnswerId,
  { label: string; className: string }
> = {
  independent: {
    label: "Independent",
    className: "border-success/20 bg-success-muted text-success",
  },
  assistance: {
    label: "Some support",
    className: "border-warning/20 bg-warning-muted text-warning",
  },
  dependent: {
    label: "Dependent",
    className: "border-destructive/20 bg-destructive-muted text-destructive",
  },
  yes: {
    label: "Yes",
    className: "border-warning/20 bg-warning-muted text-warning",
  },
  no: {
    label: "No",
    className: "border-success/20 bg-success-muted text-success",
  },
};

export function getIaspAnswerBadgeForQuestion(
  questionId: string,
  answer: IaspAnswerId | undefined,
): { label: string; className: string } | null {
  if (!answer) return null;
  const question = findIaspQuestion(questionId);
  const option = question
    ? getIaspQuestionOptions(question).find((item) => item.id === answer)
    : undefined;
  const fallback = DEFAULT_ANSWER_BADGE[answer];
  return {
    label: option?.label ?? fallback.label,
    className: fallback.className,
  };
}

function getIaspAnswerPoints(
  questionId: string,
  answer: IaspAnswerId | undefined,
): number {
  if (!answer) return 0;
  const question = findIaspQuestion(questionId);
  if (!question || !isIaspQuestionScored(question)) return 0;
  const option = getIaspQuestionOptions(question).find(
    (item) => item.id === answer,
  );
  return option?.points ?? 0;
}

export function calculateIaspRawScore(
  answers: Record<string, IaspAnswerId | undefined>,
): number {
  let sum = 0;
  for (const [questionId, answer] of Object.entries(answers)) {
    sum += getIaspAnswerPoints(questionId, answer);
  }
  return sum;
}

export function calculateIaspPercentage(rawScore: number): number {
  if (IASP_MAX_SCORE <= 0) return 0;
  return Math.round((rawScore / IASP_MAX_SCORE) * 100);
}

export function getIaspBand(percentage: number): IaspBandResult {
  let band: IaspRiskBand;
  if (percentage >= 85) band = "strong_independent";
  else if (percentage >= 70) band = "independent_vulnerable";
  else if (percentage >= 55) band = "supported_independence";
  else if (percentage >= 40) band = "limited_independence";
  else band = "high_dependence";

  return { band, ...BAND_COPY[band] };
}

/** All IASP bands in severity order — docs, tests, design QA. */
export function listIaspBands(): IaspBandResult[] {
  const order: IaspRiskBand[] = [
    "strong_independent",
    "independent_vulnerable",
    "supported_independence",
    "limited_independence",
    "high_dependence",
  ];
  return order.map((band) => ({ band, ...BAND_COPY[band] }));
}

export function formatIaspAssessmentDate(date = new Date()): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getIaspReviewSections(
  answers: Record<string, IaspAnswerId | undefined>,
) {
  return IASP_SECTIONS.map((section) => {
    const answered = section.questions.filter((q) => answers[q.id] != null);
    return {
      id: section.id,
      title: section.title,
      questions: section.questions.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        answer: answers[question.id],
      })),
      answeredCount: answered.length,
      totalCount: section.questions.length,
    };
  });
}

export function getSelectedRedFlagOptions(selected: readonly IaspRedFlagId[]) {
  const selectedSet = new Set(selected);
  return IASP_RED_FLAG_OPTIONS.filter((option) => selectedSet.has(option.id));
}

export function findFirstPageIndexForSection(sectionId: string): number {
  const index = IASP_QUESTION_PAGES.findIndex(
    (page) => page.sectionId === sectionId,
  );
  return Math.max(0, index);
}
