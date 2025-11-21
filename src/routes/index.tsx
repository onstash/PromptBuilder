import { useState, type ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// import { searchParamsSchema, type SearchParams } from "../utils/search-params";
import {
  instructionSchema,
  defaultValues,
  type InstructionFormData,
} from "../utils/instruction-schema";

const AnimatePresence = ({ children }: { children: ReactNode }) => (
  <>{children}</>
);

export const Route = createFileRoute("/")({
  component: InstructionBuilderPage,
  validateSearch: (search: Record<string, unknown>): InstructionFormData => {
    // validate and parse the search params into a typed state
    // return {
    //   page: Number(search?.page ?? 1),
    //   filter: (search.filter as string) || '',
    //   sort: (search.sort as ProductSearchSortOptions) || 'newest',
    // }
    const result = instructionSchema.safeParse(search);
    if (!result.success || result.error) {
      console.log("[validateSearch] result", result);
      console.log("[validateSearch] search", search);
      return defaultValues as InstructionFormData;
    }
    return result.data as InstructionFormData;
  },
});

export function InstructionBuilderPage() {
  const searchParams = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  // const [instructionType, setInstructionType] = useState<
  //   InstructionFormData["instruction_type"]
  // >(searchParams.instruction_type || "General Purpose");
  const [optionalSettingsOpen, setOptionalSettingsOpen] = useState(false);

  const form = useForm({
    defaultValues: searchParams,
    validators: {
      onChange: instructionSchema,
    },
    onSubmit: async ({ value }) => {
      navigate({
        search: (prev) => ({ ...prev, ...value }),
      });
    },
  });

  const handleInstructionTypeChange = (
    value: InstructionFormData["instruction_type"]
  ) => {
    // setInstructionType(value);
    form.setFieldValue("instruction_type", value);
  };

  const renderErrors = (errors: any[]) => {
    if (!errors) return null;
    return errors
      .map((err) =>
        typeof err === "string" ? err : err.message || "Unknown error"
      )
      .join(", ");
  };

  const isFieldFilled = (value: string | undefined) =>
    value && value.trim().length > 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 lg:p-12">
      <div className="mx-auto max-w-4xl">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-bold">
              AI Instruction Builder
            </CardTitle>
            <CardDescription className="text-base">
              Customize how your AI assistant behaves and responds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-6"
            >
              <form.Field name="instruction_type">
                {(field) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor="instruction_type"
                      className="text-sm font-semibold"
                    >
                      Instruction Type
                    </Label>
                    <Select
                      value={field.state.value}
                      onValueChange={handleInstructionTypeChange}
                    >
                      <SelectTrigger
                        id="instruction_type"
                        className={`border-2 transition-colors ${
                          isFieldFilled(field.state.value)
                            ? "border-[#38AC5F] bg-[#38AC5F]/5"
                            : "border-border"
                        }`}
                      >
                        <SelectValue placeholder="Select instruction type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General Purpose">
                          General Purpose
                        </SelectItem>
                        <SelectItem value="Frontend Engineering">
                          Frontend Engineering
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <AnimatePresence>
                      {field.state.meta.isTouched &&
                        field.state.meta.errors && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm text-destructive">
                              {renderErrors(field.state.meta.errors)}
                            </p>
                          </motion.div>
                        )}
                    </AnimatePresence>
                  </div>
                )}
              </form.Field>

              <form.Field name="context_gathering">
                {(field) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor="context_gathering"
                      className="text-sm font-semibold"
                    >
                      Context Gathering
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      What background info should the AI pick up before giving
                      an answer?
                    </p>
                    <Textarea
                      id="context_gathering"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className={`min-h-[100px] border-2 resize-y transition-colors ${
                        isFieldFilled(field.state.value)
                          ? "border-[#38AC5F] bg-[#38AC5F]/5"
                          : "border-border"
                      }`}
                      placeholder="Describe how the AI should gather context..."
                    />
                    <AnimatePresence>
                      {field.state.meta.isTouched &&
                        field.state.meta.errors && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm text-destructive">
                              {renderErrors(field.state.meta.errors)}
                            </p>
                          </motion.div>
                        )}
                    </AnimatePresence>
                  </div>
                )}
              </form.Field>

              <Accordion
                type="single"
                collapsible
                className="w-full border-2"
                value={optionalSettingsOpen ? "optional-fields" : ""}
                onValueChange={(value) =>
                  setOptionalSettingsOpen(value === "optional-fields")
                }
              >
                <AccordionItem value="optional-fields">
                  <AccordionTrigger className="px-4 font-semibold hover:no-underline">
                    Optional Settings
                  </AccordionTrigger>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AccordionContent className="space-y-6 px-4 py-4">
                      <form.Field name="persistence">
                        {(field) => (
                          <div className="space-y-2">
                            <Label
                              htmlFor="persistence"
                              className="text-sm font-semibold"
                            >
                              Persistence
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              What should the AI remember as the conversation
                              continues?
                            </p>
                            <Textarea
                              id="persistence"
                              value={field.state.value}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              onBlur={field.handleBlur}
                              className={`min-h-[100px] border-2 resize-y transition-colors ${
                                isFieldFilled(field.state.value)
                                  ? "border-[#38AC5F] bg-[#38AC5F]/5"
                                  : "border-border"
                              }`}
                              placeholder="Describe what should persist..."
                            />
                            <AnimatePresence>
                              {field.state.meta.isTouched &&
                                field.state.meta.errors && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <p className="text-sm text-destructive">
                                      {renderErrors(field.state.meta.errors)}
                                    </p>
                                  </motion.div>
                                )}
                            </AnimatePresence>
                          </div>
                        )}
                      </form.Field>

                      <form.Field name="tool_preambles">
                        {(field) => (
                          <div className="space-y-2">
                            <Label
                              htmlFor="tool_preambles"
                              className="text-sm font-semibold"
                            >
                              Tool Preambles
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              The starting instructions the AI needs before
                              using any tools.
                            </p>
                            <Textarea
                              id="tool_preambles"
                              value={field.state.value}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              onBlur={field.handleBlur}
                              className={`min-h-[100px] border-2 resize-y transition-colors ${
                                isFieldFilled(field.state.value)
                                  ? "border-[#38AC5F] bg-[#38AC5F]/5"
                                  : "border-border"
                              }`}
                              placeholder="Describe tool usage instructions..."
                            />
                            <AnimatePresence>
                              {field.state.meta.isTouched &&
                                field.state.meta.errors && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <p className="text-sm text-destructive">
                                      {renderErrors(field.state.meta.errors)}
                                    </p>
                                  </motion.div>
                                )}
                            </AnimatePresence>
                          </div>
                        )}
                      </form.Field>

                      <form.Field name="maximize_context_understanding">
                        {(field) => (
                          <div className="space-y-2">
                            <Label
                              htmlFor="maximize_context_understanding"
                              className="text-sm font-semibold"
                            >
                              Maximize Context Understanding
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              How the AI tries its best to understand what you
                              really mean.
                            </p>
                            <Textarea
                              id="maximize_context_understanding"
                              value={field.state.value}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              onBlur={field.handleBlur}
                              className={`min-h-[100px] border-2 resize-y transition-colors ${
                                isFieldFilled(field.state.value)
                                  ? "border-[#38AC5F] bg-[#38AC5F]/5"
                                  : "border-border"
                              }`}
                              placeholder="Describe context maximization..."
                            />
                            <AnimatePresence>
                              {field.state.meta.isTouched &&
                                field.state.meta.errors && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <p className="text-sm text-destructive">
                                      {renderErrors(field.state.meta.errors)}
                                    </p>
                                  </motion.div>
                                )}
                            </AnimatePresence>
                          </div>
                        )}
                      </form.Field>

                      <form.Field name="context_understanding">
                        {(field) => (
                          <div className="space-y-2">
                            <Label
                              htmlFor="context_understanding"
                              className="text-sm font-semibold"
                            >
                              Context Understanding
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              How the AI understands the meaning of your message
                              in general.
                            </p>
                            <Textarea
                              id="context_understanding"
                              value={field.state.value}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              onBlur={field.handleBlur}
                              className={`min-h-[100px] border-2 resize-y transition-colors ${
                                isFieldFilled(field.state.value)
                                  ? "border-[#38AC5F] bg-[#38AC5F]/5"
                                  : "border-border"
                              }`}
                              placeholder="Describe general understanding approach..."
                            />
                            <AnimatePresence>
                              {field.state.meta.isTouched &&
                                field.state.meta.errors && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <p className="text-sm text-destructive">
                                      {renderErrors(field.state.meta.errors)}
                                    </p>
                                  </motion.div>
                                )}
                            </AnimatePresence>
                          </div>
                        )}
                      </form.Field>
                    </AccordionContent>
                  </motion.div>
                </AccordionItem>
              </Accordion>

              <form.Field name="reasoning_effort">
                {(field) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor="reasoning_effort"
                      className="text-sm font-semibold"
                    >
                      Reasoning Effort
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      How hard should the AI think — short answer or deep
                      explanation?
                    </p>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value)}
                    >
                      <SelectTrigger
                        id="reasoning_effort"
                        className={`border-2 transition-colors ${
                          isFieldFilled(field.state.value)
                            ? "border-[#38AC5F] bg-[#38AC5F]/5"
                            : "border-border"
                        }`}
                      >
                        <SelectValue placeholder="Select reasoning effort" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          Low - Quick, concise answers
                        </SelectItem>
                        <SelectItem value="moderate">
                          Moderate - Balanced depth
                        </SelectItem>
                        <SelectItem value="high">
                          High - Deep, thorough analysis
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <AnimatePresence>
                      {field.state.meta.isTouched &&
                        field.state.meta.errors && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm text-destructive">
                              {renderErrors(field.state.meta.errors)}
                            </p>
                          </motion.div>
                        )}
                    </AnimatePresence>
                  </div>
                )}
              </form.Field>

              <form.Field name="self_reflection">
                {(field) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor="self_reflection"
                      className="text-sm font-semibold"
                    >
                      Self Reflection
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      How the AI checks its own answer for mistakes.
                    </p>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value)}
                    >
                      <SelectTrigger
                        id="self_reflection"
                        className={`border-2 transition-colors ${
                          isFieldFilled(field.state.value)
                            ? "border-[#38AC5F] bg-[#38AC5F]/5"
                            : "border-border"
                        }`}
                      >
                        <SelectValue placeholder="Select self reflection" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">
                          Enabled - Always review answers
                        </SelectItem>
                        <SelectItem value="standard">
                          Standard - Review complex responses
                        </SelectItem>
                        <SelectItem value="minimal">
                          Minimal - Basic checks only
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <AnimatePresence>
                      {field.state.meta.isTouched &&
                        field.state.meta.errors && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm text-destructive">
                              {renderErrors(field.state.meta.errors)}
                            </p>
                          </motion.div>
                        )}
                    </AnimatePresence>
                  </div>
                )}
              </form.Field>

              <AnimatePresence>
                {form.state.values.instruction_type === "Frontend Engineering" && (
                  <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-6 rounded-lg border-2 border-accent p-4 md:p-6">
                      <h3 className="text-lg font-semibold text-accent-foreground bg-accent px-3 py-2 -mx-4 -mt-4 md:-mx-6 md:-mt-6 mb-4">
                        Frontend Engineering Settings
                      </h3>

                      <form.Field name="code_editing_rules">
                        {(field) => (
                          <div className="space-y-2">
                            <Label
                              htmlFor="code_editing_rules"
                              className="text-sm font-semibold"
                            >
                              Code Editing Rules
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              How the AI should change or improve code safely.
                            </p>
                            <Textarea
                              id="code_editing_rules"
                              value={field.state.value || ""}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              onBlur={field.handleBlur}
                              className={`min-h-[100px] border-2 resize-y transition-colors ${
                                isFieldFilled(field.state.value)
                                  ? "border-[#38AC5F] bg-[#38AC5F]/5"
                                  : "border-border"
                              }`}
                              placeholder="Describe code editing guidelines..."
                            />
                            <AnimatePresence>
                              {field.state.meta.isTouched &&
                                field.state.meta.errors && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <p className="text-sm text-destructive">
                                      {renderErrors(field.state.meta.errors)}
                                    </p>
                                  </motion.div>
                                )}
                            </AnimatePresence>
                          </div>
                        )}
                      </form.Field>

                      <form.Field name="guiding_principles">
                        {(field) => (
                          <div className="space-y-2">
                            <Label
                              htmlFor="guiding_principles"
                              className="text-sm font-semibold"
                            >
                              Guiding Principles
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Core rules like readability, performance, and
                              correctness.
                            </p>
                            <Textarea
                              id="guiding_principles"
                              value={field.state.value || ""}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              onBlur={field.handleBlur}
                              className={`min-h-[100px] border-2 resize-y transition-colors ${
                                isFieldFilled(field.state.value)
                                  ? "border-[#38AC5F] bg-[#38AC5F]/5"
                                  : "border-border"
                              }`}
                              placeholder="Describe core principles..."
                            />
                            <AnimatePresence>
                              {field.state.meta.isTouched &&
                                field.state.meta.errors && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <p className="text-sm text-destructive">
                                      {renderErrors(field.state.meta.errors)}
                                    </p>
                                  </motion.div>
                                )}
                            </AnimatePresence>
                          </div>
                        )}
                      </form.Field>

                      <form.Field name="frontend_stack_defaults">
                        {(field) => (
                          <div className="space-y-2">
                            <Label
                              htmlFor="frontend_stack_defaults"
                              className="text-sm font-semibold"
                            >
                              Frontend Stack Defaults
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              The default tech choices the AI should assume.
                            </p>
                            <Textarea
                              id="frontend_stack_defaults"
                              value={field.state.value || ""}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              onBlur={field.handleBlur}
                              className={`min-h-[100px] border-2 resize-y transition-colors ${
                                isFieldFilled(field.state.value)
                                  ? "border-[#38AC5F] bg-[#38AC5F]/5"
                                  : "border-border"
                              }`}
                              placeholder="Describe default stack..."
                            />
                            <AnimatePresence>
                              {field.state.meta.isTouched &&
                                field.state.meta.errors && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <p className="text-sm text-destructive">
                                      {renderErrors(field.state.meta.errors)}
                                    </p>
                                  </motion.div>
                                )}
                            </AnimatePresence>
                          </div>
                        )}
                      </form.Field>

                      <form.Field name="ui_ux_best_practices">
                        {(field) => (
                          <div className="space-y-2">
                            <Label
                              htmlFor="ui_ux_best_practices"
                              className="text-sm font-semibold"
                            >
                              UI/UX Best Practices
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Good design rules to keep apps clear, usable, and
                              responsive.
                            </p>
                            <Textarea
                              id="ui_ux_best_practices"
                              value={field.state.value || ""}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              onBlur={field.handleBlur}
                              className={`min-h-[100px] border-2 resize-y transition-colors ${
                                isFieldFilled(field.state.value)
                                  ? "border-[#38AC5F] bg-[#38AC5F]/5"
                                  : "border-border"
                              }`}
                              placeholder="Describe UI/UX guidelines..."
                            />
                            <AnimatePresence>
                              {field.state.meta.isTouched &&
                                field.state.meta.errors && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <p className="text-sm text-destructive">
                                      {renderErrors(field.state.meta.errors)}
                                    </p>
                                  </motion.div>
                                )}
                            </AnimatePresence>
                          </div>
                        )}
                      </form.Field>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="border-2 shadow-md font-semibold"
                >
                  Save Instructions
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
