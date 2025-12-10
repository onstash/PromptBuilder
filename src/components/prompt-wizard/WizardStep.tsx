import { motion, AnimatePresence } from "motion/react";
import type { ReactNode } from "react";

interface WizardStepProps {
  stepKey: number;
  direction: number;
  children: ReactNode;
  hint?: string;
}

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
};

export function WizardStep({
  stepKey,
  direction,
  children,
  hint,
}: WizardStepProps) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={stepKey}
        custom={direction}
        variants={stepVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="min-h-[250px]"
      >
        <div className="space-y-4">
          {children}

          {hint && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-muted-foreground font-mono"
            >
              💡 {hint}
            </motion.p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
