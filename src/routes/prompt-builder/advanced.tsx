import { createFileRoute } from "@tanstack/react-router";
import { PromptBuilderAdvanced } from "@/components/prompt-builder/PromptBuilderAdvanced";
// import { validatePromptBuilderAdvancedSearchParams } from "@/utils/prompt-builder/advanced-search-params";

export const Route = createFileRoute("/prompt-builder/advanced")({
  component: PromptBuilderAdvanced,
  // validateSearch: validatePromptBuilderAdvancedSearchParams,
  ssr: true,
});
