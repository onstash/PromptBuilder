import { Textarea } from "@/components/ui/textarea";
import type { PromptWizardData } from "@/utils/prompt-wizard/schema";

interface StepProps {
  data: PromptWizardData;
  onUpdate: (updates: Partial<PromptWizardData>) => void;
}

export function TaskIntentStep({ data, onUpdate }: StepProps) {
  return (
    <div className="space-y-4">
      <Textarea
        placeholder="What do you want the AI to do? Be as specific as possible..."
        value={data.task_intent}
        onChange={(e) => onUpdate({ task_intent: e.target.value })}
        className="min-h-[150px] resize-none text-lg"
        autoFocus
      />

      <div className="text-sm text-muted-foreground">
        <p className="font-mono uppercase tracking-wider mb-2">Examples:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Write a professional email declining a job offer politely</li>
          <li>Explain blockchain technology to a 10-year-old</li>
          <li>Create a 30-day workout plan for beginners</li>
        </ul>
      </div>
    </div>
  );
}
