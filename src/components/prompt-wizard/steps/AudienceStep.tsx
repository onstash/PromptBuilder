import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  TARGET_AUDIENCES,
  type PromptWizardData,
} from "@/utils/prompt-wizard/schema";

interface StepProps {
  data: PromptWizardData;
  onUpdate: (updates: Partial<PromptWizardData>) => void;
}

export function AudienceStep({ data, onUpdate }: StepProps) {
  const [showCustomInput, setShowCustomInput] = useState(
    data.target_audience === "custom"
  );

  const handleSelect = (value: PromptWizardData["target_audience"]) => {
    onUpdate({ target_audience: value });
    setShowCustomInput(value === "custom");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {TARGET_AUDIENCES.map((audience) => {
          const isSelected = data.target_audience === audience.value;
          return (
            <button
              key={audience.value}
              onClick={() =>
                handleSelect(
                  audience.value as PromptWizardData["target_audience"]
                )
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
                {audience.label}
              </span>
              <span className="block text-xs mt-1 opacity-80">
                {audience.description}
              </span>
            </button>
          );
        })}
      </div>

      {showCustomInput && (
        <Input
          placeholder="Describe your audience..."
          value={data.custom_audience || ""}
          onChange={(e) => onUpdate({ custom_audience: e.target.value })}
          className="mt-4"
          autoFocus
        />
      )}
    </div>
  );
}
