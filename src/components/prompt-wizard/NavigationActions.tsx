import { Link } from "@tanstack/react-router";
import { Plus, Home } from "lucide-react";

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
    <div className="py-4 px-4 md:px-[5%] flex justify-between gap-4 flex-wrap">
      <Button
        variant="outline"
        asChild
        onClick={() => trackEvent("cta_clicked_back_to_home", { page })}
      >
        <Link to="/" className="font-mono text-sm">
          <Home className="w-4 h-4" />
        </Link>
      </Button>
      <Button
        asChild
        onClick={() => {
          trackEvent("cta_clicked_create_new_prompt", { page });
          reset();
        }}
      >
        <Link
          to="/wizard"
          search={{ d: null, vld: 0, partial: false }}
          className="font-mono text-sm"
        >
          <Plus className="w-4 h-4" />
          Create New
        </Link>
      </Button>
    </div>
  );
}
