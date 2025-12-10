import { motion } from "motion/react";
import { Check } from "lucide-react";
import {
  TOTAL_REQUIRED_STEPS,
  WIZARD_STEPS,
} from "@/utils/prompt-wizard/schema";

interface WizardProgressProps {
  currentStep: number;
  showAdvanced: boolean;
}

export function WizardProgress({
  currentStep,
  showAdvanced,
}: WizardProgressProps) {
  const totalSteps = showAdvanced ? WIZARD_STEPS.length : TOTAL_REQUIRED_STEPS;
  const steps = WIZARD_STEPS.slice(0, totalSteps);

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step dot */}
              <motion.div
                className={`
                  relative flex items-center justify-center w-10 h-10 
                  border-4 border-foreground font-mono text-sm font-bold
                  ${isCompleted ? "bg-primary text-primary-foreground" : ""}
                  ${isActive ? "bg-secondary text-secondary-foreground" : ""}
                  ${isUpcoming ? "bg-muted text-muted-foreground" : ""}
                `}
                animate={{
                  scale: isActive ? [1, 1.1, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{stepNumber}</span>
                )}
              </motion.div>

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
