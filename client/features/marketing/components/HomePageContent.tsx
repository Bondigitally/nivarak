import { ChallengeSection } from "@/features/marketing/components/sections/ChallengeSection";
import { CheckScoreSection } from "@/features/marketing/components/ScoreCheckForm";
import { ExpertsSection } from "@/features/marketing/components/sections/ExpertsSection";
import { FinalCtaSection } from "@/features/marketing/components/sections/FinalCtaSection";
import { HeroSection } from "@/features/marketing/components/sections/HeroSection";
import { HowItWorksSection } from "@/features/marketing/components/sections/HowItWorksSection";
import { PresenceSection } from "@/features/marketing/components/sections/PresenceSection";
import { ScoreSection } from "@/features/marketing/components/sections/ScoreSection";
import { TestimonialsSection } from "@/features/marketing/components/sections/TestimonialsSection";
import { WhatIsSection } from "@/features/marketing/components/sections/WhatIsSection";

export function HomePageContent() {
  return (
    <main id="main">
      <HeroSection />
      <ChallengeSection />
      <WhatIsSection />
      <ScoreSection />
      <CheckScoreSection />
      <HowItWorksSection />
      <ExpertsSection />
      <TestimonialsSection />
      <FinalCtaSection />
      <PresenceSection />
    </main>
  );
}
