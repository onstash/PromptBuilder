import { Hero } from "./Hero";
import { SocialProof } from "./SocialProof";
import { CTASection } from "./CTASection";
import { useEffect } from "react";
import { useTrackMixpanel } from "@/utils/analytics/MixpanelProvider";

// Toggle this to show/hide fake social proof stats
const SHOW_SOCIAL_PROOF = false;

export function LandingPage() {
  const trackEvent = useTrackMixpanel();

  useEffect(() => {
    // Track landing page view with session ID automatically included
    trackEvent("page_view", {
      page: "landing",
      timestamp: new Date().toISOString(),
    });
  }, []);
  return (
    <main className="bg-background min-h-screen">
      <Hero />
      <SocialProof show={SHOW_SOCIAL_PROOF} />
      <CTASection />
    </main>
  );
}
