import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { promptDataValidator } from "./validators";
import { Logger } from "../src/utils/logger";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-"); // Replace multiple - with single -
}

const stableKeys = [
  "ai_role",
  "task_intent",
  "context",
  "examples",
  "constraints",
  "disallowed_content",
  "output_format",
];
async function generateContentHash(data: Record<string, unknown>): Promise<string> {
  const payload = stableKeys.map((k) => String(data[k] ?? "")).join("||");

  const msgBuffer = new TextEncoder().encode(payload);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const savePromptLogger = Logger.createLogger({
  namespace: "savePrompt",
  level: "DEBUG",
  enableConsoleLog: true,
});

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const savePrompt = mutation({
  args: {
    promptData: promptDataValidator,
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const { promptData, sessionId } = args;
    savePromptLogger.debug("savePrompt", promptData, sessionId);

    // 1. Generate Content Hash
    const contentHash = await generateContentHash(promptData);
    savePromptLogger.debug("contentHash", contentHash);

    // 2. Check for Duplicate (User-Scoped)
    const existing = await ctx.db
      .query("prompts")
      .withIndex("by_session_hash", (q) =>
        q.eq("sessionId", sessionId).eq("contentHash", contentHash)
      )
      .first();
    savePromptLogger.debug("existing", existing);

    if (existing) {
      return { slug: existing.slug, status: "existing" };
    }

    // 3. Generate Slug
    // Pattern: role-intent-hash(4)
    const roleSlug = slugify(promptData.ai_role || "custom-role").slice(0, 30);
    savePromptLogger.debug("promptData.ai_role", promptData.ai_role);
    savePromptLogger.debug("roleSlug", roleSlug);
    const intentSlug = slugify(promptData.task_intent || "task").slice(0, 20);
    savePromptLogger.debug("promptData.task_intent", promptData.task_intent);
    savePromptLogger.debug("intentSlug", intentSlug);
    const uniqueSuffix = contentHash.slice(0, 6);
    savePromptLogger.debug("uniqueSuffix", uniqueSuffix);
    const slug = `${roleSlug}-${intentSlug}-${uniqueSuffix}`;
    savePromptLogger.debug("slug", slug);

    // 4. Generate SEO Metadata (Basic heuristic)
    const seoTitle = `Act as ${promptData.ai_role} | Prompt Builder`;
    savePromptLogger.debug("promptData.ai_role", promptData.ai_role);
    savePromptLogger.debug("seoTitle", seoTitle);
    const checkDesc = promptData.task_intent || "AI Prompt";
    savePromptLogger.debug("promptData.task_intent", promptData.task_intent);
    savePromptLogger.debug("checkDesc", checkDesc);
    const seoDescription = checkDesc.length > 150 ? checkDesc.slice(0, 147) + "..." : checkDesc;
    savePromptLogger.debug("seoDescription", seoDescription);

    // 5. Insert
    await ctx.db.insert("prompts", {
      promptData,
      sessionId,
      slug,
      seoTitle,
      seoDescription,
      contentHash,
      views: 0,
      forks: 0,
      createdAt: Date.now(),
    });

    return { slug, status: "created" };
  },
});

export const savePromptAnalysis = mutation({
  args: {
    promptData: promptDataValidator,
    sessionId: v.string(),
    overallScore: v.number(),
    clarity: v.number(),
    specificity: v.number(),
    robustness: v.number(),
    structure: v.number(),
    analysisOutput: v.any(),
    latency: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("prompts_analysis", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────────────────────

export const getPromptBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const prompt = await ctx.db
      .query("prompts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    return prompt;
  },
});
