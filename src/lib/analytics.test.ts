import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BriefInput } from "./types";

const posthog = vi.hoisted(() => ({
  capture: vi.fn(),
  identify: vi.fn(),
  reset: vi.fn(),
}));

vi.mock("posthog-js", () => ({ default: posthog }));

import {
  captureAnalyticsEvent,
  getAnalyticsConfig,
  getBriefSubmissionProperties,
  identifyAnalyticsUser,
  resetAnalyticsUser,
} from "./analytics";

const brief: BriefInput = {
  businessName: "Luma",
  niche: "beauty",
  websiteUrl: "https://example.com",
  socialUrl: "",
  offer: "Private offer text",
  audience: "Private audience text",
  goal: "leads",
  style: "premium",
  contactName: "Max",
  contactMethod: "max@example.com",
};

describe("analytics", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", "phc_test");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "https://eu.i.posthog.com");
    posthog.capture.mockReset();
    posthog.identify.mockReset();
    posthog.reset.mockReset();
  });

  afterEach(() => vi.unstubAllEnvs());

  it("stays disabled when the public project token is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", "");

    expect(getAnalyticsConfig()).toBeNull();
    captureAnalyticsEvent("brief_started");

    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it("captures only the requested typed event", () => {
    captureAnalyticsEvent("email_auth_started", {
      is_resend: false,
      return_to: "/brief",
    });

    expect(posthog.capture).toHaveBeenCalledWith("email_auth_started", {
      is_resend: false,
      return_to: "/brief",
    });
  });

  it("identifies a confirmed account without sending its email", () => {
    identifyAnalyticsUser("user-42");

    expect(posthog.identify).toHaveBeenCalledWith("user-42", {
      auth_provider: "email_otp",
    });
  });

  it("resets the analytics identity on logout", () => {
    resetAnalyticsUser();

    expect(posthog.reset).toHaveBeenCalledOnce();
  });

  it("builds non-PII order properties", () => {
    const properties = getBriefSubmissionProperties("order-1", brief);

    expect(properties).toEqual({
      order_id: "order-1",
      niche: "beauty",
      goal: "leads",
      style: "premium",
      has_website: true,
      has_social: false,
    });
    expect(JSON.stringify(properties)).not.toContain("max@example.com");
    expect(JSON.stringify(properties)).not.toContain("Private offer text");
  });
});
