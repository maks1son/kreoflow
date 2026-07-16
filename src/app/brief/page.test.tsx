import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BriefPage from "./page";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  push: vi.fn(),
  capture: vi.fn(),
  auth: {
    configured: true,
    loading: false,
    user: null as { id: string } | null,
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/brief",
  useRouter: () => ({ replace: mocks.replace, push: mocks.push }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => mocks.auth,
}));

vi.mock("@/lib/analytics", () => ({
  captureAnalyticsEvent: mocks.capture,
  getBriefSubmissionProperties: vi.fn(),
}));

describe("BriefPage authentication", () => {
  beforeEach(() => {
    mocks.replace.mockReset();
    mocks.push.mockReset();
    mocks.capture.mockReset();
    mocks.auth.configured = true;
    mocks.auth.loading = false;
    mocks.auth.user = null;
    window.localStorage.clear();
  });

  afterEach(() => cleanup());

  it("does not mount the brief form before email authentication", async () => {
    render(<BriefPage />);

    expect(document.querySelector('input[name="businessName"]')).toBeNull();
    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith("/login?returnTo=%2Fbrief");
    });
  });

  it("renders the existing brief for an authenticated visitor", () => {
    mocks.auth.user = { id: "user-1" };

    render(<BriefPage />);

    expect(document.querySelector('input[name="businessName"]')).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(mocks.capture).toHaveBeenCalledWith("brief_started");
  });
});
