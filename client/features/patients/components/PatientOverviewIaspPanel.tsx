"use client";

import { useMemo, useRef, useState } from "react";
import {
  AiBrain01Icon,
  Alert02Icon,
  Calendar03Icon,
  Flag01Icon,
  PillIcon,
  Refresh01Icon,
  UserMultiple02Icon,
  WalkingIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import { AppIcon } from "@/components/shared/AppIcon";
import { ChevronIcon } from "@/components/shared/ChevronIcon";
import { Button } from "@/components/ui/button";
import {
  DonutChart,
  type DonutChartSegment,
} from "@/components/ui/donut-chart";
import { SectionInfoButton } from "@/features/dashboard/components/EmptyState";
import { dashboardCardClass } from "@/features/dashboard/data/dashboard-styles";
import { getDoctorPatientById } from "@/features/patients/data/doctor-patients-data";
import {
  getPatientOverviewIasp,
  type IaspDomainBand,
  type IaspOverviewDomain,
} from "@/features/patients/data/patient-chart-data";
import { BADGE_ICON_SIZE, ICON_SIZE } from "@/lib/icons";
import { radius } from "@/lib/tokens/radius";
import { statusBadgeClass } from "@/lib/tokens/status-badges";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

const SCORE_RING_SIZE = 200;
const SCORE_RING_STROKE = 22;

/** Distinct segment colors for the five IAS-P domains */
const DOMAIN_CHART_COLORS: Record<string, string> = {
  memory: "#7932ba",
  mobility: "#2e8b57",
  social: "#ea4335",
  financial: "#F59E0B",
  medication: "#147AD6",
};

const DOMAIN_ICONS: Record<string, IconSvgElement> = {
  memory: AiBrain01Icon,
  mobility: WalkingIcon,
  social: UserMultiple02Icon,
  financial: Wallet01Icon,
  medication: PillIcon,
};

const DOMAIN_BAND_STYLES: Record<
  IaspDomainBand,
  { label: string; bar: string; pill: string }
> = {
  good: {
    label: "Good",
    bar: "bg-[#2e8b57]",
    pill: "bg-[#ecfdf3] text-[#16a34a]",
  },
  moderate: {
    label: "Moderate",
    bar: "bg-[#7932ba]",
    pill: "bg-[#f3eefb] text-[#7e3af2]",
  },
  low: {
    label: "Low",
    bar: "bg-[#ea4335]",
    pill: "bg-[#fef2f2] text-[#ef4444]",
  },
};

function ScoreDonut({
  score,
  maxScore,
  domains,
  tooltipConstraintRef,
}: {
  score: number;
  maxScore: number;
  domains: IaspOverviewDomain[];
  tooltipConstraintRef: React.RefObject<HTMLElement | null>;
}) {
  const [hoveredSegment, setHoveredSegment] =
    useState<DonutChartSegment | null>(null);

  const totalPct = Math.round((score / maxScore) * 100);

  const data = useMemo<DonutChartSegment[]>(
    () =>
      domains.map((domain) => ({
        value: Math.max(domain.score, 0),
        max: domain.max,
        color: DOMAIN_CHART_COLORS[domain.id] ?? "#6C318E",
        label: domain.name,
      })),
    [domains],
  );

  const domainsByName = useMemo(
    () => new Map(domains.map((domain) => [domain.name, domain])),
    [domains],
  );

  const activeDomain = hoveredSegment
    ? domainsByName.get(hoveredSegment.label)
    : undefined;

  const displayLabel = activeDomain?.name ?? "Total";
  const displayValue = activeDomain ? activeDomain.score : score;
  const displayMax = activeDomain ? activeDomain.max : maxScore;
  const displayPct = activeDomain
    ? Math.round((activeDomain.score / activeDomain.max) * 100)
    : totalPct;
  const displayKey = activeDomain?.id ?? "total";

  return (
    <DonutChart
      className="mx-auto"
      data={data}
      size={SCORE_RING_SIZE}
      strokeWidth={SCORE_RING_STROKE}
      animationDuration={1.2}
      animationDelayPerSegment={0.05}
      highlightOnHover
      showTooltip
      tooltipConstraintRef={tooltipConstraintRef}
      onSegmentHover={setHoveredSegment}
      centerContent={
        <AnimatePresence mode="wait">
          <motion.div
            key={displayKey}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "circOut" }}
            className="flex w-full max-w-[8.5rem] flex-col items-center justify-center text-center"
          >
            <p className="w-full text-xs font-medium leading-snug text-muted-foreground sm:text-sm">
              {displayLabel}
            </p>
            <p className="mt-0.5 flex items-baseline gap-0.5 leading-none">
              <span className="text-[28px] font-bold tracking-[-0.02em] text-foreground sm:text-[32px]">
                {displayValue}
              </span>
              <span className={cn(typo.bodyM, "text-muted-foreground")}>
                /{displayMax}
              </span>
            </p>
            <p className={cn(typo.bodyS, "mt-0.5 text-muted-foreground")}>
              {displayPct}%
            </p>
          </motion.div>
        </AnimatePresence>
      }
    />
  );
}

function DomainProgressFill({
  pct,
  barClassName,
  delay = 0,
}: {
  pct: number;
  barClassName: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={cn("h-full rounded-full", barClassName)}
      initial={{ width: 0 }}
      animate={{ width: `${pct}%` }}
      transition={{
        duration: 1,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    />
  );
}

function DomainRow({
  domain,
  showDivider,
  index = 0,
  expanded,
  onToggle,
}: {
  domain: IaspOverviewDomain;
  showDivider?: boolean;
  index?: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const pct = Math.round((domain.score / domain.max) * 100);
  const band = DOMAIN_BAND_STYLES[domain.band];
  const icon = DOMAIN_ICONS[domain.id] ?? AiBrain01Icon;
  const fillDelay = 0.15 + index * 0.08;

  return (
    <div className={cn(showDivider && "border-t border-divider")}>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={onToggle}
        className={cn(
          "flex w-full items-start gap-3 py-3 text-left transition-colors",
          "sm:min-h-16 sm:items-center sm:gap-6",
          "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          showDivider && "pt-[13px]",
        )}
      >
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f3eff6] text-primary sm:mt-0 sm:size-12 dark:bg-primary/10">
          <AppIcon icon={icon} size={ICON_SIZE} />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:pr-6">
          <p className={cn(typo.bodyM, "font-medium text-foreground")}>
            {domain.name}
          </p>

          {/* Mobile: bar + chevron inline */}
          <div className="flex items-center gap-2 sm:hidden">
            <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[#f1f5f9] dark:bg-muted">
              <DomainProgressFill
                pct={pct}
                barClassName={band.bar}
                delay={fillDelay}
              />
            </div>
            <span className="flex size-9 shrink-0 items-center justify-center text-muted-foreground">
              <ChevronIcon
                direction="right"
                size={16}
                className={cn(
                  "transition-transform duration-200",
                  expanded && "rotate-90",
                )}
              />
            </span>
          </div>

          {/* Desktop: full-width bar */}
          <div className="hidden h-2 w-full overflow-hidden rounded-full bg-[#f1f5f9] sm:block dark:bg-muted">
            <DomainProgressFill
              pct={pct}
              barClassName={band.bar}
              delay={fillDelay}
            />
          </div>

          {/* Mobile: score + pill below bar */}
          <div className="flex items-center justify-between gap-3 pr-9 sm:hidden">
            <span className={cn(typo.bodyM, "font-medium text-muted-foreground")}>
              {domain.score}/{domain.max}
            </span>
            <span
              className={cn(
                radius.md,
                "inline-flex w-fit items-center px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap",
                band.pill,
              )}
            >
              {band.label}
            </span>
          </div>
        </div>

        {/* Desktop: score + pill + chevron */}
        <div className="hidden shrink-0 items-center gap-6 sm:flex">
          <span className={cn(typo.bodyM, "w-8 text-right font-medium text-muted-foreground")}>
            {domain.score}/{domain.max}
          </span>
          <span className="flex w-[4.75rem] justify-start">
            <span
              className={cn(
                radius.md,
                "inline-flex w-fit items-center px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap",
                band.pill,
              )}
            >
              {band.label}
            </span>
          </span>
          <span className="flex size-9 items-center justify-center text-muted-foreground">
            <ChevronIcon
              direction="right"
              size={16}
              className={cn(
                "transition-transform duration-200",
                expanded && "rotate-90",
              )}
            />
          </span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key={`${domain.id}-detail`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                radius.md,
                "mb-3 ml-[3.25rem] bg-muted/60 px-3.5 py-3 sm:ml-[4.5rem]",
              )}
            >
              <p className={cn(typo.caption, "font-semibold text-foreground")}>
                About this score ({domain.score}/{domain.max} · {band.label})
              </p>
              <p className={cn(typo.bodyS, "mt-1.5 text-muted-foreground")}>
                {domain.detail}
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function PatientOverviewIaspPanel({ patientId }: { patientId: string }) {
  const patient = getDoctorPatientById(patientId);
  const overview = getPatientOverviewIasp(patientId);
  const iaspCardRef = useRef<HTMLElement>(null);
  const [expandedDomainId, setExpandedDomainId] = useState<string | null>(null);

  if (!patient) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <section
          ref={iaspCardRef}
          className={cn(
            dashboardCardClass,
            "relative flex flex-col items-center gap-4 overflow-hidden p-6 text-center",
          )}
        >
          <h3
            className={cn(
              typo.headingL,
              "flex w-full items-center gap-1.5 text-left text-foreground",
            )}
          >
            <span>IAS-P Total Score</span>
            <SectionInfoButton info="Independent Ageing Score from the latest IAS-P assessment. Higher scores indicate stronger functional independence." />
          </h3>
          <ScoreDonut
            score={overview.score}
            maxScore={overview.maxScore}
            domains={overview.domains}
            tooltipConstraintRef={iaspCardRef}
          />
          <span
            className={cn(
              radius.full,
              "px-3 py-1.5 text-xs font-bold tracking-[0.6px]",
              overview.riskTone === "elevated"
                ? "bg-destructive-muted text-destructive"
                : overview.riskTone === "low"
                  ? DOMAIN_BAND_STYLES.good.pill
                  : DOMAIN_BAND_STYLES.moderate.pill,
            )}
          >
            {overview.riskLabel.toUpperCase()}
          </span>
          <p className={cn(typo.bodyM, "max-w-56 text-muted-foreground")}>
            {overview.summary}
          </p>
          <div
            className={cn(
              radius.md,
              "flex w-full items-center gap-3 bg-muted/70 px-3 py-2.5 text-left",
            )}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-primary">
              <AppIcon icon={Calendar03Icon} size={ICON_SIZE} />
            </span>
            <div className="min-w-0 flex flex-1 flex-col gap-0.5">
              <p className={cn(typo.bodyM, "text-muted-foreground")}>
                Next assessment
              </p>
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                <p className={cn(typo.bodyM, "min-w-0 font-semibold text-primary")}>
                  {overview.nextAssessmentDate}
                </p>
                <span
                  className={cn(
                    statusBadgeClass,
                    "shrink-0 bg-[#f3eff6] text-primary dark:bg-primary/10",
                  )}
                >
                  {overview.nextAssessmentBadge}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          className={cn(
            dashboardCardClass,
            "group/thin-scroll flex max-h-[min(32rem,70vh)] flex-col gap-5 overflow-hidden p-6",
          )}
        >
          <div className="flex shrink-0 flex-col gap-1">
            <h3
              className={cn(
                typo.headingL,
                "tracking-[-0.025em] text-foreground",
              )}
            >
              Domain Breakdown
            </h3>
            <p className={cn(typo.bodyM, "text-muted-foreground")}>
              Performance across key functional domains
            </p>
          </div>
          <div className="thin-hover-scroll min-h-0 flex-1 overflow-y-scroll overscroll-contain [scrollbar-gutter:stable]">
            <div className="flex flex-col pr-1">
              {overview.domains.map((domain, index) => (
                <DomainRow
                  key={domain.id}
                  domain={domain}
                  index={index}
                  showDivider={index > 0}
                  expanded={expandedDomainId === domain.id}
                  onToggle={() =>
                    setExpandedDomainId((current) =>
                      current === domain.id ? null : domain.id,
                    )
                  }
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function PatientOverviewConcernsCard({
  patientId,
}: {
  patientId: string;
}) {
  const overview = getPatientOverviewIasp(patientId);

  return (
    <section
      className={cn(
        dashboardCardClass,
        "flex h-full flex-col gap-4 p-6",
      )}
    >
      <h3 className={cn(typo.headingL, "inline-flex items-center gap-2")}>
        <AppIcon
          icon={Flag01Icon}
          size={ICON_SIZE}
          className="text-destructive"
        />
        Specific Concerns Flagged
      </h3>
      <ul className="flex flex-col gap-3">
        {overview.concerns.map((concern) => (
          <li
            key={concern.id}
            className={cn(
              radius.md,
              "flex gap-3 bg-[#fcecec] p-3 dark:bg-destructive/10",
            )}
          >
            <AppIcon
              icon={Alert02Icon}
              size={BADGE_ICON_SIZE}
              className="mt-0.5 shrink-0 text-destructive"
            />
            <div className="min-w-0">
              <p className={cn(typo.bodyM, "font-bold text-foreground")}>
                {concern.title}
              </p>
              <p className={cn(typo.bodyM, "mt-0.5 text-muted-foreground")}>
                {concern.body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PatientOverviewProxyCard({
  patientId,
}: {
  patientId: string;
}) {
  const overview = getPatientOverviewIasp(patientId);

  return (
    <section
      className={cn(
        dashboardCardClass,
        "flex h-full flex-col justify-between gap-6 p-6",
      )}
    >
      <div className="flex flex-col gap-4">
        <h3 className={typo.headingL}>Proxy Metadata</h3>
        <dl className="flex flex-col">
          {overview.proxy.map((field, index) => (
            <div
              key={field.id}
              className={cn(
                "flex items-start justify-between gap-3 pb-2.5",
                index < overview.proxy.length - 1 &&
                  "mb-2.5 border-b border-divider",
              )}
            >
              <dt className={cn(typo.bodyM, "text-muted-foreground")}>
                {field.label}
              </dt>
              <dd className={cn(typo.bodyM, "font-semibold text-foreground")}>
                {field.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="border-t border-divider pt-4">
        <Button
          type="button"
          variant="ghost"
          className="h-9 w-full gap-2 text-muted-foreground"
        >
          <AppIcon icon={Refresh01Icon} size={ICON_SIZE} />
          Request family reassessment
        </Button>
      </div>
    </section>
  );
}
