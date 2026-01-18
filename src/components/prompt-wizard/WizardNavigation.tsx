import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/stores/wizard-store";

interface WizardNavigationProps {
  onNext: () => void;
  onBack: () => void;
  onFinish: () => void;
  isLastStep: boolean;
}

export function WizardNavigation({ onNext, onBack, onFinish, isLastStep }: WizardNavigationProps) {
  const currentStep = useWizardStore((state) => state.wizardData.step);
  const isFirstStep = currentStep === 1;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t-4 border-foreground">
      {/* Back button */}
      <motion.div
        whileHover={isFirstStep ? {} : { x: -4 }}
        whileTap={isFirstStep ? {} : { scale: 0.98 }}
        className="w-full md:w-auto"
      >
        <Button
          variant="outline"
          disabled={isFirstStep}
          onClick={onBack}
          className="uppercase font-bold w-full md:w-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </motion.div>

      {/* Next / Finish button */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 w-full md:w-auto">
        {!isLastStep && (
          <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} className="w-full md:w-auto">
            <Button onClick={onNext} className="uppercase font-bold w-full md:w-auto">
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full md:w-auto"
        >
          <Button onClick={onFinish} className="uppercase font-bold w-full md:w-auto">
            <Sparkles className="w-4 h-4 mr-2" />
            Save Prompt
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
