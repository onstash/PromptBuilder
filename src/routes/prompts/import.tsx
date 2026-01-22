import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { Upload, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NavigationActions } from "@/components/prompt-wizard/NavigationActions";
import { useServerFn } from "@tanstack/react-start";
import { parsePromptMarkdown, parsePromptMarkdownLogger } from "@/functions/parse-prompt-markdown";
import { promptWizardSchema, PromptWizardData } from "@/utils/prompt-wizard/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { compressPrompt } from "@/utils/prompt-wizard/url-compression";

export const Route = createFileRoute("/prompts/import")({
  component: PromptsImportPage,
});

function PromptsImportPage() {
  const [rawText, setRawText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<z.ZodIssue[] | null>(null);

  const navigate = useNavigate();
  const parseMarkdownFn = useServerFn(parsePromptMarkdown);

  const handleImport = useCallback(async () => {
    if (!rawText.trim()) return;

    setIsLoading(true);
    setValidationErrors(null);

    try {
      // 1. Parse Markdown on Server
      const { data: parsedData, wizardType } = await parseMarkdownFn({
        data: { markdown: rawText },
      });
      parsePromptMarkdownLogger.debug("Parsed data: ", parsedData);

      // 2. Client-side Validation using Zod
      // We use safeParse to get all errors at once
      const validationResult = promptWizardSchema.safeParse(parsedData);
      parsePromptMarkdownLogger.debug("Validation result: ", validationResult);

      if (!validationResult.success) {
        setValidationErrors(validationResult.error.issues);
        toast.error("Validation failed. Please check the errors.");
        return;
      }

      // const result = await savePrompt({
      //   promptData: validationResult.data,
      //   sessionId: getOrCreateSessionId(),
      // });
      // if (!result.slug) {
      //   toast.error("Failed to import prompt. Please try again.");
      //   return;
      // }

      // 3. Success - Update Store & Navigate
      toast.success("Prompt imported successfully!");

      // navigate({
      //   to: `/prompts/${result.slug}`,
      //   reloadDocument: true,
      // });

      navigate({
        to: "/wizard",
        search: {
          d: compressPrompt({ ...validationResult.data, wizardType } as PromptWizardData),
          vld: 1,
          partial: false,
        },
      });
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import prompt. Invalid format.");
    } finally {
      setIsLoading(false);
    }
  }, [rawText, parseMarkdownFn, navigate]);

  return (
    <div className="container max-w-5xl mx-auto py-8 space-y-8">
      <NavigationActions page="share" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Import Area - Spans 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 bg-card border-4 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))] md:shadow-[8px_8px_0px_0px_hsl(var(--foreground))] max-md:shadow-[4px_4px_0px_0px_hsl(var(--foreground))]"
        >
          {/* Header */}
          <div className="p-4 border-b-4 border-foreground flex flex-row gap-3 items-center justify-between bg-muted/20">
            <h3 className="font-black uppercase text-lg flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Import Prompt
            </h3>
            <Button
              onClick={handleImport}
              disabled={!rawText.trim() || isLoading}
              className="uppercase font-bold bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>Import</>
              )}
            </Button>
          </div>

          {/* Input Area */}
          <div className="p-4">
            <Textarea
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                if (validationErrors) setValidationErrors(null); // Clear errors on edit
              }}
              placeholder="# Paste your markdown prompt here...

## Role
Act as index...

## Task
Your task is to..."
              className="min-h-[500px] font-mono text-sm leading-relaxed resize-none border-2 focus-visible:ring-offset-2"
            />
          </div>
        </motion.div>

        {/* Validation / Help Panel - Spans 1 col */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-1 space-y-6"
        >
          {/* Validation Errors */}
          {validationErrors && validationErrors.length > 0 && (
            <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-r space-y-3">
              <div className="flex items-center gap-2 text-destructive font-bold">
                <AlertTriangle className="w-5 h-5" />
                <h4>Import Errors</h4>
              </div>
              <ul className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {validationErrors.map((issue, idx) => (
                  <li
                    key={idx}
                    className="text-sm bg-background p-2 rounded border border-destructive/20 shadow-sm"
                  >
                    <span className="font-mono text-xs font-bold block mb-1 uppercase text-muted-foreground">
                      {issue.path.join(".")}
                    </span>
                    <span className="text-foreground/90">{issue.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Guide */}
          <Alert className="bg-primary/5 border-primary/20">
            <AlertDescription className="space-y-2">
              <h4 className="font-bold text-primary mb-2">Supported Sections</h4>
              <p className="text-xs text-muted-foreground">
                Ensure your markdown uses these headers for correct parsing:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-1 bg-background rounded border">## Role</div>
                <div className="p-1 bg-background rounded border">## Task</div>
                <div className="p-1 bg-background rounded border">## Context</div>
                <div className="p-1 bg-background rounded border">## Examples</div>
                <div className="p-1 bg-background rounded border">## Constraints</div>
                <div className="p-1 bg-background rounded border">## Output Format</div>
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      </div>
    </div>
  );
}
