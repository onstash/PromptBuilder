import { Textarea } from "@/components/ui/textarea";
import type { PromptWizardData } from "@/utils/prompt-wizard/schema";

interface StepProps {
  data: PromptWizardData;
  onUpdate: (updates: Partial<PromptWizardData>) => void;
}

export function ContextStep({ data, onUpdate }: StepProps) {
  return (
    <div className="space-y-4">
      <Textarea
        placeholder="What background information does the AI need to know?"
        value={data.context}
        onChange={(e) => onUpdate({ context: e.target.value })}
        className="min-h-[150px] resize-none text-lg"
        autoFocus
      />

      <div className="text-sm text-muted-foreground">
        <p className="font-mono uppercase tracking-wider mb-2">Include things like:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Your current situation or role</li>
          <li>Relevant past experience or knowledge</li>
          <li>Specific requirements or preferences</li>
        </ul>
      </div>
    </div>
  );
}
