import { createFileRoute } from "@tanstack/react-router";

import { validateSearchParams } from "@/utils/prompt-builder/basic-search-params";

import { PromptBuilderBasic } from "@/components/prompt-builder/PromptBuilderBasic";

export const Route = createFileRoute("/")({
  component: PromptBuilderBasic,
  validateSearch: validateSearchParams,
  ssr: true,
});
