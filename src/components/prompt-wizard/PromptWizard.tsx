import { useState, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import { Settings2 } from "lucide-react";

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
// STEP VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validates if a step is complete
 * Returns true if the step has valid data
 */
function isStepValid(step: number, data: PromptWizardData): boolean {
  switch (step) {
    case 1:
      // Task intent is required (at least 10 characters)
      return data.task_intent.trim().length >= 10;
    case 2:
      // Context is optional, always valid
      return true;
    case 3:
      // Constraints are optional, always valid
      return true;
    case 4:
      // Audience must be selected (has a default, so always valid)
      return true;
    case 5:
      // Output format must be selected (has a default, so always valid)
      return true;
    default:
      return true;
  }
}

/**
 * Get validation error message for a step
 */
function getStepError(step: number, data: PromptWizardData): string | null {
  switch (step) {
    case 1:
      if (data.task_intent.trim().length < 10) {
        return "Please describe what you want (at least 10 characters)";
      }
      return null;
    default:
      return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function PromptWizard() {
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();

  const [direction, setDirection] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showError, setShowError] = useState(false);

  const currentStep = searchParams.step;
  const showAdvanced = searchParams.show_advanced;
  const totalSteps = showAdvanced ? 10 : TOTAL_REQUIRED_STEPS;

  // Calculate which steps are completed
  const completedSteps = useMemo(() => {
    const completed = new Set<number>();
    for (let i = 1; i <= totalSteps; i++) {
      if (isStepValid(i, searchParams)) {
        completed.add(i);
      }
    }
    return completed;
  }, [searchParams, totalSteps]);

  // Check if current step is valid
  const currentStepValid = isStepValid(currentStep, searchParams);
  const currentStepError = getStepError(currentStep, searchParams);

  // Update URL with new data
  const updateSearch = useCallback(
    (updates: Partial<PromptWizardData>) => {
      setShowError(false); // Clear error when user types
      const newData = { ...searchParams, ...updates };
      const params = wizardDataToSearchParams(newData);
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
      setDirection(step > currentStep ? 1 : -1);
      updateSearch({ step });
    },
    [currentStep, updateSearch]
  );

  const handleNext = useCallback(() => {
    // Validate current step before proceeding
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
    // Validate current step before finishing
    if (!currentStepValid) {
      setShowError(true);
      return;
    }
    setShowPreview(true);
  }, [currentStepValid]);

  const toggleAdvanced = useCallback(() => {
    updateSearch({ show_advanced: !showAdvanced });
  }, [showAdvanced, updateSearch]);

  // Handle click on progress step
  const handleStepClick = useCallback(
    (step: number) => {
      // Going backward is always allowed
      if (step < currentStep) {
        goToStep(step);
        return;
      }

      // Going forward requires current step to be valid
      if (step > currentStep && !currentStepValid) {
        setShowError(true);
        return;
      }

      goToStep(step);
    },
    [currentStep, currentStepValid, goToStep]
  );

  // Render current step content
  const renderStep = () => {
    const stepProps = {
      data: searchParams,
      onUpdate: updateSearch,
    };

    switch (currentStep) {
      case 1:
        return <TaskIntentStep {...stepProps} />;
      case 2:
        return <ContextStep {...stepProps} />;
      case 3:
        return <ConstraintsStep {...stepProps} />;
      case 4:
        return <AudienceStep {...stepProps} />;
      case 5:
        return <OutputFormatStep {...stepProps} />;
      // Advanced steps (6-10)
      case 6:
        return <RoleStep {...stepProps} />;
      case 7:
        return <ToneStep {...stepProps} />;
      case 8:
        return <ReasoningStep {...stepProps} />;
      case 9:
        return <SelfCheckStep {...stepProps} />;
      case 10:
        return <DisallowedStep {...stepProps} />;
      default:
        return <TaskIntentStep {...stepProps} />;
    }
  };

  const getStepHint = () => {
    switch (currentStep) {
      case 1:
        return 'Be specific. Example: "Write a professional email declining a job offer"';
      case 2:
        return "Include relevant background that helps the AI understand your situation (optional)";
      case 3:
        return "What should the AI NOT do? Any limits on length, format, or content? (optional)";
      case 4:
        return "Who will read this output? Their expertise level matters";
      case 5:
        return "Choose how you want the response structured";
      // Advanced steps
      case 6:
        return "Give the AI a persona or role to adopt (optional)";
      case 7:
        return "How should the AI communicate? (optional)";
      case 8:
        return "How detailed should the reasoning be?";
      case 9:
        return "Should the AI double-check its work?";
      case 10:
        return "Specify topics or content the AI should avoid (optional)";
      default:
        return "";
    }
  };

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
              hint={getStepHint()}
            >
              {renderStep()}
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
}
