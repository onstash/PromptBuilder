import { motion } from "motion/react";
import { Copy, Check, X } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { PromptWizardData } from "@/utils/prompt-wizard/schema";

interface WizardPreviewProps {
  data: PromptWizardData;
  onClose: () => void;
}

function generatePromptString(data: PromptWizardData): string {
  const sections: string[] = [];

  // Task Intent (required)
  if (data.task_intent) {
    sections.push(`## Task\n${data.task_intent}`);
  }

  // Context
  if (data.context) {
    sections.push(`## Context\n${data.context}`);
  }

  // Constraints
  if (data.constraints) {
    sections.push(`## Constraints\n${data.constraints}`);
  }

  // Target Audience
  const audienceLabel =
    data.target_audience === "custom"
      ? data.custom_audience
      : data.target_audience;
  if (audienceLabel) {
    sections.push(`## Target Audience\n${audienceLabel}`);
  }

  // Output Format
  const formatMap: Record<string, string> = {
    "1-paragraph": "Provide your response in a single paragraph.",
    "2-paragraphs": "Provide your response in exactly 2 paragraphs.",
    "3-plus-paragraphs":
      "Provide a detailed essay-length response with multiple paragraphs.",
    "bullet-list": "Provide your response as a bulleted list.",
    "numbered-list": "Provide your response as a numbered step-by-step list.",
    table: "Provide your response in a table format.",
    mixed:
      "Use a combination of paragraphs, lists, and other formatting as appropriate.",
  };
  if (data.output_format) {
    sections.push(
      `## Output Format\n${formatMap[data.output_format] || data.output_format}`
    );
  }

  // AI Role (optional)
  if (data.ai_role) {
    sections.push(`## Your Role\nAct as: ${data.ai_role}`);
  }

  // Tone (optional)
  if (data.tone_style) {
    sections.push(`## Tone\nUse a ${data.tone_style} tone.`);
  }

  // Reasoning Depth (optional)
  if (data.reasoning_depth && data.reasoning_depth !== "moderate") {
    const depthMap: Record<string, string> = {
      brief: "Be concise and direct.",
      thorough: "Provide thorough, in-depth analysis.",
    };
    sections.push(`## Reasoning\n${depthMap[data.reasoning_depth]}`);
  }

  // Self-Check (optional)
  if (data.self_check) {
    sections.push(
      `## Self-Check\nBefore finalizing, verify your response is accurate and complete.`
    );
  }

  // Disallowed Content (optional)
  if (data.disallowed_content) {
    sections.push(`## Avoid\n${data.disallowed_content}`);
  }

  return sections.join("\n\n");
}

export function WizardPreview({ data, onClose }: WizardPreviewProps) {
  const [copied, setCopied] = useState(false);
  const promptText = generatePromptString(data);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      toast.success("Prompt copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, [promptText]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 bg-card border-4 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))]"
    >
      {/* Header */}
      <div className="p-4 border-b-4 border-foreground flex items-center justify-between">
        <h3 className="font-black uppercase text-lg">Your Prompt</h3>
        <div className="flex gap-2">
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="uppercase font-bold"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </>
            )}
          </Button>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Prompt content */}
      <div className="p-4 max-h-[400px] overflow-y-auto">
        <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
          {promptText}
        </pre>
      </div>
    </motion.div>
  );
}
