import { createServerFn } from "@tanstack/react-start";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { z } from "zod";
import {
  type PromptWizardData,
  WIZARD_STEPS_ADVANCED_OPTIONAL,
} from "@/utils/prompt-wizard/schema";
import { Logger } from "@/utils/logger";

/**
 * Maps markdown headings to schema keys.
 * Case-insensitive matching.
 */
const HEADING_TO_KEY: Record<string, keyof PromptWizardData> = {
  role: "ai_role",
  "ai role": "ai_role",
  task: "task_intent",
  intent: "task_intent",
  "task intent": "task_intent",
  context: "context",
  examples: "examples",
  "examples (few-shot)": "examples",
  constraints: "constraints",
  guardrails: "constraints",
  "things to avoid": "disallowed_content",
  avoid: "disallowed_content",
  "disallowed content": "disallowed_content",
  "output format": "output_format",
  format: "output_format",
  reasoning: "reasoning_depth",
  "reasoning depth": "reasoning_depth",
  verification: "self_check",
  "self check": "self_check",
};

const InputSchema = z.object({
  markdown: z.string(),
});

export const parsePromptMarkdownLogger = Logger.createLogger({
  namespace: "parse-prompt-markdown",
  level: "DEBUG",
  enableConsoleLog: true,
});

export const parsePromptMarkdown = createServerFn({ method: "POST" })
  .inputValidator(InputSchema)
  .handler(async ({ data }) => {
    const { markdown } = data;

    if (!markdown || !markdown.trim()) {
      throw new Error("Markdown content is empty");
    }

    const processor = unified().use(remarkParse).use(remarkStringify);
    const tree = processor.parse(markdown);

    const result: Partial<PromptWizardData> = {
      step: 1,
      updatedAt: Date.now(),
      finishedAt: Date.now(),
      id: crypto.randomUUID(),
    };

    let currentKey: keyof PromptWizardData | null = null;
    let currentContent: string[] = [];

    // Simple AST traversal to extract content by heading
    for (const node of tree.children) {
      if (node.type === "heading") {
        // Save previous section content
        if (currentKey) {
          result[currentKey] = currentContent.join("\n").trim() as any;
          currentContent = [];
        }

        // Determine new key from heading text
        const headingText = (node.children[0] as any)?.value?.toLowerCase() || "";
        // Try exact match or substring match from map
        const foundKey = Object.entries(HEADING_TO_KEY).find(([k]) => headingText.includes(k));

        if (foundKey) {
          parsePromptMarkdownLogger.debug("Found key: ", foundKey);
          currentKey = foundKey[1];
        } else {
          parsePromptMarkdownLogger.debug("No key found for heading: ", headingText);
          currentKey = null; // Section we don't care about
        }
      } else if (currentKey) {
        parsePromptMarkdownLogger.debug("Collecting content for key: ", currentKey);
        // Collect content for the current section
        // Stringify the node back to markdown to preserve formatting (lists, bold, etc.)
        const nodeMarkdown = processor.stringify({ type: "root", children: [node] }).trim();
        parsePromptMarkdownLogger.debug("Node markdown: ", nodeMarkdown);
        if (nodeMarkdown) {
          parsePromptMarkdownLogger.debug("Adding node markdown to content");
          currentContent.push(nodeMarkdown);
        }
      }
    }

    // Save the last section
    if (currentKey && currentContent.length > 0) {
      result[currentKey] = currentContent.join("\n").trim() as any;
    }

    // Determine Wizard Mode
    const advancedKeys = WIZARD_STEPS_ADVANCED_OPTIONAL.map((s) => s.key);
    const hasAdvancedFields = advancedKeys.some((key) => {
      const val = result[key as keyof PromptWizardData];
      return val && String(val).trim().length > 0;
    });

    const wizardType = hasAdvancedFields ? "advanced" : "basic";

    return {
      data: result as Mutable<PromptWizardData>, // Type assertion for partial data
      wizardType,
    };
  });

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
