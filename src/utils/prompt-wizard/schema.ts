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
  // Required (Core) - Steps 1-5
  // ─────────────────────────────────────────────────────────────────────────
  task_intent: z.string().default(""),
  context: z.string().default(""),
  constraints: z.string().default(""),
  target_audience: z
    .enum([
      "general",
      "technical",
      "business",
      "children",
      "entrepreneur",
      "custom",
    ])
    .default("general"),
  custom_audience: z.string().optional(),
  output_format: z
    .enum([
      "1-paragraph",
      "2-paragraphs",
      "3-plus-paragraphs",
      "bullet-list",
      "numbered-list",
      "table",
      "mixed",
    ])
    .default("1-paragraph"),

  // ─────────────────────────────────────────────────────────────────────────
  // Optional (Enhancements) - Steps 6-10
  // ─────────────────────────────────────────────────────────────────────────
  ai_role: z.string().optional(),
  tone_style: z
    .enum([
      "formal",
      "casual",
      "technical",
      "friendly",
      "professional",
      "humorous",
    ])
    .optional(),
  reasoning_depth: z
    .enum(["brief", "moderate", "thorough"])
    .default("moderate"),
  self_check: z.boolean().default(false),
  disallowed_content: z.string().optional(),

  // ─────────────────────────────────────────────────────────────────────────
  // Wizard State
  // ─────────────────────────────────────────────────────────────────────────
  step: z.number().min(1).max(10).default(1),
  show_advanced: z.boolean().default(false),
});

export type PromptWizardData = z.infer<typeof promptWizardSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// STEP DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export const WIZARD_STEPS = [
  // Required steps
  { id: 1, key: "task_intent", title: "What do you want?", required: true },
  { id: 2, key: "context", title: "Give some context", required: true },
  { id: 3, key: "constraints", title: "Any constraints?", required: true },
  { id: 4, key: "target_audience", title: "Who is this for?", required: true },
  { id: 5, key: "output_format", title: "Output format", required: true },
  // Optional steps
  { id: 6, key: "ai_role", title: "AI Role", required: false },
  { id: 7, key: "tone_style", title: "Tone & Style", required: false },
  { id: 8, key: "reasoning_depth", title: "Reasoning Depth", required: false },
  { id: 9, key: "self_check", title: "Self-Check", required: false },
  { id: 10, key: "disallowed_content", title: "Avoid", required: false },
] as const;

export const REQUIRED_STEPS = WIZARD_STEPS.filter((s) => s.required);
export const OPTIONAL_STEPS = WIZARD_STEPS.filter((s) => !s.required);
export const TOTAL_REQUIRED_STEPS = REQUIRED_STEPS.length;
export const TOTAL_STEPS = WIZARD_STEPS.length;
