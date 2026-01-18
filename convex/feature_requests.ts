import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const submitAIAnalysisRequest = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("feature_request_ai_analysis", {
      sessionId: args.sessionId,
      createdAt: Date.now(),
    });
  },
});
