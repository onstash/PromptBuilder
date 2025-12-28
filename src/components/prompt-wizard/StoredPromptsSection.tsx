import { useState, useCallback } from "react";
import { toast } from "sonner";

import { CardGrid, STORED_PROMPT_ACTIONS } from "@/components/ui/CardGrid";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { type MixpanelDataEvent, useTrackMixpanel } from "@/utils/analytics/MixpanelProvider";
import {
  usePromptsWithFallback,
  getWizardLink,
  getShareLink,
  type PromptCardItem,
} from "@/hooks/usePromptsWithFallback";
import type { PromptWizardData } from "@/utils/prompt-wizard";

interface StoredPromptsSectionProps {
  page: string;
  columns?: 2 | 3;
  currentPrompt?: PromptWizardData;
}

/**
 * Renders stored prompts grid ONLY if user has stored prompts.
 * Returns null if no stored prompts (no fallback to examples).
 */
export function StoredPromptsSection({
  page,
  columns = 2,
  currentPrompt,
}: StoredPromptsSectionProps) {
  const trackEvent = useTrackMixpanel();
  const {
    items,
    source,
    title,
    subtitle,
    handleDelete: handleDeleteFromHook,
  } = usePromptsWithFallback({ includeExamples: false, currentPrompt });

  const [itemToDelete, setItemToDelete] = useState<PromptCardItem | null>(null);

  const handleDeleteClick = useCallback((item: PromptCardItem) => {
    setItemToDelete(item);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!itemToDelete) return;

    handleDeleteFromHook(itemToDelete);
    trackEvent("stored_prompt_deleted" as MixpanelDataEvent, {
      page,
      prompt_id: itemToDelete.id,
      prompt_title: itemToDelete.title,
    });
    toast.success("Prompt deleted");
    setItemToDelete(null);
  }, [itemToDelete, handleDeleteFromHook, trackEvent, page]);

  const handleCancelDelete = useCallback(() => {
    setItemToDelete(null);
  }, []);

  // Only show if we have stored prompts (not examples fallback)
  if (source !== "stored" || !items || !items.length) {
    return null;
  }

  return (
    <>
      <CardGrid
        items={items}
        title={title}
        subtitle={subtitle}
        columns={columns}
        layout="horizontal"
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
