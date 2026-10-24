"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  AiMagicIcon,
  ArrowLeft02Icon,
  Download01Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { IASP_ASSESSMENT_OPEN_HREF } from "@/features/assessments/lib/iasp-report-url";
import { AgingDomainTabs } from "@/features/marketing/components/AgingDomainTabs";
import { AgingScoreRing } from "@/features/marketing/components/AgingScoreRing";
import { MarketingReveal } from "@/features/marketing/components/MarketingReveal";
import {
  AGING_SCORE_SAMPLE,
  getAgingDomainsNeedingAttention,
} from "@/features/marketing/data/aging-score-sample";
import {
  btnPrimary,
  eyebrow,
  eyebrowCenter,
  section,
  sectionHead,
  sectionHeadBody,
  sectionHeadTitle,
  wrap,
} from "@/features/marketing/lib/marketing-classes";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { cn } from "@/lib/utils";
import "@/features/marketing/components/sections/score.css";

export function ScoreSection() {
  const agingReportRef = useRef<HTMLDivElement>(null);
  const attentionDomains = getAgingDomainsNeedingAttention();
  const attentionNames = attentionDomains.map((d) => d.tabLabel.toLowerCase());
  const attentionLabels =
    attentionNames.length <= 1
      ? (attentionNames[0] ?? "key domains")
      : attentionNames.length === 2
        ? `${attentionNames[0]} and ${attentionNames[1]}`
        : `${attentionNames.slice(0, -1).join(", ")}, and ${attentionNames.at(-1)}`;

  return (
    <section
      className={cn(section, "score-section")}
      id="aging-score"
      aria-labelledby="score-title"
    >
      <div className={wrap}>
        <MarketingReveal className={sectionHead}>
          <p className={cn(eyebrow, eyebrowCenter)}>Independent Aging Score™</p>
          <h2 id="score-title" className={sectionHeadTitle}>
            Know How Well You&apos;re Aging, Not Just How Old You Are
          </h2>
          <p className={sectionHeadBody}>
            One clear number that reflects how well someone is aging across the
            domains that matter most for staying independent at home.
          </p>
        </MarketingReveal>

        <MarketingReveal delay={0.1} offset={36} duration={0.65}>
          <div
            ref={agingReportRef}
            className="aging-report"
            aria-label="Sample Independent Aging Score report"
          >
          <div className="aging-report-toolbar">
            <span className="aging-icon-btn" aria-hidden="true">
              <AppIcon icon={ArrowLeft02Icon} size={BADGE_ICON_SIZE} />
            </span>
            <span className="aging-download-btn" aria-hidden="true">
              <AppIcon icon={Download01Icon} size={BADGE_ICON_SIZE} />
              Download
            </span>
          </div>

          <header className="aging-report-header">
            <p className="aging-report-kicker">
              {AGING_SCORE_SAMPLE.memberLabel}&apos;s
            </p>
            <div className="aging-report-heading">
              <h3 className="aging-report-title">Aging Score Report</h3>
              <span className="aging-summarise" aria-hidden="true">
                <AppIcon icon={AiMagicIcon} size={BADGE_ICON_SIZE} />
                Summarise
              </span>
            </div>
          </header>

          <AgingScoreRing tooltipConstraintRef={agingReportRef} />

          <div className="aging-next">
            <p className="aging-next-label">
              <span className="aging-next-dot" aria-hidden="true" /> Next
              steps
            </p>
            <div className="aging-next-card">
              <div className="aging-next-copy">
                <h4>{AGING_SCORE_SAMPLE.memberLabel}&apos;s Care Plan is ready</h4>
                <p>
                  Personalized actions across {attentionLabels}, ready for the
                  family to review.
                </p>
              </div>
              <Link className={cn(btnPrimary, "aging-view-btn")} href={IASP_ASSESSMENT_OPEN_HREF}>
                View
              </Link>
            </div>
          </div>

          <AgingDomainTabs />
          </div>
        </MarketingReveal>

        <MarketingReveal className="score-closing" delay={0.15}>
          <p className="score-tagline">One score. Complete understanding.</p>
          <p className="score-sub">
            Reassessed regularly so families see the trend, not just a snapshot,
            catching decline while it&apos;s still reversible.
          </p>
          <div className="score-cta-wrap">
            <Link className={btnPrimary} href={IASP_ASSESSMENT_OPEN_HREF}>
              Check your score
            </Link>
          </div>
        </MarketingReveal>
      </div>
    </section>
  );
}
