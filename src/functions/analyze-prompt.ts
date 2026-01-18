import { createServerFn } from "@tanstack/react-start";
import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";
import { promptWizardSchema } from "@/utils/prompt-wizard/schema";
import { trackMixpanelInServer } from "@/utils/analytics/MixpanelProvider";

// ─────────────────────────────────────────────────────────────────────────────
// Output Schema (Analysis Result)
// ─────────────────────────────────────────────────────────────────────────────
const SuggestionSchema = z.object({
  field: z.enum(["ai_role", "task_intent", "context", "examples", "constraints", "general"]),
  issue: z.string().describe("Brief description of the issue"),
  recommendation: z.string().describe("Actionable advice to fix it"),
  example_fix: z.string().optional().describe("A concrete example of how to rewrite that part"),
});

const AnalysisResultSchema = z.object({
  score: z.number().min(0).max(100).describe("0-100 quality score"),
  strengths: z.array(z.string()).describe("List of 2-3 things the prompt does well"),
  weaknesses: z.array(z.string()).describe("List of 2-3 areas for improvement"),
  suggestions: z.array(SuggestionSchema),
  improved_version: z
    .string()
    .optional()
    .describe("A rewritten version of the core task or role if it was very poor"),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Input Schema (Prompt to Analyze)
// ─────────────────────────────────────────────────────────────────────────────
const InputSchema = z.object({
  promptData: promptWizardSchema,
  sessionId: z.string(),
});

// ─────────────────────────────────────────────────────────────────────────────
// System Prompt
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `
  You are an Expert Prompt Engineer and AI Optimization Specialist. Your goal is to analyze a given structured prompt and provide actionable feedback to improve its output quality, consistency, and adherence to best practices.

  ## Analysis Criteria

  Evaluate the prompt based on the following dimensions:
  1.  **Clarity**: Is the task intent unambiguous?
  2.  **Specificity**: Is the role and context detailed enough to guide the AI?
  3.  **Robustness**: Are constraints and guardrails sufficient to prevent hallucinations or unwanted output?
  4.  **Structure**: Are examples aligned with the task? Is the output format clear?

  ## Guidelines for Suggestions

  - **Role**: If generic (e.g., "Expert"), suggest adding a specific domain or tone.
  - **Task**: If vague (e.g., "Write something"), suggest adding a specific deliverable and audience.
  - **Examples**: If missing, suggest adding 1-2 examples if the task is complex.
  - **Constraints**: If missing, suggest adding length limits, style prohibitions, or negative constraints.
  - **Tone**: If neutral, suggest specifying an emotional or professional tone.

  ## Tone & Style of Feedback
  - Be encouraging but critical.
  - Focus on "High Impact" changes first.
  - Keep suggestions concise.
`;

// ─────────────────────────────────────────────────────────────────────────────
// Server Function
// ─────────────────────────────────────────────────────────────────────────────
export const analyzePrompt = createServerFn({ method: "POST" })
  .inputValidator(InputSchema)
  .handler(async ({ data }) => {
    const startTime = performance.now();
    try {
      const { output } = await generateText({
        model: google("gemini-2.5-flash"),
        output: Output.object({ schema: AnalysisResultSchema }),
        system: SYSTEM_PROMPT,
        prompt: JSON.stringify(data.promptData, null, 2),
      });

      // Fire-and-forget tracking (don't await to avoid slowing down response)
      trackMixpanelInServer({
        data: {
          event: "prompt_analyzed",
          properties: {
            distinct_id: data.sessionId,
            prompt: data.promptData,
            analysis_output: output,
            latency_ms: performance.now() - startTime,
          },
        },
      }).catch((err) => console.error("Failed to track mixpanel event", err));

      return output;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      console.error("Gemini Analysis Error:", error);
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
