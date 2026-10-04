"use client";

import { useCallback, useEffect, useId, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowRight02Icon,
  AssignmentsIcon,
  CheckmarkBadge02Icon,
  CheckmarkCircle04Icon,
  InformationCircleIcon,
  Loading01Icon,
  SquareLock02Icon,
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
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  dialogBodyShellClass,
  dialogFooterShellClass,
  dialogHeaderShellClass,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authInputClassName } from "@/features/auth/components/primitives/AuthField";
import { typo } from "@/lib/tokens/typography";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { radius } from "@/lib/tokens/radius";
import { cn } from "@/lib/utils";
import {
  IASP_LIVING_SITUATION_OPTIONS,
  IASP_LOCATION_OPTIONS,
  IASP_RELATIONSHIP_OPTIONS,
  IASP_VISIT_FREQUENCY_OPTIONS,
  isIaspAboutYouComplete,
  type IaspAboutYouValues,
} from "../data/iasp-about-you-data";
import {
  IASP_ANSWER_OPTIONS,
  IASP_HELPER,
  IASP_QUESTION_PAGES,
  IASP_TOTAL_QUESTIONS,
  getIaspProgressPct,
  getIaspQuestionLabel,
  isLastPageInSection,
  type IaspAnswerId,
  type IaspAnswerOption,
  type IaspQuestion,
} from "../data/iasp-questionnaire-data";
import {
  INITIAL_IASP_FLOW_STATE,
  clearIaspDraft,
  createIaspResultsPreviewState,
  hasIaspProgress,
  isIaspResultsPreviewEnabled,
  saveIaspDraft,
  type IaspAnswersMap,
  type IaspFlowState,
} from "../data/iasp-assessment-draft";
import {
  RedFlagsStep,
  ResultsStep,
  ReviewStep,
} from "./IaspAssessmentClosingSteps";
import { findFirstPageIndexForSection } from "../data/iasp-scoring";
import {
  iaspAutoSavedBadgeClass,
  iaspCalloutClass,
  iaspDropdownContentClass,
  iaspDropdownItemClass,
  iaspKeyHintClass,
  iaspMotionEase,
  iaspOptionCardClass,
  iaspQuestionStepGapClass,
  iaspQuestionStepPaddingClass,
  iaspStatCardClass,
  iaspValidatedProtocolBadgeClass,
} from "../data/iasp-assessment-styles";
import {
  IaspModalCloseButton,
  IaspModalShell,
  IaspProgressBar,
} from "./IaspAssessmentModalShell";
import { IaspExitConfirmDialog } from "./IaspExitConfirmDialog";

const AUTO_ADVANCE_DELAY_MS = 350;
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

const INTRO_HIGHLIGHTS = [
  "Warm, everyday questions. No medical know-how needed.",
  "Great for families checking in from near or far.",
  "Helps you spot where a little support could help.",
] as const;

const INTRO_DESCRIPTION =
  "Answer simple questions about how your loved one manages day to day. When you finish, you’ll see a clear picture of how they’re doing and where a little support could help.";

const INTRO_STATS = [
  {
    icon: AssignmentsIcon,
    title: `${IASP_TOTAL_QUESTIONS} questions`,
    subtitle: "Clear Multiple Choice",
  },
  {
    icon: Loading01Icon,
    title: "About 3 minutes",
    subtitle: "Quick Self-Paced Flow",
  },
  {
    icon: SquareLock02Icon,
    title: "Private",
    subtitle: "Zero Public Data Sharing",
  },
] as const;

const ANSWER_SELECTED_CLASS: Record<IaspAnswerId, string> = {
  independent:
    "border-success bg-success-muted [&_[data-option-label]]:text-success [&_[data-radio]]:border-success [&_[data-radio-dot]]:bg-success",
  assistance:
    "border-warning/40 bg-warning-muted [&_[data-option-label]]:text-warning [&_[data-radio]]:border-warning [&_[data-radio-dot]]:bg-warning",
  dependent:
    "border-destructive/40 bg-destructive-muted [&_[data-option-label]]:text-destructive [&_[data-radio]]:border-destructive [&_[data-radio-dot]]:bg-destructive",
};

type SaveIndicatorStatus = "idle" | "saving" | "saved";

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

/* ─── Intro ─────────────────────────────────────────────────────────────── */

function IntroStep({
  onStart,
  onPreviewResults,
}: {
  onStart: () => void;
  onPreviewResults?: () => void;
}) {
  return (
    <IaspModalShell>
      <DialogHeader
        className={cn(
          dialogHeaderShellClass,
          "relative items-center border-b-0 px-8 py-6 sm:px-10 sm:py-7 text-center",
        )}
      >
        <div className="flex w-full flex-col items-center gap-2 text-center">
          <span className={iaspValidatedProtocolBadgeClass}>
            <AppIcon icon={CheckmarkBadge02Icon} size={BADGE_ICON_SIZE} />
            Clinically validated protocol
          </span>
          <div className="flex flex-col items-center gap-1">
            <DialogTitle className={cn(typo.displayL, "text-primary")}>
              IAS-P Assessment
            </DialogTitle>
            <p
              className={cn(
                typo.bodyM,
                "uppercase tracking-[0.06em] text-muted-foreground",
              )}
            >
              Independent Ageing Score Proxy
            </p>
          </div>
        </div>
        <div className="absolute top-6 right-6 sm:top-7 sm:right-8">
          <IaspModalCloseButton />
        </div>
      </DialogHeader>

      <div
        className={cn(
          dialogBodyShellClass,
          "gap-5 px-8 pt-3 pb-2 sm:gap-5 sm:px-10 sm:pt-4 sm:pb-2",
        )}
      >
        <DialogDescription
          className={cn(
            typo.bodyL,
            "text-center text-pretty leading-relaxed text-foreground",
          )}
        >
          {INTRO_DESCRIPTION}
        </DialogDescription>

        <ul className="flex flex-col gap-2.5">
          {INTRO_HIGHLIGHTS.map((highlight) => (
            <li key={highlight} className="flex items-start gap-2.5">
              <AppIcon
                icon={CheckmarkCircle04Icon}
                size={18}
                className="mt-0.5 shrink-0 text-success"
              />
              <span className={cn(typo.bodyM, "pt-px text-muted-foreground")}>
                {highlight}
              </span>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
          {INTRO_STATS.map((stat) => (
            <div
              key={stat.title}
              className={cn(
                iaspStatCardClass,
                "gap-2 bg-muted/70 px-3 py-3.5",
              )}
            >
              <span className="text-primary">
                <AppIcon icon={stat.icon} />
              </span>
              <p className={cn(typo.headingS, "text-foreground")}>
                {stat.title}
              </p>
              <p className={cn(typo.caption, "text-tertiary-foreground")}>
                {stat.subtitle}
              </p>
            </div>
          ))}
        </div>

        <div className={cn(iaspCalloutClass, "gap-2.5 border-0 p-3.5 sm:p-4")}>
          <span className="shrink-0 text-info">
            <AppIcon icon={InformationCircleIcon} size={18} />
          </span>
          <p className={cn(typo.bodyS, "text-info")}>
            <span className={cn(typo.label, "font-semibold text-info")}>
              Best for family or caregivers
            </span>
            <span className="mt-0.5 block text-info/90">
              Someone who spends regular time with them can answer most
              comfortably.
            </span>
          </p>
        </div>
      </div>

      <DialogFooter
        className={cn(
          dialogFooterShellClass,
          "flex-col sm:flex-col border-t-0 px-8 pt-3 pb-6 sm:px-10 sm:pt-4 sm:pb-7",
        )}
      >
        <Button type="button" size="cta" className="w-full" onClick={onStart}>
          Start Free Assessment
          <AppIcon icon={ArrowRight02Icon} />
        </Button>
        {onPreviewResults ? (
          <Button
            type="button"
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={onPreviewResults}
          >
            Preview results (dev)
          </Button>
        ) : null}
      </DialogFooter>
    </IaspModalShell>
  );
}

/* ─── About You ─────────────────────────────────────────────────────────── */

function SelectField({
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string | null;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  const id = useId();

  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={id} className={cn(typo.label, "text-foreground")}>
        {label}
      </label>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            id={id}
            type="button"
            className={cn(
              authInputClassName,
              "flex h-12 items-center justify-between gap-3 text-left shadow-[0_1px_1px_rgba(17,24,39,0.04)]",
            )}
          >
            <span
              className={cn(
                typo.input,
                "min-w-0 flex-1 truncate",
                !value && "text-placeholder",
              )}
            >
              {value ?? placeholder}
            </span>
            <AppIcon
              icon={ArrowDown01Icon}
              className="shrink-0 text-muted-foreground"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={8}
          className={iaspDropdownContentClass}
        >
          {options.map((option) => (
            <DropdownMenuItem
              key={option}
              onSelect={() => onChange(option)}
              className={cn(
                iaspDropdownItemClass,
                value === option && "bg-background",
              )}
            >
              {option}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function AboutYouStep({
  values,
  onChange,
  onBack,
  onContinue,
}: {
  values: IaspAboutYouValues;
  onChange: (next: IaspAboutYouValues) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const complete = isIaspAboutYouComplete(values);

  return (
    <IaspModalShell>
      <DialogHeader
        className={cn(dialogHeaderShellClass, "flex-col items-stretch gap-3")}
      >
        <div className="flex items-start justify-between gap-3">
          <DialogTitle className={cn(typo.headingXxl, "text-foreground")}>
            IAS-P Assessment
          </DialogTitle>
          <IaspModalCloseButton />
        </div>
        <DialogDescription className="sr-only">
          Tell us about your relationship with the person being assessed.
        </DialogDescription>
        <IaspProgressBar value={8} label="Assessment progress" />
      </DialogHeader>

      <div className={cn(dialogBodyShellClass, "gap-5 sm:gap-6")}>
        <div className="flex flex-col gap-1">
          <h3 className={cn(typo.headingL, "text-foreground")}>About You</h3>
          <p className={cn(typo.bodyS, "text-muted-foreground")}>
            Tell us about your relationship with the person being assessed.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <SelectField
            label="Your relationship"
            placeholder="Select relationship"
            value={values.relationship}
            options={IASP_RELATIONSHIP_OPTIONS}
            onChange={(relationship) => onChange({ ...values, relationship })}
          />

          <div className="flex w-full flex-col gap-2">
            <label htmlFor="iasp-age" className={cn(typo.label, "text-foreground")}>
              Age
            </label>
            <input
              id="iasp-age"
              type="number"
              inputMode="numeric"
              min={18}
              max={120}
              placeholder="e.g. 65"
              value={values.age}
              onChange={(event) =>
                onChange({ ...values, age: event.target.value })
              }
              className={cn(
                authInputClassName,
                "h-12 shadow-[0_1px_1px_rgba(17,24,39,0.04)]",
              )}
            />
          </div>

          <SelectField
            label="Location"
            placeholder="Select location"
            value={values.location}
            options={IASP_LOCATION_OPTIONS}
            onChange={(location) => onChange({ ...values, location })}
          />
          <SelectField
            label="Visit frequency"
            placeholder="Select frequency"
            value={values.visitFrequency}
            options={IASP_VISIT_FREQUENCY_OPTIONS}
            onChange={(visitFrequency) =>
              onChange({ ...values, visitFrequency })
            }
          />
          <SelectField
            label="Living situation"
            placeholder="Select situation"
            value={values.livingSituation}
            options={IASP_LIVING_SITUATION_OPTIONS}
            onChange={(livingSituation) =>
              onChange({ ...values, livingSituation })
            }
          />
        </div>
      </div>

      <DialogFooter
        className={cn(
          dialogFooterShellClass,
          "flex-col sm:flex-col gap-4 bg-background",
        )}
      >
        <div className="flex w-full items-center justify-between gap-3">
          <Button type="button" variant="secondary" onClick={onBack}>
            <AppIcon icon={ArrowLeft01Icon} />
            Back
          </Button>
          <Button
            type="button"
            disabled={!complete}
            onClick={onContinue}
            className="min-w-35"
          >
            Continue
          </Button>
        </div>
        <p
          className={cn(
            typo.caption,
            "flex w-full items-start justify-center gap-2 text-center text-muted-foreground",
          )}
        >
          <AppIcon
            icon={SquareLock02Icon}
            size={14}
            className="mt-0.5 shrink-0"
          />
          <span>
            This information helps contextualise the assessment and is not shared
            publicly.
          </span>
        </p>
      </DialogFooter>
    </IaspModalShell>
  );
}

/* ─── Questionnaire (shared UI) ─────────────────────────────────────────── */

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
  return (
    <label
      className={cn(
        iaspOptionCardClass,
        compact ? "items-center gap-3 p-3" : "items-center gap-3 p-4",
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
          "relative flex size-5 shrink-0 items-center justify-center border border-border",
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
        <span
          className={cn(
            compact ? typo.caption : typo.bodyS,
            "text-muted-foreground",
          )}
        >
          {option.description}
        </span>
      </span>
      <span className={iaspKeyHintClass}>Press {shortcutKey}</span>
    </label>
  );
}

function QuestionOptions({
  questionId,
  value,
  onChange,
  prompt,
  compact = false,
}: {
  questionId: string;
  value: IaspAnswerId | undefined;
  onChange: (questionId: string, answer: IaspAnswerId) => void;
  prompt: string;
  compact?: boolean;
}) {
  const optionGap = "gap-3";

  return (
    <div
      role="radiogroup"
      aria-label={prompt}
      className={cn("flex w-full min-w-0 flex-col items-stretch", optionGap)}
    >
      {IASP_ANSWER_OPTIONS.map((option, index) => (
        <AnswerOptionCard
          key={option.id}
          option={option}
          name={`iasp-${questionId}`}
          selected={value === option.id}
          onSelect={(id) => onChange(questionId, id)}
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
        questionId={question.id}
        value={value}
        onChange={onChange}
        prompt={question.prompt}
        compact={compact}
      />
    </section>
  );
}

function QuestionsStep({
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

  function triggerSaveIndicator() {
    clearSaveIndicatorTimer();
    setSaveStatus("saving");
    saveIndicatorTimerRef.current = setTimeout(() => {
      saveIndicatorTimerRef.current = undefined;
      setSaveStatus("saved");
    }, AUTO_SAVE_INDICATOR_MS);
  }

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
    [autoAdvance, onAnswer, onNext, pageIndex],
  );

  const handleNextClick = useCallback(() => {
    clearAdvanceTimer();
    if (isLastPageInSection(pageIndex)) {
      triggerSaveIndicator();
    }
    onNext();
  }, [onNext, pageIndex]);

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

      const shortcutAnswer = IASP_ANSWER_OPTIONS[Number(event.key) - 1];
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
          IAS-P assessment questionnaire. Answer each question to continue.
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
          <div aria-hidden className="border-t border-border" />
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3">
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
          dialogBodyShellClass,
          "flex w-full min-w-0 flex-1 flex-col items-stretch gap-0 overflow-x-hidden overflow-y-hidden p-0 sm:gap-0",
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

/* ─── Modal orchestrator ────────────────────────────────────────────────── */

function IaspAssessmentFlow({
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
    if (pageIndex >= IASP_QUESTION_PAGES.length - 1) {
      setState((current) => {
        if (isLastPageInSection(current.pageIndex)) {
          saveIaspDraft(current);
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
      if (isLastPageInSection(current.pageIndex)) {
        saveIaspDraft(current);
      }
      return {
        ...current,
        pageDirection: 1,
        pageIndex: Math.min(
          IASP_QUESTION_PAGES.length - 1,
          current.pageIndex + 1,
        ),
      };
    });
  }

  if (step === "intro") {
    return (
      <IntroStep
        onStart={() =>
          setState((current) => ({ ...current, step: "about" }))
        }
        onPreviewResults={
          isIaspResultsPreviewEnabled()
            ? () => setState(createIaspResultsPreviewState())
            : undefined
        }
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
        onBack={() =>
          setState((current) => ({ ...current, step: "redFlags" }))
        }
        onSubmit={() =>
          setState((current) => ({ ...current, step: "results" }))
        }
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
    return <ResultsStep answers={answers} onRetake={onReset} />;
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

export function IaspAssessmentModal({
  open,
  onOpenChange,
  initialState = INITIAL_IASP_FLOW_STATE,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialState?: IaspFlowState;
}) {
  const [flowState, setFlowState] = useState<IaspFlowState>(initialState);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const suppressExitConfirmUntilRef = useRef(0);

  function resetFlow() {
    clearIaspDraft();
    setFlowState(INITIAL_IASP_FLOW_STATE);
  }

  function closeAssessment() {
    if (flowState.step === "results") {
      clearIaspDraft();
      setFlowState(INITIAL_IASP_FLOW_STATE);
      onOpenChange(false);
      return;
    }

    if (hasIaspProgress(flowState)) {
      saveIaspDraft(flowState);
    } else {
      clearIaspDraft();
      setFlowState(INITIAL_IASP_FLOW_STATE);
    }

    onOpenChange(false);
  }

  function dismissExitConfirm() {
    suppressExitConfirmUntilRef.current = Date.now() + 400;
    setExitConfirmOpen(false);
  }

  function handleOpenChange(next: boolean) {
    if (next) {
      setExitConfirmOpen(false);
      onOpenChange(true);
      return;
    }

    if (Date.now() < suppressExitConfirmUntilRef.current) {
      return;
    }

    if (exitConfirmOpen) {
      return;
    }

    if (flowState.step === "results") {
      closeAssessment();
      return;
    }

    if (hasIaspProgress(flowState)) {
      setExitConfirmOpen(true);
      return;
    }

    closeAssessment();
  }

  return (
    <>
      <IaspExitConfirmDialog
        open={exitConfirmOpen}
        onContinue={dismissExitConfirm}
        onCloseAssessment={() => {
          suppressExitConfirmUntilRef.current = Date.now() + 400;
          setExitConfirmOpen(false);
          closeAssessment();
        }}
      />
      <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPortal>
        {open ? (
          <IaspAssessmentFlow
            state={flowState}
            setState={setFlowState}
            onReset={resetFlow}
          />
        ) : null}
      </DialogPortal>
    </Dialog>
    </>
  );
}
