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
import { PostHogProvider } from "@/utils/analytics/PostHogProvider";

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
        title: "Prompt Builder",
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
        <PostHogProvider>{children}</PostHogProvider>
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
