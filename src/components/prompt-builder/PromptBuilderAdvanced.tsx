import { useState } from "react";

import { useForm } from "@tanstack/react-form";
import { AnimatePresence, motion } from "motion/react";

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
import { Checkbox } from "@/components/ui/checkbox";

// import {
//   instructionSchema,
//   searchParamsLongToShort,
//   searchParamsShortToLong,
//   type InstructionFormData,
// } from "../utils/instruction-schema";
import { Route } from "@/routes/prompt-builder/advanced";
import {
  defaultValues,
  promptBuilderAdvancedFormSchema,
  PromptBuilderFormData,
} from "@/utils/prompt-builder/advanced-schema";

function generatePrompt(
  value: PromptBuilderFormData,
  setStateCallback: (newValue: string) => void
) {
  const _arr = [];
  for (const [key, _value] of Object.entries(value)) {
    const _valueType = typeof _value;
    switch (_valueType) {
      case "boolean": {
        if (_value) {
          _arr.push(`${key}: \n${_value}`);
        }
        break;
      }
      case "string": {
        if ((_value as string).length) {
          _arr.push(`<${key}>\n\t${_value}\n</${key}>`);
        }
        break;
      }
    }
  }
  const promptGeneratedStr = _arr.join("\n");
  setStateCallback(promptGeneratedStr);
  window.localStorage.setItem("promptGeneratedStr", promptGeneratedStr);
}

export function PromptBuilderAdvanced() {
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();
  const [optionalSettingsOpen, setOptionalSettingsOpen] = useState(false);
  const [promptGenerated, _setPromptGenerated] = useState(() => {
    let updatedAt = Date.now();
    let value = ``;
    let setState = (newValue: string) => {
      updatedAt = Date.now();
      value = newValue;
      console.log("[promptGenerated] setState called", { updatedAt, newValue });
    };
    generatePrompt((searchParams
      ? searchParams
      : defaultValues) as PromptBuilderFormData, setState);
    return {
      value,
      updatedAt,
    };
  });
  const setPromptGenerated = (newValue: string) => {
    _setPromptGenerated({ value: newValue, updatedAt: Date.now() });
  };

  const form = useForm({
    // defaultValues: searchParamsShortToLong(searchParams),
    defaultValues: (searchParams
      ? searchParams
      : defaultValues) as PromptBuilderFormData,
    validators: {
      onChange: promptBuilderAdvancedFormSchema,
      onBlurAsync: (opts) => {
        // navigate({
        //   search: (prev) => ({ ...prev, ...opts.value }),
        // });
        generatePrompt(opts.value, setPromptGenerated);
      },
    },
    onSubmit: async (opts) => {
      generatePrompt(opts.value, setPromptGenerated);
      // if (confirm(JSON.stringify(searchParamsLongToShort(value)))) {
      //   navigate({
      //     search: (prev) => {
      //       return {
      //         ...prev,
      //         ...searchParamsLongToShort(value)
      //       };
      //     },
      //     // replace: true,
      //   });
      // } else {
      //   alert('searchParams not updated')
      // }
    },
  });

  const handleAiRoleChange = (value: PromptBuilderFormData["ai_role"]) => {
    form.setFieldValue("ai_role", value);
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
      <div className="mx-auto flex flex-col lg:flex-row lg:justify-center lg:gap-8">
        <div className="w-full lg:w-1/2">
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold">
                AI Prompt Builder (Advanced)
              </CardTitle>
              <CardDescription className="text-base">
                Customize how your AI assistant behaves and responds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  console.log("form.submit", e);
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                className="space-y-6"
              >
                {/* Task Intent - Required */}
                <form.Field name="task_intent" asyncDebounceMs={500}>
                  {(field) => (
                    <div className="space-y-2">
                      <Label
                        htmlFor="task_intent"
                        className="text-sm font-semibold"
                      >
                        Task Intent <span className="text-destructive">*</span>
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        What do you want the AI to do?
                      </p>
                      <Textarea
                        id="task_intent"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className={`min-h-[100px] border-2 resize-y transition-colors ${
                          isFieldFilled(field.state.value)
                            ? "border-[#38AC5F] bg-[#38AC5F]/5"
                            : "border-border"
                        }`}
                        placeholder="Describe the main task or goal..."
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

                {/* Context Gathering */}
                <form.Field name="context_gathering" asyncDebounceMs={500}>
                  {(field) => (
                    <div className="space-y-2">
                      <Label
                        htmlFor="context_gathering"
                        className="text-sm font-semibold"
                      >
                        Context Gathering
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        What background information should the AI consider?
                      </p>
                      <Textarea
                        id="context_gathering"
                        value={field.state.value || ""}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className={`min-h-[80px] border-2 resize-y transition-colors ${
                          isFieldFilled(field.state.value)
                            ? "border-[#38AC5F] bg-[#38AC5F]/5"
                            : "border-border"
                        }`}
                        placeholder="Provide context for better responses..."
                      />
                    </div>
                  )}
                </form.Field>

                {/* Output Format - Required */}
                <form.Field name="output_format">
                  {(field) => (
                    <div className="space-y-2">
                      <Label
                        htmlFor="output_format"
                        className="text-sm font-semibold"
                      >
                        Output Format{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        How should the output be structured?
                      </p>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) =>
                          field.handleChange(
                            value as PromptBuilderFormData["output_format"]
                          )
                        }
                      >
                        <SelectTrigger
                          id="output_format"
                          className={`border-2 transition-colors ${
                            isFieldFilled(field.state.value)
                              ? "border-[#38AC5F] bg-[#38AC5F]/5"
                              : "border-border"
                          }`}
                        >
                          <SelectValue placeholder="Select output format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bullets">Bullet Points</SelectItem>
                          <SelectItem value="step_by_step">
                            Step by Step
                          </SelectItem>
                          <SelectItem value="essay">Essay</SelectItem>
                          <SelectItem value="table">Table</SelectItem>
                          <SelectItem value="script">Script</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
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

                {/* Reasoning Depth - Required */}
                <form.Field name="reasoning_depth">
                  {(field) => (
                    <div className="space-y-2">
                      <Label
                        htmlFor="reasoning_depth"
                        className="text-sm font-semibold"
                      >
                        Reasoning Depth{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        How deeply should the AI think through the problem?
                      </p>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) =>
                          field.handleChange(
                            value as PromptBuilderFormData["reasoning_depth"]
                          )
                        }
                      >
                        <SelectTrigger
                          id="reasoning_depth"
                          className={`border-2 transition-colors ${
                            isFieldFilled(field.state.value)
                              ? "border-[#38AC5F] bg-[#38AC5F]/5"
                              : "border-border"
                          }`}
                        >
                          <SelectValue placeholder="Select reasoning depth" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quick">
                            Quick - Surface level
                          </SelectItem>
                          <SelectItem value="medium">
                            Medium - Balanced analysis
                          </SelectItem>
                          <SelectItem value="deep">
                            Deep - Thorough examination
                          </SelectItem>
                          <SelectItem value="expert_chain_of_thought">
                            Expert - Chain of thought reasoning
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

                {/* Optional Settings Accordion */}
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
                        {/* Target Audience */}
                        <form.Field
                          name="target_audience"
                          asyncDebounceMs={500}
                        >
                          {(field) => (
                            <div className="space-y-2">
                              <Label
                                htmlFor="target_audience"
                                className="text-sm font-semibold"
                              >
                                Target Audience
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Who is this content for?
                              </p>
                              <Textarea
                                id="target_audience"
                                value={field.state.value || ""}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                onBlur={field.handleBlur}
                                className={`min-h-[80px] border-2 resize-y transition-colors ${
                                  isFieldFilled(field.state.value)
                                    ? "border-[#38AC5F] bg-[#38AC5F]/5"
                                    : "border-border"
                                }`}
                                placeholder="Describe the target audience..."
                              />
                            </div>
                          )}
                        </form.Field>

                        {/* Examples */}
                        <form.Field name="examples" asyncDebounceMs={500}>
                          {(field) => (
                            <div className="space-y-2">
                              <Label
                                htmlFor="examples"
                                className="text-sm font-semibold"
                              >
                                Examples
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Provide examples of desired output or behavior
                              </p>
                              <Textarea
                                id="examples"
                                value={field.state.value || ""}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                onBlur={field.handleBlur}
                                className={`min-h-[80px] border-2 resize-y transition-colors ${
                                  isFieldFilled(field.state.value)
                                    ? "border-[#38AC5F] bg-[#38AC5F]/5"
                                    : "border-border"
                                }`}
                                placeholder="Provide examples..."
                              />
                            </div>
                          )}
                        </form.Field>

                        {/* AI Role */}
                        <form.Field name="ai_role">
                          {(field) => (
                            <div className="space-y-2">
                              <Label
                                htmlFor="ai_role"
                                className="text-sm font-semibold"
                              >
                                AI Role
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                What role should the AI take on?
                              </p>
                              <Select
                                value={field.state.value || ""}
                                onValueChange={handleAiRoleChange}
                              >
                                <SelectTrigger
                                  id="ai_role"
                                  className={`border-2 transition-colors ${
                                    isFieldFilled(field.state.value)
                                      ? "border-[#38AC5F] bg-[#38AC5F]/5"
                                      : "border-border"
                                  }`}
                                >
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    "health, wellness & fitness entrepreneur in India",
                                    "health, wellness & fitness coach in India",
                                    "custom",
                                  ].map((item) => {
                                    return (
                                      <SelectItem value={item} key={item}>
                                        {item[0].toUpperCase() +
                                          item.slice(1).toLowerCase()}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </form.Field>

                        {/* Custom Role - Conditional */}
                        <AnimatePresence>
                          {form.state.values.ai_role === "custom" && (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.2 }}
                            >
                              <form.Field
                                name="custom_role"
                                asyncDebounceMs={500}
                              >
                                {(field) => (
                                  <div className="space-y-2">
                                    <Label
                                      htmlFor="custom_role"
                                      className="text-sm font-semibold"
                                    >
                                      Custom Role{" "}
                                      <span className="text-destructive">
                                        *
                                      </span>
                                    </Label>
                                    <Textarea
                                      id="custom_role"
                                      value={field.state.value || ""}
                                      onChange={(e) =>
                                        field.handleChange(e.target.value)
                                      }
                                      onBlur={field.handleBlur}
                                      className={`min-h-[80px] border-2 resize-y transition-colors ${
                                        isFieldFilled(field.state.value)
                                          ? "border-[#38AC5F] bg-[#38AC5F]/5"
                                          : "border-border"
                                      }`}
                                      placeholder="Describe the custom role..."
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
                                              {renderErrors(
                                                field.state.meta.errors
                                              )}
                                            </p>
                                          </motion.div>
                                        )}
                                    </AnimatePresence>
                                  </div>
                                )}
                              </form.Field>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Constraints */}
                        <form.Field name="constraints" asyncDebounceMs={500}>
                          {(field) => (
                            <div className="space-y-2">
                              <Label
                                htmlFor="constraints"
                                className="text-sm font-semibold"
                              >
                                Constraints
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Any limitations or restrictions?
                              </p>
                              <Textarea
                                id="constraints"
                                value={field.state.value || ""}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                onBlur={field.handleBlur}
                                className={`min-h-[80px] border-2 resize-y transition-colors ${
                                  isFieldFilled(field.state.value)
                                    ? "border-[#38AC5F] bg-[#38AC5F]/5"
                                    : "border-border"
                                }`}
                                placeholder="Describe constraints..."
                              />
                            </div>
                          )}
                        </form.Field>

                        {/* Tone & Style */}
                        <form.Field name="tone_style">
                          {(field) => (
                            <div className="space-y-2">
                              <Label
                                htmlFor="tone_style"
                                className="text-sm font-semibold"
                              >
                                Tone & Style
                              </Label>
                              <Select
                                value={field.state.value || ""}
                                onValueChange={(value) =>
                                  field.handleChange(
                                    value as PromptBuilderFormData["tone_style"]
                                  )
                                }
                              >
                                <SelectTrigger
                                  id="tone_style"
                                  className={`border-2 transition-colors ${
                                    isFieldFilled(field.state.value)
                                      ? "border-[#38AC5F] bg-[#38AC5F]/5"
                                      : "border-border"
                                  }`}
                                >
                                  <SelectValue placeholder="Select tone" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="simple">Simple</SelectItem>
                                  <SelectItem value="professional">
                                    Professional
                                  </SelectItem>
                                  <SelectItem value="friendly">
                                    Friendly
                                  </SelectItem>
                                  <SelectItem value="playful">
                                    Playful
                                  </SelectItem>
                                  <SelectItem value="formal">Formal</SelectItem>
                                  <SelectItem value="expert">Expert</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </form.Field>

                        {/* Length Preference */}
                        <form.Field name="length_preference">
                          {(field) => (
                            <div className="space-y-2">
                              <Label
                                htmlFor="length_preference"
                                className="text-sm font-semibold"
                              >
                                Length Preference
                              </Label>
                              <Select
                                value={field.state.value || ""}
                                onValueChange={(value) =>
                                  field.handleChange(
                                    value as PromptBuilderFormData["length_preference"]
                                  )
                                }
                              >
                                <SelectTrigger
                                  id="length_preference"
                                  className={`border-2 transition-colors ${
                                    isFieldFilled(field.state.value)
                                      ? "border-[#38AC5F] bg-[#38AC5F]/5"
                                      : "border-border"
                                  }`}
                                >
                                  <SelectValue placeholder="Select length" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="short">Short</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="long">Long</SelectItem>
                                  <SelectItem value="ultra_detailed">
                                    Ultra Detailed
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </form.Field>

                        {/* Factuality Rules */}
                        <form.Field
                          name="factuality_rules"
                          asyncDebounceMs={500}
                        >
                          {(field) => (
                            <div className="space-y-2">
                              <Label
                                htmlFor="factuality_rules"
                                className="text-sm font-semibold"
                              >
                                Factuality Rules
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                How should the AI handle accuracy and sources?
                              </p>
                              <Textarea
                                id="factuality_rules"
                                value={field.state.value || ""}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                onBlur={field.handleBlur}
                                className={`min-h-[80px] border-2 resize-y transition-colors ${
                                  isFieldFilled(field.state.value)
                                    ? "border-[#38AC5F] bg-[#38AC5F]/5"
                                    : "border-border"
                                }`}
                                placeholder="Describe factuality expectations..."
                              />
                            </div>
                          )}
                        </form.Field>

                        {/* Disallowed Content */}
                        <form.Field
                          name="disallowed_content"
                          asyncDebounceMs={500}
                        >
                          {(field) => (
                            <div className="space-y-2">
                              <Label
                                htmlFor="disallowed_content"
                                className="text-sm font-semibold"
                              >
                                Disallowed Content
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                What should the AI avoid?
                              </p>
                              <Textarea
                                id="disallowed_content"
                                value={field.state.value || ""}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                onBlur={field.handleBlur}
                                className={`min-h-[80px] border-2 resize-y transition-colors ${
                                  isFieldFilled(field.state.value)
                                    ? "border-[#38AC5F] bg-[#38AC5F]/5"
                                    : "border-border"
                                }`}
                                placeholder="Describe disallowed content..."
                              />
                            </div>
                          )}
                        </form.Field>

                        {/* Self Reflection Rules */}
                        <form.Field name="self_reflection_rules">
                          {(field) => (
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id="self_reflection_rules"
                                checked={field.state.value || false}
                                onCheckedChange={(checked) =>
                                  field.handleChange(checked as boolean)
                                }
                              />
                              <Label
                                htmlFor="self_reflection_rules"
                                className="text-sm font-semibold cursor-pointer"
                              >
                                Enable Self Reflection
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                AI should review its own work for accuracy
                              </p>
                            </div>
                          )}
                        </form.Field>

                        {/* Additional Notes */}
                        <form.Field
                          name="additional_notes"
                          asyncDebounceMs={500}
                        >
                          {(field) => (
                            <div className="space-y-2">
                              <Label
                                htmlFor="additional_notes"
                                className="text-sm font-semibold"
                              >
                                Additional Notes
                              </Label>
                              <Textarea
                                id="additional_notes"
                                value={field.state.value || ""}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                onBlur={field.handleBlur}
                                className={`min-h-[80px] border-2 resize-y transition-colors ${
                                  isFieldFilled(field.state.value)
                                    ? "border-[#38AC5F] bg-[#38AC5F]/5"
                                    : "border-border"
                                }`}
                                placeholder="Any additional notes or requirements..."
                              />
                            </div>
                          )}
                        </form.Field>
                      </AccordionContent>
                    </motion.div>
                  </AccordionItem>
                </Accordion>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="border-2 shadow-md font-semibold cursor-pointer"
                    onClick={form.handleSubmit}
                  >
                    Save Prompt
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-1/2">
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold">
                Preview
              </CardTitle>
              <CardDescription className="text-base">
                Preview how your AI prompt looks like
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence key={promptGenerated.updatedAt}>
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="border-2 shadow-md font-semibold cursor-pointer"
                    onClick={() => {
                      navigator.clipboard
                        .writeText(promptGenerated.value)
                        .then(() => {
                          console.log("Copied!");
                          alert("Copied prompt!");
                        })
                        .catch((err) => {
                          console.error("Failed to copy: ", err);
                          alert(`Failed to copy: ${err.message}`);
                        });
                    }}
                  >
                    Copy Prompt to clipboard
                  </Button>
                </div>
                <Textarea
                  id="generated_prompt"
                  value={promptGenerated.value}
                  onChange={(e) => {
                    console.log(
                      "[promptGenerated][textarea] e",
                      e.target.value
                    );
                  }}
                  className={`min-h-[100px] border-2 resize-y transition-colors border-[#38AC5F] bg-[#38AC5F]/5`}
                  placeholder="Your generated prompt will appear here.."
                />
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
