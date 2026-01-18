import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { api } from "../../convex/_generated/api";
import { getMetadataFromRequest } from "@/utils/serverFn-util";
import { getConvexClient } from "@/utils/convex-client";

const SyncUserSchema = z.object({
  sessionId: z.string(),
});

export const syncUserServerFn = createServerFn({ method: "POST" })
  .inputValidator(SyncUserSchema)
  .handler(async ({ data }) => {
    const request = getRequest();

    const { userAgent, referer, refererParts, acceptLanguage, ip, origin, device, os, browser } =
      getMetadataFromRequest(request);

    // Call Mutation
    const client = getConvexClient();
    await client.mutation(api.users.syncUser, {
      sessionId: data.sessionId,
      metadata: {
        userAgent: userAgent || undefined,
        ip: ip || undefined,
        referer: referer || undefined,
        refererParts: refererParts.length > 0 ? refererParts : undefined,
        acceptLanguage: acceptLanguage || undefined,
        origin: origin || undefined,
        device,
        browser,
        os,
        platform: os, // Keep for backward compat
      },
    });

    return { success: true };
  });
