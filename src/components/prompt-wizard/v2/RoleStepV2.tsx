import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PromptWizardData } from "@/utils/prompt-wizard/schema";
import { StepExamplesV2 } from "./StepExamplesV2";

interface StepProps {
  data: PromptWizardData;
  onUpdate: (updates: Partial<PromptWizardData>) => void;
}

/**
 * V2 Role Step with role-aware suggestions
 *
 * Step 1: Act as...
 * Sets the AI's role/persona - the foundation for everything else.
 *
 * Note: This step shows generic role examples since the role itself
 * is what determines future suggestions.
 */
export function RoleStepV2({ data, onUpdate }: StepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ai_role" className="text-sm font-mono uppercase tracking-wider">
          The AI should act as...
        </Label>
        <Input
          id="ai_role"
          placeholder="e.g., Senior Frontend Engineer with expertise in React..."
          value={data.ai_role || ""}
          onChange={(e) => onUpdate({ ai_role: e.target.value })}
          className="text-lg"
          autoFocus
        />
      </div>
      <StepExamplesV2
        field="ai_role"
        currentRole={data.ai_role || ""}
        currentValue={data.ai_role || ""}
        onExampleClick={(role) => onUpdate({ ai_role: role })}
      />
    </div>
  );
}
