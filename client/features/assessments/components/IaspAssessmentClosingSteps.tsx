"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import {
  Alert02Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  Clock01Icon,
  SquareLock02Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { AppIcon } from "@/components/shared/AppIcon";
import { Button } from "@/components/ui/button";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { openIaspReportCheckout } from "@/features/assessments/lib/razorpay-checkout";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  dialogFooterShellClass,
} from "@/components/ui/dialog";
import { radius } from "@/lib/tokens/radius";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { IaspBandBadge } from "./IaspBandBadge";
import type { IaspAnswersMap } from "../data/iasp-assessment-draft";
import {
  iaspAlertPanelClass,
  iaspAnswerBadgeClass,
  iaspModalScrollBodyClass,
  iaspMotionEase,
  iaspPanelCardClass,
  iaspProgressFillClass,
  iaspProgressTrackClass,
  iaspQuestionStepPaddingClass,
  iaspRedFlagChipClass,
  iaspResultsHeaderClass,
  iaspStepHeaderClass,
} from "../data/iasp-assessment-styles";
import {
  IASP_RED_FLAGS_HELPER,
  IASP_RED_FLAG_OPTIONS,
  type IaspRedFlagId,
} from "../data/iasp-red-flags-data";
import { IASP_TOTAL_QUESTIONS } from "../data/iasp-questionnaire-data";
import {
  calculateIaspPercentage,
  calculateIaspRawScore,
  formatIaspAssessmentDate,
  getIaspAnswerBadgeForQuestion,
  getIaspBand,
  getIaspReviewSections,
  getSelectedRedFlagOptions,
} from "../data/iasp-scoring";
import type { IaspAnswerId } from "../data/iasp-questionnaire-data";
import {
  IaspModalCloseButton,
  IaspModalShell,
  IaspProgressBar,
  IaspStepNavFooter,
} from "./IaspAssessmentModalShell";

const GAUGE_DURATION = 1.15;
const GAUGE_DELAY = 0.12;

const ANSWER_BADGE_ICONS: Record<IaspAnswerId, IconSvgElement> = {
  independent: Tick02Icon,
  assistance: Clock01Icon,
  dependent: Alert02Icon,
  yes: Clock01Icon,
  no: Tick02Icon,
};

/* ─── Red Flags ─────────────────────────────────────────────────────────── */

function RedFlagOptionRow({
  id,
  label,
  selected,
  onToggle,
}: {
  id: IaspRedFlagId;
  label: string;
  selected: boolean;
  onToggle: (id: IaspRedFlagId) => void;
}) {
  return (
    <label className="flex min-h-9 cursor-pointer items-center gap-3 py-0.5">
      <input
        type="checkbox"
        className="sr-only"
        checked={selected}
        onChange={() => onToggle(id)}
      />
      <span
        aria-hidden
        className={cn(
          radius.xs,
          "flex size-5 shrink-0 items-center justify-center border border-border bg-card shadow-[0_1px_2px_rgba(17,24,39,0.04)]",
          selected &&
            "border-destructive bg-destructive text-primary-foreground",
        )}
      >
        {selected ? <AppIcon icon={Tick02Icon} size={14} /> : null}
      </span>
      <span
        className={cn(
          typo.bodyM,
          "text-foreground",
          selected && "text-destructive",
        )}
      >
        {label}
      </span>
    </label>
  );
}

export function RedFlagsStep({
  selected,
  onChange,
  onBack,
  onNext,
}: {
  selected: readonly IaspRedFlagId[];
  onChange: (next: IaspRedFlagId[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  function toggle(id: IaspRedFlagId) {
    if (selectedSet.has(id)) {
      onChange(selected.filter((flag) => flag !== id));
      return;
    }
    onChange([...selected, id]);
  }

  return (
    <IaspModalShell>
      <DialogHeader className={iaspStepHeaderClass}>
        <div className="flex items-start justify-between gap-4">
          <DialogTitle className={cn(typo.headingXxl, "text-foreground")}>
            Red Flags
          </DialogTitle>
          <IaspModalCloseButton />
        </div>
        <IaspProgressBar value={96} label="Assessment progress" />
        <div className="flex flex-col gap-1">
          <p className={cn(typo.headingL, "text-foreground")}>Urgent concerns</p>
          <DialogDescription className={cn(typo.bodyS, "text-muted-foreground")}>
            {IASP_RED_FLAGS_HELPER}
          </DialogDescription>
        </div>
      </DialogHeader>

      <div
        className={cn(
          iaspModalScrollBodyClass,
          iaspQuestionStepPaddingClass,
          "gap-0 py-4 sm:gap-0 sm:py-5",
        )}
      >
        <div className="flex flex-col gap-0.5">
          {IASP_RED_FLAG_OPTIONS.map((option) => (
            <RedFlagOptionRow
              key={option.id}
              id={option.id}
              label={option.label}
              selected={selectedSet.has(option.id)}
              onToggle={toggle}
            />
          ))}
        </div>
      </div>

      <IaspStepNavFooter onBack={onBack}>
        <Button type="button" onClick={onNext}>
          Next
          <AppIcon icon={ArrowRight01Icon} />
        </Button>
      </IaspStepNavFooter>
    </IaspModalShell>
  );
}

/* ─── Review ────────────────────────────────────────────────────────────── */
export function ReviewStep({
  answers,
  redFlags,
  onBack,
  onSubmit,
  onEditSection,
}: {
  answers: IaspAnswersMap;
  redFlags: readonly IaspRedFlagId[];
  onBack: () => void;
  onSubmit: () => void;
  onEditSection: (sectionId: string) => void;
}) {
  const sections = useMemo(() => getIaspReviewSections(answers), [answers]);
  const [expandedId, setExpandedId] = useState("");
  const selectedFlags = useMemo(
    () => getSelectedRedFlagOptions(redFlags),
    [redFlags],
  );

  return (
    <IaspModalShell>
      <DialogHeader className={iaspStepHeaderClass}>
        <div className="flex items-start justify-between gap-4">
          <DialogTitle className={cn(typo.headingXxl, "text-foreground")}>
            Review Your Answers
          </DialogTitle>
          <IaspModalCloseButton />
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className={cn(typo.label, "text-muted-foreground")}>
            Question {IASP_TOTAL_QUESTIONS} of {IASP_TOTAL_QUESTIONS}
          </p>
          <p className={cn(typo.label, "text-muted-foreground")}>
            100% Complete
          </p>
        </div>
        <IaspProgressBar value={100} label="Assessment progress" />
        <DialogDescription className="sr-only">
          Review your answers by section before submitting the assessment.
        </DialogDescription>
      </DialogHeader>

      <div className={cn(iaspModalScrollBodyClass, "gap-6 p-0 sm:gap-6")}>
        <div className="divide-y divide-border">
          {sections.map((section) => {
            const expanded = expandedId === section.id;
            return (
              <div key={section.id} className="bg-card">
                <div className="flex items-center justify-between gap-3 px-dash-pad-x py-4 sm:px-8">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    onClick={() =>
                      setExpandedId((current) =>
                        current === section.id ? "" : section.id,
                      )
                    }
                    aria-expanded={expanded}
                  >
                    <AppIcon
                      icon={expanded ? ArrowUp01Icon : ArrowDown01Icon}
                      size={14}
                      className="shrink-0 text-primary"
                    />
                    <span className={cn(typo.headingS, "text-foreground")}>
                      {section.title}
                    </span>
                  </button>
                  <div className="flex shrink-0 items-center gap-4">
                    <span className={cn(typo.bodyM, "text-muted-foreground")}>
                      {section.answeredCount} / {section.totalCount}
                    </span>
                    {expanded ? (
                      <button
                        type="button"
                        className={cn(typo.button, "text-primary")}
                        onClick={() => onEditSection(section.id)}
                      >
                        Edit
                      </button>
                    ) : null}
                  </div>
                </div>

                {expanded ? (
                  <div className="flex flex-col gap-3 pb-4 pl-12 pr-6 sm:pr-8">
                    {section.questions.map((question, index) => {
                      const badge = getIaspAnswerBadgeForQuestion(
                        question.id,
                        question.answer,
                      );
                      const answerId = question.answer;
                      const isLast = index === section.questions.length - 1;
                      return (
                        <div
                          key={question.id}
                          className={cn(
                            "flex items-start justify-between gap-4 py-2",
                            !isLast && "border-b border-divider",
                          )}
                        >
                          <p className={cn(typo.bodyM, "text-muted-foreground")}>
                            {question.prompt}
                          </p>
                          {badge && answerId ? (
                            <span
                              className={cn(
                                iaspAnswerBadgeClass,
                                badge.className,
                              )}
                            >
                              <AppIcon
                                icon={ANSWER_BADGE_ICONS[answerId]}
                                size={BADGE_ICON_SIZE}
                                aria-hidden
                              />
                              {badge.label}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {selectedFlags.length > 0 ? (
          <div className="px-dash-pad-x pb-6 sm:px-8">
            <div className={iaspAlertPanelClass}>
              <div className="flex items-center gap-2 text-destructive">
                <AppIcon icon={Alert02Icon} size={BADGE_ICON_SIZE} />
                <p className={cn(typo.headingS, "text-destructive")}>
                  Red flags selected: {selectedFlags.length}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedFlags.map((flag) => (
                  <span key={flag.id} className={iaspRedFlagChipClass}>
                    {flag.shortLabel}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <IaspStepNavFooter onBack={onBack}>
        <Button type="button" onClick={onSubmit}>
          Submit Assessment
        </Button>
      </IaspStepNavFooter>
    </IaspModalShell>
  );
}

/* ─── Results ───────────────────────────────────────────────────────────── */
function ResultsGauge({ percentage }: { percentage: number }) {
  const reducedMotion = useReducedMotion();
  const scoreRef = useRef<HTMLSpanElement>(null);
  const ratio = Math.min(1, Math.max(0, percentage / 100));
  const arcRadius = 84;
  const stroke = 14;
  const cx = 100;
  const cy = 100;
  const circumference = Math.PI * arcRadius;

  const progress = useMotionValue(reducedMotion ? ratio : 0);
  const strokeDasharray = useTransform(progress, (value) => {
    const filled = circumference * value;
    return `${filled} ${circumference}`;
  });

  useEffect(() => {
    if (reducedMotion) {
      progress.set(ratio);
      if (scoreRef.current) scoreRef.current.textContent = String(percentage);
      return;
    }

    progress.set(0);
    if (scoreRef.current) scoreRef.current.textContent = "0";

    let lastShown = 0;
    const controls = animate(progress, ratio, {
      duration: GAUGE_DURATION,
      delay: GAUGE_DELAY,
      ease: iaspMotionEase,
      onUpdate: (value) => {
        const t = ratio > 0 ? value / ratio : 1;
        const shown = Math.min(percentage, Math.max(0, Math.round(t * percentage)));
        if (shown !== lastShown && scoreRef.current) {
          scoreRef.current.textContent = String(shown);
          lastShown = shown;
        }
      },
      onComplete: () => {
        progress.set(ratio);
        if (scoreRef.current) scoreRef.current.textContent = String(percentage);
      },
    });

    return () => controls.stop();
  }, [percentage, progress, ratio, reducedMotion]);

  return (
    <motion.div
      className="relative mx-auto h-29.5 w-50"
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: iaspMotionEase }}
    >
      <svg viewBox="0 0 200 118" className="size-full" aria-hidden>
        <path
          d={`M ${cx - arcRadius} ${cy} A ${arcRadius} ${arcRadius} 0 0 1 ${cx + arcRadius} ${cy}`}
          fill="none"
          stroke="var(--divider)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <motion.path
          d={`M ${cx - arcRadius} ${cy} A ${arcRadius} ${arcRadius} 0 0 1 ${cx + arcRadius} ${cy}`}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          style={{ strokeDasharray }}
          strokeDashoffset={0}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        <p className={cn(typo.displayXl, "leading-none text-foreground")}>
          <span ref={scoreRef} className="tabular-nums">
            {reducedMotion ? percentage : 0}
          </span>
          <span className="text-[0.55em] font-semibold text-muted-foreground">
            %
          </span>
        </p>
        <p className={cn(typo.caption, "uppercase tracking-wide")}>
          IAS Score
        </p>
      </div>
      <span className="sr-only">
        IAS score {percentage} percent
      </span>
    </motion.div>
  );
}

export function ResultsStep({
  answers,
  onRetake,
}: {
  answers: IaspAnswersMap;
  onRetake: () => void;
}) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [unlockLoading, setUnlockLoading] = useState(false);
  const rawScore = calculateIaspRawScore(answers);
  const percentage = calculateIaspPercentage(rawScore);
  const band = getIaspBand(percentage);
  const assessmentDate = formatIaspAssessmentDate();

  async function handleUnlockReport() {
    setUnlockLoading(true);
    try {
      await openIaspReportCheckout();
      toast.success("Payment successful. Your detailed report will be unlocked shortly.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not open payment";
      if (message !== "Payment cancelled") {
        toast.error(message);
      }
    } finally {
      setUnlockLoading(false);
    }
  }

  return (
    <IaspModalShell>
      <DialogHeader className={iaspResultsHeaderClass}>
        <div className="absolute top-4 right-4 sm:top-5 sm:right-6">
          <IaspModalCloseButton />
        </div>
        <DialogTitle className={cn(typo.headingXxl, "text-center text-foreground")}>
          Your Assessment Results
        </DialogTitle>
        <DialogDescription className={cn(typo.bodyL, "text-center text-tertiary-foreground")}>
          Based on the comprehensive IAS evaluation
        </DialogDescription>
      </DialogHeader>

      <div
        className={cn(
          iaspModalScrollBodyClass,
          "items-center gap-8 px-dash-pad-x py-6 sm:px-8 sm:py-7",
        )}
      >
        <div className="flex w-full flex-col items-center gap-4">
          <p className={cn(typo.overline, "text-tertiary-foreground")}>
            IAS Independence Score
          </p>
          <ResultsGauge percentage={percentage} />
        </div>

        <motion.div
          className={cn(
            iaspPanelCardClass,
            "flex w-full flex-col items-center gap-3 p-6 text-center",
          )}
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: reducedMotion ? 0 : 0.35,
            ease: iaspMotionEase,
          }}
        >
          <IaspBandBadge percentage={percentage} />
          <p className={cn(typo.bodyL, "max-w-md text-muted-foreground")}>
            {band.descriptionBefore}
            <span className={cn(typo.button, "font-semibold text-primary")}>
              {band.highlight}
            </span>
            {band.descriptionAfter}
          </p>
          <p className={cn(typo.bodyS, "text-tertiary-foreground")}>
            Assessment Date: {assessmentDate}
          </p>
        </motion.div>

        <div className={cn(iaspPanelCardClass, "relative w-full shrink-0 overflow-hidden")}>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 space-y-4 p-6 opacity-40 blur-[2px]"
          >
            <div className={cn(radius.sm, "h-6 w-44 bg-border")} />
            <div className="mt-4 space-y-3">
              <div className="flex justify-between gap-4">
                <div className={cn(radius.sm, "h-4 w-32 bg-border")} />
                <div className={cn(radius.sm, "h-4 w-11 bg-border")} />
              </div>
              <div className={cn(iaspProgressTrackClass, "bg-primary/15")}>
                <div className={cn(iaspProgressFillClass, "w-4/5")} />
              </div>
              <div className="flex justify-between gap-4">
                <div className={cn(radius.sm, "h-4 w-44 bg-border")} />
                <div className={cn(radius.sm, "h-4 w-11 bg-border")} />
              </div>
              <div className={cn(iaspProgressTrackClass, "bg-primary/15")}>
                <div className={cn(iaspProgressFillClass, "w-3/5 bg-warning")} />
              </div>
            </div>
          </div>

          <div className="relative px-dash-pad-x py-3 text-center bg-card/80 backdrop-blur-[1px] sm:py-4">
            <div className="mx-auto flex flex-col items-center">
              <span
                className={cn(
                  radius.full,
                  "flex size-12 items-center justify-center text-primary",
                )}
              >
                <AppIcon icon={SquareLock02Icon} />
              </span>
              <h3 className={cn(typo.headingXl, "mt-2.5 text-foreground")}>
                Detailed Report
              </h3>
              <p className={cn(typo.bodyM, "mt-3 max-w-sm text-muted-foreground")}>
                Section-by-section breakdown, red-flag analysis, and a
                personalised care pathway.
              </p>
              <Button
                type="button"
                size="cta"
                className="mt-4"
                loading={unlockLoading}
                disabled={unlockLoading}
                onClick={handleUnlockReport}
              >
                Unlock Detailed Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter
        className={cn(
          dialogFooterShellClass,
          "flex-row flex-wrap items-center justify-center gap-4 border-t-0 bg-card pt-2",
        )}
      >
        <Button type="button" variant="secondary" onClick={onRetake}>
          Retake assessment
        </Button>
        <Button
          type="button"
          variant="primary-outline"
          onClick={() => router.push("/register")}
        >
          Book a Free Consultation
        </Button>
      </DialogFooter>
    </IaspModalShell>
  );
}