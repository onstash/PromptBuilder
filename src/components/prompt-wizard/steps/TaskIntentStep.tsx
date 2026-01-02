import { Textarea } from "@/components/ui/textarea";
import type { PromptWizardData } from "@/utils/prompt-wizard/schema";
import { StepExamples } from "../StepExamples";

interface StepProps {
  data: PromptWizardData;
  onUpdate: (updates: Partial<PromptWizardData>) => void;
}

export function TaskIntentStep({ data, onUpdate }: StepProps) {
  const handleExampleClick = (example: string) => {
    const current = data.task_intent || "";
    const newValue = current ? `${current}\n${example}` : example;
    onUpdate({ task_intent: newValue });
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="What do you want the AI to do? Be as specific as possible..."
        value={data.task_intent}
        onChange={(e) => onUpdate({ task_intent: e.target.value })}
        className="min-h-[150px] resize-none text-lg"
        autoFocus
      />
      <StepExamples
        field="task_intent"
        currentValue={data.task_intent}
        onExampleClick={handleExampleClick}
      />
    </div>
  );
}
