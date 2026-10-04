import type { Metadata } from "next";
import { BlogFilters } from "@/features/marketing/components/BlogFilters";
import { MarketingPageHero } from "@/features/marketing/components/MarketingPageHero";
import { MarketingReveal } from "@/features/marketing/components/MarketingReveal";
import {
  section,
  visuallyHidden,
  wrap,
} from "@/features/marketing/lib/marketing-classes";
import { cn } from "@/lib/utils";
import "@/features/marketing/components/sections/what-is.css";

export const metadata: Metadata = {
  title: {
    absolute: "Blog — Nivarak Insights on Independent Aging",
  },
  description:
    "Insights on healthy aging, caregiving, and medically-led independent aging from the Nivarak team.",
};

export default function BlogPage() {
  return (
    <main id="main">
      <MarketingPageHero
        eyebrowText="Blog"
        titleId="blog-hero"
        title="Insights on Independent Aging."
        body="Practical guidance for families and caregivers — from early signs to everyday support."
      />

      <section className={cn(section, "what-is")} aria-labelledby="featured-title">
        <div className={wrap}>
          <h2 id="featured-title" className={visuallyHidden}>
            Featured post
          </h2>
          <MarketingReveal>
            <BlogFilters />
          </MarketingReveal>
        </div>
      </section>
    </main>
  );
}
