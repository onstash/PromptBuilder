import { createContext, useContext, useCallback } from "react";

import { createServerFn, useServerFn } from "@tanstack/react-start";
import Mixpanel from "mixpanel";

import { z } from "zod";
import { getOrCreateSessionId } from "@/utils/session";

const MixpanelDataSchema = z.object({
  event: z.enum([
    "page_viewed_landing",
    "page_viewed_wizard",
    "page_viewed_share",
    "button_clicked",
    "step_changed",
    "form_submitted",
    "data_loaded_url",
    "data_loaded_localstorage",
    "data_reset",
  ]),
  properties: z.looseObject({
    distinct_id: z.string(),
  }),
});

type MixpanelData = z.infer<typeof MixpanelDataSchema>;

const mp = Mixpanel.init(import.meta.env.VITE_PUBLIC_MIXPANEL_PROJECT_TOKEN, {
  verbose: true,
});

export const trackMixpanelInServer = createServerFn({ method: "POST" })
  .inputValidator(MixpanelDataSchema)
  .handler(async ({ data }) => {
    mp.track(data.event, data.properties);
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
 * trackEvent("button_clicked", { button_name: "submit", page: "wizard" });
 *
 * // Track an event without additional properties
 * trackEvent("page_viewed");
 */
export function useTrackMixpanel() {
  const trackMixpanelFn = useMixpanelContext();

  const trackEvent = useCallback(
    (event: MixpanelData["event"], properties: Omit<MixpanelData["properties"], "distinct_id">) => {
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
    [trackMixpanelFn]
  );

  return trackEvent;
}
