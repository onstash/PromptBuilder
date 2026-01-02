import { Textarea } from "@/components/ui/textarea";
import type { PromptWizardData } from "@/utils/prompt-wizard/schema";
import { StepExamples } from "../StepExamples";

interface StepProps {
  data: PromptWizardData;
  onUpdate: (updates: Partial<PromptWizardData>) => void;
}

export function ConstraintsStep({ data, onUpdate }: StepProps) {
  const handleExampleClick = (example: string) => {
    const current = data.constraints || "";
    const newValue = current ? `${current}\n${example}` : example;
    onUpdate({ constraints: newValue });
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Any rules, limits, or things to avoid? (Optional)"
        value={data.constraints}
        onChange={(e) => onUpdate({ constraints: e.target.value })}
        className="min-h-[150px] resize-none text-lg"
        autoFocus
      />
      <StepExamples
        field="constraints"
        currentValue={data.constraints}
        onExampleClick={handleExampleClick}
      />
    </div>
  );
}
