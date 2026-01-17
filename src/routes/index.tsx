import { createFileRoute } from "@tanstack/react-router";

import { ChatLandingPage } from "@/components/landing/v2/ChatLandingPage"; // v2
import { ErrorComponentWithSentry } from "@/components/ErrorComponentWithSentry";

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
  return <ChatLandingPage />;
}

import { z } from "zod";

const searchSchema = z.object({
  role: z.string().optional(),
  exampleId: z.string().optional(),
  version: z.string().optional().catch("v2"), // Default to v2 if anything goes wrong, though AB test might override
});

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  component: LandingRouter,
  errorComponent: ErrorComponentWithSentry,
});
