import { createServerFn } from "@tanstack/react-start";
import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";
import { promptWizardSchema } from "@/utils/prompt-wizard/schema";
import { trackMixpanelInServer } from "@/utils/analytics/MixpanelProvider";
import { Logger } from "@/utils/logger";
import { env } from "@/utils/server/env";
import { getConvexClient } from "@/utils/convex-client";
import { api } from "../../convex/_generated/api";

// ─────────────────────────────────────────────────────────────────────────────
// Input Schema (Prompt to Analyze)
// ─────────────────────────────────────────────────────────────────────────────
const InputSchema = z.object({
  promptData: promptWizardSchema,
  sessionId: z.string(),
});

const PromptEvaluationSchema = z.object({
  overall_assessment: z.object({
    summary: z.string().min(10, "Summary must be meaningful").max(500, "Summary should be concise"),
    grade: z.enum(["Excellent", "Good", "Needs Improvement", "Weak"]),
  }),

  dimension_scores: z.object({
    clarity: z.number().int().min(1).max(5),
    specificity: z.number().int().min(1).max(5),
    robustness: z.number().int().min(1).max(5),
    structure: z.number().int().min(1).max(5),
  }),

  strengths: z
    .array(
      z.object({
        point: z.string().min(5),
        why_it_works: z.string().min(10),
      })
    )
    .max(5),

  issues: z.array(
    z.object({
      severity: z.enum(["P0", "P1", "P2"]),
      problem: z.string().min(10),
      why_it_matters: z.string().min(10),
      actionable_fix: z.string().min(10),
    })
  ),

  final_recommendation: z.enum([
    "Ready for production",
    "Suitable after revisions",
    "Not recommended without major changes",
  ]),

  improved_version: z.string().optional(),
});

export type PromptEvaluation = z.infer<typeof PromptEvaluationSchema>;
// Export as AnalysisResult to match the import in AnalysisPanel
export type AnalysisResult = PromptEvaluation;

// ─────────────────────────────────────────────────────────────────────────────
// System Prompt
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `
  You are an Expert Prompt Engineer and AI Optimization Specialist.

  Your task is to analyze a given structured prompt and provide precise, actionable, and high-impact feedback to improve its output quality, consistency, and robustness.

  You must evaluate ONLY what is explicitly present in the prompt.
  Do NOT infer intent, audience, domain, or requirements that are not stated.

  ────────────────────────────────────────────────────────
  ANALYSIS DIMENSIONS
  ────────────────────────────────────────────────────────
  Evaluate the prompt across the following dimensions:

  1. Clarity
  2. Specificity
  3. Robustness
  4. Structure

  ────────────────────────────────────────────────────────
  OUTPUT FORMAT (STRICT JSON ONLY)
  ────────────────────────────────────────────────────────
  You MUST return valid JSON.
  Do NOT include markdown, explanations, or extra text.

  The JSON MUST follow this exact schema:

  {
    "overall_assessment": {
      "summary": string,
      "grade": "Excellent" | "Good" | "Needs Improvement" | "Weak"
    },
    "dimension_scores": {
      "clarity": number (1-5),
      "specificity": number (1-5),
      "robustness": number (1-5),
      "structure": number (1-5)
    },
    "strengths": [
      {
        "point": string,
        "why_it_works": string
      }
    ],
    "issues": [
      {
        "severity": "P0" | "P1" | "P2",
        "problem": string,
        "why_it_matters": string,
        "actionable_fix": string
      }
    ],
    "final_recommendation":
      "Ready for production" |
      "Suitable after revisions" |
      "Not recommended without major changes",
    "improved_version": string (optional, an improved version of the prompt applying the fixes)
  }

  ────────────────────────────────────────────────────────
  STRICT RULES
  ────────────────────────────────────────────────────────
  - Do NOT provide generic advice without a concrete fix.
  - Do NOT rewrite the prompt unless explicitly asked (but do provide the improved_version field).
  - Do NOT infer missing intent or audience.
  - Do NOT add praise unless it explains a functional benefit.
  - Focus on high-impact issues first (P0 → P1 → P2).
  - Keep all strings concise and implementation-ready.
`;

const analyzePromptLogger = Logger.createLogger({
  namespace: "analyze-prompt",
  level: "DEBUG",
  enableConsoleLog: true,
});

const dummyOutput: PromptEvaluation = {
  overall_assessment: {
    summary:
      "The prompt has a good structured format but suffers from significant vagueness in its core request, lack of crucial context, and an undefined output format. This will lead to inconsistent and likely unhelpful outputs.",
    grade: "Needs Improvement",
  },
  dimension_scores: {
    clarity: 2,
    specificity: 2,
    robustness: 2,
    structure: 4,
  },
  strengths: [
    {
      point: "Clearly defined AI role",
      why_it_works:
        "The 'ai_role' field is well-specified as 'Frontend Engineer', which helps the model adopt the correct persona and perspective for its recommendations.",
    },
    {
      point: "Effective use of disallowed content",
      why_it_works:
        "The 'disallowed_content' clearly defines undesirable patterns ('Deprecated APIs or patterns', 'div-button soup'), providing concrete guardrails for the Frontend Engineer role.",
    },
    {
      point: "Structured prompt fields",
      why_it_works:
        "The prompt utilizes a consistent structured format, which is a good foundation for organizing information and guiding the AI's response, even if some fields are currently empty or vague.",
    },
  ],
  issues: [
    {
      severity: "P0",
      problem: "Task intent 'Best & easy to use CMS' is subjective and lacks criteria.",
      why_it_matters:
        "Without defining what 'best' or 'easy to use' means from a 'Frontend Engineer' perspective (e.g., developer experience, integration with Astro, content editor ease, cost), the recommendations will be generic and may not meet the user's specific unstated needs.",
      actionable_fix:
        "Add explicit criteria for 'best' and 'easy to use' such as: 'headless-first, good Astro integration/plugins, self-hosting/SaaS options, clear developer experience, intuitive content editor interface, scalability, pricing model.'",
    },
    {
      severity: "P0",
      problem: "Output format 'mixed' is too vague and will lead to inconsistent responses.",
      why_it_matters:
        "The model will not know whether to provide a list, a comparison table, a prose summary, or a combination, making the output unpredictable and difficult to parse or use programmatically.",
      actionable_fix:
        "Specify a precise output format, e.g., 'A comparison table with CMS Name, Key Features, Pros (for Astro/FE), Cons, Maintainability, Price Tier. Followed by a concise recommendation paragraph.'",
    },
    {
      severity: "P1",
      problem: "The 'context' field is empty, missing crucial information for recommendations.",
      why_it_matters:
        "CMS recommendations are highly dependent on factors like budget, content editor's technical proficiency, preferred hosting, and specific features needed. Without this, recommendations will be broad and potentially irrelevant.",
      actionable_fix:
        "Populate the 'context' field with specific questions or details: 'Considerations: Budget (e.g., free, moderate, enterprise), Content Editor Technical Skill (e.g., non-technical, semi-technical, developer), Hosting Preference (e.g., self-hosted, cloud-based, serverless), Required Features (e.g., i18n, image optimization, real-time collaboration).'",
    },
    {
      severity: "P1",
      problem: "The 'examples' field is empty, hindering output consistency and quality.",
      why_it_matters:
        "Examples provide concrete demonstrations of the desired output structure, tone, and level of detail, helping the model align its response with user expectations.",
      actionable_fix:
        "Provide a brief, clear example of the desired output, especially if a structured format like a table or specific bullet points is expected for the CMS recommendations.",
    },
    {
      severity: "P2",
      problem: "The 'maintainability' constraint is good but could be more specific.",
      why_it_matters:
        "'Maintainability' can be interpreted in several ways (e.g., ease of updates, documentation, community support, simple data models). Clarifying this helps the AI prioritize recommendations.",
      actionable_fix:
        "Elaborate on 'Optimize for maintainability' by adding criteria like: 'meaning easy updates, clear documentation, strong community support, and straightforward content model management for a Frontend Engineer.'",
    },
  ],
  final_recommendation: "Suitable after revisions",
  improved_version:
    "{'ai_role': 'Frontend Engineer','task_intent': 'Recommend the best and easiest-to-use CMS for an Astro blog, portfolio, or personal website. Prioritize headless-first solutions with good Astro integration/plugins, clear developer experience, intuitive content editor interface, and reasonable pricing.','output_format': 'A comparison table with the following columns: CMS Name, Key Features, Pros (for Astro/FE), Cons, Maintainability Score (1-5), Price Tier (Free, Low, Medium, High). Follow this with a concise recommendation paragraph summarizing the top 2-3 options based on the provided context.','context': 'Considerations: Budget (e.g., free, < $50/month, > $50/month), Content Editor Technical Skill (e.g., non-technical, comfortable with markdown, developer), Hosting Preference (e.g., self-hosted, cloud-based SaaS, serverless), Required Features (e.g., i18n, rich text editor, image optimization, API for custom components, real-time collaboration).','examples': 'Example Output Table Row: | Strapi | Headless, self-hostable/cloud | GraphQL API, local dev, customizable | Initial setup complexity | 4 | Free/Medium |','constraints': 'Optimize for maintainability, meaning easy updates, clear documentation, strong community support, and straightforward content model management for a Frontend Engineer.','disallowed_content': 'Deprecated APIs or patterns\\ndiv-button soup','reasoning_depth': 'moderate','self_check': true}",
};

// ─────────────────────────────────────────────────────────────────────────────
// Server Function
// ─────────────────────────────────────────────────────────────────────────────
export const analyzePrompt = createServerFn({ method: "POST" })
  .inputValidator(InputSchema)
  .handler(async ({ data }) => {
    analyzePromptLogger.debug("Analyzing prompt", data);

    // Feature Flag: Check if analysis is enabled
    // Default to false if not explicitly set to "true"
    const isEnabled = env.ENABLE_PROMPT_ANALYSIS === "true";

    if (!isEnabled) {
      analyzePromptLogger.debug("Prompt analysis disabled via config");
      // Return a valid fallback object matching PromptEvaluationSchema
      return {
        overall_assessment: {
          summary: "Analysis is currently disabled.",
          grade: "Good",
        },
        dimension_scores: {
          clarity: 0,
          specificity: 0,
          robustness: 0,
          structure: 0,
        },
        strengths: [],
        issues: [],
        final_recommendation: "Suitable after revisions",
        improved_version: undefined,
      } as AnalysisResult;
    }

    const convexClient = getConvexClient();
    const startTime = performance.now();
    try {
      // TODO: Add caching for prompt analysis
      // const { output } = await generateText({
      //   model: google("gemini-2.5-flash"),
      //   output: Output.object({ schema: PromptEvaluationSchema }),
      //   system: SYSTEM_PROMPT,
      //   prompt: JSON.stringify(data.promptData, null, 2),
      // });
      const output = { ...dummyOutput };
      const endTime = performance.now();
      const latency = endTime - startTime;
      analyzePromptLogger.debug("Analysis output", output);
      const overallScore = Math.round(
        ((output.dimension_scores.clarity +
          output.dimension_scores.specificity +
          output.dimension_scores.robustness +
          output.dimension_scores.structure) /
          20) *
          100
      );
      convexClient.mutation(api.prompts.savePromptAnalysis, {
        promptData: data.promptData,
        sessionId: data.sessionId,
        overallScore,
        clarity: output.dimension_scores.clarity,
        specificity: output.dimension_scores.specificity,
        robustness: output.dimension_scores.robustness,
        structure: output.dimension_scores.structure,
        analysisOutput: output,
        latency,
      });

      // Fire-and-forget tracking (don't await to avoid slowing down response)
      trackMixpanelInServer({
        data: {
          event: "prompt_analyzed",
          properties: {
            distinct_id: data.sessionId,
            prompt: data.promptData,
            analysis_output: output,
            latency_ms: latency,
          },
        },
      }).catch((err) => console.error("Failed to track mixpanel event", err));

      return output;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      analyzePromptLogger.error("Analysis Error:", error);
      trackMixpanelInServer({
        data: {
          event: "prompt_analyzed_error",
          properties: {
            distinct_id: data.sessionId,
            prompt: data.promptData,
            error_message: error.message,
            error_name: error.name,
            error_stack: error.stack,
            error_cause: error.cause,
            latency_ms: performance.now() - startTime,
          },
        },
      }).catch((err) => console.error("Failed to track mixpanel event", err));
      throw error;
    }
  });
