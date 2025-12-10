import { Hero } from "./Hero";
import { FeaturesGrid } from "./FeaturesGrid";
import { HowItWorks } from "./HowItWorks";
import { UseCases } from "./UseCases";
import { CTASection } from "./CTASection";

export function LandingPage() {
  return (
    <main className="bg-slate-900 min-h-screen">
      <Hero />
      <FeaturesGrid />
      <HowItWorks />
      <UseCases />
      <CTASection />

      {/* Footer */}
      <footer className="py-8 px-6 bg-slate-900 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © 2024 Prompt Builder. Built with TanStack.
          </p>
          <div className="flex gap-6">
            <a
              href="https://github.com"
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              GitHub
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              Documentation
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
