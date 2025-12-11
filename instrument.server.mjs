import * as Sentry from "@sentry/tanstackstart-react";

Sentry.init({
  dsn: "https://e355b27fdb2047aa2e65b53c737c185c@o4510516655423488.ingest.us.sentry.io/4510516658831360",

  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for tracing.
  // We recommend adjusting this value in production.
  // Learn more at https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
  tracesSampleRate: 1.0,
});
