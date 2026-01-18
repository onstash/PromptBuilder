import { createFileRoute } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import { WizardPreviewForSharePage } from "@/components/prompt-wizard/WizardPreview";
import { NotFound } from "@/components/NotFound";
import { PromptWizardData } from "@/utils/prompt-wizard/schema";

export const Route = createFileRoute("/prompts/$slug")({
  loader: async ({ params }) => {
    const convexUrl = import.meta.env.VITE_CONVEX_URL;
    if (!convexUrl) throw new Error("Missing VITE_CONVEX_URL");
    const client = new ConvexHttpClient(convexUrl);
    const prompt = await client.query(api.prompts.getPromptBySlug, {
      slug: params.slug,
    });
    return { prompt };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.prompt) {
      return {
        title: "Prompt Not Found",
      };
    }
    const { seoTitle, seoDescription, promptData } = loaderData.prompt;
    return {
      title: seoTitle,
      meta: [
        { name: "description", content: seoDescription },
        { property: "og:title", content: seoTitle },
        { property: "og:description", content: seoDescription },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: seoTitle },
        { name: "twitter:description", content: seoDescription },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareSourceCode",
            name: seoTitle,
            description: seoDescription,
            programmingLanguage: "Natural Language",
            author: {
              "@type": "Person",
              name: "PromptBuilder User",
            },
            text: promptData.task_intent, // Expose core prompt for indexing
          }),
        },
      ],
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { prompt } = Route.useLoaderData();

  if (!prompt) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <WizardPreviewForSharePage
          wizardData={prompt.promptData as unknown as PromptWizardData}
          source="share"
          isReadOnly={true}
          compressed={false}
        />
      </div>
    </div>
  );
}
