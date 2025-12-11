import { motion } from "motion/react";
import { Copy, Check, X, Link2, ExternalLink } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { PromptWizardData } from "@/utils/prompt-wizard/schema";

interface WizardPreviewProps {
  data: PromptWizardData;
  shareUrl: string | null;
  onClose: () => void;
  source: "wizard" | "share";
}

function generatePromptString(data: PromptWizardData): string {
  const sections: string[] = [];

  if (data.task_intent) {
    sections.push(`## Task\n${data.task_intent}`);
  }

  if (data.context) {
    sections.push(`## Context\n${data.context}`);
  }

  if (data.constraints) {
    sections.push(`## Constraints\n${data.constraints}`);
  }

  const audienceLabel =
    data.target_audience === "custom"
      ? data.custom_audience
      : data.target_audience;
  if (audienceLabel) {
    sections.push(`## Target Audience\n${audienceLabel}`);
  }

  const formatMap: Record<string, string> = {
    "1-paragraph": "Provide your response in a single paragraph.",
    "2-paragraphs": "Provide your response in exactly 2 paragraphs.",
    "3-plus-paragraphs":
      "Provide a detailed response with multiple paragraphs.",
    "bullet-list": "Provide your response as a bulleted list.",
    "numbered-list": "Provide your response as a numbered step-by-step list.",
    table: "Provide your response in a table format.",
    mixed: "Use a combination of paragraphs, lists, and other formatting.",
  };
  if (data.output_format) {
    sections.push(
      `## Output Format\n${formatMap[data.output_format] || data.output_format}`
    );
  }

  if (data.ai_role) {
    sections.push(`## Your Role\nAct as: ${data.ai_role}`);
  }

  if (data.tone_style) {
    sections.push(`## Tone\nUse a ${data.tone_style} tone.`);
  }

  if (data.reasoning_depth && data.reasoning_depth !== "moderate") {
    const depthMap: Record<string, string> = {
      brief: "Be concise and direct.",
      thorough: "Provide thorough, in-depth analysis.",
    };
    sections.push(`## Reasoning\n${depthMap[data.reasoning_depth]}`);
  }

  if (data.self_check) {
    sections.push(
      `## Self-Check\nBefore finalizing, verify your response is accurate and complete.`
    );
  }

  if (data.disallowed_content) {
    sections.push(`## Avoid\n${data.disallowed_content}`);
  }

  return sections.join("\n\n");
}

export function WizardPreview({
  data,
  shareUrl,
  onClose,
  source,
}: WizardPreviewProps) {
  const isSourceShare = source === "share";
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const promptText = generatePromptString(data);

  const handleCopyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedPrompt(true);
      toast.success("Prompt copied to clipboard!");
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, [promptText]);

  const handleCopyLink = useCallback(async () => {
    if (!shareUrl) return;
    try {
      const fullUrl = `${window.location.origin}${shareUrl}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      toast.success("Share link copied!");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  }, [shareUrl]);

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
          {shareUrl && (
            <>
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="font-mono text-xs"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 mr-1" />
                    Copy Link
                  </>
                )}
              </Button>
              {!isSourceShare && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="font-mono text-xs"
                >
                  <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Open
                  </a>
                </Button>
              )}
            </>
          )}
          <Button
            onClick={handleCopyPrompt}
            size="sm"
            className="uppercase font-bold"
          >
            {copiedPrompt ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                Copy Prompt
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

      {/* Share URL indicator */}
      {shareUrl && (
        <div className="p-4 border-t-2 border-muted bg-muted/30">
          <p className="text-xs font-mono text-muted-foreground">
            🔗 Share link ready! Use "Copy Link" to share this prompt with
            others.
          </p>
        </div>
      )}
    </motion.div>
  );
}
