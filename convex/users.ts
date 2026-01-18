import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const syncUser = mutation({
  args: {
    sessionId: v.string(),
    metadata: v.optional(
      v.object({
        userAgent: v.optional(v.string()),
        ip: v.optional(v.string()),
        platform: v.optional(v.string()),
        // Richer analytics
        referer: v.optional(v.string()),
        refererParts: v.optional(v.array(v.string())),
        acceptLanguage: v.optional(v.string()),
        origin: v.optional(v.string()),
        device: v.optional(v.string()),
        browser: v.optional(v.string()),
        os: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    const now = Date.now();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        lastSeenAt: now,
        // Update metadata if provided
        ...(args.metadata ? { metadata: args.metadata } : {}),
      });
      return existingUser._id;
    } else {
      const newUserId = await ctx.db.insert("users", {
        sessionId: args.sessionId,
        firstSeenAt: now,
        lastSeenAt: now,
        metadata: args.metadata,
      });
      return newUserId;
    }
  },
});
