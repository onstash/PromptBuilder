import { memo } from "react";
import { ArrowLeft, ArrowRight, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileNavigationProps {
  onNext: () => void;
  onBack: () => void;
  onFinish: () => void;
  onViewPrompt: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isPromptAvailable: boolean;
  className?: string;
}

export const MobileNavigation = memo(function MobileNavigation(props: MobileNavigationProps) {
  const {
    onNext,
    onBack,
    onFinish,
    onViewPrompt,
    isFirstStep,
    isLastStep,
    isPromptAvailable,
    className,
  } = props;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t-2 border-border z-50 flex items-center justify-between gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] pb-safe",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        disabled={isFirstStep}
        onClick={onBack}
        className="h-12 w-12 rounded-full border border-input shadow-sm"
        title="Previous Step"
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="outline"
        size="lg"
        onClick={onViewPrompt}
        className="flex-1 font-bold uppercase tracking-wide h-12 shadow-sm"
        title="View Prompt"
      >
        <Eye className="w-5 h-5 mr-2" />
        Preview
      </Button>

      {isLastStep ? (
        <Button
          size="icon"
          onClick={onFinish}
          disabled={!isPromptAvailable}
          className="h-12 w-12 rounded-full shadow-md bg-green-600 hover:bg-green-700 text-white"
          title="Save Prompt"
        >
          <Sparkles className="h-5 w-5" />
        </Button>
      ) : (
        <Button
          size="icon"
          onClick={onNext}
          className="h-12 w-12 rounded-full shadow-md"
          title="Next Step"
        >
          <ArrowRight className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
});
