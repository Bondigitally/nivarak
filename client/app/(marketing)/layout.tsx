import type { Metadata } from "next";
import { MarketingHashScroll } from "@/features/marketing/components/MarketingHashScroll";
import { SiteFooter } from "@/features/marketing/components/SiteFooter";
import { SiteHeader } from "@/features/marketing/components/SiteHeader";
import { skipLink } from "@/features/marketing/lib/marketing-classes";
import "@/features/marketing/styles/tokens.css";
import "@/features/marketing/styles/base.css";

export const metadata: Metadata = {
  title: {
    default:
      "Nivarak — Personalized Care for Older Adults to Live Independently, Longer",
    template: "%s — Nivarak",
  },
  description:
    "Nivarak helps older adults stay independent at home with proactive health assessments, personalized care plans, and continuous support—while giving families greater confidence in their loved one's well-being.",
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
