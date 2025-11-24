import { createFileRoute, ErrorComponent } from "@tanstack/react-router";

import { validateSearchParams } from "@/utils/prompt-builder/basic-search-params";

import { PromptBuilderBasic } from "@/components/prompt-builder/PromptBuilderBasic";

export const Route = createFileRoute("/prompt-builder/basic")({
  component: PromptBuilderBasic,
  // validateSearch: (search: Record<string, unknown>): ReturnType<typeof validateSearchParams> => {
  //   const id = performance.now();
  //   console.log(`[${id}][validateSearch][path: "/prompt-builder/basic"] search`, search);
  //   const result = validateSearchParams(search);
  //   console.log(`[${id}][validateSearch][path: "/prompt-builder/basic"] result`, result);
  //   return result;
  // },
  // ssr: true,
  errorComponent: ({ error }) => {
    // if (error instanceof Error) {
    //   // Render a custom error message
    //   return <div>{error.message}</div>
    // }

    // Fallback to the default ErrorComponent
    return <ErrorComponent error={error} />
  },
});
