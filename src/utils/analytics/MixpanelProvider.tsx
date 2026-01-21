import { createContext, useContext, useCallback } from "react";

import { createServerFn, useServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import Mixpanel from "mixpanel";

import { z } from "zod";
import { getOrCreateSessionId } from "@/utils/session";

import packageJSON from "../../../package.json";
import { Logger } from "../logger";
import { getMetadataFromRequest } from "../serverFn-util";
import { env } from "../client/env";

const version = packageJSON.version;

const mixpanelLogger = Logger.createLogger({
  namespace: "mixpanel",
  level: "INFO",
  enableConsoleLog: true,
});

const MixpanelDataSchema = z.object({
  event: z.enum([
    "page_viewed_landing",
    "page_viewed_wizard",
    "page_viewed_wizard_type_default",
    "page_viewed_wizard_type_url",
    "page_viewed_wizard_type_params",
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
    "role_suggestion_submitted",
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
    "cta_clicked_get_shareable_link",
    // Stored prompts
    "stored_prompt_viewed",
    "stored_prompt_edited",
    "stored_prompt_deleted",
    // V2 Landing Page
    "page_viewed_landing_v2",
    "example_selected_v2",
    "cta_clicked_try_prompt_v2",
    "cta_clicked_start_building_v2",
    "cta_clicked_copy_prompt_v2",
    "cta_clicked_copy_link_v2",
    "cta_clicked_edit_v2",
    "cta_clicked_try_chatgpt",
    "cta_clicked_try_chatgpt_v2",
    "onboarding_dialog_shown",
    "onboarding_switched_to_advanced",
    "prompt_analyzed",
    "prompt_analyzed_error",
    "prompt_analyzed_cache_hit",
    "cta_clicked_analyze_with_ai",
    "feature_locked_click",
    "prompt_saved_background",
  ]),
  properties: z.looseObject({
    distinct_id: z.string(),
  }),
});

type MixpanelData = z.infer<typeof MixpanelDataSchema>;

export type MixpanelDataEvent = MixpanelData["event"];

const mp = Mixpanel.init(env.VITE_PUBLIC_MIXPANEL_PROJECT_TOKEN, {
  verbose: true,
});

// ═══════════════════════════════════════════════════════════════════════════
// SERVER FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

export const trackMixpanelInServer = createServerFn({ method: "POST" })
  .inputValidator(MixpanelDataSchema)
  .handler(async ({ data }) => {
    const request = getRequest();

    const { userAgent, referer, refererParts, acceptLanguage, ip, origin, device, os, browser } =
      getMetadataFromRequest(request);

    const finalData = {
      ...data.properties,

      // Browser/Device info
      $user_agent: userAgent,
      $browser: browser,
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
      mixpanelLogger.debug("event", data.event, finalData);
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
