"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import {
  clearIaspDraft,
  saveIaspDraft,
  toIaspAnswersPayload,
  type IaspFlowState,
} from "../data/iasp-assessment-draft";
import {
  IASP_QUESTION_PAGES,
  isLastPageInSection,
  type IaspAnswerId,
} from "../data/iasp-questionnaire-data";
import {
  IASP_MAX_SCORE,
  calculateIaspPercentage,
  calculateIaspRawScore,
  findFirstPageIndexForSection,
} from "../data/iasp-scoring";
import {
  completeIaspSession,
  syncIaspSession,
} from "../lib/iasp-session-api";
import {
  RedFlagsStep,
  ResultsStep,
  ReviewStep,
} from "./IaspAssessmentClosingSteps";
import { AboutYouStep } from "./IaspAboutYouStep";
import { IntroStep } from "./IaspIntroStep";
import { QuestionsStep } from "./IaspQuestionsStep";

export function IaspAssessmentFlow({
  state,
  setState,
  onReset,
}: {
  state: IaspFlowState;
  setState: Dispatch<SetStateAction<IaspFlowState>>;
  onReset: () => void;
}) {
  const {
    step,
    aboutYou,
    pageIndex,
    pageDirection,
    answers,
    redFlags,
    autoAdvance,
  } = state;
  const [submitLoading, setSubmitLoading] = useState(false);

  function persistDraft(current: IaspFlowState) {
    saveIaspDraft(current);
    void syncIaspSession({
      aboutYou: current.aboutYou,
      answers: toIaspAnswersPayload(current.answers),
      redFlags: [...current.redFlags],
      flowStep: current.step,
      pageIndex: current.pageIndex,
    }).catch(() => {
      // Draft remains in sessionStorage if the API is unavailable.
    });
  }

  function handleAnswer(questionId: string, answer: IaspAnswerId) {
    setState((current) => ({
      ...current,
      answers: { ...current.answers, [questionId]: answer },
    }));
  }

  function handleQuestionsBack() {
    if (pageIndex === 0) {
      setState((current) => ({
        ...current,
        pageDirection: -1,
        step: "about",
      }));
      return;
    }
    setState((current) => ({
      ...current,
      pageDirection: -1,
      pageIndex: Math.max(0, current.pageIndex - 1),
    }));
  }

  function handleQuestionsNext() {
    // Draft is saved at section boundaries only (not after every answer) to
    // balance persistence with write churn on sessionStorage.
    if (pageIndex >= IASP_QUESTION_PAGES.length - 1) {
      setState((current) => {
        if (isLastPageInSection(current.pageIndex)) {
          persistDraft({ ...current, step: "redFlags" });
        }
        return {
          ...current,
          pageDirection: 1,
          step: "redFlags",
        };
      });
      return;
    }

    setState((current) => {
      const next = {
        ...current,
        pageDirection: 1,
        pageIndex: Math.min(
          IASP_QUESTION_PAGES.length - 1,
          current.pageIndex + 1,
        ),
      };
      if (isLastPageInSection(current.pageIndex)) {
        persistDraft(next);
      }
      return next;
    });
  }

  if (step === "intro") {
    return (
      <IntroStep
        onStart={() => {
          setState((current) => ({ ...current, step: "about" }));
        }}
      />
    );
  }

  if (step === "about") {
    return (
      <AboutYouStep
        values={aboutYou}
        onChange={(next) =>
          setState((current) => ({ ...current, aboutYou: next }))
        }
        onBack={() => setState((current) => ({ ...current, step: "intro" }))}
        onContinue={() =>
          setState((current) => ({
            ...current,
            pageIndex: 0,
            pageDirection: 1,
            step: "questions",
          }))
        }
      />
    );
  }

  if (step === "redFlags") {
    return (
      <RedFlagsStep
        selected={redFlags}
        onChange={(next) =>
          setState((current) => ({ ...current, redFlags: next }))
        }
        onBack={() =>
          setState((current) => ({
            ...current,
            pageDirection: -1,
            pageIndex: IASP_QUESTION_PAGES.length - 1,
            step: "questions",
          }))
        }
        onNext={() => setState((current) => ({ ...current, step: "review" }))}
      />
    );
  }

  if (step === "review") {
    return (
      <ReviewStep
        answers={answers}
        redFlags={redFlags}
        loading={submitLoading}
        onBack={() =>
          setState((current) => ({ ...current, step: "redFlags" }))
        }
        onSubmit={() => {
          if (submitLoading) return;
          const rawScore = calculateIaspRawScore(answers);
          const iasPercentage = calculateIaspPercentage(rawScore);
          setSubmitLoading(true);
          void completeIaspSession({
            aboutYou,
            answers: toIaspAnswersPayload(answers),
            redFlags: [...redFlags],
            rawScore,
            maxScore: IASP_MAX_SCORE,
            iasPercentage,
          })
            .then(() => {
              clearIaspDraft();
              setState((current) => ({ ...current, step: "results" }));
            })
            .catch((error: unknown) => {
              const message =
                error instanceof Error
                  ? error.message
                  : "Could not submit assessment";
              toast.error(message);
            })
            .finally(() => {
              setSubmitLoading(false);
            });
        }}
        onEditSection={(sectionId) =>
          setState((current) => ({
            ...current,
            pageDirection: -1,
            pageIndex: findFirstPageIndexForSection(sectionId),
            step: "questions",
          }))
        }
      />
    );
  }

  if (step === "results") {
    return (
      <ResultsStep
        answers={answers}
        onRetake={onReset}
      />
    );
  }

  return (
    <QuestionsStep
      pageIndex={pageIndex}
      pageDirection={pageDirection}
      answers={answers}
      autoAdvance={autoAdvance}
      onAutoAdvanceChange={(next) =>
        setState((current) => ({ ...current, autoAdvance: next }))
      }
      onAnswer={handleAnswer}
      onBack={handleQuestionsBack}
      onNext={handleQuestionsNext}
    />
  );
}
