"use client";

import { StarIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { Marquee } from "@/components/ui/marquee";
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
    tilt: "testi-card-tilt-a",
  },
  {
    name: "Vikram Patil",
    quote:
      "My father was flagged for a nutrition and mobility risk before it turned into a fall. That early call from the care team meant everything.",
    avatar: "VP",
    rel: "Son of a Nivarak member",
    tilt: "testi-card-tilt-b",
  },
  {
    name: "Sanjay Nair",
    quote:
      "I live abroad, so knowing someone medically qualified is checking in on my parents regularly has given our whole family real peace of mind.",
    avatar: "SN",
    rel: "Family member, based overseas",
    tilt: "testi-card-tilt-c",
  },
] as const;

function TestimonialCard({
  name,
  quote,
  avatar,
  rel,
  tilt,
}: (typeof TESTIMONIALS)[number]) {
  return (
    <article className={cn("testi-card", tilt)}>
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
      <p className="quote">&ldquo;{quote}&rdquo;</p>
      <div className="testi-who">
        <div className="testi-avatar" aria-hidden="true">
          {avatar}
        </div>
        <div>
          <div className="tw-name">{name}</div>
          <div className="tw-rel">{rel}</div>
        </div>
      </div>
    </article>
  );
}

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
            Real stories from Pune families who trust Nivarak for proactive,
            medically led care at home.
          </p>
        </MarketingReveal>

        <div className="testi-marquee-shell">
          <Marquee
            pauseOnHover
            repeat={4}
            className="testi-marquee [--duration:45s] [--gap:var(--space-24)]"
          >
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </Marquee>
          <div
            className="testi-marquee-fade testi-marquee-fade-left"
            aria-hidden
          />
          <div
            className="testi-marquee-fade testi-marquee-fade-right"
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}
