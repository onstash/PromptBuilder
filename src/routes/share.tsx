import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useMemo } from "react";

import { WizardPreview } from "@/components/prompt-wizard/WizardPreview";
import { ErrorComponentWithSentry } from "@/components/ErrorComponentWithSentry";
import { validateWizardSearch } from "@/utils/prompt-wizard/search-params";

export const Route = createFileRoute("/share")({
  component: ShareRouteComponent,
  validateSearch: validateWizardSearch,
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
