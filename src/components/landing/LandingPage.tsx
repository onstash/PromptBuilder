import { Hero } from "./Hero";
import { SocialProof } from "./SocialProof";
import { FeaturesGrid } from "./FeaturesGrid";
import { HowItWorks } from "./HowItWorks";
import { ExamplesShowcase } from "./ExamplesShowcase";
import { UseCases } from "./UseCases";
import { CTASection } from "./CTASection";
import { Footer } from "./Footer";
import { useEffect } from "react";
import { useTrackMixpanel } from "@/utils/analytics/MixpanelProvider";

// Toggle this to show/hide fake social proof stats
const SHOW_SOCIAL_PROOF = false;

export function LandingPage() {
  const trackEvent = useTrackMixpanel();

  useEffect(() => {
    trackEvent("page_viewed_landing", {
      page: "landing",
      timestamp: new Date().toISOString(),
    });
  }, []);

  return (
    <main className="bg-background min-h-screen">
      <Hero />
      <SocialProof show={SHOW_SOCIAL_PROOF} />
      <FeaturesGrid />
      <HowItWorks />
      <ExamplesShowcase />
      <UseCases />
      <CTASection />
      <Footer />
    </main>
  );
}
