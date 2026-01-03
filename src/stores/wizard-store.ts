import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { distance } from "fastest-levenshtein";

import type { PromptWizardData, StoredPrompt, PromptStorageV2 } from "@/utils/prompt-wizard/schema";
// TOTAL_REQUIRED_STEPS removed
import {
  compress,
  compressPrompt,
  decompress,
  decompressPrompt,
} from "@/utils/prompt-wizard/url-compression";
import { WIZARD_DEFAULTS } from "@/utils/prompt-wizard/search-params";
import { generateSessionId, getOrCreateSessionId } from "@/utils/session";

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEY_V2 = "wizard-prompts-v2";
const MAX_PROMPTS = 15; // LRU limit

// ═══════════════════════════════════════════════════════════════════════════
// V2 STORAGE HELPERS (List-based with LRU)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get default empty v2 storage structure
 */
function getDefaultStorageV2(): PromptStorageV2 {
  return {
    version: "v2",
    prompts: [],
  };
}

/**
 * Load v2 prompts from localStorage
 */
function loadPromptsV2(): PromptStorageV2 {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_V2);
    if (!stored) return getDefaultStorageV2();

    const decompressed = decompress(stored);
    if (!decompressed) return getDefaultStorageV2();

    const parsed = JSON.parse(decompressed) as PromptStorageV2;
    let parsedPrompts = Array.isArray(parsed.prompts)
      ? parsed.prompts.filter((prompt) => {
          if (!prompt.data.task_intent || prompt.data.updatedAt === -1) {
            return false;
          }
          return true;
        })
      : [];
    return {
      version: parsed.version || "v2",
      prompts: parsedPrompts,
    };
  } catch {
    return getDefaultStorageV2();
  }
}

/**
 * Save v2 prompts to localStorage with LRU eviction
 * Most recently saved prompts are kept at the end of the array
 */
function savePromptsV2(storage: PromptStorageV2): void {
  try {
    // LRU: Keep only the last MAX_PROMPTS prompts (most recent at end)
    const truncatedPrompts = storage.prompts.slice(-MAX_PROMPTS);
    const toSave: PromptStorageV2 = {
      version: storage.version,
      prompts: truncatedPrompts,
    };

    const json = JSON.stringify(toSave);
    const compressed = compress(json);
    localStorage.setItem(STORAGE_KEY_V2, compressed);
  } catch {
    // Storage full or unavailable
  }
}

/**
 * Add or update a prompt in v2 storage
 * Deduplicates by task_intent - only keeps one prompt per task_intent
 * Moves the prompt to the end of the list (most recently used)
 */
export function upsertPromptV2(
  data: PromptWizardData,
  callbackMap: {
    noTaskIntent: () => void;
    onSuccess: () => void;
  } = {
    noTaskIntent: () => {},
    onSuccess: () => {},
  },
  opts: {
    shouldExecute: boolean;
  } = {
    shouldExecute: false,
  }
): void {
  if (!opts.shouldExecute) {
    return;
  }
  if (!data.task_intent) {
    callbackMap.noTaskIntent();
    return;
  }
  const distinctId: string = getCurrentDistinctId();
  const storage = loadPromptsV2();
  const storageUpdated = { ...storage };

  const { id, ...dataWithoutId } = data;

  const promptStr = JSON.stringify(dataWithoutId);
  let promptIndex: number = -1;
  let index = 0;
  for (const promptStored of storageUpdated.prompts) {
    const {
      data: { id: _id, ...promptStoredDataWithoutId },
    } = promptStored;
    if (id && _id && id === _id) {
      promptIndex = index;
      break;
    }
    const promptStoredDataString = JSON.stringify(promptStoredDataWithoutId);
    if (promptStoredDataString === promptStr) {
      promptIndex = index;
      break;
    }
    const levenshteinDistanceVal = distance(promptStoredDataString, promptStr);
    if (levenshteinDistanceVal < 10) {
      promptIndex = index;
      break;
    }
    index += 1;
  }
  // Create new stored prompt
  const newPrompt: StoredPrompt = {
    data,
    creator_distinct_id: distinctId,
    storage_version: "v2",
  };
  if (promptIndex === -1) {
    // Add to end (LRU: most recent at end)
    storageUpdated.prompts.push(newPrompt);
  } else {
    storageUpdated.prompts[promptIndex] = newPrompt;
  }
  storageUpdated.prompts = storageUpdated.prompts
    .map((prompt) => {
      if (!prompt.data.id) {
        prompt.data.id = generateSessionId();
      }
      return prompt;
    })
    .sort((a, b) => a.data.updatedAt.valueOf() - b.data.updatedAt.valueOf());

  savePromptsV2(storageUpdated);
  callbackMap.onSuccess();
}

/**
 * Get the current user's distinct_id for ownership tracking
 */
function getCurrentDistinctId(): string {
  return getOrCreateSessionId();
}

/**
 * Delete a prompt from v2 storage by index
 */
function deletePromptV2(index: number): void {
  const storage = loadPromptsV2();
  if (index >= 0 && index < storage.prompts.length) {
    storage.prompts.splice(index, 1);
    savePromptsV2(storage);
  }
}

/**
 * Exported for testing purposes only
 * @internal
 */
export const __testing = {
  STORAGE_KEY_V2,
  MAX_PROMPTS,
  getDefaultStorageV2,
  loadPromptsV2,
  savePromptsV2,
  upsertPromptV2,
  getCurrentDistinctId,
  loadFromStorage, // v1 loader
  deletePromptV2,
};

// ═══════════════════════════════════════════════════════════════════════════
// PROMPT GENERATION
// ═══════════════════════════════════════════════════════════════════════════

const formatMap: Record<string, string> = {
  "1-paragraph": "Provide your response in a single paragraph.",
  "2-paragraphs": "Provide your response in exactly 2 paragraphs.",
  "3-plus-paragraphs": "Provide a detailed response with multiple paragraphs.",
  "bullet-list": "Provide your response as a bulleted list.",
  "numbered-list": "Provide your response as a numbered step-by-step list.",
  table: "Provide your response in a table format.",
  mixed: "Use a combination of paragraphs, lists, and other formatting.",
};

const depthMap: Record<string, string> = {
  brief: "Be concise and direct.",
  moderate: "Provide a balanced response with moderate detail.",
  thorough: "Provide thorough, in-depth analysis.",
};

export function generatePromptText(finalData: PromptWizardData): string {
  if (finalData.updatedAt === -1) {
    return "";
  }
  const sections: string[] = [];

  // 1. Role (Who)
  if (finalData.ai_role) {
    sections.push(`## Role\nAct as: ${finalData.ai_role}`);
  }

  // 2. Task (What)
  if (finalData.task_intent) {
    sections.push(`## Task\n${finalData.task_intent}`);
  }

  // 3. Context (Why/Background)
  if (finalData.context) {
    sections.push(`## Context\n${finalData.context}`);
  }

  if (finalData.examples) {
    sections.push(`## Examples\n${finalData.examples}`);
  }

  // 4. Guardrails (How NOT to do it)
  if (finalData.constraints) {
    sections.push(`## Constraints\n${finalData.constraints}`);
  }

  if (finalData.disallowed_content) {
    sections.push(`## Avoid\n${finalData.disallowed_content}`);
  }

  // 5. Format (How to present it)
  if (finalData.output_format) {
    sections.push(
      `## Output Format\n${formatMap[finalData.output_format] || finalData.output_format}`
    );
  }

  // 6. Refinements (Optional extras)
  if (finalData.reasoning_depth && finalData.reasoning_depth !== "brief") {
    sections.push(`## Reasoning\n${depthMap[finalData.reasoning_depth]}`);
  }

  if (finalData.self_check) {
    sections.push(
      `## Self-Check\nBefore finalizing, verify your response is accurate and complete.`
    );
  }

  return sections.join("\n\n");
}

function generateShareUrl(data: PromptWizardData): string {
  // Only include non-default values
  const filtered = {} as PromptWizardData;
  for (const [key, value] of Object.entries(data)) {
    if (key === "d") continue;
    if (value === undefined || value === null || value === "") continue;
    const defaultVal = WIZARD_DEFAULTS[key as keyof PromptWizardData];
    if (value === defaultVal) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (filtered as any)[key] = value;
  }

  return `/share?d=${compressPrompt(filtered)}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

interface WizardState {
  // Core state
  wizardData: PromptWizardData;
  shareUrl: string | null;
  showError: boolean;
  dataSource: "default" | "localStorage" | "url";
  completedSteps: Record<number, boolean>;

  // Derived (computed on demand)
  isTaskIntentValid: () => boolean;
  isCurrentStepValid: () => boolean;
  getCurrentStepError: () => string | null;
}

interface WizardActions {
  // Actions
  updateData: (updates: Partial<PromptWizardData>) => void;
  goToStep: (step: number) => void;
  setShowError: (show: boolean) => void;
  finish: () => void;
  reset: () => void;
  initialize: (fromUrl?: { d: string; vld: 1 }) => void;
}

export type WizardStore = WizardState & WizardActions;

// ═══════════════════════════════════════════════════════════════════════════
// STORE CREATION
// ═══════════════════════════════════════════════════════════════════════════

export const useWizardStore = create<WizardStore>()(
  subscribeWithSelector((set, get) => ({
    // ─────────────────────────────────────────────────────────────────────────
    // Initial State
    // ─────────────────────────────────────────────────────────────────────────
    wizardData: WIZARD_DEFAULTS,
    shareUrl: null,
    showError: false,
    dataSource: "default",
    completedSteps: {},

    // ─────────────────────────────────────────────────────────────────────────
    // Derived Getters
    // ─────────────────────────────────────────────────────────────────────────
    isTaskIntentValid: () => get().wizardData.task_intent.trim().length >= 10,

    isCurrentStepValid: () => {
      const { wizardData } = get();
      return wizardData.step === 1 ? get().isTaskIntentValid() : true;
    },

    getCurrentStepError: () => {
      const { wizardData } = get();
      if (wizardData.step === 1 && !get().isTaskIntentValid()) {
        return "Please describe what you want (at least 10 characters)";
      }
      return null;
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Actions
    // ─────────────────────────────────────────────────────────────────────────
    initialize: (fromUrl) => {
      if (fromUrl?.d && fromUrl.vld) {
        const { data: decompressed, valid } = decompressPrompt(fromUrl.d, {
          _source_: "wizard-store initialize",
        });
        if (valid && Object.keys(decompressed).length > 1) {
          const completedSteps = Object.fromEntries(
            Array.from({ length: decompressed.step }, (_, i) => [i + 1, true])
          ) as Record<number, boolean>;
          set({
            wizardData: { ...decompressed, examples: "", step: 1, finishedAt: -1 },
            dataSource: "url",
            shareUrl: generateShareUrl(decompressed),
            completedSteps,
          });
          return;
        }
      }
    },

    updateData: (updates) => {
      set((state) => {
        const newData: PromptWizardData = {
          ...state.wizardData,
          ...updates,
          updatedAt: Date.now(),
        };

        return {
          wizardData: newData,
          showError: false,
        };
      });
    },

    // toggleAdvancedMode removed - all 6 steps now always visible

    goToStep: (step) => {
      set((state) => {
        const wizardDataUpdated = {
          ...state.wizardData,
          step,
          updatedAt: Date.now(),
        };
        const completedStepsUpdated = { ...state.completedSteps, [step]: true };
        const url = generateShareUrl(wizardDataUpdated);
        return {
          wizardData: wizardDataUpdated,
          showError: false,
          shareUrl: url,
          completedSteps: completedStepsUpdated,
        };
      });
    },

    setShowError: (show) => set({ showError: show }),

    finish: () => {
      const state = get();
      if (!state.isCurrentStepValid()) {
        set({ showError: true });
        return;
      }

      const url = generateShareUrl(state.wizardData);
      set({ shareUrl: url, wizardData: { ...state.wizardData, finishedAt: Date.now() } });
    },

    reset: () => {
      set({
        wizardData: WIZARD_DEFAULTS,
        shareUrl: null,
        showError: false,
        dataSource: "default",
      });
    },
  }))
);
