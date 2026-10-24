"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import {
  HealthIcon,
  InfinitySquareIcon,
  QuillWrite01Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { ArrowFillButton } from "@/features/marketing/components/ArrowFillButton";
import { useMarketingHomePreload } from "@/features/marketing/components/MarketingHomePreload";
import {
  MarketingStagger,
  MarketingStaggerItem,
} from "@/features/marketing/components/MarketingStagger";
import { marketingHeroUnderHeaderClass } from "@/features/marketing/lib/header-layout";
import { eyebrow, textAccent, wrap } from "@/features/marketing/lib/marketing-classes";
import { ICON_SIZE } from "@/lib/icons";
import { cn } from "@/lib/utils";
import "@/features/marketing/components/sections/hero.css";

const heroCarouselImport = () =>
  import("@/features/marketing/components/HeroCarousel").then((m) => ({
    default: m.HeroCarousel,
  }));

/** Dashboard preview is a separate chunk — prefetch while hero copy paints.
 *  No loading UI: MarketingHomePreload covers the chunk wait. */
const HeroCarousel = dynamic(heroCarouselImport, {
  ssr: false,
});

export function HeroSection() {
  const preload = useMarketingHomePreload();
  const revealed = preload?.ready ?? true;

  useEffect(() => {
    void heroCarouselImport();
  }, []);

  return (
    <section
      className={cn("hero", marketingHeroUnderHeaderClass)}
      aria-labelledby="hero-title"
    >
      <div className={cn(wrap, "hero-inner")}>
        <MarketingStagger
          className="hero-text"
          eager
          active={revealed}
          mode="lite"
        >
          <MarketingStaggerItem mode="lite">
            <p className={eyebrow}>Independent Aging, Reimagined</p>
          </MarketingStaggerItem>
          <MarketingStaggerItem mode="lite">
            <h1 id="hero-title">
              Your Parents Say They’re Fine.{" "}
              <span className={textAccent}>
                Understand How They’re Really Doing.
              </span>
            </h1>
          </MarketingStaggerItem>
          <MarketingStaggerItem mode="lite">
            <p className="lede">
              Explore our free Independent Ageing Assessment to understand your
              parents’ health and independence, and where they may need more
              attention.
            </p>
          </MarketingStaggerItem>
          <MarketingStaggerItem mode="lite">
            <div className="hero-ctas">
              <ArrowFillButton text="Take a Free 3-Minute Assessment" />
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
        {/*
          No MarketingReveal here — stacking an entrance animation on top of
          the dynamic chunk mount caused visible stutter in the preview.
        */}
        <div className="hero-visual">
          <HeroCarousel />
        </div>
      </div>
    </section>
  );
}
