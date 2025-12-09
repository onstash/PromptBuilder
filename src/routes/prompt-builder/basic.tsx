import { createFileRoute, ErrorComponent } from "@tanstack/react-router";

import { PromptBuilderBasic } from "@/components/prompt-builder/PromptBuilderBasic";

export const Route = createFileRoute("/prompt-builder/basic")({
  component: PromptBuilderBasic,
  errorComponent: ({ error }) => {
    return <ErrorComponent error={error} />;
  },
});
