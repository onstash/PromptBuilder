/**
 * Step Component Configuration for Wizard v2
 *
 * This file provides a mapping of v2 step components that use role-aware suggestions.
 * Import these in place of v1 components when using the v2 wizard experience.
 */

import type { PromptWizardData } from "@/utils/prompt-wizard/schema";

// V2 Step Components (role-aware suggestions)
import { RoleStepV2 } from "./RoleStepV2";
import { TaskFormatStepV2 } from "./TaskFormatStepV2";
import { ContextStepV2 } from "./ContextStepV2";
import { GuardrailsStepV2 } from "./GuardrailsStepV2";

// V1 Step Components that don't need role-aware versions
// (they don't use StepExamples, so import from original location)
import { ReasoningStep } from "../steps/ReasoningStep";
import { SelfCheckStep } from "../steps/SelfCheckStep";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface StepProps {
  data: PromptWizardData;
  onUpdate: (updates: Partial<PromptWizardData>) => void;
}

type StepComponent = React.ComponentType<StepProps>;

// ═══════════════════════════════════════════════════════════════════════════
// V2 STEP COMPONENTS CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * V2 Step Components with role-aware suggestions
 *
 * Uses:
 * - RoleStepV2: Same as v1 (role detection happens after user types)
 * - TaskFormatStepV2: Shows role-specific task examples
 * - ContextStepV2: Shows role-specific context examples
 * - GuardrailsStepV2: Shows role-specific constraints & disallowed content
 * - ReasoningStep: v1 (no role-specific suggestions needed)
 * - SelfCheckStep: v1 (no role-specific suggestions needed)
 */
export const STEP_COMPONENTS_V2: Record<number, StepComponent> = {
  1: RoleStepV2, // Act as... (v2 with StepExamplesV2)
  2: TaskFormatStepV2, // What do you want? + Output Format (v2)
  3: ContextStepV2, // Give context + Examples (v2)
  4: GuardrailsStepV2, // Set guardrails (v2)
  5: ReasoningStep, // Reasoning mode (v1 - no examples)
  6: SelfCheckStep, // Verification (v1 - no examples)
};

/**
 * Step hints - same as v1
 */
export const STEP_HINTS_V2: Record<number, string> = {
  1: "Define the AI's role and expertise level - this sets the foundation",
  2: "Be specific about what you want AND how you want it formatted",
  3: "Provide background info and examples to guide the AI",
  4: "Set boundaries - what the AI must do and must avoid",
  5: "How deeply should the AI reason through the problem? (optional)",
  6: "Should the AI verify its own work before responding? (optional)",
};
