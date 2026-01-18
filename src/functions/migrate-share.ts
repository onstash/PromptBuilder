import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

import { api } from "../../convex/_generated/api";
import { decompressPrompt } from "@/utils/prompt-wizard/url-compression";
import { PromptWizardData } from "@/utils/prompt-wizard/schema";
import { getConvexClient } from "@/utils/convex-client";

const InputSchema = z.object({
  d: z.string(),
  vld: z.number(),
});

export const migrateShareLink = createServerFn({ method: "POST" })
  .inputValidator(InputSchema)
  .handler(async ({ data: { d } }) => {
    // 1. Get Session ID from Cookie
    const cookieHeader = getRequestHeader("Cookie");
    let sessionId = "unknown";

    if (cookieHeader) {
      const match = cookieHeader.match(/session_id=([^;]+)/);
      if (match && match[1]) {
        sessionId = match[1];
      }
    }

    // 2. Decompress Prompt Data
    const { data: promptData, valid } = decompressPrompt(d);

    if (!valid || !promptData) {
      throw new Error("Invalid prompt data");
    }

    // 3. Save to Convex
    const client = getConvexClient();

    try {
      // @ts-ignore - Convex types
      const result = await client.mutation(api.prompts.savePrompt, {
        promptData: promptData as PromptWizardData,
        sessionId,
      });

      return { slug: result.slug };
    } catch (error) {
      console.error("Failed to migrate prompt:", error);
      throw new Error("Failed to migrate prompt");
    }
  });
