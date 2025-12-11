import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TOTAL_REQUIRED_STEPS } from "@/utils/prompt-wizard/schema";

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
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex items-center justify-between pt-6 border-t-4 border-foreground">
      {/* Back button */}
      {!isFirstStep ? (
        <motion.div whileHover={{ x: -4 }} whileTap={{ scale: 0.98 }}>
          <Button variant="outline" onClick={onBack} className="uppercase font-bold">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </motion.div>
      ) : (
        <div /> // Spacer
      )}

      {/* Next / Finish button */}
      {isLastStep ? (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={onFinish} disabled={!canProceed} className="uppercase font-bold">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Prompt
          </Button>
        </motion.div>
      ) : (
        <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={onNext} disabled={!canProceed} className="uppercase font-bold">
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
