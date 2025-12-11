import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useMemo } from "react";

import { decompress } from "@/utils/prompt-wizard/url-compression";
import { WIZARD_DEFAULTS } from "@/utils/prompt-wizard/search-params";
import {
  promptWizardSchema,
  type PromptWizardData,
} from "@/utils/prompt-wizard/schema";
import { WizardPreview } from "@/components/prompt-wizard/WizardPreview";

// Validate and decompress the ?d= parameter
function validateShareSearch(search: Record<string, unknown>): {
  data: PromptWizardData | null;
} {
  if (typeof search.d !== "string" || !search.d) {
    return { data: null };
  }

  try {
    const json = decompress(search.d);
    if (!json) return { data: null };

    const parsed = JSON.parse(json) as Partial<PromptWizardData>;
    const result = promptWizardSchema.safeParse({
      ...WIZARD_DEFAULTS,
      ...parsed,
    });

    if (result.success) {
      return { data: result.data };
    }
    return { data: null };
  } catch {
    return { data: null };
  }
}

export const Route = createFileRoute("/share")({
  component: ShareRouteComponent,
  validateSearch: validateShareSearch,
});

function ShareRouteComponent() {
  const { data } = useSearch({ from: "/share" });
  const navigate = useNavigate({ from: "/share" });

  // Reconstruct the share URL from current location
  const shareUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return window.location.pathname + window.location.search;
    }
    return null;
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border-4 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))] p-8 text-center">
            <h1 className="text-2xl font-black uppercase mb-4">
              Invalid Share Link
            </h1>
            <p className="text-muted-foreground mb-6">
              This share link is invalid or has expired. The prompt data could
              not be decoded.
            </p>
            <a
              href="/prompt-builder/wizard"
              className="inline-block bg-primary text-primary-foreground font-bold uppercase px-6 py-3 border-4 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] transition-all"
            >
              Create New Prompt
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <WizardPreview
          data={data}
          shareUrl={shareUrl}
          onClose={() => {
            navigate({ to: "/wizard" });
          }}
          source="share"
        />
      </div>
    </div>
  );
}
