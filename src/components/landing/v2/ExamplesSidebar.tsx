import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ROLE_LANDING_EXAMPLES, type RoleLandingExample } from "@/data/role-landing-examples";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ExamplesSidebarProps {
  selectedId: string | null;
  onSelect: (example: RoleLandingExample) => void;
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function ExamplesSidebar({ selectedId, onSelect, className }: ExamplesSidebarProps) {
  return (
    <aside className={cn("h-full overflow-y-auto bg-muted/50 p-4 md:p-6", className)}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-black uppercase tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Click to preview</p>
      </div>

      {/* Example Cards */}
      <div className="flex flex-col gap-3">
        {ROLE_LANDING_EXAMPLES.map((example, index) => {
          const Icon = example.icon;
          const isSelected = selectedId === example.id;

          return (
            <motion.button
              key={example.id}
              type="button"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(example)}
              className={cn(
                // Base styles - neobrutalist
                "group relative text-left w-full p-3",
                "bg-card border-4 border-foreground",
                "shadow-[4px_4px_0px_0px_hsl(var(--foreground))]",
                "transition-all duration-200",

                // Hover state
                "hover:-translate-x-1 hover:-translate-y-1",
                "hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))]",

                // Active/Selected state
                isSelected && [
                  "border-accent border-[6px]",
                  "-translate-x-2 -translate-y-2",
                  "shadow-[6px_6px_0px_0px_hsl(var(--foreground))]",
                ]
              )}
              aria-pressed={isSelected}
              aria-label={`${example.title}: ${example.description}`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={cn(
                    "flex-shrink-0 p-2",
                    "border-4 border-foreground",
                    "shadow-[2px_2px_0px_0px_hsl(var(--foreground))]",
                    example.color
                  )}
                >
                  <Icon className="w-5 h-5 text-foreground" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black uppercase tracking-tight text-foreground truncate">
                    {example.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {example.description}
                  </p>
                </div>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  layoutId="selectedIndicator"
                  className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-8 bg-accent border-2 border-foreground"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </aside>
  );
}
