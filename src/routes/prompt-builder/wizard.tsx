import { createFileRoute } from "@tanstack/react-router";

import { PromptWizard } from "@/components/prompt-wizard/PromptWizard";

export const Route = createFileRoute("/prompt-builder/wizard")({
  component: PromptWizard,
});
