import * as Sentry from "@sentry/tanstackstart-react";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { ConvexReactClient, ConvexProvider } from "convex/react";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { env } from "./utils/client/env";

const { VITE_CONVEX_URL } = env;
export const getRouter = () => {
  const convex = new ConvexReactClient(VITE_CONVEX_URL);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });

  const router = createTanStackRouter({
    routeTree,
    context: {
      queryClient,
    },
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    Wrap: ({ children }) => <ConvexProvider client={convex}>{children}</ConvexProvider>,
  });

  if (!router.isServer) {
    Sentry.init({
      dsn: "https://e355b27fdb2047aa2e65b53c737c185c@o4510516655423488.ingest.us.sentry.io/4510516658831360",
      sendDefaultPii: true,
      integrations: [Sentry.tanstackRouterBrowserTracingIntegration(router)],
      tracesSampleRate: 1.0,
      tunnel: "/api/sentry/tunnel",
    });
  }

  return routerWithQueryClient(router, queryClient);
};
