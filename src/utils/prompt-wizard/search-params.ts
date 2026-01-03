import {
  promptWizardSchema,
  partialPromptWizardSchema,
  PromptWizardSearchParamsCompressed,
  type PromptWizardData,
} from "./schema";
import { compress, decompress, decompressPrompt } from "./url-compression";

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
  // Wizard state
  step: 1,
  updatedAt: -1,
  finishedAt: -1,
};

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
    const { data: parsedData } = decompressPrompt(search.d);

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
