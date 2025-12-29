import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TOTAL_REQUIRED_STEPS } from "@/utils/prompt-wizard/schema";
import { useWizardStore } from "@/stores/wizard-store";

interface WizardNavigationProps {
  currentStep: number;
  showAdvanced: boolean;
  onNext: () => void;
  onBack: () => void;
  onFinish: () => void;
  canProceed?: boolean;
}

export function WizardNavigation({
  currentStep,
  showAdvanced,
  onNext,
  onBack,
  onFinish,
  canProceed = true,
}: WizardNavigationProps) {
  const totalSteps = showAdvanced ? 10 : TOTAL_REQUIRED_STEPS;
  const isFirstStep = currentStep === 1;
  const hasFinished = useWizardStore((store) => store.wizardData.finishedAt !== -1);

  return (
    <div className="flex items-center justify-between pt-6 border-t-4 border-foreground">
      {/* Back button */}
      <motion.div
        whileHover={isFirstStep ? {} : { x: -4 }}
        whileTap={isFirstStep ? {} : { scale: 0.98 }}
      >
        <Button
          variant="outline"
          disabled={isFirstStep}
          onClick={onBack}
          className="uppercase font-bold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </motion.div>

      {/* Next / Finish button */}
      <div className="flex items-center justify-between gap-4">
        <motion.div
          whileHover={!canProceed ? {} : { x: 4 }}
          whileTap={!canProceed ? {} : { scale: 0.98 }}
        >
          <Button onClick={onNext} disabled={!canProceed} className="uppercase font-bold">
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
        {hasFinished && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={onFinish} disabled={!canProceed} className="uppercase font-bold">
              <Sparkles className="w-4 h-4 mr-2" />
              Save Prompt
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
