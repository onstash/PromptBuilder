import { Hero } from "./Hero";
import { SocialProof } from "./SocialProof";
import { CTASection } from "./CTASection";

// Toggle this to show/hide fake social proof stats
const SHOW_SOCIAL_PROOF = false;

export function LandingPage() {
  return (
    <main className="bg-background min-h-screen">
      <Hero />
      <SocialProof show={SHOW_SOCIAL_PROOF} />
      <CTASection />
    </main>
  );
}
