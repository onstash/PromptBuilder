import {
  defaultValues,
  formSchema,
  defaultValuesShortened,
  searchParamsLongToShort,
} from "./advanced-schema";
import type { PromptBuilderAdvancedFormData, PromptBuilderAdvancedFormDataShortened } from "./advanced-schema";


export const validateSearchParams = (
  search: Record<string, unknown>,
): PromptBuilderAdvancedFormDataShortened => {
  try {
    const result = formSchema.safeParse(search);
    if (!result.success || result.error) {
      throw new Error(`[validateSearchParams] err ${result.error}`);
    }
    return searchParamsLongToShort(result.data);
  } catch (err) {
    console.error("[validateSearchParams] err", err);
    return {} as PromptBuilderAdvancedFormDataShortened;
    return defaultValuesShortened;
  }
};

export function validatePromptBuilderAdvancedSearchParams(
  searchParams: Record<string, unknown>
): PromptBuilderAdvancedFormData {
  const result = formSchema.safeParse(searchParams);
  console.log("[validatePromptBuilderAdvancedSearchParams] result", result);
  if (result.success && result.data) {
    return result.data;
  }
  return defaultValues;
}
