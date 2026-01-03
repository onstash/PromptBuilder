import type { PromptWizardData } from "@/utils/prompt-wizard/schema";
import { compress } from "@/utils/prompt-wizard/url-compression";
import { Mail, GraduationCap, PenLine, Briefcase, MessageSquare, Code } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE PROMPTS
// Curated for Indian audience - common everyday use cases
// ═══════════════════════════════════════════════════════════════════════════

export interface ExamplePrompt {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  data: Partial<PromptWizardData>;
  d: string;
}

export const EXAMPLE_PROMPTS = [
  {
    id: "work-email",
    title: "Work Email",
    description: "Write professional emails to your manager or team",
    icon: Mail,
    color: "bg-primary",
    data: {
      ai_role: "Professional Communication Coach",
      task_intent:
        "Write a professional email to my manager requesting work-from-home for next week",
      context:
        "I have a family function and need to travel. My work can be done remotely. I've not taken many leaves this quarter.",
      examples: "",
      constraints: "Keep it polite and professional. Under 100 words. Include dates clearly.",
      disallowed_content: "Avoid slang, emojis, or overly casual language.",
      output_format: "1-paragraph",
      tone_style: "professional",
      reasoning_depth: "brief",
      self_check: true,
      step: 6,
    },
  },
  {
    id: "exam-explainer",
    title: "Exam Prep",
    description: "Simplify complex topics for UPSC, CAT, or any exam",
    icon: GraduationCap,
    color: "bg-secondary",
    data: {
      ai_role: "UPSC Exam Tutor",
      task_intent: "Explain the concept of Fiscal Deficit in simple terms for UPSC preparation",
      context:
        "Preparing for UPSC Prelims. Need easy-to-remember explanation with real examples from Indian budget.",
      examples: "",
      constraints: "Simple language. Include one real example. Add 3 key points to remember.",
      disallowed_content: "Do not use complex jargon without definition.",
      output_format: "bullet-list",
      tone_style: "friendly",
      reasoning_depth: "moderate",
      self_check: true,
      step: 6,
    },
  },
  {
    id: "linkedin-post",
    title: "LinkedIn Post",
    description: "Create engaging posts that get likes and comments",
    icon: PenLine,
    color: "bg-accent",
    data: {
      ai_role: "LinkedIn Growth Expert",
      task_intent:
        "Write a LinkedIn post about what I learned from switching jobs twice in 2 years",
      context:
        "I'm a software developer. Moved from service company to product startup to big tech. Each move taught me something.",
      examples: "",
      constraints:
        "Personal tone but not preachy. Under 1200 characters. Start with a hook. End with a question.",
      disallowed_content: "Do not be humble; do not use hashtags in the middle of sentences.",
      output_format: "mixed",
      tone_style: "casual",
      reasoning_depth: "brief",
      self_check: true,
      step: 6,
    },
  },
  {
    id: "job-application",
    title: "Job Application",
    description: "Write cover letters and cold emails for jobs",
    icon: Briefcase,
    color: "bg-primary",
    data: {
      ai_role: "Senior Recruiter & Career Coach",
      task_intent: "Write a cover letter for a Product Manager role at a tech company",
      context:
        "3 years experience as Business Analyst. MBA from tier-2 college. Strong in data analysis and stakeholder management.",
      examples: "",
      constraints:
        "Highlight transferable skills. Keep under 250 words. Sound confident but not arrogant.",
      disallowed_content: "Do not use generic phrases like 'hard worker'.",
      output_format: "3-plus-paragraphs",
      tone_style: "professional",
      reasoning_depth: "moderate",
      self_check: true,
      step: 6,
    },
  },
  {
    id: "social-caption",
    title: "Social Caption",
    description: "Write catchy captions for Instagram or Twitter",
    icon: MessageSquare,
    color: "bg-secondary",
    data: {
      ai_role: "Social Media Manager",
      task_intent: "Write 3 Instagram caption options for my cafe's new cold coffee",
      context:
        "Small cafe in Bangalore. Known for aesthetic vibes. Target audience: college students and young professionals.",
      examples: "",
      constraints: "Keep each under 150 characters. Include relevant emojis. Make it shareable.",
      disallowed_content: "Do not use hashtags irrelevant to coffee.",
      output_format: "numbered-list",
      tone_style: "casual",
      reasoning_depth: "brief",
      self_check: true,
      step: 6,
    },
  },
  {
    id: "learn-coding",
    title: "Learn Coding",
    description: "Understand code concepts with simple explanations",
    icon: Code,
    color: "bg-accent",
    data: {
      ai_role: "Senior JavaScript Developer",
      task_intent: "Explain async/await in JavaScript like I'm a beginner",
      context:
        "Learning JavaScript for web development. Understand basic functions but confused about promises and async code.",
      examples: "",
      constraints: "Use simple analogies. Include a basic code example. Explain step by step.",
      disallowed_content: "Do not use advanced concepts like Generators or Web Workers yet.",
      output_format: "mixed",
      tone_style: "friendly",
      reasoning_depth: "moderate",
      self_check: true,
      step: 6,
    },
  },
].map((prompt) => {
  return {
    ...prompt,
    d: compress(JSON.stringify(prompt.data)),
  };
}) as ExamplePrompt[];

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate a compressed URL parameter for an example prompt
 */
export function getExampleUrl(example: ExamplePrompt): {
  d: string;
  vld: 1;
} {
  return { d: example.d, vld: 1 };
}
