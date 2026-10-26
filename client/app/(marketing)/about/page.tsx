import type { Metadata } from "next";
import Image from "next/image";
import { BorderBeam } from "@/components/ui/border-beam";
import { ArrowFillButton } from "@/features/marketing/components/ArrowFillButton";
import { Icon } from "@/features/marketing/components/Icon";
import { MarketingPageHero } from "@/features/marketing/components/MarketingPageHero";
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
  sectionHeadBody,
  sectionHeadTitle,
  wrap,
} from "@/features/marketing/lib/marketing-classes";
import { cn } from "@/lib/utils";
import "@/features/marketing/components/sections/about.css";
import "@/features/marketing/components/sections/what-is.css";
import "@/features/marketing/components/sections/challenge.css";
import "@/features/marketing/components/sections/experts.css";
import "@/features/marketing/components/sections/final-cta.css";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Nivarak’s mission to help older adults age independently with medically-led care, the Independent Aging Score™, and a family-first approach.",
};

const PILLARS = [
  {
    icon: "i-eye",
    title: "Proactive, not reactive",
    body: "We look for small shifts before they become emergencies.",
    ring: "what-card-ring-lavender",
  },
  {
    icon: "i-hand-heart",
    title: "Whole-person",
    body: "Mobility, mind, mood, nutrition, sleep: not just a single symptom.",
    ring: "what-card-ring-blush",
  },
  {
    icon: "i-family",
    title: "Family-inclusive",
    body: "Adult children stay informed and involved, wherever they live.",
    ring: "what-card-ring-periwinkle",
  },
  {
    icon: "i-heart",
    title: "Medically-led",
    body: "Clinicians guide every assessment, score, and care plan.",
    ring: "what-card-ring-lavender",
  },
] as const;

const USPS = [
  {
    icon: "i-dial",
    title: "Independent Aging Score™",
    body: "Our proprietary score turns complex health into one clear, trackable number.",
  },
  {
    icon: "i-clipboard",
    title: "Built on the CGA standard",
    body: "Grounded in Comprehensive Geriatric Assessment principles, adapted for continuous care.",
  },
  {
    icon: "i-monitor",
    title: "Continuous monitoring",
    body: "Not a one-time checkup: ongoing visibility so trends don't go unnoticed.",
  },
  {
    icon: "i-users",
    title: "Family-first communication",
    body: "Updates designed for the people who love and support the person in care.",
  },
  {
    icon: "i-leaf",
    title: "Preventive, not just responsive",
    body: "Focused on staying well and independent, not only reacting after a crisis.",
  },
] as const;

const VALUES = [
  {
    title: "Clarity",
    body: "We translate complex health into language families can use and act on.",
  },
  {
    title: "Dignity",
    body: "Every check-in respects the person's pace, privacy, and independence.",
  },
  {
    title: "Steadiness",
    body: "Care is continuous. Families shouldn't have to chase updates or guess alone.",
  },
  {
    title: "Clinical integrity",
    body: "Medical standards guide our tools, including the Independent Aging Score™.",
  },
] as const;

export default function AboutPage() {
  return (
    <main id="main">
      <MarketingPageHero
        eyebrowText="About Us"
        titleId="about-hero"
        title="Built so families can stop guessing and start knowing."
        body="Nivarak was founded on a simple belief: growing older should not mean losing independence. We exist to catch the quiet changes early, and to walk alongside families with clear, medically-led care."
      />

      <section className={cn(section, "challenge")} aria-labelledby="story-title">
        <div className={cn(wrap, "story-block")}>
          <MarketingReveal className="story-copy" direction="left">
            <p className={eyebrow}>Our Story</p>
            <h2 id="story-title" className={sectionHeadTitle}>
              From clinical insight to a new kind of aging care
            </h2>
          </MarketingReveal>
          <MarketingReveal className="story-copy" delay={0.1} direction="right">
            <p className={sectionHeadBody}>
              In [Founding year], Nivarak began with a question familiar to many
              families: why do we only see the full picture of a parent&apos;s
              health after a crisis?
            </p>
            <p className={sectionHeadBody}>
              Drawing on clinical experience in [specialty / practice context],
              our founders set out to create a care model that sits between
              routine doctor visits and hospital care: proactive, continuous,
              and built around independence at home.
            </p>
            <p className={sectionHeadBody}>
              Today, Nivarak partners with older adults and their families
              through assessment, the Independent Aging Score™, personalized
              plans, and ongoing monitoring. [Expand with real founding
              narrative.]
            </p>
          </MarketingReveal>
        </div>
      </section>

      <section className={cn(section, "what-is")} aria-labelledby="mission-title">
        <div className={wrap}>
          <div className="mission-block">
            <MarketingReveal className="mission-copy" direction="left">
              <p className={eyebrow}>Our Mission &amp; Approach</p>
              <h2 id="mission-title" className={sectionHeadTitle}>
                Independence, protected by clarity
              </h2>
              <p className={sectionHeadBody}>
                Our mission is to help older adults age independently, with
                confidence, by making whole-person health visible, actionable,
                and continuously supported for families.
              </p>
            </MarketingReveal>
            <MarketingStagger className="pillars-grid" stagger={0.1}>
              {PILLARS.map((pillar) => (
                <MarketingStaggerItem key={pillar.title} as="article">
                  <div className={cn(card, "what-card group", pillar.ring)}>
                    <div
                      className={cn(
                        cardIcon,
                        "what-card-icon",
                        "group-hover:bg-[var(--what-ring)] group-hover:text-[var(--color-text-primary)]",
                      )}
                      aria-hidden="true"
                    >
                      <Icon name={pillar.icon} />
                    </div>
                    <h3 className={cardTitle}>{pillar.title}</h3>
                    <p className={cardBody}>{pillar.body}</p>
                  </div>
                </MarketingStaggerItem>
              ))}
            </MarketingStagger>
          </div>
        </div>
      </section>

      <section className={cn(section, "why")} aria-labelledby="usp-title">
        <div className={wrap}>
          <MarketingReveal className={sectionHead}>
            <p className={cn(eyebrow, eyebrowCenter)}>Why Nivarak</p>
            <h2 id="usp-title" className={sectionHeadTitle}>
              What sets us apart
            </h2>
          </MarketingReveal>
          <MarketingStagger className="usp-grid" stagger={0.1}>
            {USPS.map((usp) => (
              <MarketingStaggerItem
                key={usp.title}
                as="article"
                className="usp-card"
              >
                <div className="card-icon" aria-hidden="true">
                  <Icon name={usp.icon} />
                </div>
                <h3>{usp.title}</h3>
                <p>{usp.body}</p>
              </MarketingStaggerItem>
            ))}
          </MarketingStagger>
        </div>
      </section>

      <section
        className={cn(section, "experts")}
        id="team"
        aria-labelledby="team-title"
      >
        <div className={wrap}>
          <MarketingReveal className={sectionHead}>
            <p className={cn(eyebrow, eyebrowCenter)}>Meet the Full Team</p>
            <h2 id="team-title" className={sectionHeadTitle}>
              People behind the care
            </h2>
            <p className={sectionHeadBody}>
              Clinicians and operators united by one goal: healthier, more
              independent aging.
            </p>
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
                  sizes="(max-width: 744px) 200px, 240px"
                  loading="lazy"
                />
              </div>
              <h3>Dr. Meetali</h3>
              <p className="role">Founder, Nivarak</p>
              <p className="bio">
                Nephrologist · 15+ Years in Healthcare · Trained in the UK
              </p>
              <BorderBeam
                size={120}
                duration={8}
                borderWidth={2}
                colorFrom="#ffffff"
                colorTo="rgba(255, 255, 255, 0.35)"
              />
            </article>
          </MarketingReveal>
        </div>
      </section>

      <section className={cn(section, "what-is")} aria-labelledby="values-title">
        <div className={wrap}>
          <MarketingReveal className={sectionHead}>
            <p className={cn(eyebrow, eyebrowCenter)}>Our Values</p>
            <h2 id="values-title" className={sectionHeadTitle}>
              How we show up for families
            </h2>
          </MarketingReveal>
          <MarketingStagger className="values-grid" stagger={0.1}>
            {VALUES.map((value) => (
              <MarketingStaggerItem
                key={value.title}
                as="article"
                className="value-card"
              >
                <h3>{value.title}</h3>
                <p>{value.body}</p>
              </MarketingStaggerItem>
            ))}
          </MarketingStagger>
        </div>
      </section>

      <section className={cn(section, "final-cta")} aria-labelledby="about-cta">
        <MarketingStagger className={wrap} stagger={0.1}>
          <MarketingStaggerItem>
            <h2 id="about-cta">Ready to take the next step?</h2>
          </MarketingStaggerItem>
          <MarketingStaggerItem>
            <p>
              Book an assessment and see how Nivarak can support your family.
            </p>
          </MarketingStaggerItem>
          <MarketingStaggerItem>
            <ArrowFillButton
              text="Contact Us"
              href="/contact#contact"
              variant="inverse"
            />
          </MarketingStaggerItem>
        </MarketingStagger>
      </section>
    </main>
  );
}
