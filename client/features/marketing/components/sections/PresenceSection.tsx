"use client";

import { PresenceMap } from "@/features/marketing/components/PresenceMap";
import { MarketingReveal } from "@/features/marketing/components/MarketingReveal";
import {
  eyebrow,
  eyebrowCenter,
  section,
  sectionHead,
  sectionHeadBody,
  sectionHeadTitle,
  wrap,
} from "@/features/marketing/lib/marketing-classes";
import { cn } from "@/lib/utils";

export function PresenceSection() {
  return (
    <section
      className={cn(section, "presence")}
      id="presence"
      aria-labelledby="presence-title"
    >
      <div className={cn(wrap, "presence-inner")}>
        <MarketingReveal className={cn(sectionHead, "presence-copy")}>
          <p className={cn(eyebrow, eyebrowCenter)}>Nivarak Presence in Pune</p>
          <h2 id="presence-title" className={sectionHeadTitle}>
            Growing Across Pune, One Family at a Time
          </h2>
          <p className={sectionHeadBody}>
            Families across Pune are choosing Nivarak to help their loved ones
            age independently, safely, and with confidence.
          </p>
        </MarketingReveal>

        <MarketingReveal className="presence-stage" delay={0.12} offset={32}>
          <aside
            className="presence-badge"
            aria-label="Active families in Pune"
          >
            <div className="presence-badge-text">
              <strong>
                <span className="presence-badge-live" aria-hidden="true" />
                50+ Active Families in Pune
              </strong>
              <span>Nivarak care network is growing</span>
            </div>
          </aside>
          <PresenceMap />
        </MarketingReveal>
      </div>
    </section>
  );
}
