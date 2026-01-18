import { createFileRoute, redirect } from "@tanstack/react-router";

import { ErrorComponentWithSentry } from "@/components/ErrorComponentWithSentry";
import { validateWizardSearch } from "@/utils/prompt-wizard/search-params";
import { migrateShareLink } from "@/functions/migrate-share";

export const Route = createFileRoute("/share")({
  component: ShareRouteComponent,
  validateSearch: validateWizardSearch,
  errorComponent: ErrorComponentWithSentry,
  loaderDeps: ({ search: { d, vld } }) => ({ d, vld }),
  loader: async ({ deps: { d, vld } }) => {
    // If we have data, try to migrate it
    if (d && vld) {
      try {
        const { slug } = await migrateShareLink({ data: { d, vld } });

        if (slug) {
          throw redirect({
            to: "/prompts/$slug",
            params: { slug },
          });
        }
      } catch (error) {
        // If migration fails (e.g. invalid data), we fall through to component
        // which handles invalid state
        if (error instanceof Response) throw error; // Re-throw redirects
        console.error("Migration failed:", error);
      }
    }
  },
});

function ShareRouteComponent() {
  // If we're here, either:
  // 1. No data provided (invalid URL)
  // 2. Migration failed
  // 3. Decompression failed (invalid data)

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border-4 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))] p-8 text-center">
          <h1 className="text-2xl font-black uppercase mb-4">Invalid Share Link</h1>
          <p className="text-muted-foreground mb-6">
            This share link is invalid, expired, or could not be migrated.
          </p>
          <a
            href="/wizard"
            className="inline-block bg-primary text-primary-foreground font-bold uppercase px-6 py-3 border-4 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] transition-all"
          >
            Create New Prompt
          </a>
        </div>
      </div>
    </div>
  );
}
