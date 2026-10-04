import type { IaspAnswerId } from "./iasp-questionnaire-data";
import {
  IASP_QUESTION_PAGES,
  IASP_SECTIONS,
  IASP_TOTAL_QUESTIONS,
} from "./iasp-questionnaire-data";
import {
  IASP_RED_FLAG_OPTIONS,
  type IaspRedFlagId,
} from "./iasp-red-flags-data";

const ANSWER_POINTS: Record<IaspAnswerId, number> = {
  independent: 2,
  assistance: 1,
  dependent: 0,
};

export const IASP_MAX_SCORE = IASP_TOTAL_QUESTIONS * 2;

type IaspRiskBand =
  | "strong_independent"
  | "independent_vulnerable"
  | "supported_independence"
  | "limited_independence"
  | "high_dependence";

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
    badgeClass: "bg-warning text-primary-foreground",
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

export const IASP_ANSWER_BADGE: Record<
  IaspAnswerId,
  { label: string; className: string }
> = {
  independent: {
    label: "Independent",
    className: "border-success/20 bg-success-muted text-success",
  },
  assistance: {
    label: "Needs Help",
    className: "border-warning/20 bg-warning-muted text-warning",
  },
  dependent: {
    label: "Dependent",
    className: "border-destructive/20 bg-destructive-muted text-destructive",
  },
};

function getIaspAnswerPoints(answer: IaspAnswerId | undefined): number {
  if (!answer) return 0;
  return ANSWER_POINTS[answer];
}

export function calculateIaspRawScore(
  answers: Record<string, IaspAnswerId | undefined>,
): number {
  return Object.values(answers).reduce(
    (sum, answer) => sum + getIaspAnswerPoints(answer),
    0,
  );
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
