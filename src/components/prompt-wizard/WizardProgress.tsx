import { motion } from "motion/react";
import { Check } from "lucide-react";
import {
  TOTAL_REQUIRED_STEPS,
  WIZARD_STEPS,
} from "@/utils/prompt-wizard/schema";

interface WizardProgressProps {
  currentStep: number;
  showAdvanced: boolean;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
}

export function WizardProgress({
  currentStep,
  showAdvanced,
  completedSteps,
  onStepClick,
}: WizardProgressProps) {
  const totalSteps = showAdvanced ? WIZARD_STEPS.length : TOTAL_REQUIRED_STEPS;
  const steps = WIZARD_STEPS.slice(0, totalSteps);

  const handleStepClick = (stepNumber: number) => {
    // Can only click on completed steps or the step right after last completed
    const canNavigate =
      stepNumber === 1 || // Always can go to step 1
      completedSteps.has(stepNumber) || // Can go to completed steps
      completedSteps.has(stepNumber - 1); // Can go to next step after completed

    if (canNavigate) {
      onStepClick(stepNumber);
    }
  };

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = completedSteps.has(stepNumber);
          const isActive = stepNumber === currentStep;
          const isUpcoming = !isCompleted && !isActive;

          // Can click if completed or is the next available step
          const isClickable =
            stepNumber === 1 ||
            completedSteps.has(stepNumber) ||
            completedSteps.has(stepNumber - 1);

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step dot */}
              <motion.button
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
                animate={{
                  scale: isActive ? [1, 1.1, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
                whileHover={isClickable ? { scale: 1.1 } : {}}
                whileTap={isClickable ? { scale: 0.95 } : {}}
                title={
                  isClickable
                    ? `Go to Step ${stepNumber}: ${step.title}`
                    : "Complete previous steps first"
                }
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{stepNumber}</span>
                )}
              </motion.button>

              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2 bg-muted border-y-2 border-foreground relative overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-primary"
                    initial={{ width: "0%" }}
                    animate={{
                      width: isCompleted ? "100%" : "0%",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          );
        })}
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
