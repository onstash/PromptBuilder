// utils/search-params.ts
import * as LZ from "lz-string";
import {
  type InstructionFormData,
  defaultValues,
} from "./instruction-schema";

export const decompress = (search: Record<string, unknown>) => {
  try {
    const compressed = search?.["data"] as string | undefined;
    if (!compressed) {
      return defaultValues;
    }
    const json = LZ.decompressFromEncodedURIComponent(compressed);
    if (!json) return defaultValues;
    return {data: json};
  } catch (err) {
    console.error("[decompress] err", err);
    return {data: ''};
  }
};

export const compress = (data: InstructionFormData): string => {
  try {
    const json = JSON.stringify(data);
    const compressed = LZ.compressToEncodedURIComponent(json);
    return compressed;
  } catch (error) {
    console.error("Failed to compress search params:", error);
    return '';
  }
};

export const compressedSearchParamValidator = {
  safeParse: (search: Record<string, unknown>): {data: string} => {
    try {
      const data = decompress(search);
      // const result = instructionSchema.safeParse(parsed);

      // return result.success ? result.data : defaultValues;
      return data;
    } catch (error) {
      console.error("Failed to decompress search params:", error);
      return {data: ''};
    }
  },

  stringify: (data: InstructionFormData): string | null => {
    try {
      const json = JSON.stringify(data);
      const compressed = LZ.compressToEncodedURIComponent(json);
      return compressed;
    } catch (error) {
      console.error("Failed to compress search params:", error);
      return null;
    }
  },
};
