import { Hero } from "./Hero";
import { FeaturesGrid } from "./FeaturesGrid";
import { HowItWorks } from "./HowItWorks";
import { UseCases } from "./UseCases";
import { CTASection } from "./CTASection";

export function LandingPage() {
  return (
    <main className="bg-background">
      <Hero />
      <FeaturesGrid />
      <HowItWorks />
      <UseCases />
      <CTASection />

      {/* Footer */}
      <footer className="py-8 px-6 bg-foreground text-background">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-mono uppercase tracking-wider">
            © 2024 Prompt Builder
          </p>
          <div className="flex gap-6 font-mono text-sm uppercase tracking-wider">
            <a
              href="https://github.com"
              className="hover:text-primary transition-colors underline underline-offset-4"
            >
              GitHub
            </a>
            <a
              href="#"
              className="hover:text-primary transition-colors underline underline-offset-4"
            >
              Docs
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
