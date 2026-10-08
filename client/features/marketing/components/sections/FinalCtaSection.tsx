"use client";

import Link from "next/link";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import {
  MarketingStagger,
  MarketingStaggerItem,
} from "@/features/marketing/components/MarketingStagger";
import {
  btnOutlineInverse,
  section,
  wrap,
} from "@/features/marketing/lib/marketing-classes";
import { ICON_SIZE } from "@/lib/icons";
import { cn } from "@/lib/utils";
import "@/features/marketing/components/sections/final-cta.css";

export function FinalCtaSection() {
  return (
    <section
      className={cn(section, "final-cta")}
      id="cta"
      aria-labelledby="cta-title"
    >
      <MarketingStagger
        className={wrap}
        stagger={0.1}
        delayChildren={0.04}
      >
        <MarketingStaggerItem>
          <h2 id="cta-title">
            Help Your Loved Ones Stay Independent for Longer
          </h2>
        </MarketingStaggerItem>
        <MarketingStaggerItem>
          <p>Start with a free assessment and a clear Independent Aging Score.</p>
        </MarketingStaggerItem>
        <MarketingStaggerItem>
          <div className="final-cta-actions">
            <Link
              className={cn(
                btnOutlineInverse,
                "min-h-[var(--density-control-h-cta)]",
              )}
              href="/iasp-assessment"
            >
              Take free assessment{" "}
              <AppIcon icon={ArrowRight02Icon} size={ICON_SIZE} />
            </Link>
            <Link
              className={cn(
                btnOutlineInverse,
                "min-h-[var(--density-control-h-cta)] final-cta-secondary",
              )}
              href="/contact#book"
            >
              Book a visit
            </Link>
          </div>
        </MarketingStaggerItem>
      </MarketingStagger>
    </section>
  );
}
