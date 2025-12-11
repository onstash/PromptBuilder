import * as Sentry from "@sentry/tanstackstart-react";
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
    trackEvent("page_viewed_landing", {
      page: "landing",
      timestamp: new Date().toISOString(),
    });
  }, []);
  return (
    <main className="bg-background min-h-screen">
      <button
        type="button"
        onClick={() => {
          // Send a test metric before throwing the error
          Sentry.metrics.count("test_counter", 1);
          throw new Error("Sentry Test Error");
        }}
      >
        Break the world
      </button>
      <button
        type="button"
        onClick={async () => {
          await Sentry.startSpan(
            {
              name: "Example Frontend Span",
              op: "test",
            },
            async () => {
              const res = await fetch("/api/sentry-example");
              if (!res.ok) {
                throw new Error("Sentry Example Frontend Error");
              }
            }
          );
        }}
      >
        Test API Error
      </button>
      <Hero />
      <SocialProof show={SHOW_SOCIAL_PROOF} />
      <CTASection />
    </main>
  );
}
