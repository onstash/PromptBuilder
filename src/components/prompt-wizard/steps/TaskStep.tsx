import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { PromptWizardData } from "@/utils/prompt-wizard/schema";
import { StepExamples } from "../StepExamples";

interface StepProps {
  data: PromptWizardData;
  onUpdate: (updates: Partial<PromptWizardData>) => void;
}

/**
 * Step 2: What do you want? (Task Intent)
 */
export function TaskStep({ data, onUpdate }: StepProps) {
  const handleExampleClick = (example: string) => {
    const current = data.task_intent || "";
    const newValue = current ? `${current}\n${example}` : example;
    onUpdate({ task_intent: newValue });
  };

  return (
    <div className="space-y-6">
      {/* Task Intent */}
      <div className="space-y-2">
        <Label htmlFor="task_intent" className="text-sm font-mono uppercase tracking-wider">
          What do you want?
        </Label>
        <Textarea
          id="task_intent"
          placeholder="Describe the task in detail. Be specific about what you want..."
          value={data.task_intent}
          onChange={(e) => onUpdate({ task_intent: e.target.value })}
          className="min-h-[120px] resize-none text-base md:text-lg"
          autoFocus
        />
        <StepExamples
          field="task_intent"
          currentValue={data.task_intent}
          onExampleClick={handleExampleClick}
        />
      </div>
    </div>
  );
}
