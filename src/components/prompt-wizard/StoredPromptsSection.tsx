import { useState, useCallback } from "react";
import { toast } from "sonner";

import { CardGrid, STORED_PROMPT_ACTIONS } from "@/components/ui/CardGrid";
import { type MixpanelDataEvent, useTrackMixpanel } from "@/utils/analytics/MixpanelProvider";
import {
  usePromptsWithFallback,
  getWizardLink,
  getShareLink,
  type PromptCardItem,
} from "@/hooks/usePromptsWithFallback";
import { __testing } from "@/stores/wizard-store";

const { deletePromptV2 } = __testing;

interface StoredPromptsSectionProps {
  page: string;
  columns?: 2 | 3;
}

/**
 * Renders stored prompts grid ONLY if user has stored prompts.
 * Returns null if no stored prompts (no fallback to examples).
 */
export function StoredPromptsSection({ page, columns = 2 }: StoredPromptsSectionProps) {
  const trackEvent = useTrackMixpanel();
  const { items, source, title, subtitle } = usePromptsWithFallback({ includeExamples: false });
  const [, forceUpdate] = useState(0);

  const handleDelete = useCallback(
    (item: PromptCardItem) => {
      // Extract the original index from the id (e.g., "stored-v2-5" → 5)
      const idParts = item.id.split("-");
      const originalIndex = parseInt(idParts[idParts.length - 1], 10);

      deletePromptV2(originalIndex);
      trackEvent("stored_prompt_deleted" as MixpanelDataEvent, {
        page,
        prompt_id: item.id,
        prompt_title: item.title,
      });
      toast.success("Prompt deleted");
      // Force re-render to show updated list
      forceUpdate((n) => n + 1);
    },
    [page, trackEvent]
  );

  // Only show if we have stored prompts (not examples fallback)
  if (source !== "stored") {
    return null;
  }

  if (!items || !items.length) {
    return null;
  }

  return (
    <CardGrid
      items={items}
      title={title}
      subtitle={subtitle}
      columns={columns}
      actions={[
        {
          ...STORED_PROMPT_ACTIONS.view,
          getLink: getShareLink,
          onClick: (item: PromptCardItem) => {
            trackEvent("stored_prompt_viewed" as MixpanelDataEvent, {
              page,
              prompt_id: item.id,
              prompt_title: item.title,
            });
          },
        },
        {
          ...STORED_PROMPT_ACTIONS.edit,
          getLink: getWizardLink,
          onClick: (item: PromptCardItem) => {
            trackEvent("stored_prompt_edited" as MixpanelDataEvent, {
              page,
              prompt_id: item.id,
              prompt_title: item.title,
            });
          },
        },
        {
          ...STORED_PROMPT_ACTIONS.delete,
          onClick: handleDelete,
        },
      ]}
    />
  );
}
