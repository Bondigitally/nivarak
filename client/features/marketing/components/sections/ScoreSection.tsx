"use client";

import { AgingDomainTabs } from "@/features/marketing/components/AgingDomainTabs";
import {
  AiMagicIcon,
  ArrowLeft02Icon,
  Download01Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { MarketingReveal } from "@/features/marketing/components/MarketingReveal";
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
            Know How Well You&apos;re Aging — Not Just How Old You Are
          </h2>
          <p className={sectionHeadBody}>
            One clear number that reflects how well someone is aging across the
            domains that matter most for staying independent at home.
          </p>
        </MarketingReveal>

        <MarketingReveal delay={0.1} offset={36} duration={0.65}>
          <div
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
            <p className="aging-report-kicker">[Sample Member]&apos;s</p>
            <div className="aging-report-heading">
              <h3 className="aging-report-title">Aging Score Report</h3>
              <span className="aging-summarise" aria-hidden="true">
                <AppIcon icon={AiMagicIcon} size={BADGE_ICON_SIZE} />
                Summarise
              </span>
            </div>
          </header>

          <div className="aging-donut-block">
            <div
              className="aging-donut"
              role="img"
              aria-label="Aging Score 86. 7 domains on track, 2 watch, 1 needs focus."
            >
              <svg
                className="aging-donut-svg"
                viewBox="0 0 240 240"
                aria-hidden="true"
              >
                <circle
                  className="aging-donut-track"
                  cx="120"
                  cy="120"
                  r="85"
                />
                <circle
                  className="aging-donut-seg aging-donut-seg-ok"
                  cx="120"
                  cy="120"
                  r="85"
                  strokeDasharray="350 184"
                  strokeDashoffset="0"
                />
                <circle
                  className="aging-donut-seg aging-donut-seg-watch"
                  cx="120"
                  cy="120"
                  r="85"
                  strokeDasharray="90 444"
                  strokeDashoffset="-360"
                />
                <circle
                  className="aging-donut-seg aging-donut-seg-alert"
                  cx="120"
                  cy="120"
                  r="85"
                  strokeDasharray="45 489"
                  strokeDashoffset="-460"
                />
              </svg>
              <div className="aging-donut-center">
                <p className="aging-donut-num">86</p>
                <p className="aging-donut-lbl">Aging Score</p>
              </div>
              <p className="aging-callout aging-callout-ok">7 on track</p>
              <p className="aging-callout aging-callout-watch">2 watch</p>
              <p className="aging-callout aging-callout-alert">1 needs focus</p>
            </div>
          </div>

          <div className="aging-next">
            <p className="aging-next-label">
              <span className="aging-next-dot" aria-hidden="true" /> Next
              steps
            </p>
            <div className="aging-next-card">
              <div className="aging-next-copy">
                <h4>[Sample Member]&apos;s Care Plan is ready</h4>
                <p>
                  Personalized actions across mobility, nutrition, and sleep —
                  ready for the family to review.
                </p>
              </div>
              <a className={cn(btnPrimary, "aging-view-btn")} href="#check-score">
                View
              </a>
            </div>
          </div>

          <AgingDomainTabs />
          </div>
        </MarketingReveal>

        <MarketingReveal delay={0.15}>
          <p className="score-tagline">One score. Complete understanding.</p>
          <p className="score-sub">
            Reassessed regularly so families see the trend, not just a snapshot —
            catching decline while it&apos;s still reversible.
          </p>
          <div className="score-cta-wrap">
            <a className={btnPrimary} href="#check-score">
              Want to check your score?
            </a>
          </div>
        </MarketingReveal>
      </div>
    </section>
  );
}
