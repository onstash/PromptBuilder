import { Textarea } from "@/components/ui/textarea";
import type { PromptWizardData } from "@/utils/prompt-wizard/schema";

interface StepProps {
  data: PromptWizardData;
  onUpdate: (updates: Partial<PromptWizardData>) => void;
}

export function DisallowedStep({ data, onUpdate }: StepProps) {
  return (
    <div className="space-y-4">
      <Textarea
        placeholder="List things the AI should NOT include in its response..."
        value={data.disallowed_content || ""}
        onChange={(e) => onUpdate({ disallowed_content: e.target.value })}
        className="min-h-[150px] resize-none text-lg"
        autoFocus
      />

      <div className="text-sm text-muted-foreground">
        <p className="font-mono uppercase tracking-wider mb-2">Examples:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Don't mention competitor products</li>
          <li>Avoid controversial topics</li>
          <li>No profanity or offensive language</li>
          <li>Don't include pricing information</li>
        </ul>
      </div>
    </div>
  );
}
