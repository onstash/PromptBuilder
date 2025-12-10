import { promptWizardSchema, type PromptWizardData } from "./schema";
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
  task_intent: "",
  context: "",
  constraints: "",
  target_audience: "general",
  output_format: "1-paragraph",
  reasoning_depth: "moderate",
  self_check: true,
  step: 1,
  show_advanced: false,
  custom_audience: undefined,
  ai_role: undefined,
  tone_style: undefined,
  disallowed_content: undefined,
};

// ═══════════════════════════════════════════════════════════════════════════
// FULL STATE COMPRESSION (TypeScript Playground style)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compress wizard state to a single URL-safe string
 * Only includes non-default values
 */
function compressFullState(data: Partial<PromptWizardData>): string {
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
function decompressFullState(compressed: string): Partial<PromptWizardData> {
  if (!compressed) return {};

  try {
    const json = decompress(compressed);
    if (!json) return {};
    return JSON.parse(json) as Partial<PromptWizardData>;
  } catch {
    return {};
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
): PromptWizardData {
  let parsedData: Partial<PromptWizardData> = {};

  // Check for compressed format
  if (typeof search.d === "string" && search.d) {
    parsedData = decompressFullState(search.d);
  }

  // Merge with defaults (Zod schema provides type validation + defaults)
  const result = promptWizardSchema.safeParse(parsedData);

  if (result.success) {
    return result.data;
  }

  return WIZARD_DEFAULTS;
}

/**
 * Convert wizard data to URL search params
 * Uses compressed format (single 'd' param)
 * Only includes non-default values
 */
export function wizardDataToSearchParams(
  data: Partial<PromptWizardData>
): Record<string, string> {
  const compressed = compressFullState(data);

  if (!compressed) {
    return {}; // Empty/default state = no params = clean URL
  }

  return { d: compressed };
}

/**
 * Build a URL string for the wizard with given params
 */
export function buildWizardUrl(data: Partial<PromptWizardData>): string {
  const params = wizardDataToSearchParams(data);
  const searchString = new URLSearchParams(params).toString();
  return `/prompt-builder/wizard${searchString ? `?${searchString}` : ""}`;
}
