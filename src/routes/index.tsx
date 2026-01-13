import { createFileRoute } from "@tanstack/react-router";

import { LandingPage } from "@/components/landing/LandingPage"; // v1
import { ChatLandingPage } from "@/components/landing/v2/ChatLandingPage"; // v2
import { ErrorComponentWithSentry } from "@/components/ErrorComponentWithSentry";
import { getLandingVersion } from "@/utils/ab-testing";

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
  const version = getLandingVersion();
  return version === "v2" ? <ChatLandingPage /> : <LandingPage />;
}

export const Route = createFileRoute("/")({
  component: LandingRouter,
  errorComponent: ErrorComponentWithSentry,
});
