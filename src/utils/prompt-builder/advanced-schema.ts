import z from "zod";

export const promptBuilderAdvancedFormSchema = z
  .object({
    task_intent: z.string().min(5, "Describe what you want.").default("<Please fill this>"),
    target_audience: z.string().optional(),
    context_gathering: z.string().optional(),
    examples: z.string().optional(),

    ai_role: z
      .enum([
        "health, wellness & fitness entrepreneur in India",
        "health, wellness & fitness coach in India",
        "custom",
      ])
      .default("health, wellness & fitness entrepreneur in India"),

    custom_role: z.string().optional(),

    constraints: z.string().optional(),

    output_format: z
      .enum(["bullets", "step_by_step", "essay", "table", "script", "mixed"])
      .default("bullets"),

    tone_style: z
      .enum([
        "simple",
        "professional",
        "friendly",
        "playful",
        "formal",
        "expert",
      ])
      .optional(),

    length_preference: z
      .enum(["short", "medium", "long", "ultra_detailed"])
      .optional(),

    reasoning_depth: z
      .enum(["quick", "medium", "deep", "expert_chain_of_thought"])
      .default("medium"),

    self_reflection_rules: z.boolean().optional(),
    factuality_rules: z.string().optional(),
    disallowed_content: z.string().optional(),

    additional_notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.ai_role === "custom" && !data.custom_role) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Describe the custom role.",
        path: ["custom_role"],
      });
    }
  });

export type PromptBuilderFormData = z.infer<
  typeof promptBuilderAdvancedFormSchema
>;

export const defaultValues: PromptBuilderFormData = {
  task_intent: "<Please fill this>",
  target_audience: "",
  context_gathering: "",
  examples: "",
  ai_role: "health, wellness & fitness entrepreneur in India",
  custom_role: "",
  constraints: "",
  output_format: "bullets",
  tone_style: undefined,
  length_preference: undefined,
  reasoning_depth: "medium",
  self_reflection_rules: false,
  factuality_rules: "",
  disallowed_content: "",
  additional_notes: "",
};
