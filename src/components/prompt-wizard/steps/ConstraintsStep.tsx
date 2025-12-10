import { Textarea } from "@/components/ui/textarea";
import type { PromptWizardData } from "@/utils/prompt-wizard/schema";

interface StepProps {
  data: PromptWizardData;
  onUpdate: (updates: Partial<PromptWizardData>) => void;
}

export function ConstraintsStep({ data, onUpdate }: StepProps) {
  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Any rules, limits, or things to avoid? (Optional)"
        value={data.constraints}
        onChange={(e) => onUpdate({ constraints: e.target.value })}
        className="min-h-[150px] resize-none text-lg"
        autoFocus
      />

      <div className="text-sm text-muted-foreground">
        <p className="font-mono uppercase tracking-wider mb-2">Examples:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Keep it under 200 words</li>
          <li>Don't use jargon or technical terms</li>
          <li>Must include a call-to-action</li>
          <li>Avoid mentioning competitors</li>
        </ul>
      </div>
    </div>
  );
}
