"use client";

import { StarIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { MarketingReveal } from "@/features/marketing/components/MarketingReveal";
import {
  MarketingStagger,
  MarketingStaggerItem,
} from "@/features/marketing/components/MarketingStagger";
import {
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
import "@/features/marketing/components/sections/testimonials.css";

const TESTIMONIALS = [
  {
    name: "Priya Deshpande",
    quote:
      "We finally have one clear picture of my mother’s health instead of five different opinions. The Aging Score made it easy to see what needed attention.",
    avatar: "PD",
    rel: "Daughter of a Nivarak member",
  },
  {
    name: "Vikram Patil",
    quote:
      "My father was flagged for a nutrition and mobility risk before it turned into a fall. That early call from the care team meant everything.",
    avatar: "VP",
    rel: "Son of a Nivarak member",
  },
  {
    name: "Sanjay Nair",
    quote:
      "I live abroad, so knowing someone medically qualified is checking in on my parents regularly has given our whole family real peace of mind.",
    avatar: "SN",
    rel: "Family member, based overseas",
  },
] as const;

export function TestimonialsSection() {
  return (
    <section
      className={cn(section, "testimonials")}
      id="testimonials"
      aria-labelledby="testi-title"
    >
      <div className={wrap}>
        <MarketingReveal className={sectionHead}>
          <p className={cn(eyebrow, eyebrowCenter)}>Testimonials</p>
          <h2 id="testi-title" className={sectionHeadTitle}>
            Trusted by Families
          </h2>
          <p className={sectionHeadBody}>
            Sample family experiences — final testimonials to be added with
            approval.
          </p>
        </MarketingReveal>
        <MarketingStagger className="testi-grid" stagger={0.12}>
          {TESTIMONIALS.map((t) => (
            <MarketingStaggerItem
              key={t.name}
              as="article"
              className="testi-card"
            >
              <div className="testi-stars" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <AppIcon
                    key={i}
                    icon={StarIcon}
                    size={BADGE_ICON_SIZE}
                    className="[&_path]:fill-current [&_path]:stroke-none"
                  />
                ))}
              </div>
              <p className="quote">&ldquo;{t.quote}&rdquo;</p>
              <div className="testi-who">
                <div className="testi-avatar" aria-hidden="true">
                  {t.avatar}
                </div>
                <div>
                  <div className="tw-name">{t.name}</div>
                  <div className="tw-rel">{t.rel}</div>
                </div>
              </div>
            </MarketingStaggerItem>
          ))}
        </MarketingStagger>
      </div>
    </section>
  );
}
