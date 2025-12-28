import { useState, useCallback } from "react";
import { FileText } from "lucide-react";

import type { CardItem } from "@/components/ui/CardGrid";
import { __testing } from "@/stores/wizard-store";
import { EXAMPLE_PROMPTS } from "@/data/example-prompts";
import { compress } from "@/utils/prompt-wizard/url-compression";

const { loadPromptsV2, loadFromStorage, deletePromptV2 } = __testing;

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface StoredPromptCardItem extends CardItem {
  compressedData: string;
  originalIndex: number; // Track original index for deletion
  taskIntent?: string; // For deduplication
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
    const items: StoredPromptCardItem[] = v2Storage.prompts.map((prompt, index) => {
      const taskIntent = prompt.data.task_intent || "";
      const title =
        taskIntent.length > 40 ? `${taskIntent.slice(0, 40)}...` : taskIntent || "Untitled";
      const description = prompt.data.context?.slice(0, 80) || "No context provided";

      return {
        id: `stored-v2-${index}`,
        title,
        description,
        icon: FileText,
        color: "bg-primary",
        compressedData: compress(JSON.stringify(prompt.data)),
        originalIndex: index,
        taskIntent: taskIntent.trim().toLowerCase(), // For deduplication
      };
    });

    // Deduplicate by taskIntent - keep only the last occurrence (most recent)
    const seen = new Set<string>();
    const deduped = items.reverse().filter((item) => {
      if (!item.taskIntent || seen.has(item.taskIntent)) return false;
      seen.add(item.taskIntent);
      return true;
    });

    return { items: deduped, source: "stored" };
  }

  // 2. Try v1 prompt (single prompt in wizard-draft)
  const [v1Data, v1Source] = loadFromStorage();
  if (v1Source === "localStorage" && v1Data.task_intent) {
    const taskIntent = v1Data.task_intent;
    const title = taskIntent.length > 40 ? `${taskIntent.slice(0, 40)}...` : taskIntent;
    const description = v1Data.context?.slice(0, 80) || "No context provided";

    return {
      items: [
        {
          id: "stored-v1-0",
          title,
          description,
          icon: FileText,
          color: "bg-primary",
          compressedData: compress(JSON.stringify(v1Data)),
          originalIndex: 0,
        },
      ],
      source: "stored",
    };
  }

  return { items: [], source: null };
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Returns stored prompts if any exist (v2 or v1), otherwise EXAMPLE_PROMPTS
 * Priority: v2 prompts → v1 prompt → examples
 */
export function usePromptsWithFallback(
  opts: { includeExamples: boolean } = { includeExamples: true }
): UsePromptsWithFallbackResult {
  const [items, setItems] = useState<PromptCardItem[]>(() => {
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

  const [source] = useState<"stored" | "examples">(() => {
    const { source } = loadStoredPrompts();
    return source || "examples";
  });

  const handleDelete = useCallback((item: PromptCardItem) => {
    // Delete from storage using the original index stored in the item
    deletePromptV2(item.originalIndex);
    // Update local state to trigger re-render
    setItems((prev) => prev.filter((i) => i.id !== item.id));
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
