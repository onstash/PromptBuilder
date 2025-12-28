import { createContext, useContext, useCallback } from "react";

import { createServerFn, useServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import Mixpanel from "mixpanel";

import { z } from "zod";
import { getOrCreateSessionId } from "@/utils/session";

import packageJSON from "../../../package.json";

const version = packageJSON.version;

const MixpanelDataSchema = z.object({
  event: z.enum([
    "page_viewed_landing",
    "page_viewed_wizard",
    "page_viewed_wizard_type_default",
    "page_viewed_wizard_type_url",
    "page_viewed_wizard_type_localstorage",
    "page_viewed_share",
    "cta_clicked_get_started_for_free",
    "cta_clicked_start_building",
    "cta_clicked_edit",
    "cta_clicked_copy_prompt",
    "cta_clicked_copy_link",
    "cta_clicked_copy_link",
    "cta_clicked_work-email",
    "cta_clicked_exam-explainer",
    "cta_clicked_linkedin-post",
    "cta_clicked_job-application",
    "cta_clicked_social-caption",
    "cta_clicked_learn-coding",
    "step_changed_1",
    "step_changed_2",
    "step_changed_3",
    "step_changed_4",
    "step_changed_5",
    "step_changed_6",
    "step_changed_7",
    "step_changed_8",
    "step_changed_9",
    "step_changed_10",
    "form_submitted",
    "data_reset",
    "prompt_generated",
    "time_taken_compress",
    "time_taken_decompress",
    "time_taken_json_parse",
    "time_taken_json_stringify",
    "time_taken_localStorage_get",
    "time_taken_localStorage_set",
    // Navigation
    "cta_clicked_back_to_home",
    "cta_clicked_create_new_prompt",
    // Stored prompts
    "stored_prompt_viewed",
    "stored_prompt_edited",
    "stored_prompt_deleted",
  ]),
  properties: z.looseObject({
    distinct_id: z.string(),
  }),
});

type MixpanelData = z.infer<typeof MixpanelDataSchema>;

export type MixpanelDataEvent = MixpanelData["event"];

const mp = Mixpanel.init(import.meta.env.VITE_PUBLIC_MIXPANEL_PROJECT_TOKEN, {
  verbose: true,
});

// ═══════════════════════════════════════════════════════════════════════════
// USER-AGENT PARSING UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

const browsers: [RegExp, string][] = [
  [/Edg(?:e|A|iOS)?\/(\d+)/, "Edge"],
  [/OPR\/(\d+)|Opera\/(\d+)/, "Opera"],
  [/Chrome\/(\d+).*Safari/, "Chrome"],
  [/Firefox\/(\d+)/, "Firefox"],
  [/Safari\/(\d+)(?!.*Chrome)/, "Safari"],
  [/MSIE (\d+)|Trident.*rv:(\d+)/, "Internet Explorer"],
];

/**
 * Parse browser name and version from user-agent string
 */
function parseBrowser(userAgent: string | null): string {
  if (!userAgent) return "Unknown";

  // Order matters - check more specific patterns first

  for (const [regex, name] of browsers) {
    const match = userAgent.match(regex);
    if (match) {
      const version = match[1] || match[2] || "";
      return version ? `${name} ${version}` : name;
    }
  }

  return "Unknown";
}

/**
 * Parse device type from user-agent string
 */
function parseDevice(userAgent: string | null): string {
  if (!userAgent) return "Unknown";

  const ua = userAgent.toLowerCase();

  // Check for tablets first (they often contain "mobile" too)
  if (/ipad|tablet|playbook|silk/.test(ua)) {
    return "Tablet";
  }

  // Check for mobile devices
  if (
    /mobile|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini|opera mobi/.test(ua)
  ) {
    return "Mobile";
  }

  // Check for Android (without mobile = tablet)
  if (/android/.test(ua)) {
    return "Tablet";
  }

  // Default to desktop
  return "Desktop";
}

/**
 * Parse operating system from user-agent string
 */
function parseOS(userAgent: string | null): string {
  if (!userAgent) return "Unknown";

  const osPatterns: [RegExp, string][] = [
    [/Windows NT 10/, "Windows 10"],
    [/Windows NT 6\.3/, "Windows 8.1"],
    [/Windows NT 6\.2/, "Windows 8"],
    [/Windows NT 6\.1/, "Windows 7"],
    [/Windows/, "Windows"],
    [/Mac OS X (\d+)[._](\d+)/, "macOS"],
    [/Macintosh/, "macOS"],
    [/iPhone OS (\d+)/, "iOS"],
    [/iPad.*OS (\d+)/, "iPadOS"],
    [/Android (\d+)/, "Android"],
    [/Linux/, "Linux"],
    [/CrOS/, "Chrome OS"],
  ];

  for (const [regex, name] of osPatterns) {
    const match = userAgent.match(regex);
    if (match) {
      // Extract version if available
      if (match[1]) {
        const version = match[2] ? `${match[1]}.${match[2]}` : match[1];
        return `${name} ${version}`;
      }
      return name;
    }
  }

  return "Unknown";
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVER FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

export const trackMixpanelInServer = createServerFn({ method: "POST" })
  .inputValidator(MixpanelDataSchema)
  .handler(async ({ data }) => {
    const request = getRequest();

    // Extract headers from the browser request
    const userAgent = request.headers.get("user-agent");
    const referer = request.headers.get("referer");
    // Split referer into chunks of max 205 characters for Mixpanel property limits
    const refererParts: string[] = [];
    if (referer) {
      for (let i = 0; i < referer.length; i += 205) {
        refererParts.push(referer.slice(i, i + 205));
      }
    }
    const acceptLanguage = request.headers.get("accept-language");
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
    const origin = request.headers.get("origin");

    const device = parseDevice(userAgent);
    const os = parseOS(userAgent);

    const finalData = {
      ...data.properties,

      // Browser/Device info
      $user_agent: userAgent,
      $browser: parseBrowser(userAgent),
      $device: device,
      $os: os,

      // Referral tracking
      $referrer: referer,
      refererParts,

      // Geo/Locale
      $locale: acceptLanguage?.split(",")[0],

      // Network
      ip: ip,
      $origin: origin,
      appVersion: version,
    };

    if (origin?.includes?.("localhost:3000")) {
      // console.log("Mixpanel event", data.event, finalData);
      return;
    }

    mp.track(data.event.toLowerCase(), finalData);
  });

type MixpanelContextType = ReturnType<typeof useServerFn<typeof trackMixpanelInServer>>;

const MixpanelContext = createContext<MixpanelContextType | null>(null);

export function MixpanelProvider({ children }: { children: React.ReactNode }) {
  const trackMixpanel = useServerFn(trackMixpanelInServer);

  return <MixpanelContext.Provider value={trackMixpanel}>{children}</MixpanelContext.Provider>;
}

function useMixpanelContext() {
  const context = useContext(MixpanelContext);
  if (!context) {
    throw new Error("useMixpanelContext must be used within MixpanelProvider");
  }
  return context;
}

/**
 * Custom hook for tracking Mixpanel events with automatic session ID injection
 *
 * @example
 * const trackEvent = useTrackMixpanel();
 *
 * // Track an event with custom properties
 * trackEvent("cta_clicked_get_started_for_free", { button_name: "submit", page: "wizard" });
 *
 * // Track an event without additional properties
 * trackEvent("page_viewed");
 */
export function useTrackMixpanel() {
  const trackMixpanelFn = useMixpanelContext();

  const trackEvent = useCallback(
    (
      event: MixpanelData["event"],
      properties: Omit<MixpanelData["properties"], "distinct_id"> = {}
    ) => {
      const sessionId = getOrCreateSessionId();

      trackMixpanelFn({
        data: {
          event,
          properties: {
            ...properties,
            distinct_id: sessionId,
          },
        },
      });
    },
    []
  );

  return trackEvent;
}
