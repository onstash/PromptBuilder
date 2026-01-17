import { Label } from "@/components/ui/label";
import { OUTPUT_FORMATS, type PromptWizardData } from "@/utils/prompt-wizard/schema";

interface StepProps {
  data: PromptWizardData;
  onUpdate: (updates: Partial<PromptWizardData>) => void;
}

/**
 * Step 5: Output Format
 */
export function OutputFormatStep({ data, onUpdate }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Output Format */}
      <div className="space-y-2">
        <Label className="text-sm font-mono uppercase tracking-wider">Output Format</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {OUTPUT_FORMATS.map((format) => (
            <button
              key={format.value}
              type="button"
              onClick={() => onUpdate({ output_format: format.value })}
              className={`
                p-3 text-left border-2 border-foreground transition-all cursor-pointer
                ${
                  data.output_format === format.value
                    ? "bg-primary text-primary-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))]"
                    : "bg-background hover:bg-muted shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:shadow-[1px_1px_0px_0px_hsl(var(--foreground))]"
                }
              `}
            >
              <div className="font-mono text-sm font-bold">{format.label}</div>
              <div className="text-xs opacity-70">{format.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
