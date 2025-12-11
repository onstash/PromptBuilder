import { motion } from "motion/react";
import { Copy, Check, X, Link2, ExternalLink, FilePen } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { PromptWizardData } from "@/utils/prompt-wizard/schema";
import { compressFullState, decompress } from "@/utils/prompt-wizard";
import { Link } from "@tanstack/react-router";
import { useTrackMixpanel } from "@/utils/analytics/MixpanelProvider";

type WizardPreviewProps =
  | {
      shareUrl: string;
      onClose: () => void;
      data: PromptWizardData;
      compressed: false;
      source: "wizard";
    }
  | {
      shareUrl: string;
      onClose: () => void;
      data: string;
      compressed: true;
      source: "share";
    };

function generatePromptString(
  opts:
    | {
        data: PromptWizardData;
        compressed: false;
      }
    | {
        data: string;
        compressed: true;
      }
): string {
  const { data, compressed } = opts;
  const finalData = (
    compressed ? JSON.parse(decompress(data)) : data
  ) as PromptWizardData;
  const sections: string[] = [];

  if (finalData.task_intent) {
    sections.push(`## Task\n${finalData.task_intent}`);
  }

  if (finalData.context) {
    sections.push(`## Context\n${finalData.context}`);
  }

  if (finalData.constraints) {
    sections.push(`## Constraints\n${finalData.constraints}`);
  }

  const audienceLabel =
    finalData.target_audience === "custom"
      ? finalData.custom_audience
      : finalData.target_audience;
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
  if (finalData.output_format) {
    sections.push(
      `## Output Format\n${formatMap[finalData.output_format] || finalData.output_format}`
    );
  }

  if (finalData.ai_role) {
    sections.push(`## Your Role\nAct as: ${finalData.ai_role}`);
  }

  if (finalData.tone_style) {
    sections.push(`## Tone\nUse a ${finalData.tone_style} tone.`);
  }

  if (finalData.reasoning_depth && finalData.reasoning_depth !== "moderate") {
    const depthMap: Record<string, string> = {
      brief: "Be concise and direct.",
      thorough: "Provide thorough, in-depth analysis.",
    };
    sections.push(`## Reasoning\n${depthMap[finalData.reasoning_depth]}`);
  }

  if (finalData.self_check) {
    sections.push(
      `## Self-Check\nBefore finalizing, verify your response is accurate and complete.`
    );
  }

  if (finalData.disallowed_content) {
    sections.push(`## Avoid\n${finalData.disallowed_content}`);
  }

  return sections.join("\n\n");
}

export function WizardPreview({
  data,
  compressed,
  shareUrl,
  onClose,
  source,
}: WizardPreviewProps) {
  const trackEvent = useTrackMixpanel();
  const isSourceShare = source === "share";
  useEffect(() => {
    trackEvent("page_viewed_share", {
      data: {
        source,
        compressed,
      },
    });
  }, []);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [[promptText, promptTextCompressed]] = useState(() => {
    const result = compressed
      ? generatePromptString({ data: data as string, compressed: true })
      : generatePromptString({
          data: data as PromptWizardData,
          compressed: false,
        });
    return [
      result,
      compressed ? data : compressFullState(data as PromptWizardData),
    ];
  });

  const handleCopyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      trackEvent("button_clicked", {
        button: "copy_prompt",
      });
      setCopiedPrompt(true);
      toast.success("Prompt copied to clipboard!");
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, []);

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

  const EditOrOpenIcon = !isSourceShare ? ExternalLink : FilePen;

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
              <Button
                asChild
                variant="outline"
                size="sm"
                className="font-mono text-xs"
              >
                <Link
                  to={!isSourceShare ? "/share" : "/wizard"}
                  search={{ d: promptTextCompressed, vld: 1 }}
                >
                  <EditOrOpenIcon className="w-4 h-4 mr-1" />
                  {!isSourceShare ? "Open" : "Edit"}
                </Link>
              </Button>
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
