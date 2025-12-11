import { useState, useCallback, useMemo, useRef, useEffect, memo } from "react";
import { motion } from "motion/react";
import { Settings2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import {
  TOTAL_REQUIRED_STEPS,
  type PromptWizardData,
} from "@/utils/prompt-wizard/schema";
import { compress } from "@/utils/prompt-wizard/url-compression";
import { WIZARD_DEFAULTS } from "@/utils/prompt-wizard/search-params";

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

const STORAGE_KEY = "wizard-draft";
const SHARE_URL_KEY = "wizard-share-url";

// ═══════════════════════════════════════════════════════════════════════════
// LOCALSTORAGE HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function loadFromStorage(): PromptWizardData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return WIZARD_DEFAULTS;
    return { ...WIZARD_DEFAULTS, ...JSON.parse(stored) };
  } catch {
    return WIZARD_DEFAULTS;
  }
}

function saveToStorage(data: PromptWizardData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable
  }
}

function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SHARE_URL_KEY);
  } catch {
    // Ignore
  }
}

function generateShareUrl(data: PromptWizardData): string {
  // Only include non-default values
  const filtered: Partial<PromptWizardData> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === "d") continue;
    if (value === undefined || value === null || value === "") continue;
    const defaultVal = WIZARD_DEFAULTS[key as keyof PromptWizardData];
    if (value === defaultVal) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (filtered as any)[key] = value;
  }

  const json = JSON.stringify(filtered);
  const compressed = compress(json);
  return `/share?d=${compressed}`;
}

function saveShareUrl(url: string): void {
  try {
    localStorage.setItem(SHARE_URL_KEY, url);
  } catch {
    // Ignore
  }
}

function getShareUrl(): string | null {
  try {
    return localStorage.getItem(SHARE_URL_KEY);
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const PromptWizard = memo(function PromptWizard() {
  // Initialize from localStorage
  const [wizardData, setWizardData] =
    useState<PromptWizardData>(loadFromStorage);
  const [showPreview, setShowPreview] = useState(false);
  const [showError, setShowError] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(getShareUrl);

  // Track previous step for direction
  const prevStepRef = useRef(wizardData.step);
  const direction =
    wizardData.step > prevStepRef.current
      ? 1
      : wizardData.step < prevStepRef.current
        ? -1
        : 0;

  useEffect(() => {
    prevStepRef.current = wizardData.step;
  }, [wizardData.step]);

  // Debounced localStorage save (300ms)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveToStorage(wizardData);
    }, 300);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [wizardData]);

  // Derived values
  const currentStep = wizardData.step;
  const showAdvanced = wizardData.show_advanced;
  const totalSteps = showAdvanced ? 10 : TOTAL_REQUIRED_STEPS;
  const taskIntentValid = wizardData.task_intent.trim().length >= 10;

  const completedSteps = useMemo(() => {
    const completed = new Set<number>();
    if (taskIntentValid) completed.add(1);
    for (let i = 2; i <= totalSteps; i++) {
      completed.add(i);
    }
    return completed;
  }, [taskIntentValid, totalSteps]);

  const currentStepValid = currentStep === 1 ? taskIntentValid : true;
  const currentStepError =
    currentStep === 1 && !taskIntentValid
      ? "Please describe what you want (at least 10 characters)"
      : null;

  // Update local state (fast, no URL updates)
  const updateData = useCallback((updates: Partial<PromptWizardData>) => {
    setShowError(false);
    setWizardData((prev) => ({ ...prev, ...updates }));
  }, []);

  // Navigation handlers
  const goToStep = useCallback((step: number) => {
    setShowError(false);
    setWizardData((prev) => ({ ...prev, step }));
  }, []);

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
    // Generate and save share URL
    const url = generateShareUrl(wizardData);
    saveShareUrl(url);
    setShareUrl(url);
    setShowPreview(true);
  }, [currentStepValid, wizardData]);

  const toggleAdvanced = useCallback(() => {
    updateData({ show_advanced: !showAdvanced });
  }, [showAdvanced, updateData]);

  const handleReset = useCallback(() => {
    setWizardData(WIZARD_DEFAULTS);
    clearStorage();
    setShareUrl(null);
    setShowPreview(false);
    setShowError(false);
  }, []);

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
            <WizardStep
              stepKey={currentStep}
              direction={direction}
              hint={stepHint}
            >
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

        {/* Preview Panel */}
        {showPreview && (
          <WizardPreview
            data={wizardData}
            shareUrl={shareUrl}
            onClose={() => setShowPreview(false)}
            source="wizard"
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
