import { useState, useCallback, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTrackMixpanel } from "@/utils/analytics/MixpanelProvider";
import type { RoleLandingExample } from "@/data/role-landing-examples";

import { ExamplesSidebar } from "./ExamplesSidebar";
import { PromptPreview } from "./PromptPreview";

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function ChatLandingPage() {
  const trackEvent = useTrackMixpanel();
  const [selectedExample, setSelectedExample] = useState<RoleLandingExample | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Track page view
  useEffect(() => {
    trackEvent("page_viewed_landing_v2", {
      page: "landing_v2",
      timestamp: new Date().toISOString(),
    });
  }, []);

  // Handle example selection
  const handleSelectExample = useCallback((example: RoleLandingExample) => {
    setSelectedExample(example);
    setIsSidebarOpen(false); // Close mobile drawer
    trackEvent("example_selected_v2", {
      page: "landing_v2",
      example_id: example.id,
      example_title: example.title,
    });
  }, []);

  // Handle try click
  const handleTryClick = useCallback((example: RoleLandingExample) => {
    trackEvent("cta_clicked_try_prompt_v2", {
      page: "landing_v2",
      example_id: example.id,
      example_title: example.title,
    });
  }, []);

  // Handle CTA click (when no example selected)
  const handleStartBuilding = useCallback(() => {
    trackEvent("cta_clicked_start_building_v2", {
      page: "landing_v2",
    });
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex-shrink-0 h-16 border-b-4 border-foreground bg-background px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]" />
          <span className="font-black text-lg uppercase tracking-tight text-foreground hidden md:block">
            Prompt Builder
          </span>
        </Link>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden p-2 border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] bg-background"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Desktop CTA */}
        <Button
          asChild
          className={cn(
            "hidden md:flex",
            "uppercase font-black tracking-wide",
            "border-4 border-foreground",
            "shadow-[4px_4px_0px_0px_hsl(var(--foreground))]",
            "hover:-translate-x-0.5 hover:-translate-y-0.5",
            "hover:shadow-[5px_5px_0px_0px_hsl(var(--foreground))]",
            "transition-all duration-200"
          )}
          onClick={handleStartBuilding}
        >
          <Link
            to="/wizard"
            search={{ d: null, vld: 0, partial: false }}
            className="flex items-center gap-2"
          >
            New Prompt
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-80 lg:w-96 border-r-4 border-foreground flex-shrink-0">
          <ExamplesSidebar
            selectedId={selectedExample?.id ?? null}
            onSelect={handleSelectExample}
          />
        </div>

        {/* Mobile Sidebar Drawer */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-foreground/20 z-40 md:hidden"
              />

              {/* Drawer */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed inset-y-0 left-0 w-80 z-50 md:hidden border-r-4 border-foreground bg-background"
              >
                <div className="h-16 border-b-4 border-foreground px-4 flex items-center justify-between">
                  <span className="font-black text-lg uppercase tracking-tight">Examples</span>
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <ExamplesSidebar
                  selectedId={selectedExample?.id ?? null}
                  onSelect={handleSelectExample}
                  className="h-[calc(100%-4rem)]"
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Preview Area */}
        <div className="flex-1 overflow-hidden">
          <PromptPreview example={selectedExample} onTryClick={handleTryClick} />
        </div>
      </div>

      {/* Mobile bottom CTA */}
      <div className="md:hidden flex-shrink-0 p-4 border-t-4 border-foreground bg-background">
        <Button
          asChild
          size="lg"
          className={cn(
            "w-full uppercase font-black tracking-wide",
            "border-4 border-foreground",
            "shadow-[4px_4px_0px_0px_hsl(var(--foreground))]"
          )}
          onClick={handleStartBuilding}
        >
          {selectedExample ? (
            <Link
              to="/wizard"
              search={{ d: selectedExample.d, vld: 1, partial: false }}
              className="flex items-center justify-center gap-2"
            >
              Try This Prompt
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/wizard"
              search={{ d: null, vld: 0, partial: false }}
              className="flex items-center justify-center gap-2"
            >
              Start Building
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </Button>
      </div>
    </div>
  );
}
