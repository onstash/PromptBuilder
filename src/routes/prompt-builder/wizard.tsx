import { createFileRoute } from "@tanstack/react-router";
import { PromptBuilderWizard } from "@/components/prompt-builder/PromptBuilderWizard";


export const Route = createFileRoute("/prompt-builder/wizard")({
  component: PromptBuilderWizard,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      s: Number(search.s) || 1,
      p: (search.p as string) || "",
      cp: (search.cp as string) || "",
      t: (search.t as string) || "",
      c: (search.c as string) || "",
      f: (search.f as string) || "",
      cf: (search.cf as string) || "",
    };
  },
});
