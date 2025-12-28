import { CardGrid, STORED_PROMPT_ACTIONS } from "@/components/ui/CardGrid";
import { type MixpanelDataEvent, useTrackMixpanel } from "@/utils/analytics/MixpanelProvider";
import {
  usePromptsWithFallback,
  getWizardLink,
  getShareLink,
  type PromptCardItem,
} from "@/hooks/usePromptsWithFallback";

export function ExamplesShowcase() {
  const trackEvent = useTrackMixpanel();
  const { items, source, title, subtitle } = usePromptsWithFallback();

  // For stored prompts: show View + Edit buttons
  if (source === "stored") {
    return (
      <CardGrid
        items={items}
        title={title}
        subtitle={subtitle}
        emptyMessage="No prompts saved yet"
        actions={[
          {
            ...STORED_PROMPT_ACTIONS.view,
            getLink: getShareLink,
            onClick: (item: PromptCardItem) => {
              trackEvent("cta_clicked_copy_prompt" as MixpanelDataEvent, {
                page: "landing",
                prompt_id: item.id,
              });
            },
          },
          {
            ...STORED_PROMPT_ACTIONS.edit,
            getLink: getWizardLink,
            onClick: (item: PromptCardItem) => {
              trackEvent("cta_clicked_copy_prompt" as MixpanelDataEvent, {
                page: "landing",
                prompt_id: item.id,
              });
            },
          },
        ]}
      />
    );
  }

  // For examples: single click to wizard
  return (
    <CardGrid
      items={items}
      title={title}
      subtitle={subtitle}
      actionLabel="Try it"
      getItemLink={getWizardLink}
      onItemClick={(item: PromptCardItem) => {
        trackEvent(`cta_clicked_${item.id}` as MixpanelDataEvent, {
          page: "landing",
          example_id: item.id,
          example_title: item.title,
        });
      }}
    />
  );
}
