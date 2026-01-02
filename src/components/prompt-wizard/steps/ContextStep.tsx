import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { PromptWizardData } from "@/utils/prompt-wizard/schema";
import { StepExamples } from "../StepExamples";

interface StepProps {
  data: PromptWizardData;
  onUpdate: (updates: Partial<PromptWizardData>) => void;
}

/**
 * Step 3: Give context (Context + Examples)
 * Background info + optional few-shot examples.
 */
export function ContextStep({ data, onUpdate }: StepProps) {
  const handleContextExample = (example: string) => {
    const current = data.context || "";
    const newValue = current ? `${current}\n${example}` : example;
    onUpdate({ context: newValue });
  };

  return (
    <div className="space-y-6">
      {/* Context */}
      <div className="space-y-2">
        <Label htmlFor="context" className="text-sm font-mono uppercase tracking-wider">
          Background Context
        </Label>
        <Textarea
          id="context"
          placeholder="What background information does the AI need to know?"
          value={data.context}
          onChange={(e) => onUpdate({ context: e.target.value })}
          className="min-h-[100px] resize-none text-lg"
          autoFocus
        />
        <StepExamples
          field="context"
          currentValue={data.context}
          onExampleClick={handleContextExample}
        />
      </div>

      {/* Few-shot Examples (New) */}
      <div className="space-y-2">
        <Label htmlFor="examples" className="text-sm font-mono uppercase tracking-wider">
          Few-Shot Examples <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="examples"
          placeholder="Provide example inputs and outputs to show the AI what you expect..."
          value={data.examples || ""}
          onChange={(e) => onUpdate({ examples: e.target.value })}
          className="min-h-[80px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Pro tip: Showing examples is more effective than describing what you want.
        </p>
      </div>
    </div>
  );
}
