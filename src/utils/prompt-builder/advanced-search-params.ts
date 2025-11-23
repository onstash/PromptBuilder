import {
  defaultValues,
  promptBuilderAdvancedFormSchema,
} from "./advanced-schema";
import type { PromptBuilderFormData } from "./advanced-schema";

export function validatePromptBuilderAdvancedSearchParams(
  searchParams: Record<string, unknown>
): PromptBuilderFormData {
  const result = promptBuilderAdvancedFormSchema.safeParse(searchParams);
  console.log("[validatePromptBuilderAdvancedSearchParams] result", result);
  if (result.success && result.data) {
    return result.data;
  }
  return defaultValues;
}
