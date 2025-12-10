import { useState, useCallback } from "react";
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

// Step components
import { TaskIntentStep } from "./steps/TaskIntentStep";
import { ContextStep } from "./steps/ContextStep";
import { ConstraintsStep } from "./steps/ConstraintsStep";
import { AudienceStep } from "./steps/AudienceStep";
import { OutputFormatStep } from "./steps/OutputFormatStep";

export function PromptWizard() {
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();

  const [direction, setDirection] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const currentStep = searchParams.step;
  const showAdvanced = searchParams.show_advanced;
  const totalSteps = showAdvanced ? 10 : TOTAL_REQUIRED_STEPS;

  // Update URL with new data
  const updateSearch = useCallback(
    (updates: Partial<PromptWizardData>) => {
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
      setDirection(step > currentStep ? 1 : -1);
      updateSearch({ step });
    },
    [currentStep, updateSearch]
  );

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps) {
      goToStep(currentStep + 1);
    }
  }, [currentStep, totalSteps, goToStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  const handleFinish = useCallback(() => {
    setShowPreview(true);
  }, []);

  const toggleAdvanced = useCallback(() => {
    updateSearch({ show_advanced: !showAdvanced });
  }, [showAdvanced, updateSearch]);

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
      default:
        return <TaskIntentStep {...stepProps} />;
    }
  };

  const getStepHint = () => {
    switch (currentStep) {
      case 1:
        return 'Be specific. Example: "Write a professional email declining a job offer"';
      case 2:
        return "Include relevant background that helps the AI understand your situation";
      case 3:
        return "What should the AI NOT do? Any limits on length, format, or content?";
      case 4:
        return "Who will read this output? Their expertise level matters";
      case 5:
        return "Choose how you want the response structured";
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
          </div>

          {/* Navigation */}
          <div className="p-6">
            <WizardNavigation
              currentStep={currentStep}
              showAdvanced={showAdvanced}
              onNext={handleNext}
              onBack={handleBack}
              onFinish={handleFinish}
              canProceed={true}
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
