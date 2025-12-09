import { createFileRoute } from "@tanstack/react-router";
import { PromptBuilderAdvanced } from "@/components/prompt-builder/PromptBuilderAdvanced";
import { validateSearchParams } from "@/utils/prompt-builder/advanced-search-params";

export const Route = createFileRoute("/prompt-builder/advanced")({
  component: PromptBuilderAdvanced,
  validateSearch: (
    search: Record<string, unknown>,
  ): ReturnType<typeof validateSearchParams> => {
    const id = performance.now();
    console.log(
      `[${id}][validateSearch][path: "/prompt-builder/advanced"] search`,
      search,
    );
    const result = validateSearchParams(search);
    console.log(
      `[${id}][validateSearch][path: "/prompt-builder/advanced"]
         result`,
      result,
    );
    return result;
  },
  ssr: true,
});
