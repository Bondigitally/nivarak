import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion } from "@/features/marketing/components/FaqAccordion";
import { Icon } from "@/features/marketing/components/Icon";
import { MarketingPageHero } from "@/features/marketing/components/MarketingPageHero";
import { MarketingReveal } from "@/features/marketing/components/MarketingReveal";
import {
  MarketingStagger,
  MarketingStaggerItem,
} from "@/features/marketing/components/MarketingStagger";
import {
  btnOutlineInverse,
  section,
  visuallyHidden,
  wrap,
} from "@/features/marketing/lib/marketing-classes";
import { cn } from "@/lib/utils";
import "@/features/marketing/components/sections/faq.css";
import "@/features/marketing/components/sections/final-cta.css";

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "Answers to common questions about Nivarak assessments, the Independent Aging Score™, family involvement, and how our care works alongside your doctors.",
};

export default function FaqPage() {
  return (
    <main id="main" className="faq-page">
      <MarketingPageHero
        eyebrowText="FAQs"
        titleId="faq-hero"
        title="Common questions, clear answers."
        body="Everything families ask before booking an assessment, from how the first visit works to staying involved from abroad."
      />

      <section className={section} aria-labelledby="faq-title">
        <div className={wrap}>
          <h2 id="faq-title" className={visuallyHidden}>
            Frequently asked questions
          </h2>
          <MarketingReveal>
            <FaqAccordion />
          </MarketingReveal>
        </div>
      </section>

      <section className={cn(section, "final-cta")} aria-labelledby="faq-cta">
        <MarketingStagger className={wrap} stagger={0.1}>
          <MarketingStaggerItem>
            <h2 id="faq-cta">Still have a question?</h2>
          </MarketingStaggerItem>
          <MarketingStaggerItem>
            <p>
              Reach out and we&apos;ll help you decide if Nivarak is the right
              fit for your family.
            </p>
          </MarketingStaggerItem>
          <MarketingStaggerItem>
            <Link className={btnOutlineInverse} href="/contact">
              Contact Us <Icon name="i-arrow" />
            </Link>
          </MarketingStaggerItem>
        </MarketingStagger>
      </section>
    </main>
  );
}
