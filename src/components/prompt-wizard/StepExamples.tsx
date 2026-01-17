import { useSearch } from "@tanstack/react-router";
import { useWizardStore } from "@/stores/wizard-store";
import stepExamples from "@/data/step-examples.json";
import {
  getRoleStepExamples,
  detectRole,
  type RoleStepExamples,
  ROLE_STEP_EXAMPLES,
} from "@/data/role-step-examples";

// We need to map the flat json keys to the RoleStepExamples structure keys if they differ
// However, looking at the data, they seem consistent (task_intent, context, constraints, disallowed_content)
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
 *
 * UPGRADED: Now smart! 🧠
 * 1. Checks URL for `exampleId` -> Shows specific suggestions if found
 * 2. Checks Store for `ai_role` -> Shows role-specific suggestions if found
 * 3. Fallback -> Shows generic static suggestions
 */
export function StepExamples({ field, currentValue = "", onExampleClick }: StepExamplesProps) {
  // 1. Get Context
  const search = useSearch({ from: "/wizard" });
  // @ts-expect-error - search params might not be typed fully yet in this context
  const exampleId = search.exampleId as string | undefined;

  const ai_role = useWizardStore((state) => state.wizardData.ai_role);

  // 2. Determine Config Source
  let config = stepExamples[field]; // Default: Static JSON

  // Special handling for ai_role to be dynamic from codebase
  if (field === "ai_role") {
    config = {
      label: config?.label || "Popular roles",
      items: Object.values(ROLE_STEP_EXAMPLES).map((r) => r.displayName),
      type: "chips",
    } as any;
  }

  // Try dynamic resolution
  if (ai_role && field !== "ai_role") {
    const detectedRole = detectRole(ai_role);
    if (detectedRole) {
      // Cast field to match RoleStepExamples keys (should be compatible)
      const roleField = field as keyof RoleStepExamples["steps"];
      const roleConfig = getRoleStepExamples(detectedRole, roleField, exampleId);

      if (roleConfig) {
        // @ts-ignore - slight type mismatch
        config = roleConfig;
      }
    }
  }

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
