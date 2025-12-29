import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useMemo } from "react";
import * as Sentry from "@sentry/tanstackstart-react";

import { decompress } from "@/utils/prompt-wizard/url-compression";
import { WIZARD_DEFAULTS } from "@/utils/prompt-wizard/search-params";
import {
  promptWizardSchema,
  partialPromptWizardSchema,
  type PromptWizardSearchParamsCompressed,
  type PromptWizardData,
} from "@/utils/prompt-wizard/schema";
import { WizardPreview } from "@/components/prompt-wizard/WizardPreview";
import { ErrorComponentWithSentry } from "@/components/ErrorComponentWithSentry";

// Validate and decompress the ?d= parameter
// Supports both complete and partial (draft) prompts
function validateShareSearch(search: Record<string, unknown>): PromptWizardSearchParamsCompressed {
  try {
    console.log("validateShareSearch", { search });
    if (typeof search.d !== "string" || !search.d) {
      console.log("validateShareSearch", {
        search,
        error: "Invalid share link - missing or invalid data [1]",
      });
      Sentry.captureException(new Error("Invalid share link - missing or invalid data [1]"), {
        tags: { feature: "share_link_validation" },
        extra: { compressedData: search.d ?? null },
      });
      throw new Error("Invalid share link - missing or invalid data");
    }
    const json = decompress(search.d);
    if (!json) {
      console.log("validateShareSearch", {
        search,
        error: "Invalid share link - invalid data [2]",
      });
      Sentry.captureException(new Error("Invalid share link - invalid data [2]"), {
        tags: { feature: "share_link_validation" },
        extra: { compressedData: search.d ?? null },
      });
      throw new Error("Invalid share link - invalid data");
    }

    const parsed = JSON.parse(json) as Partial<PromptWizardData>;
    console.log("validateShareSearch", {
      search,
      parsed,
    });

    // Try full validation first (complete prompt)
    const fullResult = promptWizardSchema.safeParse({
      ...WIZARD_DEFAULTS,
      ...parsed,
    });
    console.log("validateShareSearch", {
      search,
      parsed,
      fullResult,
    });

    if (fullResult.success) {
      return { d: search.d, vld: 1, partial: false };
    }

    // Fall back to partial validation (draft/incomplete prompt)
    const partialResult = partialPromptWizardSchema.safeParse(parsed);
    console.log("validateShareSearch partial validation", {
      search,
      parsed,
      partialResult,
    });

    if (partialResult.success) {
      return { d: search.d, vld: 1, partial: true };
    }

    Sentry.captureException(new Error("Invalid share link - schema validation failed [3]"), {
      tags: { feature: "share_link_validation" },
      extra: { compressedData: search.d ?? null, json, parsed, fullResult, partialResult },
    });
    throw new Error("Invalid share link - schema validation failed");
  } catch (error) {
    return { d: null, vld: 0, partial: false };
  }
}

export const Route = createFileRoute("/share")({
  component: ShareRouteComponent,
  validateSearch: validateShareSearch,
  errorComponent: ErrorComponentWithSentry,
});

function ShareRouteComponent() {
  const { d, vld } = useSearch({ from: "/share" });

  // Reconstruct the share URL from current location
  const shareUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return window.location.pathname + window.location.search;
    }
    return null;
  }, []);

  if (!d || !vld) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border-4 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))] p-8 text-center">
            <h1 className="text-2xl font-black uppercase mb-4">Invalid Share Link</h1>
            <p className="text-muted-foreground mb-6">
              This share link is invalid or has expired. The prompt data could not be decoded.
            </p>
            <Link
              to="/wizard"
              search={{ d: null, vld: 0, partial: false }}
              className="inline-block bg-primary text-primary-foreground font-bold uppercase px-6 py-3 border-4 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] transition-all"
            >
              Create New Prompt
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <WizardPreview data={d} compressed source="share" shareUrl={shareUrl ?? ""} />
      </div>
    </div>
  );
}
