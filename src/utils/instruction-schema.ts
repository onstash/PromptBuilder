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

export type InstructionFormDataShortened = Partial<{
  ctxg: InstructionFormData["context_gathering"];
  p: InstructionFormData["persistence"];
  tp: InstructionFormData["tool_preambles"];
  re: InstructionFormData["reasoning_effort"];
  sr: InstructionFormData["self_reflection"];
  ctxu: InstructionFormData["context_understanding"];
  mctxu: InstructionFormData["maximize_context_understanding"];
  it: InstructionFormData["instruction_type"];
  cer: InstructionFormData["code_editing_rules"];
  gp: InstructionFormData["guiding_principles"];
  fsd: InstructionFormData["frontend_stack_defaults"];
  uixbp: InstructionFormData["ui_ux_best_practices"];
}>;


export const searchParamsLongToShort = (
  data: Partial<InstructionFormData>
): InstructionFormDataShortened => {
  return {
    ctxg: data["context_gathering"],
    p: data["persistence"],
    tp: data["tool_preambles"],
    re: data["reasoning_effort"],
    sr: data["self_reflection"],
    ctxu: data["context_understanding"],
    mctxu: data["maximize_context_understanding"],
    it: data["instruction_type"],
    cer: data["code_editing_rules"],
    gp: data["guiding_principles"],
    fsd: data["frontend_stack_defaults"],
    uixbp: data["ui_ux_best_practices"],
  };
};

export const searchParamsShortToLong = (
  data: InstructionFormDataShortened
): InstructionFormData => {
  return {
    context_gathering: data["ctxg"]!,
    persistence: data["p"],
    tool_preambles: data["tp"],
    reasoning_effort: data["re"]!,
    self_reflection: data["sr"]!,
    context_understanding: data["ctxu"],
    maximize_context_understanding: data["mctxu"],
    instruction_type: data["it"]!,
    code_editing_rules: data["cer"],
    guiding_principles: data["gp"],
    frontend_stack_defaults: data["fsd"],
    ui_ux_best_practices: data["uixbp"],
  };
};


export const defaultValues: Partial<InstructionFormData> = {
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

export const defaultValuesShortened = searchParamsLongToShort({
  reasoning_effort: defaultValues["reasoning_effort"],
  instruction_type: defaultValues["instruction_type"],
  self_reflection: defaultValues["self_reflection"]
});