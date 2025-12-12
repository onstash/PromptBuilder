/**
 * Example Usage: Mixpanel Tracking with Session ID
 *
 * This file demonstrates how to use the useTrackMixpanel hook
 * to track events with automatic session ID injection.
 */

import { useTrackMixpanel } from "@/utils/analytics/MixpanelProvider";
import { useEffect } from "react";

export function ExampleComponent() {
  const trackEvent = useTrackMixpanel();

  // Track page view on component mount
  useEffect(() => {
    trackEvent("page_viewed_landing", {
      page_name: "example_page",
      timestamp: new Date().toISOString(),
    });
  }, [trackEvent]);

  // Track button click
  const handleButtonClick = () => {
    trackEvent("button_clicked", {
      button_name: "submit",
      page: "example",
      action: "form_submission",
    });
  };

  // Track event without additional properties
  const handleSimpleEvent = () => {
    trackEvent("button_clicked", { action: "simple" });
  };

  return (
    <div>
      <h1>Example Component</h1>
      <button onClick={handleButtonClick}>Submit</button>
      <button onClick={handleSimpleEvent}>Simple Event</button>
    </div>
  );
}

/**
 * Session ID Management Examples
 */

import { getOrCreateSessionId, clearSessionId } from "@/utils/session";

// Get or create session ID (automatically syncs between cookie and localStorage)
const sessionId = getOrCreateSessionId();
console.log("Current session ID:", sessionId);

// Clear session ID (useful for logout)
export function handleLogout() {
  clearSessionId();
  // Redirect to login or home page
}

/**
 * How it works:
 *
 * 1. Session ID Priority:
 *    - First checks cookie
 *    - Falls back to localStorage
 *    - Generates new UUID if not found
 *
 * 2. Automatic Sync:
 *    - Session ID is automatically synced between cookie and localStorage
 *    - Cookie has 1 year expiration
 *    - localStorage persists indefinitely
 *
 * 3. Mixpanel Integration:
 *    - useTrackMixpanel hook automatically includes session_id in all events
 *    - distinct_id is set to session_id for user identification
 *    - All custom properties are merged with session data
 *
 * 4. Usage in Components:
 *    - Import useTrackMixpanel hook
 *    - Call trackEvent(eventName, properties)
 *    - Session ID is automatically included
 */
