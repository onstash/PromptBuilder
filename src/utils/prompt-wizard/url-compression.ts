import LZString from "lz-string";

// ═══════════════════════════════════════════════════════════════════════════
// URL COMPRESSION UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

const COMPRESSION_PREFIX = "~";
const COMPRESSION_THRESHOLD = 100; // Only compress if longer than this

/**
 * Compress a text field for URL storage
 * Uses LZ-string for efficient compression
 * Prefixes with ~ to indicate compressed content
 */
export function compressField(text: string): string {
  if (!text || text.length < COMPRESSION_THRESHOLD) {
    return text;
  }

  const compressed = LZString.compressToEncodedURIComponent(text);

  // Only use compression if it actually saves space
  if (compressed && compressed.length < text.length) {
    return `${COMPRESSION_PREFIX}${compressed}`;
  }

  return text;
}

/**
 * Decompress a field from URL
 * Detects if content is compressed by checking for ~ prefix
 */
export function decompressField(value: string): string {
  if (!value) return "";

  if (!value.startsWith(COMPRESSION_PREFIX)) {
    return value;
  }

  const compressed = value.slice(COMPRESSION_PREFIX.length);
  const decompressed = LZString.decompressFromEncodedURIComponent(compressed);

  return decompressed || "";
}

/**
 * Fields that should be compressed (long text fields)
 */
export const COMPRESSIBLE_FIELDS = [
  "task_intent",
  "context",
  "constraints",
  "disallowed_content",
  "custom_audience",
  "ai_role",
] as const;

/**
 * Check if a field should be compressed
 */
export function isCompressibleField(key: string): boolean {
  return COMPRESSIBLE_FIELDS.includes(
    key as (typeof COMPRESSIBLE_FIELDS)[number]
  );
}

/**
 * Compress all compressible fields in an object
 */
export function compressSearchParams(
  params: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && isCompressibleField(key)) {
      result[key] = compressField(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Decompress all compressible fields in an object
 */
export function decompressSearchParams(
  params: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && isCompressibleField(key)) {
      result[key] = decompressField(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Check if current URL length is safe for browsers
 * Max safe URL length is ~2000 characters
 */
export function isUrlLengthSafe(params: Record<string, unknown>): boolean {
  const urlParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      urlParams.set(key, String(value));
    }
  }

  return urlParams.toString().length < 2000;
}
