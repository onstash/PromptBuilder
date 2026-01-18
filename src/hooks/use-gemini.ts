import { useCompletion } from "@ai-sdk/react";

export function useGemini() {
  const completion = useCompletion({
    api: "/api/ai/generate",
    onError: (error) => {
      console.error("Gemini Error:", error);
    },
  });

  return completion;
}
