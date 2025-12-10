import { promptWizardSchema, type PromptWizardData } from "./schema";
import {
  decompressSearchParams,
  compressSearchParams,
} from "./url-compression";

// ═══════════════════════════════════════════════════════════════════════════
// KEY MAPPING - Shorten keys for URL compression
// ═══════════════════════════════════════════════════════════════════════════

const SHORT_TO_LONG: Record<string, keyof PromptWizardData> = {
  ti: "task_intent",
  ctx: "context",
  con: "constraints",
  aud: "target_audience",
  caud: "custom_audience",
  fmt: "output_format",
  role: "ai_role",
  tone: "tone_style",
  depth: "reasoning_depth",
  chk: "self_check",
  no: "disallowed_content",
  s: "step",
  adv: "show_advanced",
};

const LONG_TO_SHORT: Record<keyof PromptWizardData, string> =
  Object.fromEntries(
    Object.entries(SHORT_TO_LONG).map(([short, long]) => [long, short])
  ) as Record<keyof PromptWizardData, string>;

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH PARAMS CONVERSION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert short URL params to long form for internal use
 */
function shortToLong(params: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    const longKey = SHORT_TO_LONG[key] || key;
    result[longKey] = value;
  }

  return result;
}

/**
 * Convert long form params to short for URL
 */
function longToShort(params: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    const shortKey = LONG_TO_SHORT[key as keyof PromptWizardData] || key;
    // Only include non-empty values
    if (value !== undefined && value !== null && value !== "") {
      result[shortKey] = value;
    }
  }

  return result;
}

/**
 * Parse boolean values from URL
 */
function parseValue(key: string, value: unknown): unknown {
  if (value === "true") return true;
  if (value === "false") return false;
  if (key === "step" || key === "s") {
    const num = Number(value);
    return isNaN(num) ? 1 : num;
  }
  return value;
}

/**
 * Validate and parse search params from URL
 * Used as the validateSearch function for the route
 */
export function validateWizardSearch(
  search: Record<string, unknown>
): PromptWizardData {
  // Convert short keys to long
  const longParams = shortToLong(search);

  // Parse special values
  const parsedParams: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(longParams)) {
    parsedParams[key] = parseValue(key, value);
  }

  // Decompress text fields
  const decompressed = decompressSearchParams(parsedParams);

  // Validate with Zod schema (provides defaults)
  const result = promptWizardSchema.safeParse(decompressed);

  if (result.success) {
    return result.data;
  }

  // Return defaults on validation failure
  return promptWizardSchema.parse({});
}

/**
 * Convert wizard data to URL search params
 * Compresses long text fields and uses short keys
 */
export function wizardDataToSearchParams(
  data: Partial<PromptWizardData>
): Record<string, string> {
  // Compress text fields
  const compressed = compressSearchParams(data as Record<string, unknown>);

  // Convert to short keys
  const shortParams = longToShort(compressed);

  // Convert all values to strings for URL
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(shortParams)) {
    if (value !== undefined && value !== null && value !== "") {
      result[key] = String(value);
    }
  }

  return result;
}

/**
 * Build a URL string for the wizard with given params
 */
export function buildWizardUrl(data: Partial<PromptWizardData>): string {
  const params = wizardDataToSearchParams(data);
  const searchString = new URLSearchParams(params).toString();
  return `/prompt-builder/wizard${searchString ? `?${searchString}` : ""}`;
}
