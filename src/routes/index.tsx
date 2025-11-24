import { createFileRoute } from "@tanstack/react-router";

import { validateSearchParams } from "@/utils/prompt-builder/basic-search-params";

import { PromptBuilderBasic } from "@/components/prompt-builder/PromptBuilderBasic";

export const Route = createFileRoute("/")({
  component: PromptBuilderBasic,
  validateSearch: (
    search: Record<string, unknown>
  ): ReturnType<typeof validateSearchParams> => {
    const id = performance.now();
    console.log(`[${id}][validateSearch][path: "/"] search`, search);
    const result = validateSearchParams(search);
    console.log(
      `[${id}][validateSearch][path: "/"]
       result`,
      result
    );
    return result;
  },
  ssr: true,
});
