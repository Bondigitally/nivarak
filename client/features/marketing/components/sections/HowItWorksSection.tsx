"use client";

import {
  ClipboardListIcon,
  InfinitySquareIcon,
  QuillWrite01Icon,
  Route01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
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
import { EMPTY_ICON_SIZE } from "@/lib/icons";
import { cn } from "@/lib/utils";
import "@/features/marketing/components/sections/how-it-works.css";

const STEPS: {
  icon: IconSvgElement;
  title: string;
  body: string;
}[] = [
  {
    icon: ClipboardListIcon,
    title: "Assessment",
    body: "A thorough, whole-person evaluation across the domains that shape daily independence.",
  },
  {
    icon: QuillWrite01Icon,
    title: "Independent Aging Score",
    body: "Results become one clear, trackable score families and doctors can act on.",
  },
  {
    icon: Route01Icon,
    title: "Personalized Care Plan",
    body: "A plan built around the person’s specific risks, goals, and daily routine.",
  },
  {
    icon: InfinitySquareIcon,
    title: "Continuous Monitoring",
    body: "Ongoing check-ins and tracking so changes are caught early, not after a crisis.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      className={cn(section, "how-it-works")}
      id="how-it-works"
      aria-labelledby="how-title"
    >
      <div className={wrap}>
        <MarketingReveal className={sectionHead}>
          <p className={cn(eyebrow, eyebrowCenter)}>How Nivarak Works</p>
          <h2 id="how-title" className={sectionHeadTitle}>
            A Simple Journey Towards Better Aging
          </h2>
          <p className={sectionHeadBody}>
            Four steps that turn uncertainty about a parent&apos;s health into a
            clear, medically-guided plan.
          </p>
        </MarketingReveal>
        <MarketingStagger className="steps-row" as="ol" stagger={0.11}>
          {STEPS.map((step) => (
            <MarketingStaggerItem
              key={step.title}
              as="li"
              className="step-item"
            >
              <div className="step-num" aria-hidden="true">
                <AppIcon icon={step.icon} size={EMPTY_ICON_SIZE} />
              </div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </MarketingStaggerItem>
          ))}
        </MarketingStagger>
      </div>
    </section>
  );
}
