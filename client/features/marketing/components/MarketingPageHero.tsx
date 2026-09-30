"use client";

import {
  MarketingStagger,
  MarketingStaggerItem,
} from "@/features/marketing/components/MarketingStagger";
import { marketingHeroUnderHeaderClass } from "@/features/marketing/lib/header-layout";
import {
  eyebrow,
  pageHero,
  pageHeroBody,
  pageHeroInner,
  pageHeroTitle,
  wrap,
} from "@/features/marketing/lib/marketing-classes";
import { cn } from "@/lib/utils";

type MarketingPageHeroProps = {
  eyebrowText: string;
  titleId: string;
  title: React.ReactNode;
  body: React.ReactNode;
};

/** Inner-page hero with eager entrance stagger (lite — no blur). */
export function MarketingPageHero({
  eyebrowText,
  titleId,
  title,
  body,
}: MarketingPageHeroProps) {
  return (
    <section
      className={cn(pageHero, marketingHeroUnderHeaderClass)}
      aria-labelledby={titleId}
    >
      <MarketingStagger
        className={cn(wrap, pageHeroInner)}
        eager
        mode="lite"
      >
        <MarketingStaggerItem mode="lite">
          <p className={eyebrow}>{eyebrowText}</p>
        </MarketingStaggerItem>
        <MarketingStaggerItem mode="lite">
          <h1 id={titleId} className={pageHeroTitle}>
            {title}
          </h1>
        </MarketingStaggerItem>
        <MarketingStaggerItem mode="lite">
          <p className={pageHeroBody}>{body}</p>
        </MarketingStaggerItem>
      </MarketingStagger>
    </section>
  );
}
