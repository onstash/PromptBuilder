import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { WIZARD_STEPS, WIZARD_STEPS_REQUIRED } from "@/utils/prompt-wizard/schema";
import { useWizardStore } from "@/stores/wizard-store";

interface WizardProgressProps {
  onStepClick: (step: number) => void;
}

export function WizardProgress({ onStepClick }: WizardProgressProps) {
  const currentStep = useWizardStore((state) => state.wizardData.step);
  const totalSteps = useWizardStore((state) => state.wizardData.total_steps);
  const showAdvanced = useWizardStore((state) => state.wizardData.show_advanced);
  const completedSteps = useWizardStore((state) => state.completedSteps);
  const updatedAt = useWizardStore((state) => state.wizardData.updatedAt);
  const steps = showAdvanced ? WIZARD_STEPS : WIZARD_STEPS_REQUIRED;

  const handleStepClick = (stepNumber: number) => {
    // Can only click on completed steps or the step right after last completed
    const canNavigate =
      stepNumber === 1 || // Always can go to step 1
      completedSteps[stepNumber] || // Can go to completed steps
      completedSteps[stepNumber - 1]; // Can go to next step after completed

    if (canNavigate) {
      onStepClick(stepNumber);
    }
  };

  return (
    <div className="w-full">
      {/* Progress bar - scrollable on mobile */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <motion.div
          className="grid items-center gap-2 mb-4 min-w-max"
          style={{
            gridTemplateColumns: steps
              .map((_, i) => (i < steps.length - 1 ? "auto 1fr" : "auto"))
              .join(" "),
          }}
          layout
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isCompleted = completedSteps[stepNumber];
              const isActive = stepNumber === currentStep;
              const isUpcoming = !isCompleted && !isActive;

              // Can click if completed or is the next available step
              const isClickable =
                stepNumber === 1 || completedSteps[stepNumber] || stepNumber > 1
                  ? completedSteps[stepNumber - 1]
                  : false;

              console.log("\tWizardProgress", {
                step,
                stepNumber,
                isClickable,
              });

              return (
                <>
                  {/* Step dot */}
                  <motion.button
                    key={`step-${step!.id}-${updatedAt}`}
                    onClick={() => handleStepClick(stepNumber)}
                    disabled={!isClickable}
                    className={`
                      relative flex items-center justify-center w-10 h-10
                      border-4 border-foreground font-mono text-sm font-bold
                      transition-all
                      ${isCompleted ? "bg-primary text-primary-foreground" : ""}
                      ${isActive ? "bg-secondary text-secondary-foreground" : ""}
                      ${isUpcoming ? "bg-muted text-muted-foreground" : ""}
                      ${isClickable ? "cursor-pointer hover:scale-110" : "cursor-not-allowed opacity-60"}
                    `}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale: isActive ? [1, 1.1, 1] : 1,
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    whileHover={isClickable ? { scale: 1.1 } : {}}
                    whileTap={isClickable ? { scale: 0.95 } : {}}
                    title={
                      isClickable
                        ? `Go to Step ${stepNumber}: ${step!.title}`
                        : "Complete previous steps first"
                    }
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <span>{stepNumber}</span>}
                  </motion.button>

                  {/* Connecting line */}
                  {index < steps.length - 1 && (
                    <motion.div
                      key={`line-${step!.id}`}
                      className="h-1 bg-muted border-y-2 border-foreground relative overflow-hidden"
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-primary"
                        initial={{ width: "0%" }}
                        animate={{
                          width: isCompleted ? "100%" : "0%",
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.div>
                  )}
                </>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
      {/* Step title */}
      <div className="text-center">
        <span className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
          Step {currentStep} of {totalSteps}
        </span>
        <h2 className="text-2xl font-black text-foreground uppercase mt-1">
          {steps[currentStep - 1]?.title || ""}
        </h2>
      </div>
    </div>
  );
}
