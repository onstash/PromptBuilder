import { CardGrid, STORED_PROMPT_ACTIONS } from "@/components/ui/CardGrid";
import { type MixpanelDataEvent, useTrackMixpanel } from "@/utils/analytics/MixpanelProvider";
import {
  usePromptsWithFallback,
  getWizardLink,
  getShareLink,
  type PromptCardItem,
} from "@/hooks/usePromptsWithFallback";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

export function ExamplesShowcase() {
  const trackEvent = useTrackMixpanel();
  const {
    items,
    source,
    title,
    subtitle,
    handleDelete: handleDeleteFromHook,
  } = usePromptsWithFallback();

  const [itemToDelete, setItemToDelete] = useState<PromptCardItem | null>(null);

  const handleDeleteClick = useCallback((item: PromptCardItem) => {
    setItemToDelete(item);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!itemToDelete) return;

    handleDeleteFromHook(itemToDelete);
    trackEvent("stored_prompt_deleted" as MixpanelDataEvent, {
      page: "landing",
      prompt_id: itemToDelete.id,
      prompt_title: itemToDelete.title,
    });
    toast.success("Prompt deleted");
    setItemToDelete(null);
  }, [itemToDelete, handleDeleteFromHook, trackEvent]);

  const handleCancelDelete = useCallback(() => {
    setItemToDelete(null);
  }, []);

  // For stored prompts: show View + Edit buttons
  if (source === "stored") {
    return (
      <>
        <CardGrid
          items={items}
          title={title}
          subtitle={subtitle}
          columns={2}
          layout="horizontal"
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
            {
              ...STORED_PROMPT_ACTIONS.delete,
              onClick: handleDeleteClick,
            },
          ]}
        />
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && handleCancelDelete()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this prompt?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{itemToDelete?.title}". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
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
