import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════════════
// OUTPUT FORMAT OPTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const OUTPUT_FORMATS = [
  {
    value: "1-paragraph",
    label: "1 Paragraph",
    description: "Quick, concise answer",
  },
  {
    value: "2-paragraphs",
    label: "2 Paragraphs",
    description: "Brief explanation",
  },
  {
    value: "3-plus-paragraphs",
    label: "3+ Paragraphs",
    description: "Detailed essay",
  },
  { value: "bullet-list", label: "Bullet List", description: "Key points" },
  {
    value: "numbered-list",
    label: "Numbered List",
    description: "Step-by-step",
  },
  { value: "table", label: "Table", description: "Structured comparison" },
  { value: "mixed", label: "Mixed", description: "Combination of formats" },
] as const;

export type OutputFormat = (typeof OUTPUT_FORMATS)[number]["value"];

// ═══════════════════════════════════════════════════════════════════════════
// TARGET AUDIENCE OPTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const TARGET_AUDIENCES = [
  { value: "general", label: "General", description: "Anyone can understand" },
  {
    value: "technical",
    label: "Technical",
    description: "Developers, engineers",
  },
  {
    value: "business",
    label: "Business",
    description: "Professionals, executives",
  },
  { value: "children", label: "Children", description: "Simple, kid-friendly" },
  {
    value: "entrepreneur",
    label: "Entrepreneur",
    description: "Startup founders",
  },
  { value: "custom", label: "Custom", description: "Specify your own" },
] as const;

export type TargetAudience = (typeof TARGET_AUDIENCES)[number]["value"];

// ═══════════════════════════════════════════════════════════════════════════
// TONE STYLE OPTIONS (Optional)
// ═══════════════════════════════════════════════════════════════════════════

export const TONE_STYLES = [
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "technical", label: "Technical" },
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
  { value: "humorous", label: "Humorous" },
] as const;

export type ToneStyle = (typeof TONE_STYLES)[number]["value"];

// ═══════════════════════════════════════════════════════════════════════════
// REASONING DEPTH OPTIONS (Optional)
// ═══════════════════════════════════════════════════════════════════════════

export const REASONING_DEPTHS = [
  { value: "brief", label: "Brief", description: "Quick answer" },
  { value: "moderate", label: "Moderate", description: "Balanced detail" },
  { value: "thorough", label: "Thorough", description: "In-depth analysis" },
] as const;

export type ReasoningDepth = (typeof REASONING_DEPTHS)[number]["value"];

// ═══════════════════════════════════════════════════════════════════════════
// ZOD SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

export const promptWizardSchema = z.object({
  // ─────────────────────────────────────────────────────────────────────────
  // Required (Core) - Steps 1-4
  // ─────────────────────────────────────────────────────────────────────────
  ai_role: z.string().default(""), // Step 1: Act as...
  task_intent: z.string().default(""), // Step 2: Task
  output_format: z
    .enum([
      "bullet-list",
      "1-paragraph",
      "2-paragraphs",
      "3-plus-paragraphs",
      "numbered-list",
      "table",
      "mixed",
    ])
    // @ts-expect-error
    .default(""), // Step 2: Format
  context: z.string().default(""), // Step 3: Context
  examples: z.string().default(""), // Step 3: Few-shot examples (new)
  constraints: z.string().default(""), // Step 4: Guardrails (part 1)
  disallowed_content: z.string().default(""), // Step 4: Guardrails (part 2)

  // ─────────────────────────────────────────────────────────────────────────
  // Optional (Enhancements) - Steps 5-6
  // ─────────────────────────────────────────────────────────────────────────
  reasoning_depth: z.enum(["brief", "moderate", "thorough"]).default("brief"), // Step 5: Reasoning mode - default to brief
  self_check: z.boolean().default(true), // Step 6: Verification - default to enabled

  // ─────────────────────────────────────────────────────────────────────────
  // Wizard State
  // ─────────────────────────────────────────────────────────────────────────
  step: z.number().min(1).max(7).default(1),
  updatedAt: z.number().default(-1),
  finishedAt: z.number().default(-1),
  id: z.string().optional(),

  // ─────────────────────────────────────────────────────────────────────────
  // URL Params (Optional)
  // ─────────────────────────────────────────────────────────────────────────
  role: z.string().optional(),
  exampleId: z.string().optional(),
  wizardType: z.enum(["basic", "advanced"]).optional(),
});

export type PromptWizardData = z.infer<typeof promptWizardSchema>;

const promptWizardCompressedCoreSchema = promptWizardSchema.omit({
  id: true,
  step: true,
  examples: true,
  finishedAt: true,
});

export type PromptWizardDataCompressedCore = z.infer<typeof promptWizardCompressedCoreSchema>;

// Partial schema for validating incomplete/draft prompts (all fields optional)
export const partialPromptWizardSchema = promptWizardSchema.partial();
export type PartialPromptWizardData = z.infer<typeof partialPromptWizardSchema>;

export type PromptWizardSearchParamsCompressed =
  | {
      d: string;
      vld: 1;
      partial: boolean; // true = incomplete draft, false = complete prompt
      role?: string;
      exampleId?: string;
      wizardType?: "basic" | "advanced";
    }
  | {
      d: null;
      vld: 0;
      partial: false;
      role?: string;
      exampleId?: string;
      wizardType?: "basic" | "advanced";
    };

// ═══════════════════════════════════════════════════════════════════════════
// STEP DEFINITIONS (Expert 7-Step Structure)
// ═══════════════════════════════════════════════════════════════════════════

export const WIZARD_STEPS_REQUIRED = [
  { id: 1, key: "ai_role", title: "Act as...", required: true },
  { id: 2, key: "task_intent", title: "What do you want?", required: true },
  { id: 3, key: "context", title: "Give context", required: true },
  { id: 4, key: "constraints", title: "Set guardrails", required: true },
];

export const WIZARD_STEPS = [
  // Required steps (1-4) (Basically Basic Mode)
  ...WIZARD_STEPS_REQUIRED,
  // Advanced / Optional steps (5-7)
  { id: 5, key: "output_format", title: "Output Format", required: true },
  { id: 6, key: "reasoning_depth", title: "Reasoning mode", required: false },
  { id: 7, key: "self_check", title: "Verification", required: false },
] as const;

export const REQUIRED_STEPS = WIZARD_STEPS.filter((s) => s!.required);
export const OPTIONAL_STEPS = WIZARD_STEPS.filter((s) => !s!.required);
export const TOTAL_REQUIRED_STEPS = REQUIRED_STEPS.length;
export const TOTAL_STEPS = WIZARD_STEPS.length;

// ═══════════════════════════════════════════════════════════════════════════
// PER-STEP VALIDATION SCHEMAS (Expert 7-Step Structure)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Per-step validation schemas for granular form validation.
 * Used to validate only the fields relevant to each step.
 */
export const stepValidationSchemas = {
  // Step 1: Act as... (Role)
  1: z.object({
    ai_role: z.string().min(3, "Please describe the AI's role (at least 3 characters)"),
  }),
  // Step 2: What do you want? (Task)
  2: z.object({
    task_intent: z.string().min(10, "Please describe what you want (at least 10 characters)"),
  }),
  // Step 3: Give context (Context + Examples)
  3: z.object({
    context: z.string().optional(),
    examples: z.string().optional(),
  }),
  // Step 4: Set guardrails (Constraints + Avoid)
  4: z.object({
    constraints: z.string().optional(),
    disallowed_content: z.string().optional(),
  }),
  // Step 5: Output Format
  5: z.object({
    output_format: z.enum(
      [
        "bullet-list",
        "1-paragraph",
        "2-paragraphs",
        "3-plus-paragraphs",
        "numbered-list",
        "table",
        "mixed",
      ],
      { message: "Please select an output format" }
    ),
  }),
  // Step 6: Reasoning mode
  6: z.object({ reasoning_depth: z.enum(["brief", "moderate", "thorough"]).optional() }),
  // Step 7: Verification
  7: z.object({ self_check: z.boolean().optional() }),
} as const;

/** Maps step number to its field name(s) */
export const STEP_FIELDS: Record<number, (keyof PromptWizardData)[]> = {
  1: ["ai_role"],
  2: ["task_intent"],
  3: ["context", "examples"],
  4: ["constraints", "disallowed_content"],
  5: ["output_format"],
  6: ["reasoning_depth"],
  7: ["self_check"],
};

// ═══════════════════════════════════════════════════════════════════════════
// STORAGE TYPES (v2)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Storage version enum for future extensibility
 */
export const STORAGE_VERSIONS = ["v2", "v2.1", "v3"] as const;
export type StorageVersion = (typeof STORAGE_VERSIONS)[number];

/**
 * Minimal stored prompt structure with ownership tracking
 */
export interface StoredPrompt {
  data: PromptWizardDataCompressedCore;
  creator_distinct_id: string; // User session ID who created/loaded this prompt
  storage_version: StorageVersion;
}

/**
 * Root storage structure for list-based prompt storage
 */
export interface PromptStorageV2 {
  version: StorageVersion;
  prompts: StoredPrompt[];
}
