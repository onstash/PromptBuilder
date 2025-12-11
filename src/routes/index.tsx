import { createFileRoute } from "@tanstack/react-router";

import { LandingPage } from "@/components/landing/LandingPage";
import { ErrorComponentWithSentry } from "@/components/ErrorComponentWithSentry";

export const Route = createFileRoute("/")({
  component: LandingPage,
  errorComponent: ErrorComponentWithSentry,
});
