export type IaspAnswerId =
  | "independent"
  | "assistance"
  | "dependent"
  | "yes"
  | "no";

export type IaspAnswerOption = {
  id: IaspAnswerId;
  label: string;
  description?: string;
  /** Points toward IAS raw score. Ignored when the question is unscored. */
  points: number;
};

export type IaspQuestion = {
  id: string;
  prompt: string;
  /** When false, answer is collected but excluded from IAS raw score. Default true. */
  scored?: boolean;
  /** Override the default Independent / Some support / Dependent scale. */
  options?: readonly IaspAnswerOption[];
};

export type IaspSection = {
  id: string;
  letter: string;
  title: string;
  questions: readonly IaspQuestion[];
};

export type IaspQuestionPage = {
  sectionId: string;
  letter: string;
  title: string;
  questions: readonly IaspQuestion[];
};

export const IASP_HELPER =
  "Please answer based on how your parent has functioned in the past 4 weeks.";

/** Default 0–2 independence scale for scored items. */
export const IASP_ANSWER_OPTIONS: readonly IaspAnswerOption[] = [
  {
    id: "independent",
    label: "Independent",
    description: "Does safely without help",
    points: 2,
  },
  {
    id: "assistance",
    label: "Some support",
    description: "Needs reminders, supervision, or occasional help",
    points: 1,
  },
  {
    id: "dependent",
    label: "Dependent",
    description: "Needs regular help or cannot do alone / unsafe",
    points: 0,
  },
] as const;

const FALLS_OPTIONS: readonly IaspAnswerOption[] = [
  {
    id: "independent",
    label: "No fall",
    description: "No falls in the last 6 months",
    points: 2,
  },
  {
    id: "assistance",
    label: "One fall",
    description: "One fall in the last 6 months",
    points: 1,
  },
  {
    id: "dependent",
    label: "Two or more falls",
    description: "Two or more falls in the last 6 months",
    points: 0,
  },
] as const;

const MEDICATION_COUNT_OPTIONS: readonly IaspAnswerOption[] = [
  {
    id: "yes",
    label: "Yes",
    description: "Takes more than 5 medications",
    points: 0,
  },
  {
    id: "no",
    label: "No",
    description: "Takes 5 or fewer medications",
    points: 0,
  },
] as const;

const WEIGHT_OPTIONS: readonly IaspAnswerOption[] = [
  {
    id: "independent",
    label: "Stable",
    description: "Weight and appetite are stable",
    points: 2,
  },
  {
    id: "assistance",
    label: "Mild concern",
    description: "Mild concern about weight or appetite",
    points: 1,
  },
  {
    id: "dependent",
    label: "Significant concern",
    description: "Significant concern about weight or appetite",
    points: 0,
  },
] as const;

const SOCIAL_CONTACT_OPTIONS: readonly IaspAnswerOption[] = [
  {
    id: "independent",
    label: "Yes",
    description: "Regular contact at least once a week / any social activity",
    points: 2,
  },
  {
    id: "dependent",
    label: "No",
    description: "No regular weekly contact or social activity",
    points: 0,
  },
] as const;

const EMERGENCY_OPTIONS: readonly IaspAnswerOption[] = [
  {
    id: "independent",
    label: "Clear reliable system",
    description: "Can get help in an emergency through a reliable system",
    points: 2,
  },
  {
    id: "assistance",
    label: "Some support available",
    description: "Some emergency support is available",
    points: 1,
  },
  {
    id: "dependent",
    label: "No reliable system",
    description: "No reliable emergency response system",
    points: 0,
  },
] as const;

export const IASP_SECTIONS: readonly IaspSection[] = [
  {
    id: "basic-self-care",
    letter: "A",
    title: "Basic Self-Care",
    questions: [
      { id: "bathe", prompt: "Bathing" },
      { id: "dress", prompt: "Dressing" },
      { id: "toilet", prompt: "Toileting" },
      { id: "eat-drink", prompt: "Feeding / eating meals" },
    ],
  },
  {
    id: "daily-life",
    letter: "B",
    title: "Daily Life Function",
    questions: [
      {
        id: "phone",
        prompt: "Using phone / communicating when needed",
      },
      {
        id: "home-tasks",
        prompt:
          "Managing small daily tasks in the home (e.g. making the bed or tidying)",
      },
      {
        id: "purchases",
        prompt:
          "Handling simple purchases or money matters (e.g. banking, paying bills)",
      },
      {
        id: "essentials",
        prompt: "Organizing daily essentials (food, medicines, etc.)",
      },
    ],
  },
  {
    id: "mobility",
    letter: "C",
    title: "Mobility",
    questions: [
      { id: "move-home", prompt: "Moving safely inside the house" },
      { id: "transfer", prompt: "Getting up from bed or chair" },
      {
        id: "outdoors",
        prompt: "Walking outside / in common areas",
      },
      {
        id: "falls",
        prompt: "In the last 6 months, does the patient have any falls?",
        options: FALLS_OPTIONS,
      },
    ],
  },
  {
    id: "thinking",
    letter: "D",
    title: "Thinking & Decision-Making",
    questions: [
      {
        id: "routines",
        prompt:
          "Remembering routine daily tasks (e.g. brushing, bathing)",
      },
      {
        id: "instructions",
        prompt: "Understanding instructions or advice",
      },
      {
        id: "decisions",
        prompt:
          "Making safe everyday decisions (e.g. would it be safe to leave them for 24 hrs without help)",
      },
    ],
  },
  {
    id: "health",
    letter: "E",
    title: "Health Management",
    questions: [
      {
        id: "medication-count",
        prompt: "Does the patient take more than 5 medications?",
        scored: false,
        options: MEDICATION_COUNT_OPTIONS,
      },
      {
        id: "medications",
        prompt: "Taking medicines correctly",
      },
      {
        id: "understand-health",
        prompt: "Understanding their main medical problems",
      },
      {
        id: "appointments",
        prompt: "Following appointments or treatment advice",
      },
    ],
  },
  {
    id: "nutrition",
    letter: "F",
    title: "Nutrition & Continence",
    questions: [
      {
        id: "nutrition-hydration",
        prompt: "Eating and drinking adequately",
      },
      {
        id: "weight-appetite",
        prompt: "Weight / appetite stability",
        options: WEIGHT_OPTIONS,
      },
      {
        id: "continence",
        prompt: "Bladder / bowel control",
      },
    ],
  },
  {
    id: "social",
    letter: "G",
    title: "Social Function",
    questions: [
      {
        id: "communicate",
        prompt: "Communicating needs clearly",
      },
      {
        id: "social-contact",
        prompt:
          "Maintaining regular contact with family or others (once a week / any social activities)",
        options: SOCIAL_CONTACT_OPTIONS,
      },
    ],
  },
  {
    id: "safety",
    letter: "H",
    title: "Safety & Support",
    questions: [
      {
        id: "summon-help",
        prompt: "Ability to get help in an emergency",
        options: EMERGENCY_OPTIONS,
      },
    ],
  },
] as const;

export function getIaspQuestionOptions(
  question: IaspQuestion,
): readonly IaspAnswerOption[] {
  return question.options ?? IASP_ANSWER_OPTIONS;
}

export function isIaspQuestionScored(question: IaspQuestion): boolean {
  return question.scored !== false;
}

export function findIaspQuestion(questionId: string): IaspQuestion | undefined {
  for (const section of IASP_SECTIONS) {
    const match = section.questions.find((q) => q.id === questionId);
    if (match) return match;
  }
  return undefined;
}

function buildPages(): IaspQuestionPage[] {
  const pages: IaspQuestionPage[] = [];

  for (const section of IASP_SECTIONS) {
    for (let i = 0; i < section.questions.length; i += 1) {
      pages.push({
        sectionId: section.id,
        letter: section.letter,
        title: section.title,
        questions: section.questions.slice(i, i + 1),
      });
    }
  }

  return pages;
}

export const IASP_QUESTION_PAGES = buildPages();

/** True when this page is the last question page in its section. */
export function isLastPageInSection(pageIndex: number): boolean {
  const page = IASP_QUESTION_PAGES[pageIndex];
  if (!page) return false;
  const nextPage = IASP_QUESTION_PAGES[pageIndex + 1];
  return !nextPage || nextPage.sectionId !== page.sectionId;
}

export const IASP_TOTAL_QUESTIONS = IASP_SECTIONS.reduce(
  (sum, section) => sum + section.questions.length,
  0,
);

/** Scored items only (excludes contextual items such as medication count). */
export const IASP_SCORED_QUESTION_COUNT = IASP_SECTIONS.reduce(
  (sum, section) =>
    sum + section.questions.filter((q) => isIaspQuestionScored(q)).length,
  0,
);

function getIaspAnsweredCount(
  answers: Record<string, IaspAnswerId | undefined>,
): number {
  return Object.values(answers).filter(Boolean).length;
}

/** Current question position in the flow (e.g. "Question 4 of 25"). */
export function getIaspQuestionLabel(pageIndex: number): string {
  const current = Math.min(
    IASP_TOTAL_QUESTIONS,
    Math.max(1, pageIndex + 1),
  );
  return `Question ${current} of ${IASP_TOTAL_QUESTIONS}`;
}

export function getIaspProgressPct(
  answers: Record<string, IaspAnswerId | undefined>,
): number {
  const answered = getIaspAnsweredCount(answers);
  return Math.min(100, Math.round((answered / IASP_TOTAL_QUESTIONS) * 100));
}
