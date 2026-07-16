import posthog from "posthog-js";
import type { BriefInput } from "./types";

const defaultPostHogHost = "https://eu.i.posthog.com";

type AnalyticsEventProperties = {
  email_auth_started: {
    is_resend: boolean;
    return_to: string;
  };
  email_auth_completed: {
    return_to: string;
  };
  brief_started: Record<string, never>;
  brief_step_completed: {
    step: number;
    step_name: "business" | "offer" | "direction" | "contact";
  };
  brief_submitted: ReturnType<typeof getBriefSubmissionProperties>;
};

export function getAnalyticsConfig() {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim();
  if (!token) return null;

  return {
    token,
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || defaultPostHogHost,
  };
}

export function initializeAnalytics() {
  const config = getAnalyticsConfig();
  if (!config || typeof window === "undefined") return;

  posthog.init(config.token, {
    api_host: config.host,
    defaults: "2026-05-30",
    autocapture: false,
    capture_pageview: "history_change",
    capture_pageleave: true,
    persistence: "localStorage",
    person_profiles: "identified_only",
    disable_session_recording: true,
  });
}

export function captureAnalyticsEvent<EventName extends keyof AnalyticsEventProperties>(
  eventName: EventName,
  ...args: AnalyticsEventProperties[EventName] extends Record<string, never>
    ? [properties?: AnalyticsEventProperties[EventName]]
    : [properties: AnalyticsEventProperties[EventName]]
) {
  if (!getAnalyticsConfig() || typeof window === "undefined") return;
  posthog.capture(eventName, args[0]);
}

export function identifyAnalyticsUser(userId: string) {
  if (!getAnalyticsConfig() || typeof window === "undefined" || !userId.trim()) return;
  posthog.identify(userId, { auth_provider: "email_otp" });
}

export function resetAnalyticsUser() {
  if (!getAnalyticsConfig() || typeof window === "undefined") return;
  posthog.reset();
}

export function getBriefSubmissionProperties(orderId: string, brief: BriefInput) {
  return {
    order_id: orderId,
    niche: brief.niche,
    goal: brief.goal,
    style: brief.style,
    has_website: Boolean(brief.websiteUrl?.trim()),
    has_social: Boolean(brief.socialUrl?.trim()),
  };
}
