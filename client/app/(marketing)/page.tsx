import type { Metadata } from "next";
import { HomePageContent } from "@/features/marketing/components/HomePageContent";

export const metadata: Metadata = {
  title: {
    absolute:
      "Nivarak - Personalized Care for Older Adults to Live Independently, Longer",
  },
  description:
    "Nivarak helps older adults stay independent at home with proactive health assessments, personalized care plans, and continuous support—while giving families greater confidence in their loved one's well-being.",
};

export default function MarketingHomePage() {
  return <HomePageContent />;
}
