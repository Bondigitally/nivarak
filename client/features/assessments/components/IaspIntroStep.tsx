"use client";

import {
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
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  dialogFooterShellClass,
  dialogHeaderShellClass,
} from "@/components/ui/dialog";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import { IASP_TOTAL_QUESTIONS } from "../data/iasp-questionnaire-data";
import {
  iaspCalloutClass,
  iaspModalScrollBodyClass,
  iaspStatCardClass,
  iaspValidatedProtocolBadgeClass,
} from "../data/iasp-assessment-styles";
import {
  IaspModalCloseButton,
  IaspModalShell,
} from "./IaspAssessmentModalShell";

const INTRO_HIGHLIGHTS = [
  "Simple, everyday questions. No medical know-how needed.",
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

export function IntroStep({
  onStart,
  starting = false,
}: {
  onStart: () => void;
  starting?: boolean;
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
              IAS Assessment
            </DialogTitle>
            <p
              className={cn(
                typo.bodyM,
                "uppercase tracking-[0.06em] text-muted-foreground",
              )}
            >
              Independent Ageing Score
            </p>
          </div>
        </div>
        <div className="absolute top-4 right-4 sm:top-7 sm:right-8">
          <IaspModalCloseButton />
        </div>
      </DialogHeader>

      <div
        className={cn(
          iaspModalScrollBodyClass,
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
        <Button
          type="button"
          size="cta"
          className="w-full"
          loading={starting}
          disabled={starting}
          onClick={onStart}
        >
          Start Assessment
          <AppIcon icon={ArrowRight02Icon} />
        </Button>
      </DialogFooter>
    </IaspModalShell>
  );
}
