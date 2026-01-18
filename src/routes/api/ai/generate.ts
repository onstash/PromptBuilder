import { createFileRoute } from "@tanstack/react-router";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { z } from "zod";

export const Route = createFileRoute("/api/ai/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { prompt } = z.object({ prompt: z.string() }).parse(body);

          const result = streamText({
            model: google("gemini-2.5-flash"),
            prompt,
          });

          return result.toTextStreamResponse();
        } catch (error) {
          console.error("AI Generation Error:", error);
          if (error instanceof z.ZodError) {
            return new Response(JSON.stringify({ error: "Invalid input" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }
          return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
