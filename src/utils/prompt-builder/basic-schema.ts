import { z } from "zod";

import {
  createKeyMapping,
  createSearchParamsConverter,
} from "../search-params-core";

// Zod schema with conditional validation
export const promptBuilderBasicFormSchema = z
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

export type PromptBuilderBasicFormData = z.infer<
  typeof promptBuilderBasicFormSchema
>;

export type PromptBuilderBasicFormDataShortened = Partial<{
  ctxg: PromptBuilderBasicFormData["context_gathering"];
  p: PromptBuilderBasicFormData["persistence"];
  tp: PromptBuilderBasicFormData["tool_preambles"];
  re: PromptBuilderBasicFormData["reasoning_effort"];
  sr: PromptBuilderBasicFormData["self_reflection"];
  ctxu: PromptBuilderBasicFormData["context_understanding"];
  mctxu: PromptBuilderBasicFormData["maximize_context_understanding"];
  it: PromptBuilderBasicFormData["instruction_type"];
  cer: PromptBuilderBasicFormData["code_editing_rules"];
  gp: PromptBuilderBasicFormData["guiding_principles"];
  fsd: PromptBuilderBasicFormData["frontend_stack_defaults"];
  uixbp: PromptBuilderBasicFormData["ui_ux_best_practices"];
}>;

const promptBuilderBasicSearchParamsConverter = createSearchParamsConverter<
  PromptBuilderBasicFormData,
  PromptBuilderBasicFormDataShortened
>(
  createKeyMapping<
    PromptBuilderBasicFormData,
    PromptBuilderBasicFormDataShortened
  >({
    ctxg: "context_gathering",
    p: "persistence",
    tp: "tool_preambles",
    re: "reasoning_effort",
    sr: "self_reflection",
    ctxu: "context_understanding",
    mctxu: "maximize_context_understanding",
    it: "instruction_type",
    cer: "code_editing_rules",
    gp: "guiding_principles",
    fsd: "frontend_stack_defaults",
    uixbp: "ui_ux_best_practices",
  }),
);

export const searchParamsLongToShort =
  promptBuilderBasicSearchParamsConverter.longToShort;
export const searchParamsShortToLong =
  promptBuilderBasicSearchParamsConverter.shortToLong;

export const defaultValues: Partial<PromptBuilderBasicFormData> = {
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
  self_reflection: defaultValues["self_reflection"],
});
