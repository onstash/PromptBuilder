import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/stores/wizard-store";

interface WizardNavigationProps {
  onNext: () => void;
  onBack: () => void;
  onFinish: () => void;
}

export function WizardNavigation({ onNext, onBack, onFinish }: WizardNavigationProps) {
  const currentStep = useWizardStore((state) => state.wizardData.step);
  const totalSteps = useWizardStore((state) => state.wizardData.total_steps);
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

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
        {!isLastStep && (
          <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={onNext} className="uppercase font-bold">
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={onFinish} className="uppercase font-bold">
            <Sparkles className="w-4 h-4 mr-2" />
            Save Prompt
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
