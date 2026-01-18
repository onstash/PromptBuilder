import { useState, useCallback, useMemo } from "react";

import { motion } from "motion/react";
import { Copy, Check, ExternalLink, FilePen, Bot, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getOrCreateSessionId } from "@/utils/session";
import type { PromptWizardData } from "@/utils/prompt-wizard/schema";
import { compressPrompt, decompressPrompt } from "@/utils/prompt-wizard";
import { Link } from "@tanstack/react-router";
import { useTrackMixpanel } from "@/utils/analytics/MixpanelProvider";
import { generatePromptText } from "@/stores/wizard-store";
import { withLatencyLoggingSync } from "@/utils/function-utils";
import { StoredPromptsSection } from "./StoredPromptsSection";
import { NavigationActions } from "./NavigationActions";

export type WizardPreviewPropsForSharePage = {
  shareUrl?: string; // made optional
  data?: string; // compressed string
  wizardData?: PromptWizardData; // uncompressed object
  compressed: boolean;
  source: "share";
  onClickCallback?: () => void;
  isReadOnly?: boolean; // added based on usage
};

type WizardPreviewPropsForWizardPage = {
  shareUrl: string;
  data: PromptWizardData;
  compressed: false;
  source: "wizard";
  onClickCallback?: () => void;
};

type WizardPreviewPropsForLandingPageV2 = {
  shareUrl: string;
  data: PromptWizardData;
  d: string;
  compressed: true;
  source: "landing_v2";
  onClickCallback?: () => void;
};

type WizardPreviewProps =
  | WizardPreviewPropsForWizardPage
  | WizardPreviewPropsForSharePage
  | WizardPreviewPropsForLandingPageV2;

function generatePromptStringFromCompressed(wizardData: PromptWizardData): string {
  return generatePromptText(wizardData);
}

export function WizardPreviewForSharePage(props: WizardPreviewPropsForSharePage) {
  const { data, compressed, shareUrl, wizardData: propWizardData } = props;
  const trackEvent = useTrackMixpanel();

  const [analyticsWrapper] = useState(() => {
    let loggedAtTimestamp: number | null = null;
    return {
      trackPageLoadEvent: (data: PromptWizardData) => {
        if (loggedAtTimestamp === null) {
          loggedAtTimestamp = Date.now();
          trackEvent("page_viewed_share", {
            data: {
              compressed,
              data,
            },
          });
        }
      },
    };
  });

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isChatGPTAlertOpen, setIsChatGPTAlertOpen] = useState(false);

  // KEY FIX: Use useMemo instead of useState(() => ...)
  // This ensures promptText re-computes whenever `data` changes
  const [[promptText, wizardData, promptTextCompressed]] = useState<
    [string, PromptWizardData | null, string]
  >(() => {
    if (!compressed && propWizardData) {
      // Uncompressed path (from DB query)
      analyticsWrapper.trackPageLoadEvent(propWizardData);
      return [
        generatePromptStringFromCompressed(propWizardData),
        propWizardData,
        compressPrompt(propWizardData),
      ];
    }

    // Compressed path (from URL param)
    const compressedData = data as string;
    const { data: decompressedData, valid } = withLatencyLoggingSync(
      () =>
        decompressPrompt(compressedData, {
          _source_: "WizardPreviewForSharePage",
        }),
      (latency) => {
        trackEvent("time_taken_decompress", {
          latency,
          compressedData,
        });
      }
    );
    if (!valid) {
      return ["", null, ""];
    }
    analyticsWrapper.trackPageLoadEvent(decompressedData);
    return [generatePromptStringFromCompressed(decompressedData), decompressedData, compressedData];
  });

  const handleCopyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      trackEvent("cta_clicked_copy_prompt", {
        data: wizardData,
        d: promptTextCompressed,
      });
      setCopiedPrompt(true);
      toast.success("Prompt copied to clipboard!");
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, [promptText, promptTextCompressed, wizardData]);

  const handleTryWithChatGPT = useCallback(() => {
    const encodedPrompt = encodeURIComponent(promptText);
    // 2000 is a safe limit for most browsers/servers
    if (encodedPrompt.length < 2000) {
      window.open(`https://chatgpt.com/?q=${encodedPrompt}`, "_blank");
      trackEvent("cta_clicked_try_chatgpt", {
        data: wizardData,
        result: "opened",
      });
    } else {
      setIsChatGPTAlertOpen(true);
      trackEvent("cta_clicked_try_chatgpt", {
        data: wizardData,
        result: "dialog_shown",
      });
    }
  }, [promptText, wizardData, trackEvent]);

  const handleEdit = useCallback(() => {
    trackEvent("cta_clicked_edit", {
      data: wizardData,
      d: promptTextCompressed,
    });
  }, []);

  const EditOrOpenIcon = FilePen;

  return (
    <>
      {/* Navigation Actions - At Top */}
      <NavigationActions page="share" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border-4 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))] md:shadow-[8px_8px_0px_0px_hsl(var(--foreground))] max-md:shadow-[4px_4px_0px_0px_hsl(var(--foreground))]"
      >
        {/* Header */}
        <div className="p-4 border-b-4 border-foreground flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="font-black uppercase text-lg">Your Prompt</h3>
          <div className="flex gap-2">
            {shareUrl && (
              <Button
                onClick={handleEdit}
                asChild
                variant="outline"
                size="sm"
                className="uppercase font-bold"
              >
                <Link to="/wizard" search={{ d: promptTextCompressed, vld: 1, partial: false }}>
                  <EditOrOpenIcon className="w-4 h-4 mr-1" />
                  Edit
                </Link>
              </Button>
            )}
            <Button
              onClick={handleCopyPrompt}
              size="sm"
              variant="outline"
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
                  Copy
                </>
              )}
            </Button>
            {wizardData && (
              <ShareAction
                wizardData={wizardData}
                pageSource="share"
                // @ts-ignore - In share page we likely have the slug in URL but props doesn't pass it explicitly.
                // Actually, WizardPreviewPropsForSharePage doesn't have slug. We can parse it or just create new.
                // Ideally we'd pass the slug if we have it.
                // Implementation detail: for now let's just create new or let user share new one.
                // Wait, if it's already a share page, the URL IS the share link.
                existingSlug={shareUrl ? shareUrl.split("/").pop() : undefined}
                // Wait, shareUrl might be full URL? Let's check props.
              />
            )}
            <Button
              onClick={handleTryWithChatGPT}
              size="sm"
              className="uppercase font-bold bg-green-600 hover:bg-green-700 text-white"
            >
              <Bot className="w-4 h-4 mr-1" />
              Open ChatGPT
            </Button>
          </div>
        </div>

        {/* Prompt content */}
        <div className="p-4 max-h-[400px] overflow-y-auto">
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{promptText}</pre>
        </div>
        {/* ChatGPT Alert Dialog */}
        <AlertDialog open={isChatGPTAlertOpen} onOpenChange={setIsChatGPTAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Prompt is too long for direct link</AlertDialogTitle>
              <AlertDialogDescription>
                Your prompt is excellent, but it's a bit too long to pass directly to ChatGPT via
                the URL.
                <br />
                <br />
                Please <strong>Copy</strong> the prompt first, then open ChatGPT to paste it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  window.open("https://chatgpt.com", "_blank");
                  setIsChatGPTAlertOpen(false);
                }}
              >
                Open ChatGPT
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>

      {/* Stored Prompts (only shows if user has saved prompts) */}
      <StoredPromptsSection page="share" columns={2} currentPrompt={wizardData ?? undefined} />
    </>
  );
}

import { AnalysisPanel } from "./AnalysisPanel";

// ... existing code ...

function WizardPreviewForWizardPage(props: WizardPreviewPropsForWizardPage) {
  const { data, shareUrl } = props;
  const trackEvent = useTrackMixpanel();

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isChatGPTAlertOpen, setIsChatGPTAlertOpen] = useState(false);

  // KEY FIX: Use useMemo instead of useState(() => ...)
  // This ensures promptText re-computes whenever `data` changes
  const [promptText, wizardData, promptTextCompressed] = useMemo(() => {
    const wizardData = data as PromptWizardData;
    return [generatePromptText(wizardData), wizardData, compressPrompt(wizardData)];
  }, [data]);

  const hasUserInteracted = wizardData.updatedAt > -1;

  const handleCopyPrompt = useCallback(async () => {
    if (!hasUserInteracted) {
      toast.error("Please interact with the wizard before copying the prompt");
      return;
    }
    try {
      await navigator.clipboard.writeText(promptText);
      trackEvent("cta_clicked_copy_prompt", {
        data: wizardData,
        d: promptTextCompressed,
      });
      setCopiedPrompt(true);
      toast.success("Prompt copied to clipboard!");
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, [promptText, promptTextCompressed, wizardData]);

  const handleTryWithChatGPT = useCallback(() => {
    if (!hasUserInteracted) {
      toast.error("Please interact with the wizard before trying seamlessly");
      return;
    }

    const encodedPrompt = encodeURIComponent(promptText);
    // 2000 is a safe limit for most browsers/servers
    if (encodedPrompt.length < 2000) {
      window.open(`https://chatgpt.com/?q=${encodedPrompt}`, "_blank");
      trackEvent("cta_clicked_try_chatgpt", {
        data: wizardData,
        result: "opened",
      });
    } else {
      setIsChatGPTAlertOpen(true);
      trackEvent("cta_clicked_try_chatgpt", {
        data: wizardData,
        result: "dialog_shown",
      });
    }
  }, [hasUserInteracted, promptText, wizardData, trackEvent]);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border-4 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))] md:shadow-[8px_8px_0px_0px_hsl(var(--foreground))] max-md:shadow-[4px_4px_0px_0px_hsl(var(--foreground))]"
      >
        {/* Header */}
        <div className="p-4 border-b-4 border-foreground flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="font-black uppercase text-lg">Your Prompt</h3>
          <div className="flex gap-2">
            <Button
              onClick={handleCopyPrompt}
              size="sm"
              variant="outline"
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
                  Copy
                </>
              )}
            </Button>
            <ShareAction wizardData={wizardData} pageSource="wizard" />
            <Button
              onClick={handleTryWithChatGPT}
              size="sm"
              className="uppercase font-bold bg-green-600 hover:bg-green-700 text-white"
            >
              <Bot className="w-4 h-4 mr-1" />
              Open ChatGPT
            </Button>
          </div>
        </div>

        {/* Prompt content */}
        <div className="p-4 max-h-[400px] overflow-y-auto">
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{promptText}</pre>
        </div>
        {/* ChatGPT Alert Dialog */}
        <AlertDialog open={isChatGPTAlertOpen} onOpenChange={setIsChatGPTAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Prompt is too long for direct link</AlertDialogTitle>
              <AlertDialogDescription>
                Your prompt is excellent, but it's a bit too long to pass directly to ChatGPT via
                the URL.
                <br />
                <br />
                Please <strong>Copy</strong> the prompt first, then open ChatGPT to paste it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  window.open("https://chatgpt.com", "_blank");
                  setIsChatGPTAlertOpen(false);
                }}
              >
                Open ChatGPT
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>

      {/* Helper to Analyze Prompt */}
      {hasUserInteracted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AnalysisPanel wizardData={wizardData} />
        </motion.div>
      )}
    </div>
  );
}

function WizardPreviewForLandingPageV2(props: WizardPreviewPropsForLandingPageV2) {
  const { data: wizardData, shareUrl, onClickCallback } = props;
  const trackEvent = useTrackMixpanel();

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isChatGPTAlertOpen, setIsChatGPTAlertOpen] = useState(false);

  // KEY FIX: Use useMemo instead of useState(() => ...)
  // This ensures promptText re-computes whenever `data` changes
  const [[promptText, promptTextCompressed]] = useState(() => {
    return [generatePromptText(wizardData), props.d];
  });

  const hasUserInteracted = wizardData.updatedAt > -1;

  const handleCopyPrompt = useCallback(async () => {
    if (!hasUserInteracted) {
      toast.error("Please interact with the wizard before copying the prompt");
      return;
    }
    try {
      await navigator.clipboard.writeText(promptText);
      trackEvent("cta_clicked_copy_prompt_v2", {
        data: wizardData,
        d: promptTextCompressed,
      });
      setCopiedPrompt(true);
      toast.success("Prompt copied to clipboard!");
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, []);

  const handleTryWithChatGPT = useCallback(() => {
    if (!hasUserInteracted) {
      toast.error("Please interact with the wizard before trying seamlessly");
      return;
    }

    const encodedPrompt = encodeURIComponent(promptText);
    // 2000 is a safe limit
    if (encodedPrompt.length < 2000) {
      window.open(`https://chatgpt.com/?q=${encodedPrompt}`, "_blank");
      trackEvent("cta_clicked_try_chatgpt_v2", {
        data: wizardData,
        result: "opened",
      });
    } else {
      setIsChatGPTAlertOpen(true);
      trackEvent("cta_clicked_try_chatgpt_v2", {
        data: wizardData,
        result: "dialog_shown",
      });
    }
  }, [hasUserInteracted, promptText, wizardData, trackEvent]);

  const handleEdit = useCallback(() => {
    onClickCallback?.();
    trackEvent("cta_clicked_edit_v2", {
      data: wizardData,
      d: promptTextCompressed,
    });
  }, []);

  const EditOrOpenIcon = ExternalLink;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border-4 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))] md:shadow-[8px_8px_0px_0px_hsl(var(--foreground))] max-md:shadow-[4px_4px_0px_0px_hsl(var(--foreground))]"
    >
      {/* Header */}
      <div className="p-4 border-b-4 border-foreground flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h3 className="font-black uppercase text-lg">Your Prompt</h3>
        <div className="flex gap-2">
          {shareUrl && (
            <Button
              onClick={handleEdit}
              variant="outline"
              size="sm"
              className="uppercase font-bold"
            >
              <EditOrOpenIcon className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
          <Button
            onClick={handleCopyPrompt}
            size="sm"
            variant="outline"
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
                Copy
              </>
            )}
          </Button>
          <ShareAction wizardData={wizardData} pageSource="landing_v2" />
          <Button
            onClick={handleTryWithChatGPT}
            size="sm"
            className="uppercase font-bold bg-green-600 hover:bg-green-700 text-white"
          >
            <Bot className="w-4 h-4 mr-1" />
            Open ChatGPT
          </Button>
        </div>
      </div>

      {/* Prompt content */}
      <div className="p-4 max-h-[400px] overflow-y-auto">
        <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{promptText}</pre>
      </div>
      {/* ChatGPT Alert Dialog */}
      <AlertDialog open={isChatGPTAlertOpen} onOpenChange={setIsChatGPTAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Prompt is too long for direct link</AlertDialogTitle>
            <AlertDialogDescription>
              Your prompt is excellent, but it's a bit too long to pass directly to ChatGPT via the
              URL.
              <br />
              <br />
              Please <strong>Copy</strong> the prompt first, then open ChatGPT to paste it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                window.open("https://chatgpt.com", "_blank");
                setIsChatGPTAlertOpen(false);
              }}
            >
              Open ChatGPT
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

function ShareAction({
  wizardData,
  openLabel = "Share",
  pageSource,
  existingSlug,
}: {
  wizardData: PromptWizardData;
  openLabel?: string;
  pageSource: string;
  existingSlug?: string;
}) {
  const savePrompt = useMutation(api.prompts.savePrompt);
  const trackEvent = useTrackMixpanel();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareLink, setShareLink] = useState(
    existingSlug ? `${window.location.origin}/prompts/${existingSlug}` : ""
  );
  const [copied, setCopied] = useState(false);

  // Consider a prompt active if it has at least user interaction
  const hasContent = wizardData.updatedAt > 0;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !shareLink) {
      handleCreateLink();
    }
  };

  const handleCreateLink = async () => {
    if (!hasContent && !existingSlug) {
      toast.error("Add some content to your prompt first!");
      return;
    }

    // If we already have a link (e.g. passed in prop), just use it?
    // Actually, if existingSlug is passed, we set it in state init.
    // If not, we create one.
    if (shareLink) return;

    setIsLoading(true);
    try {
      const sessionId = getOrCreateSessionId();
      const { slug } = await savePrompt({ promptData: wizardData, sessionId });

      const url = `${window.location.origin}/prompts/${slug}`;
      setShareLink(url);

      trackEvent("cta_clicked_get_shareable_link", {
        page: pageSource,
        slug,
        role: wizardData.ai_role,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create share link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="uppercase font-bold">
          <Share2 className="w-4 h-4 mr-1" />
          {openLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Get Shareable Link</DialogTitle>
          <DialogDescription>
            Create a permanent, SEO-optimized URL for this prompt to share on social media.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">Creating your unique link...</p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                value={shareLink || "Click Share to generate link"}
                readOnly
                className="font-mono text-xs"
              />
              {shareLink && (
                <Button size="icon" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function WizardPreview(props: WizardPreviewProps) {
  switch (props.source) {
    case "share": {
      return <WizardPreviewForSharePage {...props} />;
    }
    case "wizard": {
      return <WizardPreviewForWizardPage {...props} />;
    }
    case "landing_v2": {
      return <WizardPreviewForLandingPageV2 {...props} />;
    }
    default: {
      return null;
    }
  }
}
