import { useCallback, useRef, useEffect, memo, useState } from "react";

import { motion } from "motion/react";
import { Settings2, RotateCcw, Eye } from "lucide-react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

import { type PromptWizardData } from "@/utils/prompt-wizard/schema";

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

// Analytics
import { type MixpanelDataEvent, useTrackMixpanel } from "@/utils/analytics/MixpanelProvider";
// Stores
import { useWizardStore } from "@/stores/wizard-store";
// Utils
import { compress } from "@/utils/prompt-wizard";
// Hooks
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  // ─────────────────────────────────────────────────────────────────────────
  // Mobile Preview Sheet State
  // ─────────────────────────────────────────────────────────────────────────
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // Zustand Store
  // ─────────────────────────────────────────────────────────────────────────
  const wizardData = useWizardStore((state) => state.wizardData);
  const shareUrl = useWizardStore((state) => state.shareUrl);
  const showError = useWizardStore((state) => state.showError);
  const completedSteps = useWizardStore((state) => state.completedSteps);

  const updateData = useWizardStore((state) => state.updateData);
  const goToStep = useWizardStore((state) => state.goToStep);
  const setShowError = useWizardStore((state) => state.setShowError);
  const finish = useWizardStore((state) => state.finish);
  const reset = useWizardStore((state) => state.reset);
  const initialize = useWizardStore((state) => state.initialize);
  const isCurrentStepValid = useWizardStore((state) => state.isCurrentStepValid);
  const getCurrentStepError = useWizardStore((state) => state.getCurrentStepError);

  // ─────────────────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    trackEvent("page_viewed_wizard", {
      page: "wizard",
      timestamp: new Date().toISOString(),
    });

    // Initialize store from URL or localStorage
    if (search.d && search.vld) {
      initialize({ d: search.d, vld: search.vld });
      trackEvent("page_viewed_wizard_type_url", {
        page: "wizard",
        timestamp: new Date().toISOString(),
        d: search.d,
        vld: search.vld,
      });
    } else {
      initialize();
      // Track localStorage load if it was the source
      const dataSource = useWizardStore.getState().dataSource;
      const wizardData = useWizardStore.getState().wizardData;
      if (dataSource === "localStorage") {
        const dataCompressed = compress(JSON.stringify(wizardData));
        navigate({ to: "/wizard", search: { d: dataCompressed, vld: 1 } });
        trackEvent("page_viewed_wizard_type_localstorage", {
          page: "wizard",
          timestamp: new Date().toISOString(),
          d: dataCompressed,
          vld: 1,
        });
      } else {
        trackEvent("page_viewed_wizard_type_default", {
          page: "wizard",
          timestamp: new Date().toISOString(),
          d: null,
          vld: 0,
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
  const totalSteps = wizardData.total_steps;

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
      trackEvent(`step_changed_${currentStep + 1}` as MixpanelDataEvent, {
        page: "wizard",
        timestamp: new Date().toISOString(),
        step: currentStep + 1,
      });
    }
  }, [currentStep, totalSteps, currentStepValid, goToStep, setShowError, trackEvent]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
      trackEvent(`step_changed_${currentStep - 1}` as MixpanelDataEvent, {
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
    const dataCompressed = compress(JSON.stringify(wizardData));
    navigate({ to: "/wizard", search: { d: dataCompressed, vld: 1 } });
    finish();

    // On mobile, open the preview sheet after generating
    if (isMobile) {
      setIsPreviewOpen(true);
    }
  }, [currentStepValid, wizardData, setShowError, finish, trackEvent, isMobile]);

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
        trackEvent(`step_changed_${step}` as MixpanelDataEvent, {
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
      trackEvent(`step_changed_${step}` as MixpanelDataEvent, {
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
    <div className="min-h-screen bg-background py-8 px-4 md:px-[5%]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex flex-col md:flex-row md:items-start md:gap-6 md:justify-between md:max-w-[90%]"
      >
        {/* Wizard Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full md:max-w-[50%] bg-card border-4 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))]"
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
              totalSteps={totalSteps}
              completedSteps={completedSteps}
              onStepClick={handleStepClick}
            />
          </div>

          {/* Step Content */}
          <div className="p-6 min-h-[400px]">
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

        {/* Desktop Preview - Hidden on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:block md:max-w-[45%]"
        >
          <WizardPreview
            data={wizardData}
            compressed={false}
            source="wizard"
            shareUrl={shareUrl!}
          />
        </motion.div>
      </motion.div>

      {/* Mobile Preview Button - Fixed at bottom */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-4 z-40"
        >
          <Button
            onClick={() => setIsPreviewOpen(true)}
            size="lg"
            className="shadow-lg uppercase font-bold"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Prompt
          </Button>
        </motion.div>
      )}

      {/* Mobile Bottom Sheet */}
      <Drawer open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="px-4">
            <DrawerTitle className="font-black uppercase">Your Prompt</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto">
            <WizardPreview
              data={wizardData}
              compressed={false}
              source="wizard"
              shareUrl={shareUrl!}
            />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Back to Home */}
      <div className="mt-6 text-center">
        <Button variant="link" asChild>
          <Link to="/" className="text-muted-foreground font-mono text-sm">
            ← Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
});
