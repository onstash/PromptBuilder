import { Link } from "@tanstack/react-router";
import { Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTrackMixpanel } from "@/utils/analytics/MixpanelProvider";
import { useWizardStore } from "@/stores/wizard-store";

interface NavigationActionsProps {
  page: string;
}

/**
 * Navigation actions: Back To Home + Create New Prompt
 * Reusable across wizard and share pages
 */
export function NavigationActions({ page }: NavigationActionsProps) {
  const trackEvent = useTrackMixpanel();
  const reset = useWizardStore((state) => state.reset);

  return (
    <div className="py-4 px-4 md:px-[5%] flex items-center justify-between gap-4 flex-wrap border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-10">
      {/* Branding - Links to Home */}
      <Link
        to="/"
        className="flex items-center gap-3 select-none hover:opacity-80 transition-opacity cursor-pointer"
        onClick={() => trackEvent("cta_clicked_back_to_home", { page })}
      >
        <div className="p-2 border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] bg-secondary rounded-md">
          <Sparkles className="w-5 h-5 text-foreground" />
        </div>
        <h1 className="text-xl font-black uppercase tracking-tight text-foreground hidden sm:block">
          Prompt
          <span className="text-primary ml-1">Builder</span>
        </h1>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          asChild
          onClick={() => {
            trackEvent("cta_clicked_create_new_prompt", { page });
            reset();
          }}
          className="uppercase font-bold text-xs shadow-[2px_2px_0px_0px_hsl(var(--foreground))]"
        >
          <Link to="/wizard" search={{ d: null, vld: 0, partial: false }}>
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Link>
        </Button>
      </div>
    </div>
  );
}
