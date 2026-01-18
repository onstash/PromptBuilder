import { useState, useMemo, useEffect } from "react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, User, Heart, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTrackMixpanel } from "@/utils/analytics/MixpanelProvider";
import { ROLE_STEP_EXAMPLES_v2, RoleKey, RoleStepExamples } from "@/data/role-step-examples";
import { ROLE_ICONS, ROLE_COLORS } from "@/data/role-landing-examples";
import { PromptPreview } from "./PromptPreview";
import { SuggestRoleDialog } from "./SuggestRoleDialog";
import { compressPrompt, decompressPrompt } from "@/utils/prompt-wizard/url-compression";
import { PromptWizardData } from "@/utils/prompt-wizard/schema";
import {
  usePromptsWithFallback,
  type StoredPromptCardItem,
  type PromptCardItem,
} from "@/hooks/usePromptsWithFallback";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & HELPERS
// ═══════════════════════════════════════════════════════════════════════════

interface SidebarItem {
  id: string;
  title: string;
  description: string;
  icon?: React.ElementType;
  color?: string;
  data?: any;
}

function mapRoleToSidebarItem(role: RoleKey): SidebarItem {
  // Use the first example of the role to get display name usually, but here we just need the key/name
  const examples = ROLE_STEP_EXAMPLES_v2[role];
  const firstExample = examples?.[0];
  const Icon = ROLE_ICONS[role] || User;
  const color = ROLE_COLORS[role] || "bg-primary";

  return {
    id: role,
    title: firstExample?.displayName || role,
    description: `${examples?.length || 0} examples`,
    icon: Icon,
    color,
  };
}

function mapExampleToSidebarItem(example: RoleStepExamples, role: RoleKey): SidebarItem {
  const Icon = ROLE_ICONS[role] || User;
  const color = ROLE_COLORS[role] || "bg-primary";
  return {
    id: example.id || example.displayName,
    title: example.title || example.displayName,
    description: example.description || "No description",
    icon: Icon, // Maybe use a smaller icon or dot?
    color,
    data: example,
  };
}

function mapStoredPromptToSidebarItem(item: PromptCardItem): SidebarItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    icon: FileText,
    color: "bg-primary",
    data: item,
  };
}

function constructPromptData(example: RoleStepExamples): PromptWizardData {
  return {
    ai_role: example.displayName,
    task_intent: example.steps.task_intent?.items[0] || "",
    context: example.steps.context?.items[0] || "",
    constraints: example.steps.constraints?.items[0] || "",
    disallowed_content: example.steps.disallowed_content?.items[0] || "",
    output_format: "mixed",
    examples: "",
    reasoning_depth: "moderate",
    self_check: true,
    step: 1,
    updatedAt: Date.now(),
    finishedAt: -1,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function SidebarList({
  title,
  items,
  selectedId,
  onSelect,
  className,
  footer,
}: {
  title: string;
  items: SidebarItem[];
  selectedId: string | null;
  onSelect: (item: SidebarItem) => void;
  className?: string;
  footer?: React.ReactNode;
}) {
  return (
    <aside
      className={cn(
        "flex flex-col bg-zinc-50/50 dark:bg-zinc-900/50 border-r border-border backdrop-blur-sm",
        className
      )}
    >
      <div className="p-4 pt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 px-2">
          {title}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {items.map((item) => {
          const isSelected = selectedId === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-lg transition-colors duration-200 group flex items-center gap-3 cursor-pointer",
                isSelected
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isSelected
                      ? "text-foreground"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
              )}
              <div className="flex-1 truncate">
                <div className="text-sm truncate leading-snug">{item.title}</div>
                {/* Description might be too noisy for a true ChatGPT look, maybe hidden or very subtle */}
                {/* Keeping it very subtle for now, as it distinguished this from just a list of names */}
                <div className="text-[10px] opacity-60 truncate font-normal hidden xl:block">
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {footer && <div className="p-3 mt-auto border-t border-border">{footer}</div>}
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function ChatLandingPage() {
  const trackEvent = useTrackMixpanel();
  const navigate = useNavigate();

  const search: { role?: string; exampleId?: string } = useSearch({ from: "/" });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Track Page View
  useEffect(() => {
    trackEvent("page_viewed_landing_v2", {
      role: search.role,
      exampleId: search.exampleId,
    });
  }, []);

  // Derived State
  const selectedRole = search.role as RoleKey | undefined;
  const selectedExampleId = search.exampleId;

  // Stored Prompts
  const { items: storedPrompts } = usePromptsWithFallback({ includeExamples: false });

  const storedPromptItems = useMemo(() => {
    return storedPrompts.map(mapStoredPromptToSidebarItem);
  }, [storedPrompts]);

  // Roles List
  const roleItems = useMemo(() => {
    return (Object.keys(ROLE_STEP_EXAMPLES_v2) as RoleKey[]).map(mapRoleToSidebarItem);
  }, []);

  // Examples List (for selected role)
  const exampleItems = useMemo(() => {
    if (!selectedRole) return [];
    return (ROLE_STEP_EXAMPLES_v2[selectedRole] || []).map((ex) =>
      mapExampleToSidebarItem(ex, selectedRole)
    );
  }, [selectedRole]);

  // Selected Example Data (for preview)
  const selectedExampleData = useMemo(() => {
    if (selectedExampleId?.startsWith("stored-")) {
      const item = storedPrompts.find((p) => p.id === selectedExampleId) as StoredPromptCardItem;
      if (!item) return null;

      const { data } = decompressPrompt(item.compressedData);

      // If decompression failed, return null
      if (!data) return null;

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        role: "stored" as RoleKey, // Placeholder role for icon/color
        icon: FileText,
        color: "bg-primary",
        data: data,
        d: item.compressedData,
      };
    }

    if (!selectedRole || !selectedExampleId) return null;
    const example = ROLE_STEP_EXAMPLES_v2[selectedRole]?.find((e) => e.id === selectedExampleId);
    if (!example) return null;

    const promptData = constructPromptData(example);
    const Icon = ROLE_ICONS[selectedRole] || User;
    const color = ROLE_COLORS[selectedRole] || "bg-primary";

    return {
      id: example.id!,
      title: example.title!,
      description: example.description!,
      role: selectedRole,
      icon: Icon,
      color: color,
      data: promptData,
      d: compressPrompt(promptData),
    };
  }, [selectedRole, selectedExampleId, storedPrompts]);

  // Handlers
  const handleStoredPromptSelect = (item: SidebarItem) => {
    navigate({
      to: "/",
      search: { ...search, role: undefined, exampleId: item.id },
    });
  };

  const handleRoleSelect = (item: SidebarItem) => {
    navigate({
      to: "/",
      search: { ...search, role: item.id, exampleId: undefined },
    });
    // trackEvent("role_selected", { role: item.id }); // Invalid event
  };

  const handleExampleSelect = (item: SidebarItem) => {
    navigate({
      to: "/",
      search: { ...search, exampleId: item.id },
    });
    trackEvent("example_selected_v2", {
      role: selectedRole,
      exampleId: item.id,
    });
  };

  const handleMobileMenuToggle = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden font-sans">
      {/* Header */}
      <header className="flex-shrink-0 h-16 border-b-4 border-foreground bg-background px-4 flex items-center justify-end md:hidden z-10">
        <Button variant="ghost" size="icon" onClick={handleMobileMenuToggle}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar 1: Roles (Hidden on mobile unless menu open, or maybe handle mobile differently) */}
        {/* For this task, focusing on Desktop as primary request: "should have 2 sidebars in desktop mode" */}

        <div
          className={cn(
            "fixed inset-y-0 left-0 z-20 w-64 transform transition-transform duration-300 md:relative md:translate-x-0 bg-background flex flex-col border-r border-border",
            isMobileMenuOpen ? "translate-x-0 pt-16" : "-translate-x-full"
          )}
        >
          {/* Stored Prompts Sidebar (if any) */}
          {storedPromptItems.length > 0 && (
            <div className="flex-shrink-0 max-h-[40%] border-b border-border overflow-hidden flex flex-col">
              <SidebarList
                title="Your Prompts"
                items={storedPromptItems}
                selectedId={selectedExampleId || null}
                onSelect={handleStoredPromptSelect}
                className="h-full border-none"
              />
            </div>
          )}

          {/* Role Examples Sidebar */}
          <div className="flex-1 overflow-hidden flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-900/50">
            <SidebarList
              title="Role Examples"
              items={roleItems}
              selectedId={selectedRole || null}
              onSelect={handleRoleSelect}
              className="h-full border-none"
              footer={
                <div className="flex flex-col gap-2">
                  <SuggestRoleDialog />
                  <div className="pt-2 mt-2 border-t border-border text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
                    <span>Made with</span>
                    <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" />
                    <span>by</span>
                    <a
                      href="https://x.com/shtosan?utm=https://prompt-builder-ten-xi.vercel.app/"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-foreground transition-colors"
                    >
                      hastons
                    </a>
                  </div>
                </div>
              }
            />
          </div>
        </div>

        {/* Sidebar 2: Examples (Visible only if role selected) */}
        <AnimatePresence mode="wait" initial={false}>
          {selectedRole && (
            <motion.div
              initial={{ width: 0, opacity: 0, x: -20 }}
              animate={{ width: "18rem", opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="hidden md:block flex-shrink-0 overflow-hidden border-r border-border"
            >
              <div className="w-72 h-full">
                <SidebarList
                  title="Prompt Examples"
                  items={exampleItems}
                  selectedId={selectedExampleId || null}
                  onSelect={handleExampleSelect}
                  className="border-l-0 border-r-0 h-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content: Preview */}
        <main className="flex-1 bg-background overflow-hidden relative">
          {/* Mobile View: If role selected, maybe show examples list? Complex responsive logic. 
                For now, focusing on Desktop as requested. 
            */}

          <PromptPreview
            example={selectedExampleData}
            onTryClick={(ex) => {
              navigate({
                to: "/wizard",
                search: {
                  d: ex.d,
                  vld: 1,
                  partial: false,
                  role: ex.role === "stored" ? undefined : (ex.role as string),
                  exampleId: ex.id,
                },
              });
              trackEvent("cta_clicked_try_prompt_v2", {
                role: ex.role,
                exampleId: ex.id,
              });
            }}
          />
        </main>
      </div>
    </div>
  );
}
