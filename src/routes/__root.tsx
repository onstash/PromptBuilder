import {
  HeadContent,
  Scripts,
  createRootRoute,
  // useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { Toaster } from "sonner";

// import Header from "../components/Header";

import appCss from "../styles.css?url";
import { Footer } from "@/components/landing";
import { MixpanelProvider } from "@/utils/analytics/MixpanelProvider";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Prompt Builder - Professional AI Prompt Engineering Made Simple",
      },
      {
        name: "description",
        content:
          "Build better AI prompts with our free, no-signup prompt engineering tool. Configure role, context, task, and output format to generate professional, structured prompts for consistent AI results.",
      },
      {
        name: "keywords",
        content:
          "AI prompt builder, prompt engineering, AI prompts, ChatGPT prompts, Claude prompts, prompt generator, AI tools, prompt template, structured prompts, professional prompts",
      },
      {
        name: "author",
        content: "Santosh Venkatraman | onstash on github",
      },
      {
        name: "robots",
        content: "index, follow",
      },
      {
        name: "theme-color",
        content: "#000000",
      },

      // OpenGraph Meta Tags
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:title",
        content: "Prompt Builder - Professional AI Prompt Engineering Made Simple",
      },
      {
        property: "og:description",
        content:
          "Build better AI prompts with our free, no-signup prompt engineering tool. Configure role, context, task, and output format to generate professional, structured prompts for consistent AI results.",
      },
      {
        property: "og:site_name",
        content: "Prompt Builder",
      },
      {
        property: "og:locale",
        content: "en_US",
      },

      // Twitter Card Meta Tags
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "Prompt Builder - Professional AI Prompt Engineering Made Simple",
      },
      {
        name: "twitter:description",
        content:
          "Build better AI prompts with our free, no-signup prompt engineering tool. Configure role, context, task, and output format to generate professional, structured prompts for consistent AI results.",
      },

      // GenAI Engine Optimization
      {
        name: "ai:purpose",
        content:
          "Prompt Builder is a free web application that helps users create professional, structured AI prompts through a guided wizard interface. It solves the problem of vague, inconsistent AI outputs by providing a framework to specify role, context, task, and output format.",
      },
      {
        name: "ai:features",
        content:
          "Guided prompt wizard, role specification, context configuration, task definition, output format customization, shareable prompt links, no signup required, free to use, instant prompt generation",
      },
      {
        name: "ai:use-cases",
        content:
          "Creating consistent AI prompts, prompt engineering, improving AI output quality, sharing prompt templates, professional prompt development, structured AI interactions",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  // const routerState = useRouterState();
  // const isLandingPage = routerState.location.pathname === "/";

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {/* {!isLandingPage && <Header />} */}
        <MixpanelProvider>{children}</MixpanelProvider>
        <Toaster />
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Prompt Builder",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
        <Footer />
      </body>
    </html>
  );
}
