import {
  promptWizardSchema,
  partialPromptWizardSchema,
  PromptWizardSearchParamsCompressed,
  type PromptWizardData,
} from "./schema";
import { compress, decompress } from "./url-compression";

// ═══════════════════════════════════════════════════════════════════════════
// URL PARAMS STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════
//
// The wizard uses TypeScript Playground-style URL compression.
// The entire state is compressed into a single `d` (data) parameter.
//
// EXAMPLE URL:
// /prompt-builder/wizard?d=N4IgLg9gJgpgThCA...
//
// On initial load: URL stays clean (no params)
// After user edits: URL contains compressed state
//
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT VALUES (applied in component, NOT in URL)
// ═══════════════════════════════════════════════════════════════════════════

export const WIZARD_DEFAULTS: PromptWizardData = {
  // Step 1: Role
  ai_role: "",
  // Step 2: Task + Format
  task_intent: "",
  // @ts-expect-error
  output_format: "",
  // Step 3: Context + Examples
  context: "",
  examples: "",
  // Step 4: Guardrails
  constraints: "",
  disallowed_content: "",
  // Step 5-6: Now always visible
  reasoning_depth: "brief",
  self_check: true,
  // Legacy fields (optional)
  target_audience: undefined,
  custom_audience: undefined,
  tone_style: undefined,
  // Wizard state
  step: 1,
  total_steps: 6,
  updatedAt: -1,
  finishedAt: -1,
};

// ═══════════════════════════════════════════════════════════════════════════
// FULL STATE COMPRESSION (TypeScript Playground style)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compress wizard state to a single URL-safe string
 * Only includes non-default values
 */
export function compressFullState(data: PromptWizardData): string {
  const filtered: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    // Skip undefined/null/empty
    if (value === undefined || value === null || value === "") continue;

    // Skip if same as default
    const defaultVal = WIZARD_DEFAULTS[key as keyof PromptWizardData];
    if (value === defaultVal) continue;

    filtered[key] = value;
  }

  if (Object.keys(filtered).length === 0) return "";

  const json = JSON.stringify(filtered);
  return compress(json);
}

/**
 * Decompress full state from URL param
 */
export function decompressFullState(compressed: string): PromptWizardData {
  if (!compressed) return {} as PromptWizardData;

  try {
    const json = decompress(compressed);
    if (!json) return {} as PromptWizardData;
    return JSON.parse(json) as PromptWizardData;
  } catch {
    return {} as PromptWizardData;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validate and parse search params from URL
 * Returns FULL object with defaults applied (for component use)
 * TanStack Router won't serialize defaults back to URL because we use
 * a sparse representation in wizardDataToSearchParams
 */
export function validateWizardSearch(
  search: Record<string, unknown>
): PromptWizardSearchParamsCompressed {
  // Check for compressed format
  if (typeof search.d === "string" && search.d) {
    let parsedData: Partial<PromptWizardData> = {};
    parsedData = decompressFullState(search.d);

    // Try full validation first
    const fullResult = promptWizardSchema.safeParse(parsedData);
    if (fullResult.success) {
      return { d: search.d, vld: 1, partial: false };
    }

    // Fall back to partial validation for drafts
    const partialResult = partialPromptWizardSchema.safeParse(parsedData);
    if (partialResult.success) {
      return { d: search.d, vld: 1, partial: true };
    }
  }
  return { d: null, vld: 0, partial: false };
}
