import type { Metadata } from "next";
import { HomePageContent } from "@/features/marketing/components/HomePageContent";

export const metadata: Metadata = {
  title: {
    absolute: "Nivarak - Helping Older Adults Age Independently",
  },
  description:
    "Nivarak is your partner in independent aging - medically-led assessment, Independent Aging Score™, and continuous monitoring for older adults and their families.",
};

export default function MarketingHomePage() {
  return <HomePageContent />;
}
