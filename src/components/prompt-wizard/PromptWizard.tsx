import { useCallback, useMemo, useRef, useEffect, memo } from "react";
import { motion } from "motion/react";
import { Settings2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { TOTAL_REQUIRED_STEPS, type PromptWizardData } from "@/utils/prompt-wizard/schema";

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
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useTrackMixpanel } from "@/utils/analytics/MixpanelProvider";
import { useWizardStore } from "@/stores/wizard-store";
import { compress } from "@/utils/prompt-wizard";

// ═══════════════════════════════════════════════════════════════════════════
// STATIC CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

interface StepProps {
  data: PromptWizardData;
  onUpdate: (updates: Partial<PromptWizardData>) => void;
}

type StepComponent = React.ComponentType<StepProps>;

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

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const PromptWizard = memo(function PromptWizard() {
  const search = useSearch({ from: "/wizard" });
  const navigate = useNavigate({ from: "/wizard" });
  const trackEvent = useTrackMixpanel();

  // ─────────────────────────────────────────────────────────────────────────
  // Zustand Store
  // ─────────────────────────────────────────────────────────────────────────
  const wizardData = useWizardStore((state) => state.wizardData);
  const showPreview = useWizardStore((state) => state.showPreview);
  const shareUrl = useWizardStore((state) => state.shareUrl);
  const showError = useWizardStore((state) => state.showError);

  const updateData = useWizardStore((state) => state.updateData);
  const goToStep = useWizardStore((state) => state.goToStep);
  const setShowPreview = useWizardStore((state) => state.setShowPreview);
  const setShowError = useWizardStore((state) => state.setShowError);
  const finish = useWizardStore((state) => state.finish);
  const reset = useWizardStore((state) => state.reset);
  const initialize = useWizardStore((state) => state.initialize);
  const isCurrentStepValid = useWizardStore((state) => state.isCurrentStepValid);
  const getCurrentStepError = useWizardStore((state) => state.getCurrentStepError);
  const isTaskIntentValid = useWizardStore((state) => state.isTaskIntentValid);

  // ─────────────────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────────────────
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    trackEvent("page_viewed_wizard", {
      page: "wizard",
      timestamp: new Date().toISOString(),
    });

    // Initialize store from URL or localStorage
    if (search.d && search.vld) {
      initialize({ d: search.d, vld: search.vld });
      trackEvent("data_loaded_url", {
        page: "wizard",
        timestamp: new Date().toISOString(),
        type: "URL",
      });
    } else {
      initialize();
      // Track localStorage load if it was the source
      const dataSource = useWizardStore.getState().dataSource;
      const wizardData = useWizardStore.getState().wizardData;
      if (dataSource === "localStorage") {
        navigate({ to: "/wizard", search: { d: compress(JSON.stringify(wizardData)), vld: 1 } });
        trackEvent("data_loaded_localstorage", {
          page: "wizard",
          timestamp: new Date().toISOString(),
          type: "localStorage",
        });
      }
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Animation Direction
  // ─────────────────────────────────────────────────────────────────────────
  const prevStepRef = useRef(wizardData.step);
  const direction =
    wizardData.step > prevStepRef.current ? 1 : wizardData.step < prevStepRef.current ? -1 : 0;

  useEffect(() => {
    prevStepRef.current = wizardData.step;
  }, [wizardData.step]);

  // ─────────────────────────────────────────────────────────────────────────
  // Derived Values
  // ─────────────────────────────────────────────────────────────────────────
  const currentStep = wizardData.step;
  const showAdvanced = wizardData.show_advanced;
  const totalSteps = showAdvanced ? 10 : TOTAL_REQUIRED_STEPS;
  const taskIntentValid = isTaskIntentValid();

  const completedSteps = useMemo(() => {
    const completed = new Set<number>();
    if (taskIntentValid) completed.add(1);
    for (let i = 2; i <= totalSteps; i++) {
      completed.add(i);
    }
    return completed;
  }, [taskIntentValid, totalSteps]);

  const currentStepValid = isCurrentStepValid();
  const currentStepError = getCurrentStepError();

  // ─────────────────────────────────────────────────────────────────────────
  // Callbacks
  // ─────────────────────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (!currentStepValid) {
      setShowError(true);
      return;
    }
    if (currentStep < totalSteps) {
      goToStep(currentStep + 1);
      trackEvent("step_changed", {
        page: "wizard",
        timestamp: new Date().toISOString(),
        step: currentStep + 1,
      });
    }
  }, [currentStep, totalSteps, currentStepValid, goToStep, setShowError, trackEvent]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
      trackEvent("step_changed", {
        page: "wizard",
        timestamp: new Date().toISOString(),
        step: currentStep - 1,
      });
    }
  }, [currentStep, goToStep, trackEvent]);

  const handleFinish = useCallback(() => {
    if (!currentStepValid) {
      setShowError(true);
      return;
    }
    trackEvent("form_submitted", {
      page: "wizard",
      timestamp: new Date().toISOString(),
      data: wizardData,
    });
    finish();
  }, [currentStepValid, wizardData, setShowError, finish, trackEvent]);

  const toggleAdvanced = useCallback(() => {
    updateData({ show_advanced: !showAdvanced });
  }, [showAdvanced, updateData]);

  const handleReset = useCallback(() => {
    trackEvent("data_reset", {
      page: "wizard",
      timestamp: new Date().toISOString(),
      data: wizardData,
    });
    navigate({ to: "/wizard", search: { d: null, vld: 0 } });
    reset();
  }, [wizardData, navigate, reset, trackEvent]);

  const handleStepClick = useCallback(
    (step: number) => {
      if (step < currentStep) {
        goToStep(step);
        trackEvent("step_changed", {
          page: "wizard",
          timestamp: new Date().toISOString(),
          step,
        });
        return;
      }
      if (step > currentStep && !currentStepValid) {
        setShowError(true);
        return;
      }
      goToStep(step);
      trackEvent("step_changed", {
        page: "wizard",
        timestamp: new Date().toISOString(),
        step,
      });
    },
    [currentStep, currentStepValid, goToStep, setShowError, trackEvent]
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
              <h1 className="text-xl font-black uppercase tracking-tight">Prompt Wizard</h1>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-muted-foreground hover:text-foreground"
                  title="Reset form"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
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
            <WizardStep stepKey={currentStep} direction={direction} hint={stepHint}>
              <StepComponent data={wizardData} onUpdate={updateData} />
            </WizardStep>

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

        {showPreview && shareUrl && (
          <WizardPreview
            data={wizardData}
            compressed={false}
            onClose={() => setShowPreview(false)}
            source="wizard"
            shareUrl={shareUrl!}
          />
        )}

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Button variant="link" asChild>
            <Link to="/" className="text-muted-foreground font-mono text-sm">
              ← Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
});
