import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PromptWizardData } from "@/utils/prompt-wizard/schema";
import { StepExamples } from "../StepExamples";

interface StepProps {
  data: PromptWizardData;
  onUpdate: (updates: Partial<PromptWizardData>) => void;
}

/**
 * Step 1: Act as...
 * Sets the AI's role/persona - the foundation for everything else.
 */
export function RoleStep({ data, onUpdate }: StepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ai_role" className="text-sm font-mono uppercase tracking-wider">
          The AI should act as...
        </Label>
        <Input
          id="ai_role"
          placeholder="e.g., Senior Product Manager with 10 years experience in SaaS..."
          value={data.ai_role || ""}
          onChange={(e) => onUpdate({ ai_role: e.target.value })}
          className="text-lg"
          autoFocus
        />
      </div>
      <StepExamples
        field="ai_role"
        currentValue={data.ai_role || ""}
        onExampleClick={(role) => onUpdate({ ai_role: role })}
      />
    </div>
  );
}
