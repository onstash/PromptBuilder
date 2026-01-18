import { createFileRoute } from "@tanstack/react-router";

const content = `# Prompt Builder (https://prompt-builder-ten-xi.vercel.app/)

  > Prompt Builder helps you create professional, structured AI prompts.

  ## Key Features
  - **Prompt Wizard**: Guided 6-step process to build robust prompts.
  - **Analysis**: Real-time AI analysis of prompt quality (Gemini-powered).
  - **Share**: Create permanent, shareable links and pretty URLs for prompts.
  - **Library**: Browse and fork community prompts.

  ## Prompt Structure
  We follow a proven prompt engineering framework:
  1. **Role**: Who is the AI? (e.g., "Expert React Developer")
  2. **Task**: What is the goal? (e.g., "Refactor this component")
  3. **Context**: Background info.
  4. **Constraints**: What to avoid.
  5. **Output Format**: JSON, Markdown, etc.

  ## Documentation
  - **Home**: https://prompt-builder-ten-xi.vercel.app/
  - **Wizard**: https://prompt-builder-ten-xi.vercel.app/wizard
  - **GitHub**: https://github.com/onstash/PromptBuilder

  ## Tech Stack
  - TanStack Start (React Framework)
  - Convex (Realtime Database)
  - Vercel AI SDK
  - TailwindCSS + Shadcn/UI
`;
export const Route = createFileRoute("/llms/txt")({
  beforeLoad: () => {
    throw new Response(content, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  },
});
