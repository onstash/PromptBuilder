import { useState, useCallback, useMemo } from "react";

import { motion } from "motion/react";
import { Copy, Check, X, Link2, ExternalLink, FilePen } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { PromptWizardData } from "@/utils/prompt-wizard/schema";
import { compressFullState, decompress } from "@/utils/prompt-wizard";
import { Link } from "@tanstack/react-router";
import { useTrackMixpanel } from "@/utils/analytics/MixpanelProvider";
import { generatePromptText } from "@/stores/wizard-store";
import { withLatencyLoggingSync } from "@/utils/function-utils";

type WizardPreviewProps =
  | {
      shareUrl: string;
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

function generatePromptStringFromCompressed(wizardData: PromptWizardData): string {
  return generatePromptText(wizardData);
}

export function WizardPreview(props: WizardPreviewProps) {
  const { data, compressed, shareUrl, source } = props;
  const trackEvent = useTrackMixpanel();
  const isSourceShare = source === "share";

  const [analyticsWrapper] = useState(() => {
    let loggedAtTimestamp: number | null = null;
    return {
      trackPageLoadEvent: (data: PromptWizardData) => {
        if (isSourceShare && loggedAtTimestamp === null) {
          loggedAtTimestamp = Date.now();
          trackEvent("page_viewed_share", {
            data: {
              source,
              compressed,
              data,
            },
          });
        }
      },
    };
  });

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // KEY FIX: Use useMemo instead of useState(() => ...)
  // This ensures promptText re-computes whenever `data` changes
  const [promptText, wizardData, promptTextCompressed] = useMemo(() => {
    if (compressed) {
      const compressedData = data as string;
      const decompressedData = withLatencyLoggingSync(
        () => decompress(compressedData),
        (latency) => {
          trackEvent("time_taken_decompress", {
            latency,
            compressedData,
            decompressedData,
          });
        }
      );
      const wizardData = withLatencyLoggingSync(
        () => JSON.parse(decompressedData) as PromptWizardData,
        (latency) => {
          trackEvent("time_taken_json_parse", {
            latency,
            compressedData,
            decompressedData,
            wizardData,
          });
        }
      );
      analyticsWrapper.trackPageLoadEvent(wizardData);
      return [generatePromptStringFromCompressed(wizardData), wizardData, compressedData];
    }
    const wizardData = data as PromptWizardData;
    analyticsWrapper.trackPageLoadEvent(wizardData);
    return [generatePromptText(wizardData), wizardData, compressFullState(wizardData)];
  }, [data, compressed]);

  const hasUserInteracted = wizardData.updatedAt > -1;

  const handleCopyPrompt = useCallback(async () => {
    if (!hasUserInteracted) {
      toast.error("Please interact with the wizard before copying the prompt");
      return;
    }
    try {
      await navigator.clipboard.writeText(promptText);
      trackEvent(
        isSourceShare
          ? "button_clicked_cta_share_copy_prompt"
          : "button_clicked_cta_wizard_copy_prompt",
        {
          data: wizardData,
          d: promptTextCompressed,
        }
      );
      setCopiedPrompt(true);
      toast.success("Prompt copied to clipboard!");
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, [promptText, promptTextCompressed, wizardData]);

  const handleCopyLink = useCallback(async () => {
    if (!hasUserInteracted) {
      toast.error("Please interact with the wizard before copying the link");
      return;
    }
    if (!shareUrl) return;
    try {
      const fullUrl = `${window.location.origin}${shareUrl}`;
      await navigator.clipboard.writeText(fullUrl);
      trackEvent("button_clicked_cta_share_copy_prompt_link", {
        data: wizardData,
        d: promptTextCompressed,
      });
      setCopiedLink(true);
      toast.success("Share link copied!");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  }, [shareUrl, promptTextCompressed, wizardData]);

  const handleEdit = useCallback(() => {
    trackEvent("button_clicked_cta_share_edit", {
      data: wizardData,
      d: promptTextCompressed,
    });
  }, [promptTextCompressed, wizardData]);

  const EditOrOpenIcon = !isSourceShare ? ExternalLink : FilePen;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border-4 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))]"
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
                onClick={handleEdit}
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
          <Button onClick={handleCopyPrompt} size="sm" className="uppercase font-bold">
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
          {isSourceShare && (
            <Button onClick={props.onClose} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Prompt content */}
      <div className="p-4 max-h-[400px] overflow-y-auto">
        <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{promptText}</pre>
      </div>

      {/* Share URL indicator */}
      {shareUrl && (
        <div className="p-4 border-t-2 border-muted bg-muted/30">
          <p className="text-xs font-mono text-muted-foreground">
            🔗 Share link ready! Use "Copy Link" to share this prompt with others.
          </p>
        </div>
      )}
    </motion.div>
  );
}
