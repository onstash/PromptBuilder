import { createFileRoute } from "@tanstack/react-router";

import { validateSearchParams } from "@/utils/search-params";

import { InstructionBuilderPage } from "@/components/InstructionBuilderPage";

export const Route = createFileRoute("/")({
  component: InstructionBuilderPage,
  validateSearch: (search: Record<string, unknown>): ReturnType<typeof validateSearchParams> => {
    const id = performance.now();
    console.log(`[${id}][validateSearch] search`, search);
    const result = validateSearchParams(search);
    console.log(`[${id}][validateSearch] result`, result);
    return result;
  },
  ssr: true,
});

