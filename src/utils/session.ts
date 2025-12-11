/**
 * Session ID Management Utility
 * Handles session ID generation, storage, and retrieval using cookies and localStorage
 */

const SESSION_ID_KEY = "session_id";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

/**
 * Generates a unique session ID using crypto.randomUUID()
 */
function generateSessionId(): string {
  return crypto.randomUUID();
}

/**
 * Gets a cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }

  return null;
}

/**
 * Sets a cookie with the given name and value
 */
function setCookie(
  name: string,
  value: string,
  maxAge: number = COOKIE_MAX_AGE
): void {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=${value}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

/**
 * Gets a value from localStorage
 */
function getLocalStorage(key: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return null;
  }
}

/**
 * Sets a value in localStorage
 */
function setLocalStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.error("Error writing to localStorage:", error);
  }
}

/**
 * Gets the current session ID or generates a new one if it doesn't exist
 * Priority: Cookie → localStorage → Generate new
 * Syncs the session ID across both storage mechanisms
 */
export function getOrCreateSessionId(): string {
  // Try to get from cookie first
  let sessionId = getCookie(SESSION_ID_KEY);

  if (sessionId) {
    // Sync to localStorage if not present
    const localStorageId = getLocalStorage(SESSION_ID_KEY);
    if (localStorageId !== sessionId) {
      setLocalStorage(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  }

  // Try localStorage as fallback
  sessionId = getLocalStorage(SESSION_ID_KEY);

  if (sessionId) {
    // Sync to cookie
    setCookie(SESSION_ID_KEY, sessionId);
    return sessionId;
  }

  // Generate new session ID if not found anywhere
  sessionId = generateSessionId();

  // Store in both cookie and localStorage
  setCookie(SESSION_ID_KEY, sessionId);
  setLocalStorage(SESSION_ID_KEY, sessionId);

  return sessionId;
}

/**
 * Clears the session ID from both cookie and localStorage
 * Useful for logout or session reset scenarios
 */
export function clearSessionId(): void {
  // Clear cookie by setting max-age to 0
  setCookie(SESSION_ID_KEY, "", 0);

  // Clear localStorage
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(SESSION_ID_KEY);
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }
}
