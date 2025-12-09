import { createFileRoute, ErrorComponent } from "@tanstack/react-router";

import { validateSearchParams } from "@/utils/prompt-builder/basic-search-params";
import { PromptBuilderBasic } from "@/components/prompt-builder/PromptBuilderBasic";

export const Route = createFileRoute("/prompt-builder/basic")({
  component: PromptBuilderBasic,
  validateSearch: validateSearchParams,
  errorComponent: ({ error }) => {
    return <ErrorComponent error={error} />;
  },
});
