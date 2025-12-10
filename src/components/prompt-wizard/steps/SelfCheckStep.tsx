import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { PromptWizardData } from "@/utils/prompt-wizard/schema";

interface StepProps {
  data: PromptWizardData;
  onUpdate: (updates: Partial<PromptWizardData>) => void;
}

export function SelfCheckStep({ data, onUpdate }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-6 border-4 border-foreground bg-card">
        <div>
          <Label htmlFor="self-check" className="text-lg font-bold uppercase">
            Enable Self-Check
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            AI will verify its response for accuracy before finalizing
          </p>
        </div>
        <Switch
          id="self-check"
          checked={data.self_check}
          onCheckedChange={(checked) => onUpdate({ self_check: checked })}
        />
      </div>

      <div className="text-sm text-muted-foreground font-mono">
        <p className="mb-2">When enabled, the AI will:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Double-check facts and calculations</li>
          <li>Verify the response matches your requirements</li>
          <li>Correct any errors before responding</li>
        </ul>
      </div>
    </div>
  );
}
