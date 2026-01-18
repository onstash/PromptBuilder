import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Sparkles, Copy, Share2, Loader2, Check } from "lucide-react";
import { useMutation } from "convex/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { useTrackMixpanel } from "@/utils/analytics/MixpanelProvider";
import { useWizardStore } from "@/stores/wizard-store";
import { getOrCreateSessionId } from "@/utils/session";
import { PromptWizardData } from "@/utils/prompt-wizard/schema";

// @ts-ignore - Valid after npx convex dev
import { api } from "../../../convex/_generated/api";

interface NavigationActionsProps {
  page: string;
  wizardData?: PromptWizardData;
}

/**
 * Navigation actions: Back To Home + Create New Prompt + Share
 * Reusable across wizard and share pages
 */
export function NavigationActions({ page, wizardData }: NavigationActionsProps) {
  const trackEvent = useTrackMixpanel();
  const reset = useWizardStore((state) => state.reset);

  return (
    <div className="py-4 px-4 md:px-[5%] flex items-center justify-between gap-4 flex-wrap border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-10 w-full">
      {/* Branding - Links to Home */}
      <Link
        to="/"
        className="flex items-center gap-3 select-none hover:opacity-80 transition-opacity cursor-pointer"
        onClick={() => trackEvent("cta_clicked_back_to_home", { page })}
      >
        <div className="p-2 border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] bg-secondary rounded-md">
          <Sparkles className="w-5 h-5 text-foreground" />
        </div>
        <h1 className="text-xl font-black uppercase tracking-tight text-foreground hidden sm:block">
          Prompt
          <span className="text-primary ml-1">Builder</span>
        </h1>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {wizardData && <ShareButton wizardData={wizardData} page={page} />}

        <Button
          size="sm"
          asChild
          onClick={() => {
            trackEvent("cta_clicked_create_new_prompt", { page });
            reset();
          }}
          className="uppercase font-bold text-xs shadow-[2px_2px_0px_0px_hsl(var(--foreground))]"
        >
          <Link to="/wizard" search={{ d: null, vld: 0, partial: false }}>
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Link>
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARE BUTTON COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function ShareButton({ wizardData, page }: { wizardData: PromptWizardData; page: string }) {
  const savePrompt = useMutation(api.prompts.savePrompt);
  const trackEvent = useTrackMixpanel();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

  // Consider a prompt active if it has at least user interaction
  const hasContent = wizardData.updatedAt > 0;

  const handleCreateLink = async () => {
    if (!hasContent) {
      toast.error("Add some content to your prompt first!");
      return;
    }
    setIsLoading(true);
    try {
      const sessionId = getOrCreateSessionId();
      const { slug } = await savePrompt({ promptData: wizardData, sessionId });

      const url = `${window.location.origin}/prompts/${slug}`;
      setShareLink(url);

      trackEvent("cta_clicked_get_shareable_link", {
        page,
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

  if (!hasContent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="secondary"
          className="uppercase font-bold text-xs shadow-[2px_2px_0px_0px_hsl(var(--foreground))] border-2 border-foreground hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          onClick={handleCreateLink}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share Link
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
