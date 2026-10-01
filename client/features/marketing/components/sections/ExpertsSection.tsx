"use client";

import Image from "next/image";
import { MarketingReveal } from "@/features/marketing/components/MarketingReveal";
import {
  eyebrow,
  eyebrowCenter,
  section,
  sectionHead,
  sectionHeadTitle,
  wrap,
} from "@/features/marketing/lib/marketing-classes";
import { cn } from "@/lib/utils";
import "@/features/marketing/components/sections/experts.css";

export function ExpertsSection() {
  return (
    <section
      className={cn(section, "experts")}
      id="experts"
      aria-labelledby="experts-title"
    >
      <div className={wrap}>
        <MarketingReveal className={sectionHead}>
          <p className={cn(eyebrow, eyebrowCenter)}>Meet the Expert</p>
          <h2 id="experts-title" className={sectionHeadTitle}>
            Led by Experts in Healthy Aging
          </h2>
        </MarketingReveal>
        <MarketingReveal
          className="experts-grid experts-grid-single"
          delay={0.1}
          offset={24}
        >
          <article className="expert-card expert-card-founder">
            <div className="avatar-ring avatar-ring-photo">
              <Image
                src="/images/dr-meetali-bidaye.avif"
                alt="Dr. Meetali Kolhatkar Bidaye, Founder of Nivarak"
                width={538}
                height={736}
                className="avatar-photo"
                priority
                unoptimized
              />
            </div>
            <h3>Dr. Meetali</h3>
            <p className="role">Founder, Nivarak</p>
            <p className="bio">
              Nephrologist · 15+ Years in Healthcare · Trained in the UK
            </p>
          </article>
        </MarketingReveal>
      </div>
    </section>
  );
}
