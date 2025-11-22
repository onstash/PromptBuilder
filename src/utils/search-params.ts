// utils/search-params.ts
import * as LZ from "lz-string";
import {
  defaultValues,
  type InstructionFormData,
  instructionSchema,
} from "./instruction-schema";

export type SearchParamsCompressed = string;

export const decompressCompressedSearchParams = (search: Record<string, unknown>): SearchParamsCompressed => {
  try {
    const compressed = search?.["data"] as string | undefined;
    if (!compressed) {
      return '';
    }
    const jsonStr = LZ.decompressFromEncodedURIComponent(compressed);
    if (!jsonStr || !jsonStr.length) return '';
    const json = JSON.parse(jsonStr);
    const result = instructionSchema.safeParse(json);
    if (!result.success || result.error) {
      throw new Error(`[decompressCompressedSearchParams] err ${result.error}`);
    }
    return jsonStr;
  } catch (err) {
    console.error("[decompressCompressedSearchParams] err", err);
    return '';
  }
};

export const parseCompressedSearchParamsStr = (jsonStr: string): InstructionFormData => {
  try {
    const json = JSON.parse(jsonStr);
    const result = instructionSchema.safeParse(json);
    if (!result.success || result.error) {
      throw new Error(`[decompressCompressedSearchParams] err ${result.error}`);
    }
    return result.data;
  } catch (err) {
    console.error("[decompressCompressedSearchParams] err", err);
    return defaultValues;
  }
}

export const compressSearchParams = (data: InstructionFormData): string => {
  try {
    const json = JSON.stringify(data);
    const compressed = LZ.compressToEncodedURIComponent(json);
    return compressed;
  } catch (error) {
    console.error("Failed to compressSearchParams search params:", error);
    return '';
  }
};
