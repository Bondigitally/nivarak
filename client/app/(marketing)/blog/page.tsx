import type { Metadata } from "next";
import { BlogFilters } from "@/features/marketing/components/BlogFilters";
import { MarketingPageHero } from "@/features/marketing/components/MarketingPageHero";
import {
  section,
  visuallyHidden,
  wrap,
} from "@/features/marketing/lib/marketing-classes";
import { cn } from "@/lib/utils";
import "@/features/marketing/components/BlogFilters.blog.css";

export const metadata: Metadata = {
  title: {
    absolute: "Blog | Nivarak",
  },
  description:
    "Articles from the Nivarak team on fall risk, caregiving conversations, and keeping older adults independent longer.",
};

export default function BlogPage() {
  return (
    <main id="main">
      <MarketingPageHero
        eyebrowText="Blog"
        titleId="blog-hero"
        title="From the Nivarak desk."
        body="Short reads from our clinicians on fall risk, hard conversations at home, and what families can do before a crisis."
      />

      <section className={cn(section, "blog")} aria-labelledby="featured-title">
        <div className={wrap}>
          <h2 id="featured-title" className={visuallyHidden}>
            Featured post
          </h2>
          <BlogFilters />
        </div>
      </section>
    </main>
  );
}
