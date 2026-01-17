# Mixpanel Tracking Best Practices & Guidelines

This document outlines best practices for Mixpanel implementation, tailored specifically for the `builder-prompt-ai` repository.

## 1. Naming Conventions

### Event Naming: `Object: Action`

While your current implementation uses `snake_case` (e.g., `cta_clicked_get_started`), the industry standard and Mixpanel recommendation is the **Object: Action** pattern.

- **Why?** It groups events logically in the Mixpanel UI dropdowns.
- **Current**: `cta_clicked_get_started_for_free`, `page_viewed_wizard`
- **Recommended**: `CTA: Clicked`, `Page: Viewed`
- **Detail**: Move specific details to **properties** rather than the event name.

**Example Transformation:**

```typescript
// Current
track("cta_clicked_get_started_for_free");

// Recommended
track("CTA: Clicked", {
  label: "Get Started for Free",
  location: "Landing Page Hero",
});
```

This reduces the total number of unique event names ("Event Explosion"), making analysis cleaner. You can then breakdown `CTA: Clicked` by `label`.

### Property Naming: `snake_case`

Mixpanel properties (and default properties like `$os`, `$browser`) typically use `snake_case`. Your codebase currently mixes them (e.g., `refererParts` vs `$user_agent`).

- **Recommendation**: Stick to `snake_case` for all custom properties to align with Mixpanel defaults.
- **Example**: Change `refererParts` to `referrer_parts`.

## 2. Identity Management

You are currently handling identity via a custom `getOrCreateSessionId` and passing it as `distinct_id`. This is a solid approach for anonymous usage (similar to a specialized "device ID").

### Recommendations

1.  **Consistency**: Ensure `distinct_id` is _always_ passed. Your `useTrackMixpanel` hook enforces this, which is excellent.
2.  **User Identification**: If you add authentication later, you must call `mixpanel.identify(userId)` (or pass the User ID as `distinct_id`) once the user logs in. Key: **Link the previous anonymous session ID to the new User ID** (using `alias` in older SDKs, or just ensuring the graph merges in newer ones). Since you are doing server-side tracking, you essentially control the identity graph by what `distinct_id` you send.

## 3. Server-Side vs. Client-Side

Your implementation uses a **Hybrid Approach**:

- **Trigger**: Client-side hook (`useTrackMixpanel`).
- **Execution**: Server-side function (`trackMixpanelInServer`).

**Verdict: Excellent ✅**

- **Pros**:
  - Hides your Project Token from network requests.
  - Bypasses client-side ad-blockers (approx. 10-30% of users).
  - Allows robust `zod` validation before sending.
- **Cons**:
  - You lose automatic "default properties" that the Mixpanel JS SDK collects (Screen resolution, Utm params from URL, etc.).
  - **Mitigation**: You have correctly manually implemented Parsers for User-Agent, Referrer, and IP.

**Missing Pieces to Consider Adding**:

- **UTM Parameters**: You should parse `utm_source`, `utm_medium`, `utm_campaign` from the URL and pass them. Mixpanel loves these for attribution.
- **GeoIP**: You are passing `ip`, which Mixpanel uses for Geo-resolution. Ensure your hosting provider (Vercel/Netlify/etc.) provides the real Client IP in `x-forwarded-for`.

## 4. Schema & Validation

Your use of `zod` to define `MixpanelDataSchema` is **Best in Class**.

- It acts as a "Tracking Plan" in code.
- It prevents "bad data" (typos in event names) from polluting your project.

**Recommendation**:

- Keep the `event` enum.
- Consider refining the `properties` schema to be stricter than `looseObject` if you want to enforce specific properties for specific events (e.g., `Page: Viewed` _must_ have a `path` property).

## 5. Refactoring Plan (Optional)

If you wish to align with the `Object: Action` standard, here is a suggested refactor for `MixpanelDataSchema`:

```typescript
const MixpanelDataSchema = z.object({
  event: z.enum([
    "Page: Viewed",
    "CTA: Clicked",
    "Form: Submitted",
    "Prompt: Generated",
    "System: Performance", // for time_taken_* events
  ]),
  properties: z
    .object({
      distinct_id: z.string(),
      // Common optional props
      label: z.string().optional(),
      page: z.string().optional(),
      duration_ms: z.number().optional(),
    })
    .passthrough(), // allow extra props
});
```

### Mapping Old to New

| Old Event               | New Event             | New Properties                                |
| :---------------------- | :-------------------- | :-------------------------------------------- |
| `cta_clicked_copy_link` | `CTA: Clicked`        | `{ label: "Copy Link" }`                      |
| `page_viewed_wizard`    | `Page: Viewed`        | `{ name: "Wizard" }`                          |
| `time_taken_compress`   | `System: Performance` | `{ operation: "compress", duration_ms: 123 }` |

## Summary

Your current infrastructure (`MixpanelProvider.tsx`) is robust and better than 90% of basic implementations due to the server-side proxying and Zod validation. The main area for improvement is **Event Naming Strategy** to prevent clutter as the app grows.
