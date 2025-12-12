import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import type { PromptWizardData } from "@/utils/prompt-wizard/schema";
import { TOTAL_REQUIRED_STEPS } from "@/utils/prompt-wizard/schema";
import { compress } from "@/utils/prompt-wizard/url-compression";
import { decompressFullState, WIZARD_DEFAULTS } from "@/utils/prompt-wizard/search-params";

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = "wizard-draft";
const SHARE_URL_KEY = "wizard-share-url";

// ═══════════════════════════════════════════════════════════════════════════
// LOCAL STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function loadFromStorage(): [PromptWizardData, "default" | "localStorage"] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [WIZARD_DEFAULTS, "default"];
    return [{ ...WIZARD_DEFAULTS, ...JSON.parse(stored) }, "localStorage"];
  } catch {
    return [WIZARD_DEFAULTS, "default"];
  }
}

function saveToStorage(data: PromptWizardData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
// PROMPT GENERATION
// ═══════════════════════════════════════════════════════════════════════════

export function generatePromptText(finalData: PromptWizardData): string {
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

  const formatMap: Record<string, string> = {
    "1-paragraph": "Provide your response in a single paragraph.",
    "2-paragraphs": "Provide your response in exactly 2 paragraphs.",
    "3-plus-paragraphs": "Provide a detailed response with multiple paragraphs.",
    "bullet-list": "Provide your response as a bulleted list.",
    "numbered-list": "Provide your response as a numbered step-by-step list.",
    table: "Provide your response in a table format.",
    mixed: "Use a combination of paragraphs, lists, and other formatting.",
  };
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
    const depthMap: Record<string, string> = {
      brief: "Be concise and direct.",
      thorough: "Provide thorough, in-depth analysis.",
    };
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
  showPreview: boolean;
  shareUrl: string | null;
  showError: boolean;
  dataSource: "default" | "localStorage" | "url";

  // Derived (computed on demand)
  getPromptText: () => string;
  getCompressedData: () => string;
  getTotalSteps: () => number;
  isTaskIntentValid: () => boolean;
  isCurrentStepValid: () => boolean;
  getCurrentStepError: () => string | null;
}

interface WizardActions {
  // Actions
  updateData: (updates: Partial<PromptWizardData>) => void;
  goToStep: (step: number) => void;
  setShowPreview: (show: boolean) => void;
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
    showPreview: false,
    shareUrl: getShareUrl(),
    showError: false,
    dataSource: "default",

    // ─────────────────────────────────────────────────────────────────────────
    // Derived Getters
    // ─────────────────────────────────────────────────────────────────────────
    getPromptText: () => generatePromptText(get().wizardData),

    getCompressedData: () => {
      const filtered: Partial<PromptWizardData> = {};
      const data = get().wizardData;
      for (const [key, value] of Object.entries(data)) {
        if (key === "d") continue;
        if (value === undefined || value === null || value === "") continue;
        const defaultVal = WIZARD_DEFAULTS[key as keyof PromptWizardData];
        if (value === defaultVal) continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (filtered as any)[key] = value;
      }
      return compress(JSON.stringify(filtered));
    },

    getTotalSteps: () => (get().wizardData.show_advanced ? 10 : TOTAL_REQUIRED_STEPS),

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
          set({
            wizardData: decompressed,
            dataSource: "url",
            shareUrl: getShareUrl(),
          });
          return;
        }
      }

      const [dataFromLocalStorage, source] = loadFromStorage();
      set({
        wizardData: dataFromLocalStorage,
        dataSource: source,
        shareUrl: getShareUrl(),
      });
    },

    updateData: (updates) => {
      set((state) => {
        const newData = { ...state.wizardData, ...updates };

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

    goToStep: (step) => {
      set((state) => ({
        wizardData: { ...state.wizardData, step },
        showError: false,
      }));
    },

    setShowPreview: (show) => set({ showPreview: show }),

    setShowError: (show) => set({ showError: show }),

    finish: () => {
      const state = get();
      if (!state.isCurrentStepValid()) {
        set({ showError: true });
        return;
      }

      const url = generateShareUrl(state.wizardData);
      saveShareUrl(url);
      set({ shareUrl: url, showPreview: true });
    },

    reset: () => {
      clearStorage();
      set({
        wizardData: WIZARD_DEFAULTS,
        showPreview: false,
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
      saveToStorage(wizardData);
    }, 300);
  }
);
