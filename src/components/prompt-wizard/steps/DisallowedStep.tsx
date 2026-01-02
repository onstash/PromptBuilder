import { Textarea } from "@/components/ui/textarea";
import type { PromptWizardData } from "@/utils/prompt-wizard/schema";
import { StepExamples } from "../StepExamples";

interface StepProps {
  data: PromptWizardData;
  onUpdate: (updates: Partial<PromptWizardData>) => void;
}

export function DisallowedStep({ data, onUpdate }: StepProps) {
  const handleExampleClick = (example: string) => {
    const current = data.disallowed_content || "";
    const newValue = current ? `${current}\n${example}` : example;
    onUpdate({ disallowed_content: newValue });
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="List things the AI should NOT include in its response..."
        value={data.disallowed_content || ""}
        onChange={(e) => onUpdate({ disallowed_content: e.target.value })}
        className="min-h-[150px] resize-none text-lg"
        autoFocus
      />
      <StepExamples
        field="disallowed_content"
        currentValue={data.disallowed_content || ""}
        onExampleClick={handleExampleClick}
      />
    </div>
  );
}
