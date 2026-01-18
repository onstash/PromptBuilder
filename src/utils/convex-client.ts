import { env } from "@/utils/client/env";
import { ConvexHttpClient } from "convex/browser";

/**
 * Shared ConvexHttpClient instance for server-side operations.
 * This prevents creating multiple client instances across different server functions.
 */

let convexClient: ConvexHttpClient | null = null;

export function getConvexClient(): ConvexHttpClient {
  if (!convexClient) {
    convexClient = new ConvexHttpClient(env.VITE_CONVEX_URL);
  }
  return convexClient;
}
