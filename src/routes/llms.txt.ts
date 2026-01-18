import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/llms/txt")({
  loader: () => {
    const content = `# Prompt Builder (builder.io/prompts)

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
- **Home**: https://prompt-builder.com
- **Wizard**: https://prompt-builder.com/wizard
- **GitHub**: https://github.com/hastons/PromptBuilder

## Tech Stack
- TanStack Start (React Framework)
- Convex (Realtime Database)
- Vercel AI SDK
- TailwindCSS + Shadcn/UI
`;

    return new Response(content, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  },
});
