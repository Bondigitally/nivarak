"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight01Icon,
  CheckmarkCircle04Icon,
  InformationCircleIcon,
  Loading01Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { Button } from "@/components/ui/button";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  dialogFooterShellClass,
  dialogHeaderShellClass,
} from "@/components/ui/dialog";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { radius } from "@/lib/tokens/radius";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import {
  IASP_HELPER,
  IASP_QUESTION_PAGES,
  getIaspProgressPct,
  getIaspQuestionLabel,
  getIaspQuestionOptions,
  isLastPageInSection,
  type IaspAnswerId,
  type IaspAnswerOption,
  type IaspQuestion,
} from "../data/iasp-questionnaire-data";
import type { IaspAnswersMap } from "../data/iasp-assessment-draft";
import {
  iaspAutoSavedBadgeClass,
  iaspKeyHintClass,
  iaspModalScrollBodyClass,
  iaspMotionEase,
  iaspOptionCardClass,
  iaspQuestionStepGapClass,
  iaspQuestionStepPaddingClass,
} from "../data/iasp-assessment-styles";
import {
  IaspModalCloseButton,
  IaspModalShell,
  IaspProgressBar,
} from "./IaspAssessmentModalShell";

const AUTO_ADVANCE_DELAY_MS = 350;
/** How long the "Saved" badge stays visible after an answer is selected (ms). */
const AUTO_SAVE_INDICATOR_MS = 650;

const autoSaveBadgeMotion = {
  initial: { opacity: 0, scale: 0.94, x: 6 },
  animate: { opacity: 1, scale: 1, x: 0 },
  exit: { opacity: 0, scale: 0.94, x: 6 },
};

const autoSaveContentMotion = {
  initial: { opacity: 0, y: 5 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -5 },
};

const AUTO_ADVANCE_INFO =
  "When auto-advance is on, the assessment moves to the next question shortly after you select an answer. No need to tap Next.";

/**
 * Slide direction for question page transitions.
 * ±28px horizontal offset fades in/out with direction driven by `pageDirection`
 * (+1 = forward, -1 = back) from the flow state.
 */
const questionPageVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 28 : -28,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -28 : 28,
  }),
};

const ANSWER_SELECTED_CLASS: Record<IaspAnswerId, string> = {
  independent:
    "border-success bg-success-muted [&_[data-option-label]]:text-success [&_[data-radio]]:border-success [&_[data-radio-dot]]:bg-success",
  assistance:
    "border-warning/40 bg-warning-muted [&_[data-option-label]]:text-warning [&_[data-radio]]:border-warning [&_[data-radio-dot]]:bg-warning",
  dependent:
    "border-destructive/40 bg-destructive-muted [&_[data-option-label]]:text-destructive [&_[data-radio]]:border-destructive [&_[data-radio-dot]]:bg-destructive",
  yes: "border-warning/40 bg-warning-muted [&_[data-option-label]]:text-warning [&_[data-radio]]:border-warning [&_[data-radio-dot]]:bg-warning",
  no: "border-success bg-success-muted [&_[data-option-label]]:text-success [&_[data-radio]]:border-success [&_[data-radio-dot]]:bg-success",
};

type SaveIndicatorStatus = "idle" | "saving" | "saved";

/**
 * Suppresses 1/2/3/Esc/arrow keyboard shortcuts when the user is typing
 * in an input or textarea so shortcut keys don't accidentally pick answers.
 */
function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

function KeyboardKeyHint({ children }: { children: React.ReactNode }) {
  return <span className={iaspKeyHintClass}>{children}</span>;
}

function IaspAutoSavedBadge({ status }: { status: SaveIndicatorStatus }) {
  const reducedMotion = useReducedMotion();
  const motionDisabled = Boolean(reducedMotion);
  const badgeTransition = motionDisabled
    ? { duration: 0 }
    : { duration: 0.28, ease: iaspMotionEase };
  const contentTransition = motionDisabled
    ? { duration: 0 }
    : { duration: 0.22, ease: iaspMotionEase };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {status !== "idle" ? (
        <motion.span
          key="auto-save-badge"
          role="status"
          aria-live="polite"
          aria-label={
            status === "saving" ? "Saving progress" : "Progress auto-saved"
          }
          className={cn(
            iaspAutoSavedBadgeClass,
            "overflow-hidden transition-colors duration-300 ease-out",
            status === "saving"
              ? "bg-muted text-muted-foreground"
              : "bg-success-muted text-success",
          )}
          initial={motionDisabled ? false : autoSaveBadgeMotion.initial}
          animate={autoSaveBadgeMotion.animate}
          exit={motionDisabled ? undefined : autoSaveBadgeMotion.exit}
          transition={badgeTransition}
        >
          <AnimatePresence mode="wait" initial={false}>
            {status === "saving" ? (
              <motion.span
                key="saving"
                className="inline-flex items-center gap-1.5"
                initial={motionDisabled ? false : autoSaveContentMotion.initial}
                animate={autoSaveContentMotion.animate}
                exit={motionDisabled ? undefined : autoSaveContentMotion.exit}
                transition={contentTransition}
              >
                {motionDisabled ? (
                  <AppIcon icon={Loading01Icon} size={BADGE_ICON_SIZE} />
                ) : (
                  <motion.span
                    className="inline-flex"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 0.9,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <AppIcon icon={Loading01Icon} size={BADGE_ICON_SIZE} />
                  </motion.span>
                )}
                Saving…
              </motion.span>
            ) : (
              <motion.span
                key="saved"
                className="inline-flex items-center gap-1.5"
                initial={motionDisabled ? false : autoSaveContentMotion.initial}
                animate={autoSaveContentMotion.animate}
                exit={motionDisabled ? undefined : autoSaveContentMotion.exit}
                transition={contentTransition}
              >
                <motion.span
                  className="inline-flex"
                  initial={motionDisabled ? false : { scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={
                    motionDisabled
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 420,
                          damping: 24,
                          mass: 0.55,
                        }
                  }
                >
                  <AppIcon icon={CheckmarkCircle04Icon} size={BADGE_ICON_SIZE} />
                </motion.span>
                Auto-saved
              </motion.span>
            )}
          </AnimatePresence>
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}

function AnswerOptionCard({
  option,
  name,
  selected,
  onSelect,
  shortcutKey,
  compact = false,
}: {
  option: IaspAnswerOption;
  name: string;
  selected: boolean;
  onSelect: (id: IaspAnswerId) => void;
  shortcutKey: number;
  compact?: boolean;
}) {
  const hasDescription = Boolean(option.description);

  return (
    <label
      className={cn(
        iaspOptionCardClass,
        "items-start gap-3",
        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
        compact ? "min-h-14 p-3" : "min-h-16 p-4",
        selected && ANSWER_SELECTED_CLASS[option.id],
      )}
    >
      <input
        type="radio"
        name={name}
        value={option.id}
        checked={selected}
        onChange={() => onSelect(option.id)}
        className="sr-only"
      />
      <span
        data-radio
        className={cn(
          radius.full,
          "relative mt-0.5 flex size-5 shrink-0 items-center justify-center border border-border",
        )}
        aria-hidden
      >
        <span
          data-radio-dot
          className={cn(
            radius.full,
            "size-2.5 transition-opacity",
            selected ? "opacity-100" : "opacity-0",
          )}
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          data-option-label
          className={cn(
            compact ? typo.bodyM : typo.headingS,
            compact ? "font-semibold text-foreground" : "text-foreground",
          )}
        >
          {option.label}
        </span>
        {hasDescription ? (
          <span
            className={cn(
              compact ? typo.caption : typo.bodyS,
              "text-muted-foreground",
            )}
          >
            {option.description}
          </span>
        ) : null}
      </span>
      <span className={cn(iaspKeyHintClass, "mt-0.5")}>
        Press {shortcutKey}
      </span>
    </label>
  );
}

function QuestionOptions({
  question,
  value,
  onChange,
  compact = false,
}: {
  question: IaspQuestion;
  value: IaspAnswerId | undefined;
  onChange: (questionId: string, answer: IaspAnswerId) => void;
  compact?: boolean;
}) {
  const options = getIaspQuestionOptions(question);

  return (
    <div
      role="radiogroup"
      aria-label={question.prompt}
      className="flex w-full min-w-0 flex-col items-stretch gap-2.5"
    >
      {options.map((option, index) => (
        <AnswerOptionCard
          key={option.id}
          option={option}
          name={`iasp-${question.id}`}
          selected={value === option.id}
          onSelect={(id) => onChange(question.id, id)}
          shortcutKey={index + 1}
          compact={compact}
        />
      ))}
    </div>
  );
}

function QuestionnaireQuestion({
  question,
  value,
  onChange,
  compact = false,
}: {
  question: IaspQuestion;
  value: IaspAnswerId | undefined;
  onChange: (questionId: string, answer: IaspAnswerId) => void;
  compact?: boolean;
}) {
  return (
    <section className={cn("flex w-full min-w-0 flex-col", iaspQuestionStepGapClass)}>
      <h3 className={cn(typo.headingL, "w-full min-w-0 text-foreground")}>
        {question.prompt}
      </h3>
      <QuestionOptions
        question={question}
        value={value}
        onChange={onChange}
        compact={compact}
      />
    </section>
  );
}

export function QuestionsStep({
  pageIndex,
  pageDirection,
  answers,
  autoAdvance,
  onAutoAdvanceChange,
  onAnswer,
  onBack,
  onNext,
}: {
  pageIndex: number;
  pageDirection: number;
  answers: IaspAnswersMap;
  autoAdvance: boolean;
  onAutoAdvanceChange: (next: boolean) => void;
  onAnswer: (questionId: string, answer: IaspAnswerId) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const saveIndicatorTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const autoAdvanceToggleId = useId();
  const autoAdvanceLabelId = useId();
  const reducedMotion = useReducedMotion();
  const [saveStatus, setSaveStatus] = useState<SaveIndicatorStatus>("idle");
  const page = IASP_QUESTION_PAGES[pageIndex];
  const progressPct = getIaspProgressPct(answers);
  const pageComplete = page.questions.every((q) => answers[q.id] != null);
  const activeQuestion = page.questions[0];
  const pageTransition = {
    duration: reducedMotion ? 0 : 0.28,
    ease: iaspMotionEase,
  };

  function clearAdvanceTimer() {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = undefined;
    }
  }

  function clearSaveIndicatorTimer() {
    if (saveIndicatorTimerRef.current) {
      clearTimeout(saveIndicatorTimerRef.current);
      saveIndicatorTimerRef.current = undefined;
    }
  }

  const triggerSaveIndicator = useCallback(() => {
    clearSaveIndicatorTimer();
    setSaveStatus("saving");
    saveIndicatorTimerRef.current = setTimeout(() => {
      saveIndicatorTimerRef.current = undefined;
      setSaveStatus("saved");
    }, AUTO_SAVE_INDICATOR_MS);
  }, []);

  const handleSelect = useCallback(
    (questionId: string, answer: IaspAnswerId) => {
      onAnswer(questionId, answer);

      if (!autoAdvance) return;

      clearAdvanceTimer();
      advanceTimerRef.current = setTimeout(() => {
        advanceTimerRef.current = undefined;
        if (isLastPageInSection(pageIndex)) {
          triggerSaveIndicator();
        }
        onNext();
      }, AUTO_ADVANCE_DELAY_MS);
    },
    [autoAdvance, onAnswer, onNext, pageIndex, triggerSaveIndicator],
  );

  const handleNextClick = useCallback(() => {
    clearAdvanceTimer();
    if (isLastPageInSection(pageIndex)) {
      triggerSaveIndicator();
    }
    onNext();
  }, [onNext, pageIndex, triggerSaveIndicator]);

  const handlePreviousQuestion = useCallback(() => {
    clearAdvanceTimer();
    if (pageIndex <= 0) return;
    onBack();
  }, [onBack, pageIndex]);

  const handleBackClick = useCallback(() => {
    clearAdvanceTimer();
    onBack();
  }, [onBack]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [pageIndex]);

  useEffect(() => {
    clearAdvanceTimer();
  }, [pageIndex, autoAdvance]);

  useEffect(() => () => {
    clearAdvanceTimer();
    clearSaveIndicatorTimer();
  }, []);

  useEffect(() => {
    if (!activeQuestion) return;

    function onKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) return;

      const shortcutAnswer = getIaspQuestionOptions(activeQuestion)[
        Number(event.key) - 1
      ];
      if (shortcutAnswer) {
        event.preventDefault();
        handleSelect(activeQuestion.id, shortcutAnswer.id);
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        handlePreviousQuestion();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handleBackClick();
        return;
      }

      if (
        (event.key === "ArrowRight" || event.key === "Enter") &&
        pageComplete
      ) {
        event.preventDefault();
        handleNextClick();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    activeQuestion,
    handleBackClick,
    handleNextClick,
    handlePreviousQuestion,
    handleSelect,
    pageComplete,
  ]);

  return (
    <IaspModalShell
      onEscapeKeyDown={(event) => {
        event.preventDefault();
        handlePreviousQuestion();
      }}
    >
      <DialogHeader
        className={cn(
          dialogHeaderShellClass,
          iaspQuestionStepGapClass,
          "flex-col items-stretch border-b-0 sm:py-3.5",
          iaspQuestionStepPaddingClass,
        )}
      >
        <div className={cn("flex items-start justify-between", iaspQuestionStepGapClass)}>
          <div
            className={cn(
              "flex min-w-0 flex-1 flex-col sm:flex-row sm:items-end sm:justify-between",
              iaspQuestionStepGapClass,
            )}
          >
            <DialogTitle className={cn(typo.headingXl, "text-foreground")}>
              Section {page.letter}
            </DialogTitle>
            <p
              className={cn(
                typo.headingM,
                "min-w-0 text-muted-foreground sm:text-right",
              )}
            >
              {page.title}
            </p>
          </div>
          <IaspModalCloseButton />
        </div>

        <DialogDescription className="sr-only">
          IAS assessment questionnaire. Answer each question to continue.
        </DialogDescription>

        <div className={cn("flex flex-col", iaspQuestionStepGapClass)}>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3">
            <p className={cn(typo.label, "min-w-0 text-muted-foreground")}>
              {getIaspQuestionLabel(pageIndex)}
            </p>
            <p className={cn(typo.label, "shrink-0 text-muted-foreground")}>
              {progressPct}% Complete
            </p>
          </div>
          <IaspProgressBar value={progressPct} label="Assessment progress" />
          <div aria-hidden className="border-t border-divider" />
          <div className="flex flex-col items-start gap-3 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-x-3 sm:gap-y-0">
            <p
              className={cn(
                typo.bodyS,
                "min-w-0 italic text-muted-foreground",
              )}
            >
              {IASP_HELPER}
            </p>
            <div
              className={cn(
                radius.full,
                "flex shrink-0 items-center gap-1.5 bg-muted px-2 py-1",
              )}
            >
              <ToggleSwitch
                id={autoAdvanceToggleId}
                labelledBy={autoAdvanceLabelId}
                checked={autoAdvance}
                onCheckedChange={onAutoAdvanceChange}
              />
              <span
                id={autoAdvanceLabelId}
                className={cn(typo.label, "text-primary whitespace-nowrap")}
              >
                Auto-advance
                <span
                  className={cn(
                    "ml-1.5 font-semibold text-success transition-opacity duration-150",
                    autoAdvance ? "opacity-100" : "opacity-40",
                  )}
                >
                  (ZERO CLICK)
                </span>
              </span>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        radius.full,
                        "inline-flex shrink-0 text-info transition-colors hover:text-info/80",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      )}
                      aria-label="What is auto-advance?"
                    >
                      <AppIcon icon={InformationCircleIcon} size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    align="end"
                    className="z-110 pointer-events-none max-w-60 rounded-md px-3 py-2 text-left text-xs leading-snug whitespace-normal"
                  >
                    {AUTO_ADVANCE_INFO}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </DialogHeader>

      <div
        ref={bodyRef}
        className={cn(
          iaspModalScrollBodyClass,
          "w-full min-w-0 gap-0 overflow-x-hidden p-0 sm:gap-0",
        )}
      >
        <AnimatePresence mode="wait" custom={pageDirection} initial={false}>
          <motion.div
            key={pageIndex}
            custom={pageDirection}
            variants={questionPageVariants}
            initial={reducedMotion ? false : "enter"}
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="flex w-full min-w-0 flex-col items-stretch self-stretch"
          >
            {page.questions.map((question) => (
              <div
                key={question.id}
                className={cn(iaspQuestionStepPaddingClass, "w-full min-w-0")}
              >
                <QuestionnaireQuestion
                  question={question}
                  value={answers[question.id]}
                  onChange={handleSelect}
                  compact
                />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <DialogFooter
        className={cn(
          dialogFooterShellClass,
          "bg-background",
          iaspQuestionStepPaddingClass,
        )}
      >
        <div className={cn("flex w-full items-center justify-between", iaspQuestionStepGapClass)}>
          <div className="flex min-w-0 items-center">
            <Button
              type="button"
              variant="secondary"
              onClick={handleBackClick}
              className="gap-2"
              aria-keyshortcuts="Escape"
            >
              Back
              <KeyboardKeyHint>Esc</KeyboardKeyHint>
            </Button>
          </div>

          <motion.div
            layout={!reducedMotion}
            transition={{ duration: 0.28, ease: iaspMotionEase }}
            className="flex shrink-0 items-center gap-2"
          >
            <IaspAutoSavedBadge status={saveStatus} />
            <Button
              type="button"
              size="cta"
              disabled={!pageComplete}
              onClick={handleNextClick}
              className="min-w-28 shrink-0"
            >
              Next
              <AppIcon icon={ArrowRight01Icon} />
            </Button>
          </motion.div>
        </div>
      </DialogFooter>
    </IaspModalShell>
  );
}
