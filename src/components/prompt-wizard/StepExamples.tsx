import stepExamples from "@/data/step-examples.json";

type StepExampleKey = keyof typeof stepExamples;

interface StepExamplesProps {
  /** The field key to get examples for */
  field: StepExampleKey;
  /** Current field value (to check if example is already added) */
  currentValue?: string;
  /** Callback when an example is clicked */
  onExampleClick: (value: string) => void;
}

/**
 * Displays clickable example buttons for a wizard step.
 * Examples that are already in the field value are shown as disabled.
 */
export function StepExamples({ field, currentValue = "", onExampleClick }: StepExamplesProps) {
  const config = stepExamples[field];
  if (!config) return null;

  const isChipsMode = "type" in config && config.type === "chips";

  // Check if example is already used (either exact match for chips, or contained for text)
  const isExampleUsed = (example: string) => {
    if (!currentValue || !currentValue.length) {
      return false;
    }
    if (isChipsMode) {
      return currentValue === example;
    }
    return currentValue.includes(example) || example.includes(currentValue);
  };

  return (
    <div className="text-sm text-muted-foreground">
      <p className="font-mono uppercase tracking-wider mb-2">{config.label}:</p>
      <div className="flex flex-wrap gap-2">
        {config.items.map((item) => {
          const isUsed = isExampleUsed(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => onExampleClick(item)}
              disabled={isUsed}
              className={`
                px-3 py-1.5 text-xs font-mono text-left
                border-2 border-foreground
                shadow-[3px_3px_0px_0px_hsl(var(--foreground))]
                transition-all
                ${
                  isUsed
                    ? "bg-muted/50 text-muted-foreground/50 cursor-not-allowed opacity-50 shadow-none"
                    : "bg-background cursor-pointer hover:bg-primary hover:text-primary-foreground hover:shadow-[1px_1px_0px_0px_hsl(var(--foreground))] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                }
              `}
            >
              <span className="mr-1">{isUsed ? "✓" : "+"}</span>
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}
