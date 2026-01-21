import { useCallback, useRef, useEffect, memo, useState, useMemo } from "react";

import { motion, AnimatePresence } from "motion/react";
import { RotateCcw } from "lucide-react";
import { useNavigate, useSearch } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

import { WIZARD_STEPS, type PromptWizardData } from "@/utils/prompt-wizard/schema";

import { WizardProgress } from "./WizardProgress";
import { WizardNavigation } from "./WizardNavigation";
import { MobileNavigation } from "./MobileNavigation";
import { WizardStep } from "./WizardStep";
import { WizardPreview } from "./WizardPreview";
import { StoredPromptsSection } from "./StoredPromptsSection";
import { NavigationActions } from "./NavigationActions";

// Step components (Expert 6-Step Structure)
import { RoleStep } from "./steps/RoleStep";
import { TaskStep } from "./steps/TaskStep";
import { ContextStep } from "./steps/ContextStep";
import { GuardrailsStep } from "./steps/GuardrailsStep";
import { OutputFormatStep } from "./steps/OutputFormatStep";
import { ReasoningStep } from "./steps/ReasoningStep";
import { SelfCheckStep } from "./steps/SelfCheckStep";

// Analytics
import { type MixpanelDataEvent, useTrackMixpanel } from "@/utils/analytics/MixpanelProvider";
// Stores
import { upsertPromptV2, useWizardStore, generatePromptText } from "@/stores/wizard-store";
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
// Dialog Imports
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Utils
import { getOrCreateSessionId } from "@/utils/session";

// Convex
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

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
  2: TaskStep, // What do you want?
  3: ContextStep, // Give context + Examples
  4: GuardrailsStep, // Set guardrails (Constraints + Avoid)
  5: OutputFormatStep, // Output Format
  6: ReasoningStep, // Reasoning mode (optional)
  7: SelfCheckStep, // Verification (optional)
};

const STEP_HINTS: Record<number, string> = {
  1: "Define the AI's role and expertise level - this sets the foundation",
  2: "Be specific about what you want",
  3: "Provide background info and examples to guide the AI",
  4: "Set boundaries - what the AI must do and must avoid",
  5: "Format the output - how do you want the response to look?",
  6: "How deeply should the AI reason through the problem? (optional)",
  7: "Should the AI verify its own work before responding? (optional)",
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

// Define step groups
const BASIC_STEPS = [1, 2, 3]; // Role, Task, Context
const ADVANCED_STEPS = [1, 2, 3, 4, 5, 6, 7]; // All steps
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

  // Onboarding Dialog State
  const [showOnboardingDialog, setShowOnboardingDialog] = useState(false);

  // Save State (Lifted from WizardPreview)
  const savePrompt = useMutation(api.prompts.savePrompt);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // Zustand Store
  // ─────────────────────────────────────────────────────────────────────────
  const wizardData = useWizardStore((state) => state.wizardData);
  const wizardMode = useWizardStore((state) => state.wizardMode);
  const setWizardMode = useWizardStore((state) => state.setWizardMode);

  // ─────────────────────────────────────────────────────────────────────────
  // Validation Hook (must be after wizardData)
  // ─────────────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────
  // Validation Hook (must be after wizardData)
  // ─────────────────────────────────────────────────────────────────────────
  const { validateAllSteps, hasStepErrors } = useWizardForm(wizardData, wizardMode);

  const storeWizardDataInLocalStorage = () => {
    upsertPromptV2(
      wizardData,
      {
        noTaskIntent: () => {},
        onSuccess: () => {
          // toast.success("Prompt saved!");
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
    const { d, vld, role, exampleId, wizardType } = searchParams;

    // Check for wizardType param to override stored preference
    if (wizardType === "advanced") {
      setWizardMode("advanced");
    } else if (wizardType === "basic") {
      setWizardMode("basic");
    }

    if (d && vld) {
      // 1. Load compressed complete data
      initialize({ d, vld });
      trackEvent("page_viewed_wizard_type_url", {
        page: "wizard",
        timestamp: new Date().toISOString(),
        d,
        vld,
        wizardType,
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

  const isBasicWizardType = wizardMode === "basic";
  const isFirstStep = currentStep === 1;
  const isLastStep = isBasicWizardType ? currentStep === 3 : currentStep === 7;

  // Ensure current step matches mode
  useEffect(() => {
    if (isBasicWizardType && !BASIC_STEPS.includes(currentStep)) {
      goToStep(1); // Default to start of basic
    } else if (!isBasicWizardType && !ADVANCED_STEPS.includes(currentStep)) {
      // Now advanced includes all, so this condition is strictly "step > 7" or "step < 1" which shouldn't happen via normal UI.
      // But if we toggle from basic (e.g. step 3) to advanced, step 3 is valid in advanced.
      // So we don't need to force jump unless out of bounds.
    }
  }, [isBasicWizardType]);

  // ─────────────────────────────────────────────────────────────────────────
  // Callbacks
  // ─────────────────────────────────────────────────────────────────────────
  // Free navigation - just go to next step
  const handleNext = useCallback(() => {
    // Basic Mode Logic
    if (isBasicWizardType && currentStep < 3) {
      goToStep(currentStep + 1);
      trackEvent(`step_changed_${currentStep + 1}` as MixpanelDataEvent, {
        page: "wizard",
        timestamp: new Date().toISOString(),
        step: currentStep + 1,
      });
    }
    // Advanced Mode Logic
    else if (!isBasicWizardType && currentStep < 7) {
      goToStep(currentStep + 1);
      trackEvent(`step_changed_${currentStep + 1}` as MixpanelDataEvent, {
        page: "wizard",
        timestamp: new Date().toISOString(),
        step: currentStep + 1,
      });
    }
  }, [goToStep, trackEvent, isBasicWizardType, currentStep]);

  const handleBack = useCallback(() => {
    // Basic Mode Logic
    if (currentStep > 1) {
      goToStep(currentStep - 1);
      trackEvent(`step_changed_${currentStep - 1}` as MixpanelDataEvent, {
        page: "wizard",
        timestamp: new Date().toISOString(),
        step: currentStep - 1,
      });
    }
  }, [goToStep, trackEvent, isBasicWizardType, currentStep]);

  const handleFinish = useCallback(() => {
    // Validate all steps before saving
    const errors = validateAllSteps();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationAlert(true);
      return;
    }

    // First Time User Logic
    const hasCompletedFirstPrompt = localStorage.getItem("has_completed_first_prompt");
    if (!hasCompletedFirstPrompt) {
      setShowOnboardingDialog(true);
      localStorage.setItem("has_completed_first_prompt", "true");
      trackEvent("onboarding_dialog_shown", {
        page: "wizard",
        timestamp: new Date().toISOString(),
      });
    }

    trackEvent("form_submitted", {
      page: "wizard",
      timestamp: new Date().toISOString(),
      data: wizardData,
      mode: wizardMode,
    });
    const dataCompressed = compressPrompt(wizardData);
    navigate({ to: "/wizard", search: { d: dataCompressed, vld: 1, partial: false } });
    finish();

    // On mobile, open the preview sheet after generating
    // Only if NOT showing the onboarding dialog (to avoid stacking)
    if (isMobile && hasCompletedFirstPrompt) {
      setIsPreviewOpen(true);
    }

    // Save to Convex
    const handleSave = async () => {
      try {
        setIsSaving(true);
        const sessionId = getOrCreateSessionId(); // ensure session id
        // Note: getOrCreateSessionId should be used if imported, but simple fallback here
        // Actually better to reuse the utility if we can import it, but let's assume WizardPreview logic for now
        // Replicating WizardPreview save logic:

        // We need a session ID. The WizardPreview example used `getOrCreateSessionId` from utility or just passed it.
        // Let's verify imports or just use a simple robust getter.
        // For now, simpler:

        const result = await savePrompt({
          promptData: wizardData,
          sessionId,
        });

        if (result && result.slug) {
          setSavedSlug(result.slug);
          toast.success("Prompt saved!");
          storeWizardDataInLocalStorage();
        }
      } catch (e) {
        console.error("Failed to save", e);
        toast.error("Failed to save prompt");
      } finally {
        setIsSaving(false);
      }
    };

    handleSave();
  }, [wizardData, validateAllSteps, finish, trackEvent, isMobile, navigate, savePrompt]);

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
    navigate({ to: "/wizard", search: { d: null, vld: 0, partial: false }, reloadDocument: true });
    reset();
    setValidationErrors([]);
    setShowValidationAlert(false);
    setShowValidationAlert(false);
    // Also reset to basic mode
    setWizardMode("basic");
  }, [wizardData, navigate, reset, trackEvent, setWizardMode]);

  // Free navigation - no validation required to navigate between steps
  // RESTRICTED by Mode
  const handleStepClick = useCallback(
    (step: number) => {
      // Only allow clicking steps within current mode
      if (isBasicWizardType && BASIC_STEPS.includes(step)) {
        goToStep(step);
      } else if (!isBasicWizardType && ADVANCED_STEPS.includes(step)) {
        goToStep(step);
      }

      trackEvent(`step_changed_${step}` as MixpanelDataEvent, {
        page: "wizard",
        timestamp: new Date().toISOString(),
        step,
      });
    },
    [goToStep, trackEvent, isBasicWizardType]
  );

  const handleViewPrompt = useCallback(() => {
    setIsPreviewOpen(true);
  }, []);

  const isPromptAvailable = useMemo(() => {
    return generatePromptText(wizardData).trim().length > 0;
  }, [wizardData.updatedAt]);

  // Get step component and props
  const StepComponent = STEP_COMPONENTS[currentStep] || RoleStep;
  const stepHint = STEP_HINTS[currentStep] || "";

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Actions - At Top */}
      <NavigationActions page="wizard" />

      <div className="py-4 px-4 md:px-[5%]">
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
            <div className="p-4 border-b-4 border-foreground">
              <div className="flex items-center justify-between mb-4">
                {/* Advanced Mode Toggle (Title Area) */}
                <div className="flex items-center gap-2">
                  <Switch
                    id="advanced-mode-toggle"
                    checked={!isBasicWizardType}
                    onCheckedChange={(checked) => setWizardMode(checked ? "advanced" : "basic")}
                    className="cursor-pointer"
                  />
                  <Label
                    htmlFor="advanced-mode-toggle"
                    className="font-bold uppercase text-sm cursor-pointer"
                  >
                    {!isBasicWizardType ? "Advanced" : "Basic"} Mode
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-muted-foreground hover:text-foreground font-bold uppercase gap-2 cursor-pointer"
                    title="Reset form"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Prompt
                  </Button>
                </div>
              </div>

              {/* Progress or Title (Animated) */}
              <div className="relative overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={wizardMode}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {!isBasicWizardType ? (
                      <WizardProgress
                        onStepClick={handleStepClick}
                        hasStepErrors={hasStepErrors}
                        steps={ADVANCED_STEPS}
                      />
                    ) : (
                      <div className="text-center mb-2">
                        <h2 className="text-2xl font-black text-foreground uppercase mt-1">
                          {WIZARD_STEPS.find((s) => s.id === currentStep)?.title || ""}
                        </h2>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Step Content */}
            <div className="p-4 min-h-[300px]">
              <WizardStep stepKey={currentStep} direction={direction} hint={stepHint}>
                <StepComponent data={wizardData} onUpdate={updateData} />
              </WizardStep>
            </div>

            {/* Navigation - Desktop Only */}
            <div className="p-4 hidden md:block">
              <WizardNavigation
                onNext={handleNext}
                onBack={handleBack}
                onFinish={handleFinish}
                isFirstStep={isFirstStep}
                isLastStep={isLastStep}
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
              savedSlug={savedSlug}
              onSave={handleFinish}
              isSaving={isSaving}
            />
          </motion.div>
        </motion.div>

        {/* Mobile Bottom Sheet */}
        <Drawer open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DrawerContent className="max-h-[95vh]">
            <DrawerHeader>
              <DrawerTitle className="font-black uppercase">Your Prompt</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-6 overflow-y-auto">
              <WizardPreview
                data={wizardData}
                compressed={false}
                source="wizard"
                shareUrl={shareUrl!}
                savedSlug={savedSlug}
                onSave={handleFinish}
                isSaving={isSaving}
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
        {/* Onboarding Dialog */}
        <Dialog open={showOnboardingDialog} onOpenChange={setShowOnboardingDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase">
                🎉 Prompt Created Successfully!
              </DialogTitle>
              <DialogDescription>You've taken the first step!</DialogDescription>
            </DialogHeader>
            <div className="aspect-video w-full mt-2 rounded-lg overflow-hidden border-2 border-foreground">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/7lsdJDiJ0QE"
                title="Prompt Engineering Tips"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4 items-center justify-between w-full">
              {isBasicWizardType ? (
                <>
                  <p className="text-sm text-muted-foreground text-center sm:text-left flex-1">
                    Want to unlock full control?
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowOnboardingDialog(false)}>
                      Keep Basic
                    </Button>
                    <Button
                      onClick={() => {
                        setWizardMode("advanced");
                        localStorage.setItem("wizard_mode_preference", "advanced");
                        setShowOnboardingDialog(false);
                        trackEvent("onboarding_switched_to_advanced", {
                          page: "wizard",
                          timestamp: new Date().toISOString(),
                        });
                        toast.success("Switched to Advanced Mode as default!");
                      }}
                      className="bg-primary text-primary-foreground"
                    >
                      Switch to Advanced
                    </Button>
                  </div>
                </>
              ) : (
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2">
                  <p className="text-sm text-green-600 font-medium flex items-center gap-2">
                    ✨ Advanced Mode saved as default
                  </p>
                  <Button onClick={() => setShowOnboardingDialog(false)}>Get Started</Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile Navigation - Fixed at bottom */}
      <MobileNavigation
        className="md:hidden"
        onNext={handleNext}
        onBack={handleBack}
        onFinish={handleFinish}
        onViewPrompt={handleViewPrompt}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        isPromptAvailable={isPromptAvailable}
      />
    </div>
  );
});
