"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type Dispatch,
  type SetStateAction,
} from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
  dialogHeaderShellClass,
} from "@/components/ui/dialog";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
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
  fetchIaspSession,
  getActiveIaspSessionSnapshot,
  getServerIaspSessionSnapshot,
  startIaspSession,
  subscribeActiveIaspSession,
  syncIaspSession,
} from "../lib/iasp-session-api";
import {
  RedFlagsStep,
  ResultsStep,
  ReviewStep,
} from "./IaspAssessmentClosingSteps";
import { AboutYouStep } from "./IaspAboutYouStep";
import { IntroStep } from "./IaspIntroStep";
import { IaspModalCloseButton, IaspModalShell } from "./IaspAssessmentModalShell";
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
  const [starting, setStarting] = useState(false);
  const [replaced, setReplaced] = useState(false);
  const sessionId = useSyncExternalStore(
    subscribeActiveIaspSession,
    getActiveIaspSessionSnapshot,
    getServerIaspSessionSnapshot,
  );
  const startInFlight = useRef(false);

  useEffect(() => {
    if (!sessionId) return;
    const onFocus = () => {
      void fetchIaspSession(sessionId)
        .then((session) => {
          if (session.status === "superseded") setReplaced(true);
        })
        .catch((error: unknown) => {
          if (error instanceof ApiError && error.code === "ASSESSMENT_REPLACED") {
            setReplaced(true);
          }
        });
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [sessionId]);

  function noteSessionError(error: unknown) {
    if (error instanceof ApiError && error.code === "ASSESSMENT_REPLACED") {
      setReplaced(true);
    }
  }

  function persistDraft(current: IaspFlowState) {
    saveIaspDraft(current);
    void syncIaspSession({
      aboutYou: current.aboutYou,
      answers: toIaspAnswersPayload(current.answers),
      redFlags: [...current.redFlags],
      flowStep: current.step,
      pageIndex: current.pageIndex,
    }).catch((error: unknown) => {
      noteSessionError(error);
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

  if (replaced) {
    return (
      <IaspModalShell>
        <DialogHeader className={dialogHeaderShellClass}>
          <div className="absolute top-4 right-4 sm:top-5 sm:right-6">
            <IaspModalCloseButton />
          </div>
          <DialogTitle className={cn(typo.headingXl, "text-foreground")}>
            This assessment was replaced
          </DialogTitle>
          <DialogDescription className={cn(typo.bodyM, "mt-2 text-muted-foreground")}>
            A newer assessment was started, so this one can no longer be continued.
          </DialogDescription>
        </DialogHeader>
      </IaspModalShell>
    );
  }

  if (step === "intro") {
    return (
      <IntroStep
        starting={starting}
        onStart={() => {
          if (startInFlight.current) return;
          startInFlight.current = true;
          setStarting(true);
          void (async () => {
            try {
              if (sessionId) {
                const existing = await fetchIaspSession(sessionId);
                if (existing.status === "superseded") {
                  setReplaced(true);
                  return;
                }
                if (existing.status === "in_progress") {
                  setState((current) => ({ ...current, step: "about" }));
                  return;
                }
              }
              await startIaspSession({
                supersedeSessionId: sessionId,
              });
              setState((current) => ({ ...current, step: "about" }));
            } catch (error: unknown) {
              noteSessionError(error);
              const message =
                error instanceof Error
                  ? error.message
                  : "Could not start the assessment";
              toast.error(message);
            } finally {
              startInFlight.current = false;
              setStarting(false);
            }
          })();
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
              noteSessionError(error);
              if (error instanceof ApiError && error.code === "ASSESSMENT_REPLACED") {
                return;
              }
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
        sessionId={sessionId}
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
