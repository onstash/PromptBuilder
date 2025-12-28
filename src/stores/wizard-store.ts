import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import type { PromptWizardData, StoredPrompt, PromptStorageV2 } from "@/utils/prompt-wizard/schema";
import { TOTAL_REQUIRED_STEPS } from "@/utils/prompt-wizard/schema";
import { compress, decompress } from "@/utils/prompt-wizard/url-compression";
import { decompressFullState, WIZARD_DEFAULTS } from "@/utils/prompt-wizard/search-params";
import { getOrCreateSessionId } from "@/utils/session";

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = "wizard-draft";
const SHARE_URL_KEY = "wizard-share-url";
const STORAGE_KEY_V2 = "wizard-prompts-v2";
const MAX_PROMPTS = 15; // LRU limit

// ═══════════════════════════════════════════════════════════════════════════
// LOCAL STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if a string is valid JSON (uncompressed legacy format)
 */
function isValidJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Load wizard data from localStorage with auto-detection for compressed/uncompressed data
 * Backward compatible: handles both legacy raw JSON and new compressed format
 */
function loadFromStorage(): [PromptWizardData, "default" | "localStorage"] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [WIZARD_DEFAULTS, "default"];

    let json: string;

    // Auto-detect: if it starts with '{', it's legacy uncompressed JSON
    if (isValidJson(stored)) {
      json = stored;
    } else {
      // New compressed format - decompress first
      const decompressed = decompress(stored);
      if (!decompressed) return [WIZARD_DEFAULTS, "default"];
      json = decompressed;
    }

    return [{ ...WIZARD_DEFAULTS, ...JSON.parse(json) }, "localStorage"];
  } catch {
    return [WIZARD_DEFAULTS, "default"];
  }
}

/**
 * Save wizard data to localStorage using LZ-String compression
 * Reduces storage size by ~30-50% compared to raw JSON
 */
function saveToStorage(data: PromptWizardData): void {
  try {
    const json = JSON.stringify(data);
    const compressed = compress(json);
    localStorage.setItem(STORAGE_KEY, compressed);
  } catch {
    // Storage full or unavailable
  }
}

function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SHARE_URL_KEY);
  } catch {
    // Ignore
  }
}

function saveShareUrl(url: string): void {
  try {
    localStorage.setItem(SHARE_URL_KEY, url);
  } catch {
    // Ignore
  }
}

function getShareUrl(): string | null {
  try {
    return localStorage.getItem(SHARE_URL_KEY);
  } catch {
    return null;
  }
}

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

    let json: string;
    if (isValidJson(stored)) {
      json = stored;
    } else {
      const decompressed = decompress(stored);
      if (!decompressed) return getDefaultStorageV2();
      json = decompressed;
    }

    const parsed = JSON.parse(json) as PromptStorageV2;
    return {
      version: parsed.version || "v2",
      prompts: Array.isArray(parsed.prompts) ? parsed.prompts : [],
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
 * Moves the prompt to the end of the list (most recently used)
 */
function upsertPromptV2(data: PromptWizardData, distinctId: string): void {
  const storage = loadPromptsV2();

  // Create new stored prompt
  const newPrompt: StoredPrompt = {
    data,
    creator_distinct_id: distinctId,
    storage_version: "v2",
  };

  // For simplicity, add to end (LRU: most recent at end)
  // Note: Without an ID field, we're treating each save as a new prompt
  // If you want to dedupe, you'd need to add ID or hash-based matching
  storage.prompts.push(newPrompt);

  savePromptsV2(storage);
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
  thorough: "Provide thorough, in-depth analysis.",
};

export function generatePromptText(finalData: PromptWizardData): string {
  if (finalData.updatedAt === -1) {
    return "";
  }
  const sections: string[] = [];

  if (finalData.task_intent) {
    sections.push(`## Task\n${finalData.task_intent}`);
  }

  if (finalData.context) {
    sections.push(`## Context\n${finalData.context}`);
  }

  if (finalData.constraints) {
    sections.push(`## Constraints\n${finalData.constraints}`);
  }

  const audienceLabel =
    finalData.target_audience === "custom" ? finalData.custom_audience : finalData.target_audience;
  if (audienceLabel) {
    sections.push(`## Target Audience\n${audienceLabel}`);
  }

  if (finalData.output_format) {
    sections.push(
      `## Output Format\n${formatMap[finalData.output_format] || finalData.output_format}`
    );
  }

  if (finalData.ai_role) {
    sections.push(`## Your Role\nAct as: ${finalData.ai_role}`);
  }

  if (finalData.tone_style) {
    sections.push(`## Tone\nUse a ${finalData.tone_style} tone.`);
  }

  if (finalData.reasoning_depth && finalData.reasoning_depth !== "moderate") {
    sections.push(`## Reasoning\n${depthMap[finalData.reasoning_depth]}`);
  }

  if (finalData.self_check) {
    sections.push(
      `## Self-Check\nBefore finalizing, verify your response is accurate and complete.`
    );
  }

  if (finalData.disallowed_content) {
    sections.push(`## Avoid\n${finalData.disallowed_content}`);
  }

  return sections.join("\n\n");
}

function generateShareUrl(data: PromptWizardData): string {
  // Only include non-default values
  const filtered: Partial<PromptWizardData> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === "d") continue;
    if (value === undefined || value === null || value === "") continue;
    const defaultVal = WIZARD_DEFAULTS[key as keyof PromptWizardData];
    if (value === defaultVal) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (filtered as any)[key] = value;
  }

  const json = JSON.stringify(filtered);
  const compressed = compress(json);
  return `/share?d=${compressed}`;
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
  toggleAdvancedMode: () => void;
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
    shareUrl: getShareUrl(),
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
        const decompressed = decompressFullState(fromUrl.d);
        if (Object.keys(decompressed).length > 1) {
          const completedSteps = Object.fromEntries(
            Array.from({ length: decompressed.step }, (_, i) => [i + 1, true])
          ) as Record<number, boolean>;
          set({
            wizardData: { ...decompressed, step: 1 },
            dataSource: "url",
            shareUrl: getShareUrl(),
            completedSteps,
          });
          return;
        }
      }

      const [dataFromLocalStorage, source] = loadFromStorage();
      const completedSteps = Object.fromEntries(
        Array.from({ length: dataFromLocalStorage.step }, (_, i) => [i + 1, true])
      ) as Record<number, boolean>;

      set({
        wizardData: { ...dataFromLocalStorage, step: 1 },
        dataSource: source,
        shareUrl: getShareUrl(),
        completedSteps,
      });
    },

    updateData: (updates) => {
      set((state) => {
        const newData: PromptWizardData = {
          ...state.wizardData,
          ...updates,
          updatedAt: Date.now(),
        };

        // If disabling advanced mode while on step > 5, go to step 5
        if (updates.show_advanced === false && state.wizardData.step > 5) {
          newData.step = 5;
        }

        return {
          wizardData: newData,
          showError: false,
        };
      });
    },

    toggleAdvancedMode: () => {
      set((state) => {
        const showAdvancedUpdated = !state.wizardData.show_advanced;
        const newData = {
          ...state.wizardData,
          show_advanced: showAdvancedUpdated,
          total_steps: showAdvancedUpdated ? 10 : TOTAL_REQUIRED_STEPS,
          updatedAt: Date.now(),
        };
        return {
          wizardData: newData,
          showError: false,
        };
      });
    },

    goToStep: (step) => {
      set((state) => {
        const wizardDataUpdated = {
          ...state.wizardData,
          step,
          updatedAt: Date.now(),
        };
        const completedStepsUpdated = { ...state.completedSteps, [step]: true };
        const url = generateShareUrl(wizardDataUpdated);
        saveShareUrl(url);
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
      saveShareUrl(url);
      set({ shareUrl: url });
    },

    reset: () => {
      clearStorage();
      set({
        wizardData: WIZARD_DEFAULTS,
        shareUrl: null,
        showError: false,
        dataSource: "default",
      });
    },
  }))
);

// ═══════════════════════════════════════════════════════════════════════════
// DEBOUNCED PERSISTENCE SUBSCRIBER
// ═══════════════════════════════════════════════════════════════════════════

let saveTimeoutId: ReturnType<typeof setTimeout> | undefined;

useWizardStore.subscribe(
  (state) => state.wizardData,
  (wizardData) => {
    if (saveTimeoutId) {
      clearTimeout(saveTimeoutId);
    }
    saveTimeoutId = setTimeout(() => {
      // Save to legacy storage (backward compatibility)
      saveToStorage(wizardData);

      // Also save to v2 list-based storage with distinct_id
      const distinctId = getCurrentDistinctId();
      upsertPromptV2(wizardData, distinctId);
    }, 300);
  }
);
