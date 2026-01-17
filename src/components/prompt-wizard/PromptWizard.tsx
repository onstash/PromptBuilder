import { useCallback, useRef, useEffect, memo, useState } from "react";

import { motion } from "motion/react";
import { RotateCcw, Eye } from "lucide-react";
import { useNavigate, useSearch } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

import { TOTAL_STEPS, type PromptWizardData } from "@/utils/prompt-wizard/schema";

import { WizardProgress } from "./WizardProgress";
import { WizardNavigation } from "./WizardNavigation";
import { WizardStep } from "./WizardStep";
import { WizardPreview } from "./WizardPreview";
import { StoredPromptsSection } from "./StoredPromptsSection";
import { NavigationActions } from "./NavigationActions";

// Step components (Expert 6-Step Structure)
import { RoleStep } from "./steps/RoleStep";
import { TaskFormatStep } from "./steps/TaskFormatStep";
import { ContextStep } from "./steps/ContextStep";
import { GuardrailsStep } from "./steps/GuardrailsStep";
import { ReasoningStep } from "./steps/ReasoningStep";
import { SelfCheckStep } from "./steps/SelfCheckStep";

// Analytics
import { type MixpanelDataEvent, useTrackMixpanel } from "@/utils/analytics/MixpanelProvider";
// Stores
import { upsertPromptV2, useWizardStore } from "@/stores/wizard-store";
// Utils
import { compressPrompt } from "@/utils/prompt-wizard";
// Hooks
import { useIsMobile } from "@/hooks/use-mobile";
import { useWizardForm, type ValidationError } from "@/hooks/useWizardForm";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

// ═══════════════════════════════════════════════════════════════════════════
// STATIC CONFIGURATION (Expert 6-Step Structure)
// ═══════════════════════════════════════════════════════════════════════════

interface StepProps {
  data: PromptWizardData;
  onUpdate: (updates: Partial<PromptWizardData>) => void;
}

type StepComponent = React.ComponentType<StepProps>;

const STEP_COMPONENTS: Record<number, StepComponent> = {
  1: RoleStep, // Act as...
  2: TaskFormatStep, // What do you want? + Output Format
  3: ContextStep, // Give context + Examples
  4: GuardrailsStep, // Set guardrails (Constraints + Avoid)
  5: ReasoningStep, // Reasoning mode (optional)
  6: SelfCheckStep, // Verification (optional)
};

const STEP_HINTS: Record<number, string> = {
  1: "Define the AI's role and expertise level - this sets the foundation",
  2: "Be specific about what you want AND how you want it formatted",
  3: "Provide background info and examples to guide the AI",
  4: "Set boundaries - what the AI must do and must avoid",
  5: "How deeply should the AI reason through the problem? (optional)",
  6: "Should the AI verify its own work before responding? (optional)",
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
  const [isResetCalled, setIsResetCalled] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showValidationAlert, setShowValidationAlert] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // Zustand Store
  // ─────────────────────────────────────────────────────────────────────────
  const wizardData = useWizardStore((state) => state.wizardData);

  // ─────────────────────────────────────────────────────────────────────────
  // Validation Hook (must be after wizardData)
  // ─────────────────────────────────────────────────────────────────────────
  const { validateAllSteps, hasStepErrors } = useWizardForm(wizardData);

  const storeWizardDataInLocalStorage = () => {
    upsertPromptV2(
      wizardData,
      {
        noTaskIntent: () => {},
        onSuccess: () => {
          toast.success("Prompt saved!");
        },
      },
      {
        shouldExecute: true,
      }
    );
  };
  const shareUrl = useWizardStore((state) => state.shareUrl);

  const updateData = useWizardStore((state) => state.updateData);
  const goToStep = useWizardStore((state) => state.goToStep);
  const finish = useWizardStore((state) => state.finish);
  const reset = useWizardStore((state) => state.reset);
  const initialize = useWizardStore((state) => state.initialize);

  // ─────────────────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    trackEvent("page_viewed_wizard", {
      page: "wizard",
      timestamp: new Date().toISOString(),
    });

    // Initialize store from URL or localStorage
    const searchParams = search as any; // Cast to access optional params until router types catch up
    const { d, vld, role, exampleId } = searchParams;

    if (d && vld) {
      // 1. Load compressed complete data
      initialize({ d, vld });
      trackEvent("page_viewed_wizard_type_url", {
        page: "wizard",
        timestamp: new Date().toISOString(),
        d,
        vld,
      });
    } else if (role || exampleId) {
      // 2. Load from Query Params (Landing Page handoff)
      // If we have params, we start fresh but pre-fill
      initialize();
      const currentData = useWizardStore.getState().wizardData;

      // Detect role from exampleId if role is missing but exampleId exists
      // (exampleId format is usually "role-something")
      let inferredRole = role;
      if (!inferredRole && exampleId) {
        const parts = exampleId.split("-");
        if (parts.length > 0) inferredRole = parts[0];
      }

      // Update store with params
      useWizardStore.getState().updateData({
        ...currentData,
        ai_role: inferredRole || currentData.ai_role,
      });

      // Store exampleId in temporary session storage effectively by using a URL param?
      // Or we can just rely on the URL param persisting if we kept it?
      // TanStack router might strip it if not in validateSearch schema? (We added it there)

      trackEvent("page_viewed_wizard_type_params", {
        page: "wizard",
        timestamp: new Date().toISOString(),
        role,
        exampleId,
      });
    } else {
      // 3. Load default / localStorage
      initialize();
      // Track localStorage load if it was the source
      const dataSource = useWizardStore.getState().dataSource;
      const wizardData = useWizardStore.getState().wizardData;
      if (dataSource === "localStorage") {
        const dataCompressed = compressPrompt(wizardData);
        navigate({ to: "/wizard", search: { d: dataCompressed, vld: 1, partial: false } });
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
  const { step: currentStep } = wizardData;

  // ─────────────────────────────────────────────────────────────────────────
  // Callbacks
  // ─────────────────────────────────────────────────────────────────────────
  // Free navigation - just go to next step
  const handleNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      goToStep(currentStep + 1);
      trackEvent(`step_changed_${currentStep + 1}` as MixpanelDataEvent, {
        page: "wizard",
        timestamp: new Date().toISOString(),
        step: currentStep + 1,
      });
    }
  }, [currentStep, goToStep, trackEvent]);

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
    // Validate all steps before saving
    const errors = validateAllSteps();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationAlert(true);
      return;
    }
    trackEvent("form_submitted", {
      page: "wizard",
      timestamp: new Date().toISOString(),
      data: wizardData,
    });
    const dataCompressed = compressPrompt(wizardData);
    navigate({ to: "/wizard", search: { d: dataCompressed, vld: 1, partial: false } });
    finish();

    // On mobile, open the preview sheet after generating
    if (isMobile) {
      setIsPreviewOpen(true);
    }
    storeWizardDataInLocalStorage();
  }, [wizardData, validateAllSteps, finish, trackEvent, isMobile, navigate]);

  const handleReset = () => {
    setIsResetCalled(true);
  };

  const handleResetCore = useCallback(() => {
    setIsResetCalled(false);
    trackEvent("data_reset", {
      page: "wizard",
      timestamp: new Date().toISOString(),
      data: wizardData,
    });
    navigate({ to: "/wizard", search: { d: null, vld: 0, partial: false } });
    reset();
  }, [wizardData, navigate, reset, trackEvent]);

  // Free navigation - no validation required to navigate between steps
  const handleStepClick = useCallback(
    (step: number) => {
      goToStep(step);
      trackEvent(`step_changed_${step}` as MixpanelDataEvent, {
        page: "wizard",
        timestamp: new Date().toISOString(),
        step,
      });
    },
    [goToStep, trackEvent]
  );

  // Get step component and props
  const StepComponent = STEP_COMPONENTS[currentStep] || RoleStep;
  const stepHint = STEP_HINTS[currentStep] || "";

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Actions - At Top */}
      <NavigationActions page="wizard" />

      <div className="py-8 px-4 md:px-[5%]">
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
                </div>
              </div>
              <WizardProgress onStepClick={handleStepClick} hasStepErrors={hasStepErrors} />
            </div>

            {/* Step Content */}
            <div className="p-6 min-h-[400px]">
              <WizardStep stepKey={currentStep} direction={direction} hint={stepHint}>
                <StepComponent data={wizardData} onUpdate={updateData} />
              </WizardStep>
            </div>

            {/* Navigation */}
            <div className="p-6">
              <WizardNavigation onNext={handleNext} onBack={handleBack} onFinish={handleFinish} />
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

        {/* Reset Confirmation Dialog */}
        <AlertDialog open={isResetCalled} onOpenChange={(open) => !open && handleResetCore()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset this prompt?</AlertDialogTitle>
              <AlertDialogDescription>
                This will reset the prompt data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetCore}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Validation Errors Alert */}
        <AlertDialog open={showValidationAlert} onOpenChange={setShowValidationAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive">
                ⚠️ Please fix the following errors
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-2">
                  {validationErrors.map((error, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <span className="font-mono text-muted-foreground">Step {error.step}:</span>
                      <span>{error.message}</span>
                    </div>
                  ))}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => {
                  setShowValidationAlert(false);
                  // Navigate to the first step with an error
                  if (validationErrors.length > 0) {
                    goToStep(validationErrors[0].step);
                  }
                }}
              >
                Fix Errors
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Stored Prompts (only shows if user has saved prompts) */}
        <StoredPromptsSection
          page="wizard"
          columns={3}
          currentPrompt={wizardData}
          key={wizardData.finishedAt}
        />
      </div>
    </div>
  );
});
