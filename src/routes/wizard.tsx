import { createFileRoute, ErrorComponent } from "@tanstack/react-router";

import { PromptWizard } from "@/components/prompt-wizard/PromptWizard";
import { validateWizardSearch } from "@/utils/prompt-wizard/search-params";

export const Route = createFileRoute("/wizard")({
  validateSearch: validateWizardSearch,
  component: PromptWizard,
  errorComponent: ErrorComponent,
});
