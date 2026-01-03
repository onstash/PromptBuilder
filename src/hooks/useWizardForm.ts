import { useCallback } from "react";

import {
  type PromptWizardData,
  stepValidationSchemas,
  STEP_FIELDS,
  TOTAL_STEPS,
} from "@/utils/prompt-wizard/schema";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ValidationError {
  step: number;
  field: keyof PromptWizardData;
  message: string;
}

export interface UseWizardFormReturn {
  /** Get field names for a specific step */
  getStepFields: (step: number) => (keyof PromptWizardData)[];
  /** Check if a specific step passes validation */
  isStepValid: (step: number) => boolean;
  /** Check if a step has any validation errors */
  hasStepErrors: (step: number) => boolean;
  /** Validate all required steps and return errors */
  validateAllSteps: () => ValidationError[];
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Custom hook for wizard validation.
 * Validates directly against Zustand wizardData.
 *
 * @param wizardData - Current wizard data from Zustand store
 */
export function useWizardForm(wizardData: PromptWizardData): UseWizardFormReturn {
  /**
   * Get the field names for a specific step
   */
  const getStepFields = useCallback((step: number): (keyof PromptWizardData)[] => {
    return STEP_FIELDS[step] || [];
  }, []);

  /**
   * Check if a step passes validation
   */
  const isStepValid = useCallback(
    (step: number): boolean => {
      const schema = stepValidationSchemas[step as keyof typeof stepValidationSchemas];
      if (!schema) return true;

      const fields = STEP_FIELDS[step] || [];
      const values: Record<string, unknown> = {};

      for (const field of fields) {
        values[field] = wizardData[field];
      }

      const result = schema.safeParse(values);
      return result.success;
    },
    [wizardData]
  );

  /**
   * Check if a step has validation errors
   */
  const hasStepErrors = useCallback(
    (step: number): boolean => {
      return !isStepValid(step);
    },
    [isStepValid]
  );

  /**
   * Validate all required steps and return errors
   */
  const validateAllSteps = useCallback((): ValidationError[] => {
    const errors: ValidationError[] = [];

    for (let step = 1; step <= TOTAL_STEPS; step++) {
      const schema = stepValidationSchemas[step as keyof typeof stepValidationSchemas];
      if (!schema) continue;

      const fields = STEP_FIELDS[step] || [];
      const values: Record<string, unknown> = {};

      for (const field of fields) {
        values[field] = wizardData[field];
      }

      const result = schema.safeParse(values);
      if (!result.success) {
        // Extract errors from Zod v4 result
        const zodIssues = result.error.issues;
        for (const issue of zodIssues) {
          const fieldName = issue.path[0] as keyof PromptWizardData;
          errors.push({
            step,
            field: fieldName,
            message: issue.message,
          });
        }
      }
    }

    return errors;
  }, [wizardData]);

  return {
    getStepFields,
    isStepValid,
    hasStepErrors,
    validateAllSteps,
  };
}
