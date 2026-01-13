import { useMemo } from "react";

import stepExamples from "@/data/step-examples.json";
import {
  detectRole,
  getRoleStepExamples,
  getRoleDisplayName,
  type StepExamplesConfig,
} from "@/data/role-step-examples";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type DefaultStepExampleKey = keyof typeof stepExamples;

interface StepExamplesV2Props {
  /** The field key to get examples for */
  field: DefaultStepExampleKey;
  /** The current role value from wizard (ai_role field) */
  currentRole?: string;
  /** Current field value (to check if example is already added) */
  currentValue?: string;
  /** Callback when an example is clicked */
  onExampleClick: (value: string) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * V2 StepExamples with role-aware suggestions
 *
 * Logic:
 * 1. Detect role from currentRole (ai_role field)
 * 2. If role matches a known category, show role-specific suggestions
 * 3. If no match, fallback to default step-examples.json
 *
 * Same visual design as v1, just smarter about which examples to show.
 */
export function StepExamplesV2({
  field,
  currentRole = "",
  currentValue = "",
  onExampleClick,
}: StepExamplesV2Props) {
  // Detect role and get appropriate examples
  const { config, detectedRole, isRoleSpecific } = useMemo(() => {
    // Try to detect role from user input
    const detected = detectRole(currentRole);

    // Try to get role-specific examples
    const roleConfig = getRoleStepExamples(
      detected,
      field as keyof ReturnType<typeof getRoleStepExamples>
    );

    if (roleConfig) {
      return {
        config: roleConfig,
        detectedRole: detected,
        isRoleSpecific: true,
      };
    }

    // Fallback to default examples
    const defaultConfig = stepExamples[field] as StepExamplesConfig | undefined;
    return {
      config: defaultConfig || null,
      detectedRole: detected,
      isRoleSpecific: false,
    };
  }, [currentRole, field]);

  // No config = no examples to show
  if (!config) return null;

  const isChipsMode = "type" in config && config.type === "chips";

  // Check if example is already used
  const isExampleUsed = (example: string) => {
    if (!currentValue || !currentValue.length) {
      return false;
    }
    if (isChipsMode) {
      return currentValue === example;
    }
    return currentValue.includes(example) || example.includes(currentValue);
  };

  // Get role display name for badge
  const roleDisplayName = detectedRole ? getRoleDisplayName(detectedRole) : null;

  return (
    <div className="text-sm text-muted-foreground">
      {/* Label with role badge if applicable */}
      <div className="flex items-center gap-2 mb-2">
        <p className="font-mono uppercase tracking-wider">{config.label}:</p>
        {isRoleSpecific && roleDisplayName && (
          <span className="px-2 py-0.5 text-xs font-mono bg-accent/20 text-accent-foreground border border-accent/30 uppercase">
            {roleDisplayName}
          </span>
        )}
      </div>

      {/* Example buttons */}
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
