import { OUTPUT_FORMATS, type PromptWizardData } from "@/utils/prompt-wizard/schema";

interface StepProps {
  data: PromptWizardData;
  onUpdate: (updates: Partial<PromptWizardData>) => void;
}

export function OutputFormatStep({ data, onUpdate }: StepProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {OUTPUT_FORMATS.map((format) => {
          const isSelected = data.output_format === format.value;
          return (
            <button
              key={format.value}
              onClick={() =>
                onUpdate({
                  output_format: format.value as PromptWizardData["output_format"],
                })
              }
              className={`
                p-4 border-4 border-foreground text-left transition-all
                ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]"
                    : "bg-card hover:bg-muted"
                }
              `}
            >
              <span className="block font-bold uppercase text-sm">{format.label}</span>
              <span className="block text-xs mt-1 opacity-80">{format.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
