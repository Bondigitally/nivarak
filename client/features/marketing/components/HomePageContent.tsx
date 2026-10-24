import dynamic from "next/dynamic";
import { MarketingHomePreload } from "@/features/marketing/components/MarketingHomePreload";
import { ChallengeSection } from "@/features/marketing/components/sections/ChallengeSection";
import { HeroSection } from "@/features/marketing/components/sections/HeroSection";
import { HowItWorksSection } from "@/features/marketing/components/sections/HowItWorksSection";
import { WhatIsSection } from "@/features/marketing/components/sections/WhatIsSection";

/**
 * Below-fold sections (score ring, experts photo, presence map, etc.) load as
 * separate client chunks so the first paint isn’t blocked by their JS.
 */
const ScoreSection = dynamic(() =>
  import("@/features/marketing/components/sections/ScoreSection").then(
    (m) => ({ default: m.ScoreSection }),
  ),
);
const ExpertsSection = dynamic(() =>
  import("@/features/marketing/components/sections/ExpertsSection").then(
    (m) => ({ default: m.ExpertsSection }),
  ),
);
const TestimonialsSection = dynamic(() =>
  import("@/features/marketing/components/sections/TestimonialsSection").then(
    (m) => ({ default: m.TestimonialsSection }),
  ),
);
const FinalCtaSection = dynamic(() =>
  import("@/features/marketing/components/sections/FinalCtaSection").then(
    (m) => ({ default: m.FinalCtaSection }),
  ),
);
const PresenceSection = dynamic(() =>
  import("@/features/marketing/components/sections/PresenceSection").then(
    (m) => ({ default: m.PresenceSection }),
  ),
);

export function HomePageContent() {
  return (
    <MarketingHomePreload>
      <main id="main">
        <HeroSection />
        <ChallengeSection />
        <WhatIsSection />
        <ScoreSection />
        <HowItWorksSection />
        <ExpertsSection />
        <TestimonialsSection />
        <FinalCtaSection />
        <PresenceSection />
      </main>
    </MarketingHomePreload>
  );
}
