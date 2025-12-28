import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Eye, FilePen, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CardItem {
  id: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  color?: string;
}

interface CardAction<T> {
  label: string;
  icon?: LucideIcon;
  getLink?: (item: T) => { to: string; search?: object };
  onClick?: (item: T) => void;
}

interface CardGridProps<T extends CardItem> {
  items: T[];
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
  columns?: 2 | 3;

  // Single action mode (for examples)
  actionLabel?: string;
  onItemClick?: (item: T) => void;
  getItemLink?: (item: T) => { to: string; search?: object };

  // Multi-action mode (for stored prompts)
  actions?: CardAction<T>[];
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function CardGrid<T extends CardItem>({
  items,
  title,
  subtitle,
  emptyMessage = "No items to display",
  columns = 3,
  actionLabel = "Try it",
  onItemClick,
  getItemLink,
  actions,
}: CardGridProps<T>) {
  const gridCols = columns === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3";

  if (items.length === 0) {
    return (
      <section className="py-16 px-6 bg-background">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            {title && (
              <h2 className="text-4xl md:text-6xl font-black text-foreground mb-4 uppercase tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
            )}
          </motion.div>
        )}

        {/* Cards grid */}
        <div className={`grid ${gridCols} gap-6`}>
          {items.map((item, index) => {
            const Icon = item.icon || FileText;
            const colorClass = item.color || "bg-muted";

            // Determine if using single action or multi-action mode
            const useSingleAction = !actions || actions.length === 0;
            const linkProps = useSingleAction ? getItemLink?.(item) : undefined;

            const cardContent = (
              <>
                {/* Icon */}
                <div
                  className={`inline-flex p-3 ${colorClass} border-4 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] mb-4`}
                >
                  <Icon className="w-6 h-6 text-foreground" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-black text-foreground mb-2 uppercase line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 flex-grow line-clamp-2">
                  {item.description}
                </p>

                {/* Actions */}
                {useSingleAction ? (
                  <div className="flex items-center gap-2 text-primary font-mono text-sm font-bold group-hover:gap-3 transition-all mt-auto">
                    {actionLabel}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mt-auto">
                    {actions?.map((action) => {
                      const ActionIcon = action.icon || ArrowRight;
                      const actionLinkProps = action.getLink?.(item);

                      if (actionLinkProps) {
                        return (
                          <Link
                            key={action.label}
                            to={actionLinkProps.to}
                            search={actionLinkProps.search}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick?.(item);
                            }}
                            className="flex items-center gap-1.5 text-primary font-mono text-sm font-bold hover:gap-2 transition-all px-3 py-1.5 border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))] bg-background"
                          >
                            <ActionIcon className="w-3.5 h-3.5" />
                            {action.label}
                          </Link>
                        );
                      }

                      return (
                        <button
                          key={action.label}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick?.(item);
                          }}
                          className="flex items-center gap-1.5 text-primary font-mono text-sm font-bold hover:gap-2 transition-all px-3 py-1.5 border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))] bg-background"
                        >
                          <ActionIcon className="w-3.5 h-3.5" />
                          {action.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            );

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {useSingleAction && linkProps ? (
                  <Link
                    to={linkProps.to}
                    search={linkProps.search}
                    onClick={() => onItemClick?.(item)}
                    className="group block h-full bg-card border-4 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] p-6 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_hsl(var(--foreground))] transition-all duration-200 flex flex-col"
                  >
                    {cardContent}
                  </Link>
                ) : (
                  <div className="group block h-full bg-card border-4 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] p-6 flex flex-col">
                    {cardContent}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PRESET ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const STORED_PROMPT_ACTIONS = {
  view: {
    label: "View",
    icon: Eye,
  },
  edit: {
    label: "Edit",
    icon: FilePen,
  },
  delete: {
    label: "Delete",
    icon: Trash2,
  },
} as const;
