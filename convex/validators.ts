import { v } from "convex/values";

export const promptDataValidator = v.object({
  // Required (Core)
  ai_role: v.string(),
  task_intent: v.string(),
  output_format: v.string(), // enums like "bullet-list", "table"
  context: v.string(),
  examples: v.string(),
  constraints: v.string(),
  disallowed_content: v.string(),

  // Optional (Enhancements)
  reasoning_depth: v.string(), // "brief", "moderate", "thorough"
  self_check: v.boolean(),

  // Wizard State
  step: v.number(),
  updatedAt: v.number(),
  finishedAt: v.number(),
  id: v.optional(v.string()), // Zod has it optional

  // URL Params (Optional)
  role: v.optional(v.string()),
  exampleId: v.optional(v.string()),
  wizardType: v.optional(v.string()), // "basic" | "advanced"
  total_steps: v.optional(v.number()),
});
