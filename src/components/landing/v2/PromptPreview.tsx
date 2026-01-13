import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoleLandingExample } from "@/data/role-landing-examples";
import { generateShareUrl } from "@/stores/wizard-store";
import { WizardPreview as PromptPreviewV1 } from "../../prompt-wizard/WizardPreview";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface PromptPreviewProps {
  example: RoleLandingExample | null;
  onTryClick?: (example: RoleLandingExample) => void;
  className?: string;
}

interface FieldDisplayProps {
  label: string;
  value: string;
  delay?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function FieldDisplay({ label, value, delay = 0 }: FieldDisplayProps) {
  if (!value) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="border-2 border-border bg-muted p-3"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
        {label}
      </p>
      <p className="text-sm text-foreground">{value}</p>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center h-full text-center px-6"
    >
      {/* Decorative icon */}
      <motion.div
        animate={{
          rotate: [0, 5, -5, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="mb-8"
      >
        <div className="p-6 border-4 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))] bg-secondary">
          <Sparkles className="w-12 h-12 text-foreground" />
        </div>
      </motion.div>

      {/* Heading */}
      <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-foreground mb-4">
        What would you
        <span className="block text-primary">like to build?</span>
      </h1>

      {/* Subtitle */}
      <p className="text-lg text-muted-foreground max-w-md">
        Select an example from the sidebar to preview it here, then customize it for your needs.
      </p>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function PromptPreview({ example, onTryClick, className }: PromptPreviewProps) {
  return (
    <div className={cn("h-full flex flex-col overflow-y-auto p-6 md:p-10", className)}>
      <AnimatePresence mode="wait">
        {!example ? (
          <EmptyState key="empty" />
        ) : (
          <motion.div
            key={example.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full max-w-2xl mx-auto w-full"
          >
            <PromptPreviewV1
              data={example.data}
              d={example.d}
              shareUrl={generateShareUrl(example.data)}
              compressed
              source="landing_v2"
              onClickCallback={() => onTryClick?.(example)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
