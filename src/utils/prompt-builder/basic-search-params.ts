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
  try {
    const result = promptBuilderBasicFormSchema.safeParse(search);
    if (!result.success || result.error) {
      throw new Error(`[validateSearchParams] err ${result.error}`);
    }
    return searchParamsLongToShort(result.data);
  } catch (err) {
    console.error("[validateSearchParams] err", err);
    return {} as PromptBuilderBasicFormDataShortened;
    return defaultValuesShortened;
  }
};
