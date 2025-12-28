import { useMemo } from "react";
import { FileText } from "lucide-react";

import type { CardItem } from "@/components/ui/CardGrid";
import { __testing } from "@/stores/wizard-store";
import { EXAMPLE_PROMPTS } from "@/data/example-prompts";
import { compress } from "@/utils/prompt-wizard/url-compression";

const { loadPromptsV2, loadFromStorage } = __testing;

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface StoredPromptCardItem extends CardItem {
  compressedData: string;
}

export interface ExamplePromptCardItem extends CardItem {
  compressedData: string;
}

export type PromptCardItem = StoredPromptCardItem | ExamplePromptCardItem;

export interface UsePromptsWithFallbackResult {
  items: PromptCardItem[];
  source: "stored" | "examples";
  title: string;
  subtitle: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Returns stored prompts if any exist (v2 or v1), otherwise EXAMPLE_PROMPTS
 * Priority: v2 prompts → v1 prompt → examples
 */
export function usePromptsWithFallback(
  opts: { includeExamples: boolean } = {
    includeExamples: true,
  }
): UsePromptsWithFallbackResult {
  return useMemo(() => {
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
        };
      });

      return {
        items: items.reverse(), // Most recent first
        source: "stored" as const,
        title: "Your Prompts",
        subtitle: "Continue where you left off",
      };
    }

    // 2. Try v1 prompt (single prompt in wizard-draft)
    const [v1Data, v1Source] = loadFromStorage();
    if (v1Source === "localStorage" && v1Data.task_intent) {
      const taskIntent = v1Data.task_intent;
      const title = taskIntent.length > 40 ? `${taskIntent.slice(0, 40)}...` : taskIntent;
      const description = v1Data.context?.slice(0, 80) || "No context provided";

      const items: StoredPromptCardItem[] = [
        {
          id: "stored-v1-0",
          title,
          description,
          icon: FileText,
          color: "bg-primary",
          compressedData: compress(JSON.stringify(v1Data)),
        },
      ];

      return {
        items,
        source: "stored" as const,
        title: "Your Prompt",
        subtitle: "Continue where you left off",
      };
    }

    if (!opts.includeExamples) {
      return {
        items: [],
        source: "stored" as const,
        title: "Your Prompts",
        subtitle: "Continue where you left off",
      };
    }

    // 3. Fallback to examples
    const items: ExamplePromptCardItem[] = EXAMPLE_PROMPTS.map((example) => ({
      id: example.id,
      title: example.title,
      description: example.description,
      icon: example.icon,
      color: example.color,
      compressedData: example.d,
    }));

    return {
      items,
      source: "examples" as const,
      title: "Try an Example",
      subtitle: "Click any example to see it in action. Edit and make it yours.",
    };
  }, []);
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
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
