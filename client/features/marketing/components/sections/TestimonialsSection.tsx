"use client";

import { QuoteIcon } from "@hugeicons/core-free-icons";
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
import { ICON_SIZE } from "@/lib/icons";
import { cn } from "@/lib/utils";
import "@/features/marketing/components/sections/testimonials.css";

const TESTIMONIALS = [
  {
    name: "Ananya Sharma",
    quote:
      "It feels like a relative who is a highly qualified physician visits with my parents regularly to ensure that they remain in good health and receive the best medical care possible.",
    avatar: "AS",
    rel: "Daughter of a Nivarak member",
    tilt: "testi-card-tilt-a",
  },
  {
    name: "Rohan Mehta",
    quote:
      "Having a dedicated doctor looking after my mother who sees the whole medical picture including meds and takes a preventative approach to health care rather than a reactive one.",
    avatar: "RM",
    rel: "Son of a Nivarak member",
    tilt: "testi-card-tilt-b",
  },
  {
    name: "Kavita Iyer",
    quote:
      "Think of it as an insurance policy - you hope you don't have to use it for emergencies, but when you do, know that it always comes through for you.",
    avatar: "KI",
    rel: "Daughter of a Nivarak member",
    tilt: "testi-card-tilt-c",
  },
  {
    name: "Arjun Kapoor",
    quote:
      "Proactive healthcare for aging parents that gives you peace of mind and a chance at preventing or delaying the onset of serious illness as much as possible.",
    avatar: "AK",
    rel: "Son of a Nivarak member",
    tilt: "testi-card-tilt-a",
  },
  {
    name: "Neha Banerjee",
    quote:
      "Nivarak is a trustworthy, reliable service that you can use to reduce the burden of caring for your parents from afar.",
    avatar: "NB",
    rel: "Family member, based overseas",
    tilt: "testi-card-tilt-b",
  },
  {
    name: "Aditya Rao",
    quote:
      "Peace of mind about parents' healthcare and a better relationship with parents as Nivarak removes tension related to medical topics.",
    avatar: "AR",
    rel: "Son of a Nivarak member",
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
    <figure className={cn("testi-card", tilt)}>
      <div className="testi-quote-mark" aria-hidden="true">
        <AppIcon icon={QuoteIcon} size={ICON_SIZE} />
      </div>
      <blockquote className="quote">
        <p>{quote}</p>
      </blockquote>
      <figcaption className="testi-who">
        <div className="testi-avatar" aria-hidden="true">
          {avatar}
        </div>
        <div>
          <div className="tw-name">{name}</div>
          <div className="tw-rel">{rel}</div>
        </div>
      </figcaption>
    </figure>
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
