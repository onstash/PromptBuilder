// utils/search-params.ts
import {
  defaultValuesShortened,
  searchParamsLongToShort,
  promptBuilderBasicFormSchema,
} from "./basic-schema";

import type { PromptBuilderBasicFormDataShortened } from "./basic-schema";

export const validateSearchParams = (
  search: Record<string, unknown>,
): PromptBuilderBasicFormDataShortened => {
  // If search params are empty, return defaults immediately
  if (!search || Object.keys(search).length === 0) {
    return defaultValuesShortened;
  }

  try {
    const result = promptBuilderBasicFormSchema.safeParse(search);
    if (!result.success || result.error) {
      console.error(
        "[validateSearchParams] Validation failed, using defaults:",
        result.error,
      );
      return defaultValuesShortened;
    }
    return searchParamsLongToShort(result.data);
  } catch (err) {
    console.error("[validateSearchParams] err", err);
    return defaultValuesShortened;
  }
};
