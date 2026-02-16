import { motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useWizardStore, generatePromptText } from "@/stores/wizard-store";

interface WizardNavigationProps {
  onNext: () => void;
  onBack: () => void;
  onFinish: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function WizardNavigation({
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
}: WizardNavigationProps) {
  const wizardData = useWizardStore((state) => state.wizardData);
  const isPromptAvailable =
    generatePromptText(wizardData, { source: "WizardNavigation" }).trim().length > 0;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t-4 border-foreground">
      {/* Back button */}
      {isFirstStep ? (
        <div />
      ) : (
        <motion.div whileHover={{ x: -4 }} whileTap={{ scale: 0.98 }} className="w-full md:w-auto">
          <Button
            variant="outline"
            onClick={onBack}
            className="uppercase font-bold w-full md:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </motion.div>
      )}

      {/* Next / Finish button */}
      {isLastStep || !isPromptAvailable ? null : (
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 w-full md:w-auto">
          <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} className="w-full md:w-auto">
            <Button onClick={onNext} className="uppercase font-bold w-full md:w-auto">
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
