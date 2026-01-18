import { createServerFn } from "@tanstack/react-start";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { z } from "zod";

const InputSchema = z.object({
  prompt: z.string(),
});

export const generateGemini = createServerFn({ method: "POST" })
  .inputValidator(InputSchema)
  .handler(async ({ data }) => {
    try {
      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        prompt: data.prompt,
      });

      return { text };
    } catch (error) {
      console.error("Gemini Generation Error:", error);
      throw error; // Let the client handle the error
    }
  });
