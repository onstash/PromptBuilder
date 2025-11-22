// utils/search-params.ts
import {
  defaultValues,
  type InstructionFormData,
  instructionSchema,
} from "./instruction-schema";

export const validateSearchParams = (
  search: Record<string, unknown>
): InstructionFormData => {
  try {
    const data = search?.["data"] as string | undefined;
    if (!data) {
      return defaultValues;
    }
    const json = JSON.parse(data);
    const result = instructionSchema.safeParse(json);
    if (!result.success || result.error) {
      throw new Error(`[validateSearchParams] err ${result.error}`);
    }
    return result.data;
  } catch (err) {
    console.error("[validateSearchParams] err", err);
    return defaultValues;
  }
};

export function decodeFromBinary(str: string): string {
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(str), function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
}

export function encodeToBinary(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
      return String.fromCharCode(parseInt(p1, 16));
    })
  );
}
