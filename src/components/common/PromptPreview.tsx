import { AnimatePresence } from "motion/react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PromptPreview(props: {
  heading?: string;
  description?: string;
  value: string;
  updatedAt: number;
  onClipboardCopy: (error?: Error) => void;
}) {
  const {
    heading = "Prompt Preview",
    description = "Preview how your AI prompt looks like",
    value,
    updatedAt,
    onClipboardCopy,
  } = props;
  return (
    <Card className="border-2 shadow-lg">
      <CardHeader key="PromptPreview_header">
        <CardTitle className="text-2xl md:text-3xl font-bold">
          {heading}
        </CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent key="PromptPreview_content">
        <AnimatePresence key={updatedAt}>
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              size="lg"
              className="border-2 shadow-md font-semibold cursor-pointer"
              onClick={() => {
                navigator.clipboard
                  .writeText(value)
                  .then(() => {
                    console.log("Copied!");
                    onClipboardCopy();
                    alert("Copied prompt!");
                  })
                  .catch((err: unknown) => {
                    const error = err as Error;
                    onClipboardCopy(error);
                    console.error("Failed to copy: ", error);
                    alert(`Failed to copy: ${error.message}`);
                  });
              }}
            >
              Copy Prompt to clipboard
            </Button>
          </div>
          <Textarea
            id="generated_prompt"
            value={value}
            // onChange={(e) => {
            //   console.log("[promptGenerated][textarea] e", e.target.value);
            // }}
            className={`min-h-[100px] border-2 resize-y transition-colors border-[#38AC5F] bg-[#38AC5F]/5`}
            placeholder="Your generated prompt will appear here.."
          />
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
