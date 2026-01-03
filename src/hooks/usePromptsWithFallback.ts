import { useState, useCallback, useMemo } from "react";
import { FileText } from "lucide-react";

import type { CardItem } from "@/components/ui/CardGrid";
import { __testing } from "@/stores/wizard-store";
import { EXAMPLE_PROMPTS } from "@/data/example-prompts";
import { compressPrompt } from "@/utils/prompt-wizard/url-compression";
import type { PromptWizardData } from "@/utils/prompt-wizard";

const { loadPromptsV2, deletePromptV2 } = __testing;

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface StoredPromptCardItem extends CardItem {
  compressedData: string;
  originalIndex: number; // Track original index for deletion
  currentPrompt?: PromptWizardData;
}

export interface ExamplePromptCardItem extends CardItem {
  compressedData: string;
  originalIndex: number;
}

export type PromptCardItem = StoredPromptCardItem | ExamplePromptCardItem;

export interface UsePromptsWithFallbackResult {
  items: PromptCardItem[];
  source: "stored" | "examples";
  title: string;
  subtitle: string;
  handleDelete: (item: PromptCardItem) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function loadStoredPrompts(): { items: StoredPromptCardItem[]; source: "stored" | null } {
  // 1. Try v2 prompts first
  const v2Storage = loadPromptsV2();
  if (v2Storage.prompts.length > 0) {
    const items: StoredPromptCardItem[] = v2Storage.prompts
      .filter((prompt) => {
        if (!prompt.data.task_intent || prompt.data.updatedAt === -1) {
          return false;
        }
        return true;
      })
      .map((prompt, index) => {
        return {
          id: `stored-v2-${index}`,
          title: prompt.data.task_intent,
          description: prompt.data.context,
          icon: FileText,
          color: "bg-primary",
          compressedData: compressPrompt({ ...prompt.data, examples: "", step: 1, finishedAt: -1 }),
          originalIndex: index,
        };
      });

    // Deduplicate by taskIntent - keep only the last occurrence (most recent)
    const seen = new Set<string>();
    const deduped = items.reverse().filter((item) => {
      if (!item.title || seen.has(item.title)) return false;
      seen.add(item.title);
      return true;
    });

    return { items: deduped, source: "stored" };
  }

  return { items: [], source: null };
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Returns stored prompts if any exist (v2 or v1), otherwise EXAMPLE_PROMPTS
 * Priority: v2 prompts → v1 prompt → examples
 * Filters out the current prompt being edited if provided
 */
export function usePromptsWithFallback(
  opts: { includeExamples: boolean; currentPrompt?: PromptWizardData } = {
    includeExamples: true,
    currentPrompt: undefined,
  }
): UsePromptsWithFallbackResult {
  const [allItems, setAllItems] = useState<PromptCardItem[]>(() => {
    const { items: storedItems } = loadStoredPrompts();
    if (storedItems.length > 0) return storedItems;

    if (!opts.includeExamples) return [];

    // Fallback to examples
    return EXAMPLE_PROMPTS.map((example, index) => ({
      id: example.id,
      title: example.title,
      description: example.description,
      icon: example.icon,
      color: example.color,
      compressedData: example.d,
      originalIndex: index,
    }));
  });

  // Filter out current prompt being edited (reactive to currentPrompt changes)
  const currentTaskIntent = opts.currentPrompt?.task_intent?.trim().toLowerCase();
  const items = useMemo(() => {
    if (!currentTaskIntent) return allItems;
    return allItems.filter((item) => {
      const itemTaskIntent = (item as StoredPromptCardItem).title;
      return itemTaskIntent !== currentTaskIntent;
    });
  }, [allItems, currentTaskIntent]);

  const [source] = useState<"stored" | "examples">(() => {
    const { source } = loadStoredPrompts();
    return source || "examples";
  });

  const handleDelete = useCallback((item: PromptCardItem) => {
    // Delete from storage using the original index stored in the item
    deletePromptV2(item.originalIndex);
    // Update local state to trigger re-render
    setAllItems((prev) => prev.filter((i) => i.id !== item.id));
  }, []);

  const title =
    source === "stored" ? (items.length === 1 ? "Your Prompt" : "Your Prompts") : "Try an Example";

  const subtitle =
    source === "stored"
      ? "Continue where you left off"
      : "Click any example to see it in action. Edit and make it yours.";

  return {
    items,
    source,
    title,
    subtitle,
    handleDelete,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// LINK HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get wizard route params for a prompt
 */
export function getWizardLink(item: PromptCardItem): {
  to: "/wizard";
  search: { d: string; vld: 1 };
} {
  return {
    to: "/wizard",
    search: { d: item.compressedData, vld: 1 },
  };
}

/**
 * Get share route params for a prompt
 */
export function getShareLink(item: PromptCardItem): {
  to: "/share";
  search: { d: string; vld: 1 };
} {
  return {
    to: "/share",
    search: { d: item.compressedData, vld: 1 },
  };
}
