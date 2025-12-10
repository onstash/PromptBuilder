import {
  TONE_STYLES,
  type PromptWizardData,
} from "@/utils/prompt-wizard/schema";

interface StepProps {
  data: PromptWizardData;
  onUpdate: (updates: Partial<PromptWizardData>) => void;
}

export function ToneStep({ data, onUpdate }: StepProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {TONE_STYLES.map((tone) => {
          const isSelected = data.tone_style === tone.value;
          return (
            <button
              key={tone.value}
              onClick={() =>
                onUpdate({
                  tone_style: tone.value as PromptWizardData["tone_style"],
                })
              }
              className={`
                p-4 border-4 border-foreground text-left transition-all
                ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]"
                    : "bg-card hover:bg-muted"
                }
              `}
            >
              <span className="block font-bold uppercase text-sm">
                {tone.label}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground font-mono">
        💡 This affects how the AI communicates - not what it says
      </p>
    </div>
  );
}
