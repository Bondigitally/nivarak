"use client";

import Link from "next/link";
import {
  ArrowRight02Icon,
  HealthIcon,
  InfinitySquareIcon,
  QuillWrite01Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { HeroCarousel } from "@/features/marketing/components/HeroCarousel";
import { MarketingReveal } from "@/features/marketing/components/MarketingReveal";
import {
  MarketingStagger,
  MarketingStaggerItem,
} from "@/features/marketing/components/MarketingStagger";
import { marketingHeroUnderHeaderClass } from "@/features/marketing/lib/header-layout";
import { marketingHero } from "@/features/marketing/lib/motion";
import {
  btnOutline,
  btnPrimary,
  eyebrow,
  textAccent,
  wrap,
} from "@/features/marketing/lib/marketing-classes";
import { ICON_SIZE } from "@/lib/icons";
import { cn } from "@/lib/utils";
import "@/features/marketing/components/sections/hero.css";

export function HeroSection() {
  return (
    <section
      className={cn("hero", marketingHeroUnderHeaderClass)}
      aria-labelledby="hero-title"
    >
      <div className={cn(wrap, "hero-inner")}>
        <MarketingStagger className="hero-text" eager mode="lite">
          <MarketingStaggerItem mode="lite">
            <p className={eyebrow}>Independent Aging, Reimagined</p>
          </MarketingStaggerItem>
          <MarketingStaggerItem mode="lite">
            <h1 id="hero-title">
              Personalized Care for Older Adults to Live{" "} <span className={textAccent}>  Independently, Longer</span>{" "}

            </h1>
          </MarketingStaggerItem>
          <MarketingStaggerItem mode="lite">
            <p className="lede">
              Nivarak helps older adults stay independent at home with proactive health assessments, personalized care plans, and continuous support—while giving families greater confidence in their loved one’s well-being.
            </p>
          </MarketingStaggerItem>
          <MarketingStaggerItem mode="lite">
            <div className="hero-ctas">
              <Link
                className={cn(btnPrimary, "min-h-[var(--density-control-h-cta)]")}
                href="/contact#book"
              >
                Take an assessment{" "}
                <AppIcon icon={ArrowRight02Icon} size={ICON_SIZE} />
              </Link>
              <a
                className={cn(btnOutline, "min-h-[var(--density-control-h-cta)]")}
                href="#how"
              >
                How It Works
              </a>
            </div>
          </MarketingStaggerItem>
          <MarketingStaggerItem mode="lite">
            <div className="trust-badges" aria-label="Trust signals">
              <div className="trust-badge">
                <span className="tb-icon" aria-hidden="true">
                  <AppIcon icon={HealthIcon} size={ICON_SIZE} />
                </span>
                Medical Care
              </div>
              <div className="trust-badge">
                <span className="tb-icon" aria-hidden="true">
                  <AppIcon icon={QuillWrite01Icon} size={ICON_SIZE} />
                </span>
                Independent Aging Score
              </div>
              <div className="trust-badge">
                <span className="tb-icon" aria-hidden="true">
                  <AppIcon icon={InfinitySquareIcon} size={ICON_SIZE} />
                </span>
                Continuous Monitoring
              </div>
            </div>
          </MarketingStaggerItem>
        </MarketingStagger>
        <MarketingReveal
          className="hero-visual"
          eager
          mode="lite"
          delay={marketingHero.visualDelay}
          direction="right"
          offset={marketingHero.visualOffset}
          duration={marketingHero.visualDuration}
        >
          <HeroCarousel />
        </MarketingReveal>
      </div>
    </section>
  );
}
