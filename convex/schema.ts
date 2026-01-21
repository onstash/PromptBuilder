import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { promptDataValidator } from "./validators";

export default defineSchema({
  users: defineTable({
    sessionId: v.string(), // Primary identifier for anonymous users
    firstSeenAt: v.number(),
    lastSeenAt: v.number(),
    // Metadata for debugging/analytics (optional)
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
  }).index("by_sessionId", ["sessionId"]),

  prompts: defineTable({
    // Core Data
    promptData: promptDataValidator, // Storing the full PromptWizardData object
    sessionId: v.string(), // Creator's session ID

    // SEO & Routing
    slug: v.string(), // Unique URL slug (e.g., "senior-react-dev-custom-hook-x9d2")
    seoTitle: v.string(), // <title> tag content
    seoDescription: v.string(), // <meta name="description"> content

    // Deduplication & Integrity
    contentHash: v.string(), // SHA-256 hash of core prompt fields

    // Metrics
    views: v.number(),
    forks: v.number(), // How many times this was used as a template

    // Timestamps
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_session", ["sessionId"])
    .index("by_session_hash", ["sessionId", "contentHash"]), // For user-scoped deduplication
  feature_request_ai_analysis: defineTable({
    sessionId: v.string(),
    createdAt: v.number(),
  }),
  feature_request_suggest_role: defineTable({
    sessionId: v.string(),
    roleTitle: v.string(),
    description: v.string(),
    createdAt: v.number(),
  }),
  prompts_analysis: defineTable({
    sessionId: v.string(),
    promptData: promptDataValidator,
    overallScore: v.number(),
    clarity: v.number(),
    specificity: v.number(),
    robustness: v.number(),
    structure: v.number(),
    analysisOutput: v.any(),
    createdAt: v.number(),
    latency: v.number(),
    contentHash: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
    systemPromptVersion: v.optional(v.string()),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_score", ["overallScore"])
    .index("by_content_hash", ["contentHash"])
    // Index for rate limiting: query by sessionId and filter by createdAt
    // Compound index helps if we had many users, but for simple rate limiting by sessionId, "by_sessionId" is often enough.
    // However, including createdAt allows efficient range queries for "last 24 hours".
    .index("by_session_created", ["sessionId", "createdAt"]),
});
