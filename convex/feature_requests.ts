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

export const submitRoleSuggestion = mutation({
  args: {
    sessionId: v.string(),
    roleTitle: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("feature_request_suggest_role", {
      sessionId: args.sessionId,
      roleTitle: args.roleTitle,
      description: args.description,
      createdAt: Date.now(),
    });
  },
});
