import { useForm } from "@tanstack/react-form";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  User,
  Briefcase,
  FileText,
  Layout,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Route } from "@/routes/prompt-builder/wizard";
import {
  searchParamsShortToLong,
  defaultValues,
  WizardFormData,
} from "@/utils/prompt-builder/wizard-schema";
import { PromptPreview } from "../common/PromptPreview";

const STEPS = [
  {
    id: 1,
    title: "The Persona",
    description: "Who should the AI be?",
    icon: User,
    color: "text-blue-500",
  },
  {
    id: 2,
    title: "The Task",
    description: "What is the main mission?",
    icon: Briefcase,
    color: "text-purple-500",
  },
  {
    id: 3,
    title: "The Context",
    description: "Any background info?",
    icon: FileText,
    color: "text-yellow-500",
  },
  {
    id: 4,
    title: "The Format",
    description: "How should it look?",
    icon: Layout,
    color: "text-green-500",
  },
  {
    id: 5,
    title: "The Preview",
    description: "Your ready-to-serve prompt",
    icon: Check,
    color: "text-red-500",
  },
];

const PERSONAS = [
  { value: "Teacher", label: "Teacher", emoji: "👩‍🏫" },
  { value: "Coder", label: "Coder", emoji: "💻" },
  { value: "Comedian", label: "Comedian", emoji: "🤡" },
  { value: "Critic", label: "Critic", emoji: "🧐" },
  { value: "custom", label: "Custom...", emoji: "✨" },
];

const FORMATS = [
  { value: "Table", label: "Table", icon: Layout },
  { value: "List", label: "List", icon: FileText },
  { value: "Code Block", label: "Code Block", icon: Briefcase }, // Reusing Briefcase as placeholder
  { value: "Email", label: "Email", icon: FileText },
  { value: "Tweet", label: "Tweet", icon: FileText },
  { value: "custom", label: "Custom...", icon: Wand2 },
];

export function PromptBuilderWizard() {
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();
  
  // Ensure step is a number and defaults to 1
  const currentStep = Number(searchParams.s) || 1;

  const form = useForm({
    defaultValues: {
      ...defaultValues,
      ...searchParamsShortToLong(searchParams),
      step: currentStep,
    },
    onSubmit: async ({ value }) => {
      // Handle final submission if needed
      console.log("Form submitted:", value);
    },
  });

  // Update URL when form changes, but debounce it slightly or just on step change
  // For wizard, we usually want to update URL on step change or explicit action
  const updateUrl = (values: WizardFormData) => {
    navigate({
      search: (prev: any) => ({ ...prev, ...values }),
      replace: true,
    });
  };

  const handleNext = () => {
    const nextStep = Math.min(currentStep + 1, 5);
    form.setFieldValue("step", nextStep);
    updateUrl({ ...form.state.values, step: nextStep });
  };

  const handleBack = () => {
    const prevStep = Math.max(currentStep - 1, 1);
    form.setFieldValue("step", prevStep);
    updateUrl({ ...form.state.values, step: prevStep });
  };

  // Generate the prompt string based on current values
  const generatePrompt = (values: WizardFormData) => {
    const parts = [];
    
    // Persona
    const persona = values.persona === "custom" ? values.customPersona : values.persona;
    if (persona) parts.push(`Act as a ${persona}.`);

    // Context
    if (values.context) parts.push(`\nContext:\n${values.context}`);

    // Task
    if (values.task) parts.push(`\nTask:\n${values.task}`);

    // Format
    const format = values.format === "custom" ? values.customFormat : values.format;
    if (format) parts.push(`\nFormat:\nPlease provide the output as a ${format}.`);

    return parts.join("\n");
  };

  // Memoize prompt generation to avoid unnecessary calculations
  // Note: form.state.values changes on every keystroke, so this will still run,
  // but it's good practice.
  const promptValue = generatePrompt(form.state.values);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center">
      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex justify-between mb-2">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex flex-col items-center ${
                step.id <= currentStep ? step.color : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step.id <= currentStep
                    ? `border-current bg-background`
                    : "border-muted bg-muted"
                }`}
              >
                <step.icon size={16} />
              </div>
              <span className="text-xs mt-1 hidden md:block">{step.title}</span>
            </div>
          ))}
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Card */}
      <Card className="w-full max-w-2xl border-2 shadow-xl relative overflow-hidden min-h-[500px] flex flex-col">
        <CardHeader className="bg-muted/10 border-b">
          <CardTitle className="flex items-center gap-2 text-2xl">
            {STEPS[currentStep - 1].icon && (
              <span className={STEPS[currentStep - 1].color}>
                {(() => {
                  const Icon = STEPS[currentStep - 1].icon;
                  return <Icon size={28} />;
                })()}
              </span>
            )}
            {STEPS[currentStep - 1].title}
          </CardTitle>
          <CardDescription className="text-lg">
            {STEPS[currentStep - 1].description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {/* Step 1: Persona */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {PERSONAS.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => {
                          form.setFieldValue("persona", p.value);
                          updateUrl({ ...form.state.values, persona: p.value });
                        }}
                        className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                          form.state.values.persona === p.value
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-md"
                            : "border-border hover:border-blue-300"
                        }`}
                      >
                        <div className="text-4xl mb-2">{p.emoji}</div>
                        <div className="font-semibold">{p.label}</div>
                      </button>
                    ))}
                  </div>
                  {form.state.values.persona === "custom" && (
                    <div className="mt-4">
                      <Label htmlFor="customPersona">Describe your custom persona:</Label>
                      <Input
                        id="customPersona"
                        value={form.state.values.customPersona || ""}
                        onChange={(e) => {
                          form.setFieldValue("customPersona", e.target.value);
                        }}
                        onBlur={() => updateUrl(form.state.values)}
                        placeholder="e.g. A grumpy 19th-century lighthouse keeper..."
                        className="mt-2"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Task */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <Label htmlFor="task" className="text-lg">
                    What do you want to achieve?
                  </Label>
                  <Textarea
                    id="task"
                    value={form.state.values.task || ""}
                    onChange={(e) => {
                      form.setFieldValue("task", e.target.value);
                    }}
                    onBlur={() => updateUrl(form.state.values)}
                    placeholder="e.g. Write a blog post about coffee..."
                    className="min-h-[200px] text-lg p-4 resize-none"
                    autoFocus
                  />
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" className="gap-2 text-purple-500">
                      <Wand2 size={16} />
                      Magic Fix (Coming Soon)
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Context */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <Label htmlFor="context" className="text-lg">
                    Add some background info (Optional)
                  </Label>
                  <Textarea
                    id="context"
                    value={form.state.values.context || ""}
                    onChange={(e) => {
                      form.setFieldValue("context", e.target.value);
                    }}
                    onBlur={() => updateUrl(form.state.values)}
                    placeholder="e.g. The audience is beginners. Use simple analogies..."
                    className="min-h-[200px] text-lg p-4 resize-none"
                    autoFocus
                  />
                </div>
              )}

              {/* Step 4: Format */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {FORMATS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => {
                          form.setFieldValue("format", f.value);
                          updateUrl({ ...form.state.values, format: f.value });
                        }}
                        className={`p-4 rounded-xl border-2 transition-all hover:scale-105 flex flex-col items-center justify-center gap-2 ${
                          form.state.values.format === f.value
                            ? "border-green-500 bg-green-50 dark:bg-green-950/30 shadow-md"
                            : "border-border hover:border-green-300"
                        }`}
                      >
                        <f.icon size={32} className={form.state.values.format === f.value ? "text-green-600" : "text-muted-foreground"} />
                        <div className="font-semibold">{f.label}</div>
                      </button>
                    ))}
                  </div>
                  {form.state.values.format === "custom" && (
                    <div className="mt-4">
                      <Label htmlFor="customFormat">Describe your custom format:</Label>
                      <Input
                        id="customFormat"
                        value={form.state.values.customFormat || ""}
                        onChange={(e) => {
                          form.setFieldValue("customFormat", e.target.value);
                        }}
                        onBlur={() => updateUrl(form.state.values)}
                        placeholder="e.g. A sonnet in iambic pentameter..."
                        className="mt-2"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Step 5: Preview */}
              {currentStep === 5 && (
                <div className="h-full flex flex-col">
                  <PromptPreview
                    value={promptValue}
                    updatedAt={0} // Use stable key to avoid remounting
                    onClipboardCopy={() => {}}
                    heading="Your Magic Prompt"
                    description="Ready to copy and paste!"
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        {/* Footer Actions */}
        <div className="p-6 border-t bg-muted/10 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          
          <div className="text-sm text-muted-foreground font-medium">
            Step {currentStep} of {STEPS.length}
          </div>

          {currentStep < 5 ? (
            <Button onClick={handleNext} className="gap-2">
              Next
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button onClick={() => {
                // Reset or navigate home? For now just copy toast
                navigator.clipboard.writeText(promptValue);
                alert("Copied to clipboard!");
            }} className="gap-2 bg-green-600 hover:bg-green-700">
              Copy Final
              <Check size={16} />
            </Button>
          )}
        </div>
      </Card>
      
      {/* Live Preview (Mini) - Visible on steps 1-4 */}
      {currentStep < 5 && (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mt-8 opacity-80 hover:opacity-100 transition-opacity"
        >
            <Card className="bg-muted/50 border-dashed">
                <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Live Preview</CardTitle>
                </CardHeader>
                <CardContent className="py-3 pt-0">
                    <pre className="whitespace-pre-wrap text-sm font-mono text-muted-foreground/80">
                        {promptValue || "(Start building to see your prompt here...)"}
                    </pre>
                </CardContent>
            </Card>
        </motion.div>
      )}
    </div>
  );
}
