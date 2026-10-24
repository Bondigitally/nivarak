"use client";

import type { IconSvgElement } from "@hugeicons/react";
import {
  Alert02Icon,
  BlocksIcon,
  ScanHeartIcon,
  Shield01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { DotArrow } from "@/features/marketing/components/DotArrow";
import { MarketingReveal } from "@/features/marketing/components/MarketingReveal";
import {
  MarketingStagger,
  MarketingStaggerItem,
} from "@/features/marketing/components/MarketingStagger";
import {
  eyebrow,
  section,
  wrap,
} from "@/features/marketing/lib/marketing-classes";
import { ICON_SIZE } from "@/lib/icons";
import { cn } from "@/lib/utils";
import "@/features/marketing/components/sections/challenge.css";

type PathTone = "neutral" | "crisis" | "success";

type PathStage = {
  label: string;
  icon: IconSvgElement;
  tone: PathTone;
};

const WITHOUT_EARLY_DETECTION: readonly PathStage[] = [
  { label: "Small changes", icon: BlocksIcon, tone: "neutral" },
  { label: "Go unnoticed", icon: ViewIcon, tone: "neutral" },
  { label: "Health crisis", icon: Alert02Icon, tone: "crisis" },
];

const NIVARAK_WAY: readonly PathStage[] = [
  { label: "Small changes", icon: BlocksIcon, tone: "neutral" },
  { label: "Detected early", icon: ScanHeartIcon, tone: "neutral" },
  { label: "Independence maintained", icon: Shield01Icon, tone: "success" },
];

function PathConnector({ variant }: { variant: "bad" | "good" }) {
  return (
    <span
      className={cn("path-connector", `path-connector-${variant}`)}
      aria-hidden="true"
    >
      <span className="path-connector-track path-connector-track-h">
        <DotArrow direction="right" />
      </span>
      <span className="path-connector-track path-connector-track-v">
        <DotArrow direction="down" />
      </span>
    </span>
  );
}

function PathStageCard({ stage }: { stage: PathStage }) {
  return (
    <span className={cn("path-stage", `path-stage-${stage.tone}`)}>
      <AppIcon icon={stage.icon} size={ICON_SIZE} className="path-stage-icon" />
      <span className="path-stage-label">{stage.label}</span>
    </span>
  );
}

function PathRow({
  label,
  stages,
  variant,
}: {
  label: string;
  stages: readonly PathStage[];
  variant: "bad" | "good";
}) {
  return (
    <div className={cn("path-row", `path-row-${variant}`)}>
      <p className="path-label">{label}</p>
      <div className="path-steps">
        {stages.map((stage, index) => (
          <div key={stage.label} className="path-step-group">
            {index > 0 ? <PathConnector variant={variant} /> : null}
            <PathStageCard stage={stage} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChallengeSection() {
  return (
    <section
      className={cn(section, "challenge")}
      id="why-nivarak"
      aria-labelledby="challenge-title"
    >
      <div className={cn(wrap, "challenge-inner")}>
        <MarketingReveal className="challenge-text" direction="left" offset={32}>
          <p className={cn(eyebrow, "challenge-eyebrow")}>The Challenge</p>
          <h2 id="challenge-title">
            Growing Older Shouldn&apos;t Mean Losing Independence
          </h2>
          <p>
            A slower walk. A skipped meal. A missed dose. On their own, these
            changes look ordinary, the kind families explain away as &ldquo;just
            age.&rdquo; Left unnoticed, they quietly compound until a fall, a
            hospital admission, or a health crisis forces the issue.
          </p>
          <p>
            Nivarak exists to catch these shifts long before they become
            emergencies, so independence is protected rather than lost.
          </p>
          <div className="challenge-stats">
            <div className="cstat">
              <strong>1 in 3</strong>
              <span>
                Adults 65+ experience a fall each year, often preceded by
                unnoticed changes
              </span>
            </div>
            <div className="cstat">
              <strong>80%</strong>
              <span>
                Of health decline is gradual and detectable early with the
                right assessment
              </span>
            </div>
          </div>
        </MarketingReveal>

        <MarketingReveal className="challenge-visual" delay={0.12} offset={28}>
          <div className="challenge-diagram" aria-label="Early detection pathways">
            <MarketingStagger
              className="challenge-pathways"
              stagger={0.14}
              delayChildren={0.08}
            >
              <MarketingStaggerItem className="path-pathway">
                <PathRow
                  label="Without Early Detection"
                  stages={WITHOUT_EARLY_DETECTION}
                  variant="bad"
                />
              </MarketingStaggerItem>
              <MarketingStaggerItem className="path-pathway">
                <PathRow
                  label="The Nivarak Way"
                  stages={NIVARAK_WAY}
                  variant="good"
                />
              </MarketingStaggerItem>
            </MarketingStagger>
          </div>
        </MarketingReveal>
      </div>
    </section>
  );
}
