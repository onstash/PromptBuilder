import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { RoleLandingExample } from "@/data/role-landing-examples";
import type { RoleKey } from "@/data/role-step-examples";
import { generateShareUrl } from "@/stores/wizard-store";
import { WizardPreview } from "../../prompt-wizard/WizardPreview";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

// Local type to allow "stored" as a role for display purposes
export type PromptPreviewExample = Omit<RoleLandingExample, "role"> & {
  role: RoleKey | string;
};

interface PromptPreviewProps {
  example: PromptPreviewExample | null;
  onTryClick?: (example: PromptPreviewExample) => void;
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

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
        Prompt
        <span className="block text-primary">Builder</span>
      </h1>

      {/* Subtitle */}
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        Craft expert-level prompts for any role or task. Select an example to start or build from
        scratch.
      </p>

      {/* CTA */}
      <Link to="/wizard" search={{ d: null, vld: 0, partial: false }} className="inline-block">
        <div
          className={cn(
            "flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground",
            "border-4 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]",
            "hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))]",
            "transition-all duration-200 font-bold uppercase tracking-wide text-lg"
          )}
        >
          Create New Prompt
        </div>
      </Link>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function PromptPreview({ example, onTryClick, className }: PromptPreviewProps) {
  return (
    <div className={cn("h-full flex flex-col overflow-y-auto p-6 md:p-10", className)}>
      <AnimatePresence mode="wait" initial={false}>
        {!example ? (
          <EmptyState key="empty" />
        ) : (
          <motion.div
            key={example.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full max-w-2xl mx-auto w-full justify-center"
          >
            <WizardPreview
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
