import {
  REASONING_DEPTHS,
  type PromptWizardData,
} from "@/utils/prompt-wizard/schema";

interface StepProps {
  data: PromptWizardData;
  onUpdate: (updates: Partial<PromptWizardData>) => void;
}

export function ReasoningStep({ data, onUpdate }: StepProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {REASONING_DEPTHS.map((depth) => {
          const isSelected = data.reasoning_depth === depth.value;
          return (
            <button
              key={depth.value}
              onClick={() =>
                onUpdate({
                  reasoning_depth:
                    depth.value as PromptWizardData["reasoning_depth"],
                })
              }
              className={`
                p-4 border-4 border-foreground text-center transition-all
                ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]"
                    : "bg-card hover:bg-muted"
                }
              `}
            >
              <span className="block font-bold uppercase text-sm">
                {depth.label}
              </span>
              <span className="block text-xs mt-1 opacity-80">
                {depth.description}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground font-mono">
        💡 Controls how much detail and explanation the AI provides
      </p>
    </div>
  );
}
