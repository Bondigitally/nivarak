"use client";

import {
  CaduceusIcon,
  HouseHeartIcon,
  PatientIcon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { MarketingReveal } from "@/features/marketing/components/MarketingReveal";
import {
  MarketingStagger,
  MarketingStaggerItem,
} from "@/features/marketing/components/MarketingStagger";
import {
  card,
  cardBody,
  cardIcon,
  cardTitle,
  eyebrow,
  eyebrowCenter,
  section,
  sectionHead,
  sectionHeadTitle,
  wrap,
} from "@/features/marketing/lib/marketing-classes";
import { EMPTY_ICON_SIZE } from "@/lib/icons";
import { cn } from "@/lib/utils";
import "@/features/marketing/components/sections/what-is.css";

/** ElderIcon is not in the free pack pinned by package-lock; PatientIcon matches. */
const ElderIcon = PatientIcon;

const CARDS = [
  {
    icon: ElderIcon,
    title: "For Older Adults",
    body: "Stay healthier and independent at home.",
    ring: "what-card-ring-lavender",
  },
  {
    icon: HouseHeartIcon,
    title: "For Families",
    body: "Get clarity and reassurance.",
    ring: "what-card-ring-blush",
  },
  {
    icon: CaduceusIcon,
    title: "For Doctors",
    body: "Get a longitudinal view of the patient.",
    ring: "what-card-ring-periwinkle",
  },
] as const;

export function WhatIsSection() {
  return (
    <section
      className={cn(section, "what-is")}
      id="care-ecosystem"
      aria-labelledby="what-title"
    >
      <div className={wrap}>
        <MarketingReveal className={sectionHead}>
          <p className={cn(eyebrow, eyebrowCenter)}>Care Ecosystem</p>
          <h2 id="what-title" className={sectionHeadTitle}>
            Your Partner in Independent Aging
          </h2>
        </MarketingReveal>
        <MarketingStagger className="what-grid" stagger={0.12}>
          {CARDS.map((item) => (
            <MarketingStaggerItem key={item.title} as="article">
              {/*
                Hover lift lives on an inner shell so it doesn’t fight the
                stagger item’s motion transform (which looked like a right shift).
              */}
              <div className={cn(card, "what-card group", item.ring)}>
                <div
                  className={cn(
                    cardIcon,
                    "what-card-icon",
                    "group-hover:bg-[var(--what-ring)] group-hover:text-[var(--color-text-primary)]",
                  )}
                  aria-hidden="true"
                >
                  <AppIcon icon={item.icon} size={EMPTY_ICON_SIZE} />
                </div>
                <h3 className={cardTitle}>{item.title}</h3>
                <p className={cardBody}>{item.body}</p>
              </div>
            </MarketingStaggerItem>
          ))}
        </MarketingStagger>
        <MarketingReveal className="what-tagline" delay={0.2}>
          Proactive medical care between routine doctor visits and hospital
          episodes.
        </MarketingReveal>
      </div>
    </section>
  );
}
