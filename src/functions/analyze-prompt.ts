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
import { generatePromptText } from "@/stores/wizard-store";

const analyzePromptLogger = Logger.createLogger({
  namespace: "analyze-prompt",
  level: "INFO",
  enableConsoleLog: true,
});

// ─────────────────────────────────────────────────────────────────────────────
// Input Schema (Prompt to Analyze)
// ─────────────────────────────────────────────────────────────────────────────
const InputSchema = z.object({
  promptData: promptWizardSchema,
  sessionId: z.string(),
  wizardMode: z.enum(["basic", "advanced"]),
});

const PromptEvaluationSchema = z
  .object({
    overall_assessment: z.object({
      summary: z
        .string()
        .min(10, "Summary must be meaningful")
        .max(500, "Summary should be concise"),
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
          point: z.string().min(3),
          why_it_works: z.string().min(10),
        })
      )
      .max(5),

    issues: z
      .array(
        z.object({
          severity: z.enum(["P0", "P1", "P2"]),
          problem: z.string().min(10),
          why_it_matters: z.string().min(10),
          actionable_fix: z.string().min(10),
        })
      )
      .max(5),

    final_recommendation: z.enum([
      "Ready for production",
      "Suitable after revisions",
      "Not recommended without major changes",
    ]),

    improved_version: z
      .string()
      .optional()
      .refine(() => {
        // if (typeof val === "string" && val) {
        //   try {
        //     const parsed = JSON.parse(val);
        //     analyzePromptLogger.info("Parsed improved version", { parsed });
        //     // promptWizardSchema.parse(parsed);
        //     return true;
        //   } catch (e) {
        //     analyzePromptLogger.error("Failed to parse improved version", { error: e });
        //     return false;
        //   }
        // }
        return true;
      }, "Improved version must be a valid JSON string"),
  })
  .superRefine((ctx, val) => {
    analyzePromptLogger.debug("Refining", { ctx, val });
  });

export type PromptEvaluation = z.infer<typeof PromptEvaluationSchema>;
// Export as AnalysisResult to match the import in AnalysisPanel
export type AnalysisResult = PromptEvaluation;

export type PromptEvaluationTransformed = PromptEvaluation & {
  // improvedPromptData: PromptWizardData;
  overallScore: number;
};

const SYSTEM_PROMPT_CONFIG = {
  "1.0.0": {
    systemPrompt: `
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
    "improved_version": string (an improved version of the prompt applying the fixes)
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
`,
    outputSchema: PromptEvaluationSchema,
    systemPromptVersion: "1.0.0",
    aiSDKConfig: {
      temperature: undefined,
      topP: undefined,
      maxOutputTokens: undefined,
    },
  },
  "1.1.0": {
    systemPrompt: `
      ## System Prompt — Prompt Evaluator

      You are an Expert Prompt Engineer and AI Optimization Specialist.

      Your task is to analyze a given structured prompt and return precise, actionable, high-impact feedback to improve its output quality, consistency, and robustness.

      You must evaluate ONLY what is explicitly present in the prompt.
      Do NOT infer intent, audience, domain, or requirements that are not stated.

      ---

      ## Analysis Dimensions

      Evaluate the prompt across the following dimensions:

      1. Clarity
        - Is the task intent unambiguous and easy to understand?

      2. Specificity
        - Is the role, context, and expected behavior sufficiently constrained?

      3. Robustness
        - Are guardrails, negative constraints, and edge-case handling sufficient to reduce hallucination or drift?

      4. Structure
        - Are instructions, formatting, examples, and output expectations internally consistent?

      ---

      ## Output Format (STRICT JSON ONLY)

      Return valid JSON only.
      Do NOT include markdown, commentary, or extra text.

      The JSON MUST match this schema exactly:

      {
        "overall_assessment": {
          "summary": "string",
          "grade": "Excellent | Good | Needs Improvement | Weak"
        },
        "dimension_scores": {
          "clarity": 1,
          "specificity": 1,
          "robustness": 1,
          "structure": 1
        },
        "strengths": [
          {
            "point": "string",
            "why_it_works": "string"
          }
        ],
        "issues": [
          {
            "severity": "P0 | P1 | P2",
            "problem": "string",
            "why_it_matters": "string",
            "actionable_fix": "string"
          }
        ],
        "final_recommendation": "Ready for production | Suitable after revisions | Not recommended without major changes"
      }
    `,
    outputSchema: PromptEvaluationSchema,
    systemPromptVersion: "1.1.0",
    aiSDKConfig: {
      temperature: 0.0,
      topP: 1.0,
      // maxOutputTokens: 2000,
    },
  },
  "1.2.0": {
    systemPrompt: `
      ## System Prompt — Prompt Evaluator

      You are an Expert Prompt Engineer and AI Optimization Specialist.

      Your task is to analyze a given structured prompt and return precise, actionable, high-impact feedback to improve its output quality, consistency, and robustness.

      You must evaluate ONLY what is explicitly present in the prompt.
      Do NOT infer intent, audience, domain, or requirements that are not stated.

      ---

      ## Analysis Dimensions

      Evaluate the prompt across the following dimensions:

      1. Clarity
        - Is the task intent unambiguous and easy to understand?

      2. Specificity
        - Is the role, context, and expected behavior sufficiently constrained?

      3. Robustness
        - Are guardrails, negative constraints, and edge-case handling sufficient to reduce hallucination or drift?

      4. Structure
        - Are instructions, formatting, examples, and output expectations internally consistent?

      ---

      ## Output Format (STRICT JSON ONLY)

      Return valid JSON only.
      Do NOT include markdown, commentary, or extra text.

      Return a single JSON object with this structure:
      - overall_assessment: object with
        - summary: short string
        - grade: one of ["Excellent", "Good", "Needs Improvement", "Weak"]

      - dimension_scores: object with numeric scores 1–5 for
        - clarity
        - specificity
        - robustness
        - structure

      - strengths: array (1–3 items), each with
        - point
        - why_it_works

      - issues: array (1–5 items), each with
        - severity: "P0" | "P1" | "P2"
        - problem
        - why_it_matters
        - actionable_fix

      - final_recommendation: one of
        ["Ready for production", "Suitable after revisions", "Not recommended without major changes"]

      Return JSON only. No extra text.
    `,
    outputSchema: PromptEvaluationSchema,
    systemPromptVersion: "1.2.0",
    aiSDKConfig: {
      temperature: 0.0,
      topP: 1.0,
      // maxOutputTokens: 2000,
    },
  },
};

const CURRENT_SYSTEM_PROMPT_VERSION: keyof typeof SYSTEM_PROMPT_CONFIG = "1.2.0";

// ─────────────────────────────────────────────────────────────────────────────
// Server Function
// ─────────────────────────────────────────────────────────────────────────────
export const analyzePrompt = createServerFn({ method: "POST" })
  .inputValidator(InputSchema)
  .handler(async ({ data }) => {
    analyzePromptLogger.debug("Analyzing prompt", data);
    const { promptData, sessionId, wizardMode } = data;

    // Feature Flag: Check if analysis is enabled
    // Default to false if not explicitly set to "true"
    const isEnabled = env.ENABLE_PROMPT_ANALYSIS === "true";

    if (!isEnabled) {
      analyzePromptLogger.debug("Prompt analysis disabled via config");
      throw new Error("PROMPT_ANALYSIS_DISABLED");
    }

    const convexClient = getConvexClient();
    const startTime = performance.now();

    try {
      // 1. Check Rate Limit
      const rateLimitCheck = await convexClient.query(api.prompts.checkRateLimit, {
        sessionId,
      });

      if (!rateLimitCheck.allowed) {
        analyzePromptLogger.warn("Rate limit exceeded", { sessionId });
        throw new Error("RATE_LIMIT_EXCEEDED"); // Custom error code to be caught by frontend
      }

      // 2. Check Cache
      const cachedAnalysis = await convexClient.query(api.prompts.getAnalysis, {
        promptData: data.promptData,
      });

      if (cachedAnalysis) {
        analyzePromptLogger.debug("Cache Hit", { contentHash: cachedAnalysis.contentHash });
        trackMixpanelInServer({
          data: {
            event: "prompt_analyzed_cache_hit",
            properties: {
              distinct_id: data.sessionId,
              prompt: data.promptData,
              content_hash: cachedAnalysis.contentHash,
            },
          },
        }).catch((err) => console.error("Failed to track mixpanel event", err));
        const { analysisOutput, overallScore } = cachedAnalysis;
        return {
          ...(analysisOutput as PromptEvaluation), // type casting is needed as the convex type is any :/
          overallScore,
        } as PromptEvaluationTransformed;
      }

      const promptText = generatePromptText(promptData, {
        source: "analyze-prompt",
        mode: wizardMode,
      });
      analyzePromptLogger.debug("Prompt Text", { promptText });

      const { systemPrompt, systemPromptVersion, aiSDKConfig } =
        SYSTEM_PROMPT_CONFIG[CURRENT_SYSTEM_PROMPT_VERSION];

      // 3. Run Analysis (Cache Miss)
      const { output, text, request, response } = await generateText({
        model: google("gemini-2.5-flash"),
        output: Output.object({ schema: PromptEvaluationSchema }),
        system: systemPrompt,
        prompt: promptText,
        ...aiSDKConfig,
      });
      analyzePromptLogger.debug("Analysis Output", { output, text, request, response });
      const overallScore = Math.round(
        ((output.dimension_scores.clarity +
          output.dimension_scores.specificity +
          output.dimension_scores.robustness +
          output.dimension_scores.structure) /
          20) *
          100
      );
      // const output = { ...dummyOutput };
      const outputTransformed: PromptEvaluationTransformed = {
        ...output,
        // improvedPromptData: JSON.parse(output.improved_version!) as PromptWizardData,
        overallScore,
      };
      const endTime = performance.now();
      const latency = endTime - startTime;
      analyzePromptLogger.debug("Analysis output", output);

      // 4. Save to DB (Update Cache)
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
        systemPrompt,
        systemPromptVersion,
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

      return outputTransformed;
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
