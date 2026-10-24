"use client";

import { useMemo, useState, type RefObject } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  DonutChart,
  type DonutChartSegment,
} from "@/components/ui/donut-chart";
import {
  AGING_DOMAIN_STATUS_META,
  AGING_SAMPLE_DOMAINS,
  AGING_SCORE_SAMPLE,
  getAgingDomainStatusCounts,
} from "@/features/marketing/data/aging-score-sample";
import { cn } from "@/lib/utils";

/** Match doctor portal IAS-P overview ring sizing. */
const SCORE_RING_SIZE = 200;
const SCORE_RING_STROKE = 22;

type AgingScoreRingProps = {
  /** Bounds tooltips to the Aging Score Report card. */
  tooltipConstraintRef: RefObject<HTMLElement | null>;
};

/**
 * Marketing Aging Score ring — same DonutChart used in the doctor portal
 * (`PatientOverviewIaspPanel` ScoreDonut).
 */
export function AgingScoreRing({ tooltipConstraintRef }: AgingScoreRingProps) {
  const [hoveredSegment, setHoveredSegment] =
    useState<DonutChartSegment | null>(null);

  const data = useMemo<DonutChartSegment[]>(
    () =>
      AGING_SAMPLE_DOMAINS.map((domain) => ({
        value: Math.max(domain.score, 0),
        max: domain.max,
        color: domain.color,
        label: domain.title,
      })),
    [],
  );

  const domainsByName = useMemo(
    () => new Map(AGING_SAMPLE_DOMAINS.map((d) => [d.title, d])),
    [],
  );

  const activeDomain = hoveredSegment
    ? domainsByName.get(hoveredSegment.label)
    : undefined;

  const totalPct = Math.round(
    (AGING_SCORE_SAMPLE.score / AGING_SCORE_SAMPLE.maxScore) * 100,
  );
  const displayLabel = activeDomain?.title ?? "Aging Score";
  const displayPct = activeDomain
    ? Math.round((activeDomain.score / activeDomain.max) * 100)
    : totalPct;
  const displayKey = activeDomain?.id ?? "total";

  const counts = getAgingDomainStatusCounts();

  return (
    <div className="aging-donut-block">
      <div className="aging-donut aging-donut--portal">
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
                <p className="mt-0.5 flex items-baseline leading-none">
                  <span className="text-[32px] font-bold tracking-[-0.02em] tabular-nums text-foreground sm:text-[36px]">
                    {displayPct}
                  </span>
                  <span className="text-base font-semibold text-muted-foreground">
                    %
                  </span>
                </p>
              </motion.div>
            </AnimatePresence>
          }
        />

        <div className="aging-status-legend" aria-label="Domain status summary">
          {(
            [
              ["ok", counts.ok],
              ["watch", counts.watch],
              ["alert", counts.alert],
            ] as const
          )
            .filter(([, count]) => count > 0)
            .map(([status, count]) => (
              <span
                key={status}
                className={cn(
                  "aging-status-legend-item",
                  `aging-status-legend-${status}`,
                )}
              >
                {count} {AGING_DOMAIN_STATUS_META[status].callout}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
}
