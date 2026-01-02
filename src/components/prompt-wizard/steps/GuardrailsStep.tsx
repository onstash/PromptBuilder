import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { PromptWizardData } from "@/utils/prompt-wizard/schema";
import { StepExamples } from "../StepExamples";

interface StepProps {
  data: PromptWizardData;
  onUpdate: (updates: Partial<PromptWizardData>) => void;
}

/**
 * Step 4: Set guardrails (Constraints + Avoid merged)
 * What the AI should and shouldn't do.
 */
export function GuardrailsStep({ data, onUpdate }: StepProps) {
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
        <StepExamples
          field="constraints"
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
        <StepExamples
          field="disallowed_content"
          currentValue={data.disallowed_content || ""}
          onExampleClick={handleDisallowedExample}
        />
      </div>
    </div>
  );
}
