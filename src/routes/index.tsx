import { createFileRoute } from "@tanstack/react-router";

import { ChatLandingPage } from "@/components/landing/v2/ChatLandingPage"; // v2
import { ErrorComponentWithSentry } from "@/components/ErrorComponentWithSentry";
import { TestGeminiButton } from "@/components/TestGeminiButton";

// ═══════════════════════════════════════════════════════════════════════════
// ROUTE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Landing page with A/B testing
 *
 * Assignment logic (see src/utils/ab-testing.ts):
 * 1. URL parameter (?version=v2) - Manual override
 * 2. Environment variable (VITE_LANDING_VERSION=v2) - Global default
 * 3. localStorage - Previously assigned version
 * 4. Session ID hash - Deterministic 50/50 split
 * 5. Default - v1
 */
function LandingRouter() {
  // return (
  //   <div className="relative">
  //     <div className="fixed bottom-4 right-4 z-50">
  //       <TestGeminiButton />
  //     </div>
  //     <ChatLandingPage />
  //   </div>
  // );
  return <ChatLandingPage />;
}

import { z } from "zod";

const searchSchema = z.object({
  role: z.string().optional(),
  exampleId: z.string().optional(),
});

export const Route = createFileRoute("/")({
  component: LandingRouter,
  validateSearch: searchSchema,
  errorComponent: ErrorComponentWithSentry,
});
