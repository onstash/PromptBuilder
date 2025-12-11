import { createFileRoute } from "@tanstack/react-router";

const SENTRY_HOST = "o4510516655423488.ingest.us.sentry.io";
const SENTRY_PROJECT_IDS = ["4510516658831360"];

export const Route = createFileRoute("/api/sentry/tunnel")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.text();

          // Parse the envelope header (first line)
          const envelopeLines = body.split("\n");
          if (envelopeLines.length < 2) {
            console.error("[Sentry Tunnel] Invalid envelope format");
            return new Response("Invalid envelope", { status: 400 });
          }

          const header = JSON.parse(envelopeLines[0]);
          const dsn = header.dsn;

          if (!dsn) {
            console.error("[Sentry Tunnel] Missing DSN in envelope");
            return new Response("Missing DSN", { status: 400 });
          }

          // Extract project ID from DSN
          // DSN format: https://PUBLIC_KEY@HOST/PROJECT_ID
          const dsnMatch = dsn.match(/https:\/\/[^@]+@[^/]+\/(\d+)/);
          if (!dsnMatch) {
            console.error("[Sentry Tunnel] Invalid DSN format:", dsn);
            return new Response("Invalid DSN", { status: 400 });
          }

          const projectId = dsnMatch[1];

          // Validate project ID
          if (!SENTRY_PROJECT_IDS.includes(projectId)) {
            console.error("[Sentry Tunnel] Unauthorized project ID:", projectId);
            return new Response("Unauthorized", { status: 403 });
          }

          // Forward to Sentry
          const sentryUrl = `https://${SENTRY_HOST}/api/${projectId}/envelope/`;

          console.log("[Sentry Tunnel] Forwarding event to:", sentryUrl);

          const sentryResponse = await fetch(sentryUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-sentry-envelope",
            },
            body: body,
          });

          if (!sentryResponse.ok) {
            console.error(
              "[Sentry Tunnel] Sentry responded with error:",
              sentryResponse.status,
              await sentryResponse.text()
            );
          } else {
            console.log("[Sentry Tunnel] Event forwarded successfully");
          }

          return new Response(null, {
            status: sentryResponse.status,
            statusText: sentryResponse.statusText,
          });
        } catch (error) {
          console.error("[Sentry Tunnel] Error processing request:", error);
          return new Response("Internal server error", { status: 500 });
        }
      },
      // Keep GET for health checks
      GET: () => {
        return new Response(
          JSON.stringify({
            status: "ok",
            message: "Sentry tunnel is operational",
          }),
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      },
    },
  },
});
