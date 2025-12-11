import * as Sentry from "@sentry/tanstackstart-react";
import { createRouter } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  if (!router.isServer) {
    Sentry.init({
      dsn: "https://e355b27fdb2047aa2e65b53c737c185c@o4510516655423488.ingest.us.sentry.io/4510516658831360",

      // Adds request headers and IP for users, for more info visit:
      // https://docs.sentry.io/platforms/javascript/guides/tanstackstart-react/configuration/options/#sendDefaultPii
      sendDefaultPii: true,

      integrations: [Sentry.tanstackRouterBrowserTracingIntegration(router)],

      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for tracing.
      // We recommend adjusting this value in production.
      // Learn more at https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
      tracesSampleRate: 1.0,
      tunnel: "/api/sentry/tunnel",
    });
  }

  return router;
};
