/**
 * A/B Testing Utility
 *
 * Provides consistent version assignment for experiments using session-based hashing.
 * Persists assignments in localStorage to ensure users see the same variant across sessions.
 */

import { getOrCreateSessionId } from "./session";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type LandingVersion = "v1" | "v2";
export type WizardVersion = "v1" | "v2";

type ExperimentName = "landing_page" | "wizard_suggestions";
type VersionType = LandingVersion | WizardVersion;

// ═══════════════════════════════════════════════════════════════════════════
// STORAGE KEYS
// ═══════════════════════════════════════════════════════════════════════════

const AB_VERSION_KEYS = {
  landing_page: "ab_landing_version",
  wizard_suggestions: "ab_wizard_version",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// HASH UTILITY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Simple deterministic hash function
 * Same input always produces same output
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSIGNMENT LOGIC
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get or assign A/B test variant for an experiment
 *
 * Priority:
 * 1. URL parameter (?version=v2) - Manual override for testing
 * 2. Environment variable - Global default for all users
 * 3. localStorage - Previously assigned variant
 * 4. Session hash - Deterministic 50/50 assignment for new users
 * 5. Default - v1 (fallback)
 *
 * @param experiment - The experiment name
 * @param urlParam - Name of the URL parameter to check (e.g., "version")
 * @param envVarName - Name of the environment variable to check (e.g., "VITE_LANDING_VERSION")
 * @param defaultVersion - Default version if no assignment found
 * @returns The assigned version
 */
function getOrAssignVersion<T extends VersionType>(
  experiment: ExperimentName,
  urlParam: string,
  envVarName: string
): T {
  // 1. Check URL parameter (manual override for testing)
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const urlVersion = params.get(urlParam);
    if (urlVersion === "v1" || urlVersion === "v2") {
      return urlVersion as T;
    }
  }

  // 2. Check environment variable (global default)
  const envVersion = (import.meta.env as Record<string, string>)[envVarName];
  if (envVersion === "v1" || envVersion === "v2") {
    return envVersion as T;
  }

  // 3. Check localStorage (previous assignment)
  const storageKey = AB_VERSION_KEYS[experiment];
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === "v1" || stored === "v2") {
      return stored as T;
    }
  } catch (error) {
    console.error("Error reading A/B assignment from localStorage:", error);
  }

  // 4. Assign based on session ID hash (50/50 split)
  const sessionId = getOrCreateSessionId();
  const hash = simpleHash(`${experiment}_${sessionId}`);
  const assigned = (hash % 2 === 0 ? "v1" : "v2") as T;

  // 5. Persist assignment to localStorage
  try {
    localStorage.setItem(storageKey, assigned);
  } catch (error) {
    console.error("Error storing A/B assignment in localStorage:", error);
  }

  return assigned;
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get landing page version (v1 or v2)
 *
 * Usage in routes/index.tsx:
 * ```typescript
 * const version = getLandingVersion();
 * return version === "v2" ? <ChatLandingPage /> : <LandingPage />;
 * ```
 *
 * URL override: `?version=v2`
 * Env variable: `VITE_LANDING_VERSION=v2`
 */
export function getLandingVersion(): LandingVersion {
  return getOrAssignVersion<LandingVersion>("landing_page", "version", "VITE_LANDING_VERSION");
}

/**
 * Get wizard version (v1 or v2) for role-based suggestions
 *
 * Usage in PromptWizard.tsx:
 * ```typescript
 * const stepComponents = getWizardVersion() === "v2"
 *   ? STEP_COMPONENTS_V2
 *   : STEP_COMPONENTS_V1;
 * ```
 *
 * URL override: `?wizard=v2`
 * Env variable: `VITE_WIZARD_VERSION=v2`
 */
export function getWizardVersion(): WizardVersion {
  return getOrAssignVersion<WizardVersion>("wizard_suggestions", "wizard", "VITE_WIZARD_VERSION");
}

/**
 * Clear all A/B test assignments (for testing purposes)
 */
export function clearABAssignments(): void {
  try {
    Object.values(AB_VERSION_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error("Error clearing A/B assignments:", error);
  }
}

/**
 * Get assignment method for analytics
 * Useful for debugging and understanding how users were assigned
 */
export function getAssignmentMethod(
  experiment: ExperimentName,
  urlParam: string,
  envVarName: string
): "url" | "env" | "localStorage" | "session_hash" | "default" {
  // Check URL
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const urlVersion = params.get(urlParam);
    if (urlVersion === "v1" || urlVersion === "v2") {
      return "url";
    }
  }

  // Check env
  const envVersion = (import.meta.env as Record<string, string>)[envVarName];
  if (envVersion === "v1" || envVersion === "v2") {
    return "env";
  }

  // Check localStorage
  const storageKey = AB_VERSION_KEYS[experiment];
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === "v1" || stored === "v2") {
      return "localStorage";
    }
  } catch {
    // Fall through
  }

  return "session_hash";
}
