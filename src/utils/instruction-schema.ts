import { z } from "zod";

// Zod schema with conditional validation
export const instructionSchema = z
  .object({
    context_gathering: z.string().min(1, "Context gathering is required"),
    persistence: z.string().optional(),
    tool_preambles: z.string().optional(),
    reasoning_effort: z.string().min(1, "Reasoning effort is required"),
    self_reflection: z.string().min(1, "Self reflection is required"),
    maximize_context_understanding: z.string().optional(),
    context_understanding: z.string().optional(),
    instruction_type: z.enum(["General Purpose", "Frontend Engineering"]),
    code_editing_rules: z.string().optional(),
    guiding_principles: z.string().optional(),
    frontend_stack_defaults: z.string().optional(),
    ui_ux_best_practices: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.instruction_type === "Frontend Engineering") {
      if (!data.code_editing_rules || data.code_editing_rules.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Code editing rules is required for Frontend Engineering",
          path: ["code_editing_rules"],
        });
      }
      if (!data.guiding_principles || data.guiding_principles.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Guiding principles is required for Frontend Engineering",
          path: ["guiding_principles"],
        });
      }
      if (
        !data.frontend_stack_defaults ||
        data.frontend_stack_defaults.trim() === ""
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Frontend stack defaults is required for Frontend Engineering",
          path: ["frontend_stack_defaults"],
        });
      }
      if (
        !data.ui_ux_best_practices ||
        data.ui_ux_best_practices.trim() === ""
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "UI/UX best practices is required for Frontend Engineering",
          path: ["ui_ux_best_practices"],
        });
      }
    }
  });

export type InstructionFormData = z.infer<typeof instructionSchema>;

export const defaultValues: InstructionFormData = {
  context_gathering: "",
  persistence: "",
  tool_preambles: "",
  reasoning_effort: "moderate",
  self_reflection: "enabled",
  maximize_context_understanding: "",
  context_understanding: "",
  instruction_type: "General Purpose",
  code_editing_rules: "",
  guiding_principles: "",
  frontend_stack_defaults: "",
  ui_ux_best_practices: "",
};
