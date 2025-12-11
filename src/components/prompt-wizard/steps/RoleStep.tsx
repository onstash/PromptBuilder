import { Input } from "@/components/ui/input";
import type { PromptWizardData } from "@/utils/prompt-wizard/schema";

interface StepProps {
  data: PromptWizardData;
  onUpdate: (updates: Partial<PromptWizardData>) => void;
}

export function RoleStep({ data, onUpdate }: StepProps) {
  return (
    <div className="space-y-4">
      <Input
        placeholder="e.g., Senior Software Engineer, Marketing Expert, Teacher..."
        value={data.ai_role || ""}
        onChange={(e) => onUpdate({ ai_role: e.target.value })}
        className="text-lg"
        autoFocus
      />

      <div className="text-sm text-muted-foreground">
        <p className="font-mono uppercase tracking-wider mb-2">Popular roles:</p>
        <div className="flex flex-wrap gap-2">
          {[
            "Career Coach",
            "Technical Writer",
            "Marketing Strategist",
            "Data Analyst",
            "Creative Director",
          ].map((role) => (
            <button
              key={role}
              onClick={() => onUpdate({ ai_role: role })}
              className="px-3 py-1 border-2 border-foreground bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-xs font-mono"
            >
              {role}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
