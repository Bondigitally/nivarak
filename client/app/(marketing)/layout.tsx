import type { Metadata } from "next";
import { MarketingHashScroll } from "@/features/marketing/components/MarketingHashScroll";
import { SiteFooter } from "@/features/marketing/components/SiteFooter";
import { SiteHeader } from "@/features/marketing/components/SiteHeader";
import { skipLink } from "@/features/marketing/lib/marketing-classes";
import "@/features/marketing/styles/tokens.css";
import "@/features/marketing/styles/base.css";

export const metadata: Metadata = {
  title: {
    default: "Nivarak — Helping Older Adults Age Independently",
    template: "%s — Nivarak",
  },
  description:
    "Nivarak is your partner in independent aging — medically-led assessment, Independent Aging Score™, and continuous monitoring for older adults and their families.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing-site">
      <MarketingHashScroll />
      <a className={skipLink} href="#main">
        Skip to content
      </a>
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
