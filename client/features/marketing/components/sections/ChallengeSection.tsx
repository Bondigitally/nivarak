"use client";

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
import { cn } from "@/lib/utils";
import "@/features/marketing/components/sections/challenge.css";

function PathDots() {
  return (
    <span className="path-dots" aria-hidden="true">
      <span className="path-dot" />
      <span className="path-dot" />
      <span className="path-dot" />
    </span>
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
          <p className={eyebrow}>The Challenge</p>
          <h2 id="challenge-title">
            Growing Older Shouldn&apos;t Mean Losing Independence
          </h2>
          <p>
            A slower walk. A skipped meal. A missed dose. On their own, these
            changes look ordinary — the kind families explain away as &ldquo;just
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
                Of health decline is gradual — and detectable early with the
                right assessment
              </span>
            </div>
          </div>
        </MarketingReveal>
        <MarketingStagger
          className="challenge-visual"
          stagger={0.14}
          delayChildren={0.12}
        >
          <MarketingStaggerItem className="path-card path-card-bad">
            <p className="path-label">Without Early Detection</p>
            <div className="path-steps">
              <span className="path-step">Small changes</span>
              <PathDots />
              <span className="path-step">Go unnoticed</span>
              <PathDots />
              <span className="path-step path-step-crisis">Health crisis</span>
            </div>
          </MarketingStaggerItem>
          <MarketingStaggerItem className="path-card path-card-good">
            <p className="path-label">The Nivarak Way</p>
            <div className="path-steps">
              <span className="path-step">Small changes</span>
              <PathDots />
              <span className="path-step">Detected early</span>
              <PathDots />
              <span className="path-step">Independence maintained</span>
            </div>
          </MarketingStaggerItem>
        </MarketingStagger>
      </div>
    </section>
  );
}
