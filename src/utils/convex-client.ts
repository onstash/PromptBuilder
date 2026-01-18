import { ConvexHttpClient } from "convex/browser";

/**
 * Shared ConvexHttpClient instance for server-side operations.
 * This prevents creating multiple client instances across different server functions.
 */

let convexClient: ConvexHttpClient | null = null;

export function getConvexClient(): ConvexHttpClient {
  if (!convexClient) {
    const convexUrl = import.meta.env.VITE_CONVEX_URL || process.env.VITE_CONVEX_URL;
    if (!convexUrl) {
      throw new Error("Missing VITE_CONVEX_URL environment variable");
    }
    convexClient = new ConvexHttpClient(convexUrl);
  }
  return convexClient;
}
