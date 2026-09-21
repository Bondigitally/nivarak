export type IaspAnswerId = "independent" | "assistance" | "dependent";

export type IaspAnswerOption = {
  id: IaspAnswerId;
  label: string;
  description: string;
};

export type IaspQuestion = {
  id: string;
  prompt: string;
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
  "Select the option that best describes the patient's current daily ability.";

/** Shared across every question — same labels and copy. */
export const IASP_ANSWER_OPTIONS: readonly IaspAnswerOption[] = [
  {
    id: "independent",
    label: "Independent",
    description: "Completes the activity without assistance or supervision.",
  },
  {
    id: "assistance",
    label: "Needs Assistance",
    description: "Requires some assistance, supervision, or reminders.",
  },
  {
    id: "dependent",
    label: "Dependent",
    description: "Requires complete assistance to perform the activity.",
  },
] as const;

export const IASP_SECTIONS: readonly IaspSection[] = [
  {
    id: "basic-self-care",
    letter: "A",
    title: "Basic Self-Care",
    questions: [
      { id: "bathe", prompt: "Can the patient bathe independently?" },
      { id: "dress", prompt: "Can the patient dress independently?" },
      { id: "toilet", prompt: "Can the patient use the toilet independently?" },
      { id: "eat-drink", prompt: "Can the patient eat and drink independently?" },
    ],
  },
  {
    id: "daily-life",
    letter: "B",
    title: "Daily Life Function",
    questions: [
      { id: "phone", prompt: "Can the patient use a phone independently?" },
      {
        id: "home-tasks",
        prompt: "Can the patient manage basic home tasks independently?",
      },
      {
        id: "purchases",
        prompt: "Can the patient make simple purchases independently?",
      },
      {
        id: "bills",
        prompt: "Can the patient manage bills and paperwork independently?",
      },
    ],
  },
  {
    id: "mobility",
    letter: "C",
    title: "Mobility",
    questions: [
      {
        id: "move-home",
        prompt: "Can the patient move around the home independently?",
      },
      {
        id: "transfer",
        prompt: "Can the patient get up from a bed or chair independently?",
      },
      {
        id: "outdoors",
        prompt: "Can the patient move outdoors independently?",
      },
      {
        id: "falls",
        prompt:
          "In the last 6 months, has the patient stayed free from repeated falls?",
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
        prompt: "Can the patient remember daily routines independently?",
      },
      {
        id: "instructions",
        prompt: "Can the patient follow instructions independently?",
      },
      {
        id: "decisions",
        prompt: "Can the patient make safe decisions independently?",
      },
    ],
  },
  {
    id: "health",
    letter: "E",
    title: "Health Management",
    questions: [
      {
        id: "medications",
        prompt: "Can the patient manage medications independently?",
      },
      {
        id: "understand-health",
        prompt: "Can the patient understand their health independently?",
      },
      {
        id: "appointments",
        prompt: "Can the patient manage medical appointments independently?",
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
        prompt:
          "Can the patient maintain adequate nutrition and hydration independently?",
      },
      {
        id: "weight-appetite",
        prompt:
          "Can the patient maintain a stable weight and appetite independently?",
      },
      {
        id: "continence",
        prompt:
          "Can the patient manage bladder and bowel control independently?",
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
        prompt: "Can the patient communicate their needs independently?",
      },
      {
        id: "social-contact",
        prompt: "Can the patient maintain social contact independently?",
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
        prompt: "Can the patient summon help in an emergency independently?",
      },
    ],
  },
] as const;

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

function getIaspAnsweredCount(
  answers: Record<string, IaspAnswerId | undefined>,
): number {
  return Object.values(answers).filter(Boolean).length;
}

/** Current question position in the flow (e.g. "Question 4 of 24"). */
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
