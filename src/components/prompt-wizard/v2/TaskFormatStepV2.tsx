import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { OUTPUT_FORMATS, type PromptWizardData } from "@/utils/prompt-wizard/schema";
import { StepExamplesV2 } from "./StepExamplesV2";

interface StepProps {
  data: PromptWizardData;
  onUpdate: (updates: Partial<PromptWizardData>) => void;
}

/**
 * V2 Task + Format Step with role-aware suggestions
 *
 * Step 2: What do you want? (Task + Output Format combined)
 * Shows role-specific task examples based on the ai_role field.
 */
export function TaskFormatStepV2({ data, onUpdate }: StepProps) {
  const handleExampleClick = (example: string) => {
    const current = data.task_intent || "";
    const newValue = current ? `${current}\n${example}` : example;
    onUpdate({ task_intent: newValue });
  };

  return (
    <div className="space-y-6">
      {/* Task Intent */}
      <div className="space-y-2">
        <Label htmlFor="task_intent" className="text-sm font-mono uppercase tracking-wider">
          What do you want?
        </Label>
        <Textarea
          id="task_intent"
          placeholder="Describe the task in detail. Be specific about what you want..."
          value={data.task_intent}
          onChange={(e) => onUpdate({ task_intent: e.target.value })}
          className="min-h-[120px] resize-none text-lg"
          autoFocus
        />
        <StepExamplesV2
          field="task_intent"
          currentRole={data.ai_role || ""}
          currentValue={data.task_intent}
          onExampleClick={handleExampleClick}
        />
      </div>

      {/* Output Format */}
      <div className="space-y-2">
        <Label className="text-sm font-mono uppercase tracking-wider">Output Format</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {OUTPUT_FORMATS.map((format) => (
            <button
              key={format.value}
              type="button"
              onClick={() => onUpdate({ output_format: format.value })}
              className={`
                p-3 text-left border-2 border-foreground transition-all cursor-pointer
                ${
                  data.output_format === format.value
                    ? "bg-primary text-primary-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))]"
                    : "bg-background hover:bg-muted shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:shadow-[1px_1px_0px_0px_hsl(var(--foreground))]"
                }
              `}
            >
              <div className="font-mono text-sm font-bold">{format.label}</div>
              <div className="text-xs opacity-70">{format.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
