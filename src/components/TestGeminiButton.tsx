import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { generateGemini } from "@/functions/generate-gemini";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

export function TestGeminiButton() {
  const generateFn = useServerFn(generateGemini);
  const [isOpen, setIsOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<{
    title: string;
    description: string;
    type: "success" | "error";
  } | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await generateFn({
        data: { prompt: "Say 'Hello from Gemini!' if you can hear me." },
      });
      return res.text;
    },
    onSuccess: (data) => {
      setDialogContent({
        title: "Success! Gemini Response:",
        description: data,
        type: "success",
      });
      setIsOpen(true);
    },
    onError: (error) => {
      setDialogContent({
        title: "Error Generating Text",
        description: error.message || "An unknown error occurred",
        type: "error",
      });
      setIsOpen(true);
    },
  });

  return (
    <>
      <Button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        variant={mutation.isError ? "destructive" : "default"}
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          "Test Gemini Integration"
        )}
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle
              className={dialogContent?.type === "error" ? "text-red-500" : "text-green-600"}
            >
              {dialogContent?.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-wrap max-h-[300px] overflow-auto">
              {dialogContent?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsOpen(false)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
