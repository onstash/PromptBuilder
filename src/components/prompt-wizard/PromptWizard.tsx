import { useState, useCallback, useMemo, useRef, useEffect, memo } from "react";
import { motion } from "motion/react";
import { Settings2, RotateCcw } from "lucide-react";

import { Route } from "@/routes/prompt-builder/wizard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import {
  TOTAL_REQUIRED_STEPS,
  type PromptWizardData,
} from "@/utils/prompt-wizard/schema";
import { wizardDataToSearchParams } from "@/utils/prompt-wizard/search-params";

import { WizardProgress } from "./WizardProgress";
import { WizardNavigation } from "./WizardNavigation";
import { WizardStep } from "./WizardStep";
import { WizardPreview } from "./WizardPreview";

// Step components (Required: 1-5)
import { TaskIntentStep } from "./steps/TaskIntentStep";
import { ContextStep } from "./steps/ContextStep";
import { ConstraintsStep } from "./steps/ConstraintsStep";
import { AudienceStep } from "./steps/AudienceStep";
import { OutputFormatStep } from "./steps/OutputFormatStep";
// Step components (Advanced: 6-10)
import { RoleStep } from "./steps/RoleStep";
import { ToneStep } from "./steps/ToneStep";
import { ReasoningStep } from "./steps/ReasoningStep";
import { SelfCheckStep } from "./steps/SelfCheckStep";
import { DisallowedStep } from "./steps/DisallowedStep";

// ═══════════════════════════════════════════════════════════════════════════
// STATIC CONFIGURATION (moved outside component to avoid recreation)
// ═══════════════════════════════════════════════════════════════════════════

interface StepProps {
  data: PromptWizardData;
  onUpdate: (updates: Partial<PromptWizardData>) => void;
}

type StepComponent = React.ComponentType<StepProps>;

/** Static mapping of step number to component */
const STEP_COMPONENTS: Record<number, StepComponent> = {
  1: TaskIntentStep,
  2: ContextStep,
  3: ConstraintsStep,
  4: AudienceStep,
  5: OutputFormatStep,
  6: RoleStep,
  7: ToneStep,
  8: ReasoningStep,
  9: SelfCheckStep,
  10: DisallowedStep,
};

/** Static hints for each step */
const STEP_HINTS: Record<number, string> = {
  1: 'Be specific. Example: "Write a professional email declining a job offer"',
  2: "Include relevant background that helps the AI understand your situation (optional)",
  3: "What should the AI NOT do? Any limits on length, format, or content? (optional)",
  4: "Who will read this output? Their expertise level matters",
  5: "Choose how you want the response structured",
  6: "Give the AI a persona or role to adopt (optional)",
  7: "How should the AI communicate? (optional)",
  8: "How detailed should the reasoning be?",
  9: "Should the AI double-check its work?",
  10: "Specify topics or content the AI should avoid (optional)",
};

/** Default/empty wizard state */
const DEFAULT_STATE: Partial<PromptWizardData> = {
  task_intent: "",
  context: "",
  constraints: "",
  target_audience: "general",
  output_format: "1-paragraph",
  ai_role: "",
  tone_style: undefined,
  reasoning_depth: "moderate",
  self_check: false,
  disallowed_content: "",
  step: 1,
  show_advanced: false,
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const PromptWizard = memo(function PromptWizard() {
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();

  // Track previous step for direction calculation (instead of useState)
  const prevStepRef = useRef(searchParams.step);
  const [showPreview, setShowPreview] = useState(false);
  const [showError, setShowError] = useState(false);

  const currentStep = searchParams.step;
  const showAdvanced = searchParams.show_advanced;
  const totalSteps = showAdvanced ? 10 : TOTAL_REQUIRED_STEPS;

  // Derive direction from step change (not stored in state)
  const direction =
    currentStep > prevStepRef.current
      ? 1
      : currentStep < prevStepRef.current
        ? -1
        : 0;

  // Update ref after render
  useEffect(() => {
    prevStepRef.current = currentStep;
  }, [currentStep]);

  // Optimized: Only depend on task_intent for step 1 validation
  const taskIntentValid = searchParams.task_intent.trim().length >= 10;

  // Calculate completed steps with narrowed dependencies
  const completedSteps = useMemo(() => {
    const completed = new Set<number>();
    if (taskIntentValid) completed.add(1);
    // Steps 2-10 are always valid (optional or have defaults)
    for (let i = 2; i <= totalSteps; i++) {
      completed.add(i);
    }
    return completed;
  }, [taskIntentValid, totalSteps]);

  // Current step validation
  const currentStepValid = currentStep === 1 ? taskIntentValid : true;
  const currentStepError =
    currentStep === 1 && !taskIntentValid
      ? "Please describe what you want (at least 10 characters)"
      : null;

  // Update URL with new data - only include non-default values
  const updateSearch = useCallback(
    (updates: Partial<PromptWizardData>) => {
      setShowError(false);
      // Only include fields that differ from defaults when updating URL
      const params = wizardDataToSearchParams({ ...searchParams, ...updates });
      navigate({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        search: params as any,
        replace: true,
      });
    },
    [searchParams, navigate]
  );

  // Navigation handlers
  const goToStep = useCallback(
    (step: number) => {
      setShowError(false);
      updateSearch({ step });
    },
    [updateSearch]
  );

  const handleNext = useCallback(() => {
    if (!currentStepValid) {
      setShowError(true);
      return;
    }
    if (currentStep < totalSteps) {
      goToStep(currentStep + 1);
    }
  }, [currentStep, totalSteps, currentStepValid, goToStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  const handleFinish = useCallback(() => {
    if (!currentStepValid) {
      setShowError(true);
      return;
    }
    setShowPreview(true);
  }, [currentStepValid]);

  const toggleAdvanced = useCallback(() => {
    updateSearch({ show_advanced: !showAdvanced });
  }, [showAdvanced, updateSearch]);

  // Reset form to initial state
  const handleReset = useCallback(() => {
    const params = wizardDataToSearchParams(DEFAULT_STATE);
    navigate({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      search: params as any,
      replace: true,
    });
    setShowPreview(false);
    setShowError(false);
  }, [navigate]);

  // Handle click on progress step
  const handleStepClick = useCallback(
    (step: number) => {
      if (step < currentStep) {
        goToStep(step);
        return;
      }
      if (step > currentStep && !currentStepValid) {
        setShowError(true);
        return;
      }
      goToStep(step);
    },
    [currentStep, currentStepValid, goToStep]
  );

  // Get step component and props
  const StepComponent = STEP_COMPONENTS[currentStep] || TaskIntentStep;
  const stepHint = STEP_HINTS[currentStep] || "";

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Wizard Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border-4 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))]"
        >
          {/* Header */}
          <div className="p-6 border-b-4 border-foreground">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-black uppercase tracking-tight">
                Prompt Wizard
              </h1>
              <div className="flex items-center gap-3">
                {/* Reset Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-muted-foreground hover:text-foreground"
                  title="Reset form"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                {/* Advanced Toggle */}
                <div className="flex items-center gap-2">
                  <Switch
                    id="advanced-mode"
                    checked={showAdvanced}
                    onCheckedChange={toggleAdvanced}
                  />
                  <Label htmlFor="advanced-mode" className="text-sm font-mono">
                    <Settings2 className="w-4 h-4 inline mr-1" />
                    Advanced
                  </Label>
                </div>
              </div>
            </div>
            <WizardProgress
              currentStep={currentStep}
              showAdvanced={showAdvanced}
              completedSteps={completedSteps}
              onStepClick={handleStepClick}
            />
          </div>

          {/* Step Content */}
          <div className="p-6">
            <WizardStep
              stepKey={currentStep}
              direction={direction}
              hint={stepHint}
            >
              <StepComponent data={searchParams} onUpdate={updateSearch} />
            </WizardStep>

            {/* Validation Error */}
            {showError && currentStepError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-destructive/10 border-2 border-destructive text-destructive text-sm font-mono"
              >
                ⚠️ {currentStepError}
              </motion.div>
            )}
          </div>

          {/* Navigation */}
          <div className="p-6">
            <WizardNavigation
              currentStep={currentStep}
              showAdvanced={showAdvanced}
              onNext={handleNext}
              onBack={handleBack}
              onFinish={handleFinish}
              canProceed={currentStepValid}
            />
          </div>
        </motion.div>

        {/* Preview Panel */}
        {showPreview && (
          <WizardPreview
            data={searchParams}
            onClose={() => setShowPreview(false)}
          />
        )}

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Button variant="link" asChild>
            <a href="/" className="text-muted-foreground font-mono text-sm">
              ← Back to Home
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
});
