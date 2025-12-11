import { createFileRoute } from "@tanstack/react-router";

import { PromptWizard } from "@/components/prompt-wizard/PromptWizard";
import { validateWizardSearch } from "@/utils/prompt-wizard/search-params";
import { ErrorComponentWithSentry } from "@/components/ErrorComponentWithSentry";

export const Route = createFileRoute("/wizard")({
  validateSearch: validateWizardSearch,
  component: PromptWizard,
  errorComponent: ErrorComponentWithSentry,
});
