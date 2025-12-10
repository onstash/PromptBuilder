import { createFileRoute, ErrorComponent } from "@tanstack/react-router";

import { validateWizardSearch } from "@/utils/prompt-wizard/search-params";
import { PromptWizard } from "@/components/prompt-wizard/PromptWizard";

export const Route = createFileRoute("/prompt-builder/wizard")({
  component: PromptWizard,
  validateSearch: validateWizardSearch,
  errorComponent: ({ error }) => {
    return <ErrorComponent error={error} />;
  },
});
