import LZString from "lz-string";
import { sha256 } from "@noble/hashes/sha2.js";

import { PromptWizardData, PromptWizardDataCompressedCore } from "./schema";

// ═══════════════════════════════════════════════════════════════════════════
// URL COMPRESSION UTILITIES
// TypeScript Playground-style encoding using LZ-String
// https://www.typescriptlang.org/play uses the same approach
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compress text for URL storage using LZ-String
 * Same method used by TypeScript Playground
 *
 * @example
 * compress('console.log({hello: "world"});')
 * // → 'MYewdgziA2CmB00QHMAUBvAFraSBcABAEQDuIATtACZEC+AlANwBQzQA'
 */
export function compress(text: string): string {
  if (!text) return "";
  return LZString.compressToEncodedURIComponent(text);
}

function computePromptId(data: PromptWizardData) {
  const canonicalJson = JSON.stringify(data);
  const hash = sha256(Uint8Array.from(canonicalJson));
  return hash.slice(0, 8).toString(); // or 12 hex chars
}

export function compressPrompt(data: PromptWizardData) {
  const { id, step, examples, finishedAt, ...restOfData } = data;
  const coreData: PromptWizardDataCompressedCore = restOfData;
  return compress(JSON.stringify({ version: 3, data: coreData }));
}

export function decompressPrompt(
  compressed: string,
  opts?: {
    _source_: string;
  }
):
  | { version: number; data: PromptWizardData; valid: true }
  | { version: number; data: null; valid: false } {
  try {
    const _data: { version: number; data: PromptWizardDataCompressedCore } | PromptWizardData =
      JSON.parse(decompress(compressed));
    if (!(_data as { version: number; data: PromptWizardDataCompressedCore }).version) {
      return {
        version: 1,
        data: { ..._data, step: 1, examples: "", finishedAt: -1 } as PromptWizardData,
        valid: true,
      };
    }
    const fullData: PromptWizardData = {
      ...(_data as { version: number; data: PromptWizardDataCompressedCore }).data,
      step: 1,
      examples: "",
      finishedAt: -1,
    };
    fullData.id = computePromptId(fullData);
    return { version: 3, data: fullData, valid: true };
  } catch {
    return { version: 1, data: null, valid: false };
  }
}

/**
 * Decompress text from URL
 *
 * @example
 * decompress('MYewdgziA2CmB00QHMAUBvAFraSBcABAEQDuIATtACZEC+AlANwBQzQA')
 * // → 'console.log({hello: "world"});'
 */
export function decompress(compressed: string): string {
  if (!compressed) return "";
  const result = LZString.decompressFromEncodedURIComponent(compressed);
  return result || "";
}

/**
 * Compress an entire object to a single URL-safe string
 * Similar to how TypeScript Playground encodes all code in one parameter
 */
export function compressObject<T extends Record<string, unknown>>(obj: T): string {
  if (!obj || Object.keys(obj).length === 0) return "";

  // Filter out empty/undefined values
  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== "") {
      filtered[key] = value;
    }
  }

  if (Object.keys(filtered).length === 0) return "";

  const json = JSON.stringify(filtered);
  return compress(json);
}

/**
 * Decompress a URL string back to an object
 */
export function decompressObject<T extends Record<string, unknown>>(
  compressed: string
): Partial<T> {
  if (!compressed) return {};

  try {
    const json = decompress(compressed);
    if (!json) return {};
    return JSON.parse(json) as Partial<T>;
  } catch {
    return {};
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FIELD-LEVEL COMPRESSION (backward compatible)
// ═══════════════════════════════════════════════════════════════════════════

const COMPRESSION_PREFIX = "~";

/**
 * Compress a single field value for URL (with prefix marker)
 * Use this when you want to compress individual fields
 */
export function compressField(text: string): string {
  if (!text) return "";
  const compressed = compress(text);
  return `${COMPRESSION_PREFIX}${compressed}`;
}

/**
 * Decompress a single field value from URL
 */
export function decompressField(value: string): string {
  if (!value) return "";
  if (!value.startsWith(COMPRESSION_PREFIX)) return value;
  return decompress(value.slice(COMPRESSION_PREFIX.length));
}

/**
 * Check if a value is compressed (starts with ~)
 */
export function isCompressed(value: string): boolean {
  return value.startsWith(COMPRESSION_PREFIX);
}

/**
 * Fields that should have individual compression
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
  return COMPRESSIBLE_FIELDS.includes(key as (typeof COMPRESSIBLE_FIELDS)[number]);
}

/**
 * Compress all compressible fields in an object
 */
export function compressSearchParams(params: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && isCompressibleField(key) && value.length > 0) {
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
export function decompressSearchParams(params: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && isCompressed(value)) {
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
