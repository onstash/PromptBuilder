import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/sentry/tunnel")({
  server: {
    handlers: {
      GET: () => {
        console.log("Sentry tunnel hit");
        return new Response(
          JSON.stringify({ message: "Testing Sentry Tunnel..." }),
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
