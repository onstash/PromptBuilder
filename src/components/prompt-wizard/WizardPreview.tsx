import { useState, useCallback, useMemo, useEffect } from "react";

import { motion } from "motion/react";
import {
  Copy,
  Check,
  ExternalLink,
  FilePen,
  Bot,
  Share2,
  Loader2,
  Sparkles,
  Save,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
import {
  compressPrompt,
  decompressPrompt,
  partialPromptWizardSchema,
  promptWizardSchema,
} from "@/utils/prompt-wizard";
import { Link } from "@tanstack/react-router";
import { useTrackMixpanel } from "@/utils/analytics/MixpanelProvider";
import { generatePromptText, useWizardStore } from "@/stores/wizard-store";
import { withLatencyLoggingSync } from "@/utils/function-utils";
import { StoredPromptsSection } from "./StoredPromptsSection";
import { NavigationActions } from "./NavigationActions";
import { useServerFn } from "@tanstack/react-start";
import { analyzePrompt, type PromptEvaluationTransformed } from "@/functions/analyze-prompt";
import { AnalysisPanel } from "./AnalysisPanel";
import { env } from "@/utils/client/env";
import { Logger } from "@/utils/logger";

export type WizardPreviewPropsForSharePage = {
  shareUrl?: string; // made optional
  data?: string; // compressed string
  wizardData?: PromptWizardData; // uncompressed object
  compressed: boolean;
  source: "share";
  onClickCallback?: () => void;
  isReadOnly?: boolean; // added based on usage
  onSave?: () => void;
};

type WizardPreviewPropsForWizardPage = {
  shareUrl: string;
  data: PromptWizardData;
  compressed: false;
  source: "wizard";
  onClickCallback?: () => void;
  onSave?: () => void;
  savedSlug?: string | null;
  isSaving?: boolean;
};

type WizardPreviewPropsForLandingPageV2 = {
  shareUrl: string;
  data: PromptWizardData;
  d: string;
  compressed: true;
  source: "landing_v2";
  onClickCallback?: () => void;
  onSave?: () => void;
};

type WizardPreviewProps =
  | WizardPreviewPropsForWizardPage
  | WizardPreviewPropsForSharePage
  | WizardPreviewPropsForLandingPageV2;

function generatePromptStringFromCompressed(wizardData: PromptWizardData): string {
  return generatePromptText(wizardData, { source: "generatePromptStringFromCompressed" });
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
      () => decompressPrompt(compressedData),
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
        <div className="p-4 border-b-4 border-foreground flex flex-row gap-3 items-center justify-between">
          <h3 className="font-black uppercase text-lg hidden md:block">Your Prompt</h3>
          <div className="flex flex-col gap-2 md:flex-row md:items-center w-full md:w-auto">
            <div className="flex gap-2 w-full md:w-auto">
              {shareUrl && (
                <Button
                  onClick={handleEdit}
                  asChild
                  variant="outline"
                  size="sm"
                  className="uppercase font-bold flex-1 md:flex-none md:w-9 md:px-0"
                  title="Edit"
                >
                  <Link to="/wizard" search={{ d: promptTextCompressed, vld: 1, partial: false }}>
                    <EditOrOpenIcon className="w-4 h-4 mr-1 md:mr-0" />
                    <span className="md:hidden">Edit</span>
                  </Link>
                </Button>
              )}
              <Button
                onClick={handleCopyPrompt}
                size="sm"
                variant="outline"
                className="uppercase font-bold flex-1 md:flex-none"
                disabled={promptText.trim().length === 0}
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
                <div className="flex-1 md:flex-none flex">
                  <ShareAction
                    wizardData={wizardData}
                    pageSource="share"
                    existingSlug={shareUrl ? shareUrl.split("/").pop() : undefined}
                    buttonClassName="w-full md:w-9 md:px-0"
                    openLabel={<span className="md:hidden">Share</span>}
                    disabled={promptText.trim().length === 0}
                  />
                </div>
              )}
            </div>
            <Button
              onClick={handleTryWithChatGPT}
              size="sm"
              className="uppercase font-bold bg-green-600 hover:bg-green-700 text-white w-full md:w-auto"
              disabled={promptText.trim().length === 0}
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
                Click "Copy & Open" to copy the prompt and open ChatGPT.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(promptText);
                    toast.success("Prompt copied to clipboard!");
                    window.open("https://chatgpt.com", "_blank");
                  } catch {
                    toast.error("Failed to copy prompt");
                  }
                  setIsChatGPTAlertOpen(false);
                }}
              >
                Copy & Open ChatGPT
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

const wizardPreviewLogger = Logger.createLogger({
  namespace: "WizardPreview",
  level: "INFO",
  enableConsoleLog: true,
});

function WizardPreviewForWizardPage(props: WizardPreviewPropsForWizardPage) {
  const { data } = props;
  const trackEvent = useTrackMixpanel();
  const submitFeatureRequest = useMutation(api.feature_requests.submitAIAnalysisRequest);

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isChatGPTAlertOpen, setIsChatGPTAlertOpen] = useState(false);
  const [isFeatureRequestAlertOpen, setIsFeatureRequestAlertOpen] = useState(false);
  const [isRateLimitAlertOpen, setIsRateLimitAlertOpen] = useState(false);

  const [promptAnalysisState, setPromptAnalysisState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [promptAnalysisResult, setPromptAnalysisResult] =
    useState<PromptEvaluationTransformed | null>(null);
  const analyzePromptFn = useServerFn(analyzePrompt);

  // KEY FIX: Use useMemo instead of useState(() => ...)
  // This ensures promptText re-computes whenever `data` changes
  const [promptText, wizardData, promptTextCompressed, isPromptValid] = useMemo(() => {
    let wizardData = data as PromptWizardData;
    wizardPreviewLogger.debug("wizardData", wizardData);
    const promptText = generatePromptText(wizardData, { source: "WizardPreviewForWizardPage" });
    let isPromptValid = promptText.length > 0;
    wizardPreviewLogger.debug("promptText", promptText);
    if (!promptText.length) {
      wizardPreviewLogger.debug("isPromptValid", isPromptValid);
      return ["", wizardData, "", false];
    }
    if (!wizardData.output_format) {
      wizardPreviewLogger.debug("wizardData.output_format before", wizardData.output_format);
      wizardData = {
        ...wizardData,
        output_format: "bullet-list",
      };
      wizardPreviewLogger.debug("wizardData.output_format after", wizardData.output_format);
    }
    const result1 = promptWizardSchema.safeParse(wizardData);
    isPromptValid = result1.success;
    wizardPreviewLogger.debug("isPromptValid", isPromptValid);
    if (!isPromptValid) {
      const result2 = partialPromptWizardSchema.safeParse(wizardData);
      wizardPreviewLogger.debug("result2", result2);
      isPromptValid = result2.success;
    }
    wizardPreviewLogger.debug("isPromptValid", isPromptValid);
    wizardPreviewLogger.debug("result1", result1);
    if (!isPromptValid) {
      return ["", wizardData, "", false];
    }
    return [promptText, wizardData, compressPrompt(wizardData), isPromptValid];
  }, [data]);

  const hasUserInteracted = wizardData.updatedAt > -1;

  const handleCopyPrompt = useCallback(async () => {
    if (!hasUserInteracted) {
      toast.error("Please interact with the wizard before copying the prompt");
      return;
    }
    if (!isPromptValid) {
      toast.error("Please fill in all the required fields");
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
  }, [promptText, promptTextCompressed, wizardData, hasUserInteracted, isPromptValid]);

  const handleTryWithChatGPT = useCallback(() => {
    if (!hasUserInteracted) {
      toast.error("Please interact with the wizard before trying seamlessly");
      return;
    }
    if (!isPromptValid) {
      toast.error("Please fill in all the required fields");
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
  }, [hasUserInteracted, promptText, wizardData]);

  const handleAnalyzeRequest = useCallback(async () => {
    trackEvent("cta_clicked_analyze_with_ai", {
      data: wizardData,
    });

    if (!env.VITE_ENABLE_PROMPT_ANALYSIS) {
      setIsFeatureRequestAlertOpen(true); // Disable feature request dialog for now
      return;
    }

    try {
      setPromptAnalysisState("loading");
      const analyzePromptResult = await analyzePromptFn({
        data: {
          sessionId: getOrCreateSessionId(),
          promptData: wizardData,
          wizardMode: useWizardStore.getState().wizardMode,
        },
      });
      setPromptAnalysisState("success");
      setPromptAnalysisResult(analyzePromptResult);
      // Determine if we should scroll to analysis panel? For now standard flow.
    } catch (err) {
      setPromptAnalysisState("error");
      const error = err as Error;
      console.error(error);
      if (error.message.includes("RATE_LIMIT_EXCEEDED")) {
        setIsRateLimitAlertOpen(true);
      } else {
        toast.error("Failed to analyze prompt. Please try again.");
      }
    }
  }, [wizardData, analyzePromptFn]);

  const confirmFeatureRequest = async () => {
    try {
      const sessionId = getOrCreateSessionId();
      // @ts-ignore - API type might not be updated yet
      await submitFeatureRequest({ sessionId });
      toast.success("Thanks for your interest! We've recorded your vote.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to record request");
    } finally {
      setIsFeatureRequestAlertOpen(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // FEATURE LOCK LOGIC
  // ─────────────────────────────────────────────────────────────────────────────

  // State
  const [savedSlug, setSavedSlug] = useState<string | null>(props.shareUrl || null);
  const [isLockedAlertOpen, setIsLockedAlertOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const savePrompt = useMutation(api.prompts.savePrompt);

  const isLocked = !savedSlug;

  const handleSavePrompt = useCallback(async () => {
    if (!hasUserInteracted) {
      toast.error("Add some content to your prompt first!");
      return null;
    }
    if (!isPromptValid) {
      toast.error("Please fill in all the required fields");
      return null;
    }
    try {
      setIsSaving(true);
      const sessionId = getOrCreateSessionId();
      const result = await savePrompt({
        promptData: wizardData,
        sessionId,
      });

      if (result) {
        setSavedSlug(result.slug);
        trackEvent("prompt_saved_background", {
          data: wizardData,
          slug: result.slug,
        });
        return result;
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save prompt");
    } finally {
      setIsSaving(false);
    }
    return null;
  }, [wizardData, hasUserInteracted, savePrompt, isPromptValid]);

  const handleLockedAction = useCallback(
    (featureName: string, action: () => void) => {
      if (isLocked) {
        trackEvent("feature_locked_click", {
          feature: featureName,
        });
        setIsLockedAlertOpen(true);
      } else {
        action();
      }
    },
    [isLocked, trackEvent]
  );

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // If locked and has content, warn user
      if (isLocked && hasUserInteracted) {
        e.preventDefault();
        e.returnValue = ""; // Chrome requires returnValue to be set
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isLocked, hasUserInteracted]);

  const savePromptDisabled = isSaving || !hasUserInteracted || !isPromptValid;
  let savedPromptLabel = "Save Prompt";
  if (isSaving) {
    savedPromptLabel = "Saving...";
  } else if (savedSlug) {
    savedPromptLabel = "Saved";
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border-4 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))] md:shadow-[8px_8px_0px_0px_hsl(var(--foreground))] max-md:shadow-[4px_4px_0px_0px_hsl(var(--foreground))]"
      >
        {/* Header */}
        <div className="p-4 border-b-4 border-foreground flex flex-row gap-3 items-center justify-between">
          <h3 className="font-black uppercase text-lg hidden md:block">Your Prompt</h3>
          <div className="flex flex-row gap-2 overflow-x-auto pb-2 -mb-2 w-full md:w-auto md:pb-0 md:mb-0 no-scrollbar items-center">
            {/* Added: SAVE BUTTON */}
            <div className="shrink-0">
              <Button
                onClick={async () => {
                  const result = await handleSavePrompt();
                  if (result) {
                    setIsLockedAlertOpen(false);
                    props.onSave!();
                  }
                }}
                size="sm"
                className={cn(
                  "uppercase font-bold bg-indigo-600 hover:bg-indigo-700 text-white whitespace-nowrap cursor-pointer",
                  !isLocked && "bg-green-600 hover:bg-green-700" // Visual cue that it's saved
                )}
                disabled={savePromptDisabled}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : !isLocked ? (
                  <Check className="w-4 h-4 mr-1" />
                ) : (
                  <Save className="w-4 h-4 mr-1" />
                )}
                {savedPromptLabel}
              </Button>
            </div>

            <div className="flex gap-2 shrink-0">
              <Button
                onClick={() => handleLockedAction("copy", handleCopyPrompt)}
                size="sm"
                variant="outline"
                className="uppercase font-bold whitespace-nowrap cursor-pointer"
                disabled={promptText.trim().length === 0}
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
              <div className="shrink-0">
                {/* ShareAction needs to be wrapped or handle locked state */}
                <div
                  onClickCapture={(e) => {
                    if (isLocked) {
                      e.stopPropagation();
                      handleLockedAction("share", () => {}); // No-op action, just triggers alert
                    }
                  }}
                >
                  <ShareAction
                    wizardData={wizardData}
                    pageSource="wizard"
                    buttonClassName={cn(
                      "w-auto px-4 cursor-pointer",
                      isLocked && "opacity-50 pointer-events-none"
                    )} // Visual disabled state but captured by parent
                    openLabel="Share"
                    disabled={promptText.trim().length === 0}
                    existingSlug={savedSlug || undefined}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <Button
                onClick={handleAnalyzeRequest}
                size="sm"
                variant="outline"
                className="uppercase font-bold whitespace-nowrap cursor-pointer"
                title="Analyze with AI"
                disabled={
                  promptText.trim().length === 0 ||
                  !!promptAnalysisResult ||
                  promptAnalysisState === "loading"
                }
              >
                {promptAnalysisState === "loading" ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1 md:mr-0" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-1 md:mr-0 text-amber-500 fill-amber-500" />
                )}
                <span className="md:hidden">
                  {promptAnalysisState === "loading" ? "Analyzing..." : "Analyze"}
                </span>
                <span className="hidden md:inline">
                  {promptAnalysisState === "loading" ? "Analyzing..." : "Analyze with AI"}
                </span>
              </Button>
              <Button
                onClick={() => handleLockedAction("chatgpt", handleTryWithChatGPT)}
                size="sm"
                className="uppercase font-bold bg-green-600 hover:bg-green-700 text-white whitespace-nowrap cursor-pointer"
                disabled={promptText.trim().length === 0}
              >
                <Bot className="w-4 h-4 mr-1" />
                Open ChatGPT
              </Button>
            </div>
          </div>
        </div>

        {/* Prompt content */}
        <div className="p-4 max-h-[400px] overflow-y-auto">
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{promptText}</pre>
        </div>

        {/* Locked Feature Alert Dialog */}
        <LockedFeatureAlertDialog
          open={isLockedAlertOpen}
          onOpenChange={setIsLockedAlertOpen}
          onSave={async () => {
            const result = await handleSavePrompt();
            if (result) {
              setIsLockedAlertOpen(false);
            }
          }}
          isSaving={isSaving}
        />

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
                Click "Copy & Open" to copy the prompt and open ChatGPT.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(promptText);
                    toast.success("Prompt copied to clipboard!");
                    window.open("https://chatgpt.com", "_blank");
                  } catch {
                    toast.error("Failed to copy prompt");
                  }
                  setIsChatGPTAlertOpen(false);
                }}
              >
                Copy & Open ChatGPT
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Feature Request Alert Dialog - KEPT BUT UNUSED FOR NOW */}
        <AlertDialog open={isFeatureRequestAlertOpen} onOpenChange={setIsFeatureRequestAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deep AI Analysis (Coming Soon!)</AlertDialogTitle>
              <AlertDialogDescription>
                We're currently testing demand for a deep, 10-point heuristic analysis of your
                prompt using Gemini Pro.
                <br />
                <br />
                If enough users are interested, we'll enable this feature. Would you use it?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No thanks</AlertDialogCancel>
              <AlertDialogAction onClick={confirmFeatureRequest}>
                Yes, I want this!
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Rate Limit Alert Dialog */}
        <AlertDialog open={isRateLimitAlertOpen} onOpenChange={setIsRateLimitAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Daily limit reached 🛑</AlertDialogTitle>
              <AlertDialogDescription>
                You have used your 3 free daily AI analyses.
                <br />
                <br />
                Please come back tomorrow or manually review your prompt using our guide properly.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setIsRateLimitAlertOpen(false)}>
                Got it
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>

      {/* Helper to Analyze Prompt */}
      {promptAnalysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AnalysisPanel promptAnalysisResult={promptAnalysisResult} />
        </motion.div>
      )}
    </div>
  );
}

function LockedFeatureAlertDialog({
  open,
  onOpenChange,
  onSave,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  isSaving: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Save to Unlock Features</AlertDialogTitle>
          <AlertDialogDescription>
            Please save your prompt to copy, share, or use it with ChatGPT.
            <br />
            <br />
            This helps you keep track of your best prompts and ensures you don't lose your work.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // Prevent closing immediately
              onSave();
            }}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isSaving ? "Saving..." : "Save Prompt"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
    return [generatePromptText(wizardData, { source: "WizardPreviewForLandingPageV2" }), props.d];
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
      className={cn(
        "bg-card",
        "border-4 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))] md:shadow-[8px_8px_0px_0px_hsl(var(--foreground))] max-md:shadow-[4px_4px_0px_0px_hsl(var(--foreground))]"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "p-4 border-b-4 border-foreground flex flex-row items-center justify-between border-0 pb-0"
        )}
      >
        <h3 className="font-black uppercase text-lg hidden md:block">Your Prompt</h3>
        <div className="flex flex-col gap-2 md:flex-row md:items-center w-full md:w-auto">
          <div className="flex gap-2 md:w-auto">
            {shareUrl && (
              <Button
                onClick={handleEdit}
                variant="outline"
                size="sm"
                className="uppercase font-bold flex-1 md:flex-none md:w-9 md:px-0"
                title="Edit"
              >
                <EditOrOpenIcon className="w-4 h-4 mr-1 md:mr-0" />
                <span className="md:hidden">Edit</span>
              </Button>
            )}
            <Button
              onClick={handleCopyPrompt}
              size="sm"
              variant="outline"
              className="uppercase font-bold flex-1 md:flex-none"
              disabled={promptText.trim().length === 0}
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
            <div className="flex-1 md:flex-none flex">
              <ShareAction
                wizardData={wizardData}
                pageSource="landing_v2"
                buttonClassName="w-full md:w-9 md:px-0"
                openLabel={<span className="md:hidden">Share</span>}
                disabled={promptText.trim().length === 0}
              />
            </div>
          </div>
          <Button
            onClick={handleTryWithChatGPT}
            size="sm"
            className="uppercase font-bold bg-green-600 hover:bg-green-700 text-white w-full md:w-auto"
            disabled={promptText.trim().length === 0}
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
              Click "Copy & Open" to copy the prompt and open ChatGPT.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(promptText);
                  toast.success("Prompt copied to clipboard!");
                  window.open("https://chatgpt.com", "_blank");
                } catch {
                  toast.error("Failed to copy prompt");
                }
                setIsChatGPTAlertOpen(false);
              }}
            >
              Copy & Open ChatGPT
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
  buttonClassName,
  disabled,
}: {
  wizardData: PromptWizardData;
  openLabel?: string | React.ReactNode;
  pageSource: string;
  existingSlug?: string;
  buttonClassName?: string;
  disabled?: boolean;
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

  // New prop: savedSlug. If passed, we use it directly instead of creating a new one?
  // Current logic creates a new link if !shareLink.
  // If we have existingSlug, we use it.

  const handleOpenChange = (open: boolean) => {
    // If disabled (locked), this shouldn't be callable normally, but just in case
    if (disabled) {
      return;
    }
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
        <Button
          size="sm"
          variant="outline"
          className={cn("uppercase font-bold", buttonClassName)}
          disabled={disabled}
        >
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
