import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { PromptWizardData } from "@/utils/prompt-wizard/schema";
import { StepExamplesV2 } from "./StepExamplesV2";

interface StepProps {
  data: PromptWizardData;
  onUpdate: (updates: Partial<PromptWizardData>) => void;
}

/**
 * V2 Guardrails Step with role-aware suggestions
 *
 * Step 4: Set guardrails (Constraints + Avoid merged)
 * Shows role-specific constraints and disallowed content suggestions.
 */
export function GuardrailsStepV2({ data, onUpdate }: StepProps) {
  const handleConstraintsExample = (example: string) => {
    const current = data.constraints || "";
    const newValue = current ? `${current}\n${example}` : example;
    onUpdate({ constraints: newValue });
  };

  const handleDisallowedExample = (example: string) => {
    const current = data.disallowed_content || "";
    const newValue = current ? `${current}\n${example}` : example;
    onUpdate({ disallowed_content: newValue });
  };

  return (
    <div className="space-y-6">
      {/* Constraints (Do) */}
      <div className="space-y-2">
        <Label htmlFor="constraints" className="text-sm font-mono uppercase tracking-wider">
          Constraints & Rules
        </Label>
        <Textarea
          id="constraints"
          placeholder="Any rules, limits, or requirements the AI must follow..."
          value={data.constraints}
          onChange={(e) => onUpdate({ constraints: e.target.value })}
          className="min-h-[100px] resize-none text-lg"
          autoFocus
        />
        <StepExamplesV2
          field="constraints"
          currentRole={data.ai_role || ""}
          currentValue={data.constraints}
          onExampleClick={handleConstraintsExample}
        />
      </div>

      {/* Disallowed Content (Don't) */}
      <div className="space-y-2">
        <Label htmlFor="disallowed_content" className="text-sm font-mono uppercase tracking-wider">
          Things to Avoid
        </Label>
        <Textarea
          id="disallowed_content"
          placeholder="What should the AI NOT include or do?"
          value={data.disallowed_content || ""}
          onChange={(e) => onUpdate({ disallowed_content: e.target.value })}
          className="min-h-[80px] resize-none"
        />
        <StepExamplesV2
          field="disallowed_content"
          currentRole={data.ai_role || ""}
          currentValue={data.disallowed_content || ""}
          onExampleClick={handleDisallowedExample}
        />
      </div>
    </div>
  );
}
