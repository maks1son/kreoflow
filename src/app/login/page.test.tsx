import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  capture: vi.fn(),
  auth: {
    configured: true,
    loading: false,
    user: null,
    requestEmailCode: vi.fn(),
    verifyEmailCode: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string | { src: string }; alt: string }) =>
    createElement("img", { src: typeof src === "string" ? src : src.src, alt }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) =>
    createElement("a", { href }, children),
}));

vi.mock("../../../public/media/campaign/kreoflow-editorial-watch-still-life.webp", () => ({
  default: {
    src: "/kreoflow/media/campaign/kreoflow-editorial-watch-still-life.webp",
  },
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => mocks.auth,
}));

vi.mock("@/lib/analytics", () => ({
  captureAnalyticsEvent: mocks.capture,
}));

describe("LoginPage assets", () => {
  beforeEach(() => {
    mocks.replace.mockReset();
    mocks.capture.mockReset();
    mocks.auth.requestEmailCode.mockReset();
    mocks.auth.verifyEmailCode.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("prefixes the proof image with the GitHub Pages base path", async () => {
    vi.stubEnv("GITHUB_PAGES", "true");
    const { default: LoginPage } = await import("./page");

    render(<LoginPage />);

    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "/kreoflow/media/campaign/kreoflow-editorial-watch-still-life.webp",
    );
  });

  it("tracks successful email code request and confirmation without the email", async () => {
    const user = userEvent.setup();
    mocks.auth.requestEmailCode.mockResolvedValue(undefined);
    mocks.auth.verifyEmailCode.mockResolvedValue(undefined);
    const { default: LoginPage } = await import("./page");

    render(<LoginPage />);
    await user.type(screen.getByPlaceholderText("you@example.com"), "max@example.com");
    await user.click(screen.getByRole("button", { name: /Получить код/i }));

    await waitFor(() => {
      expect(mocks.capture).toHaveBeenCalledWith("email_auth_started", {
        is_resend: false,
        return_to: "/studio",
      });
    });

    await user.type(screen.getByPlaceholderText("000000"), "123456");
    await user.click(screen.getByRole("button", { name: /^Войти$/i }));

    await waitFor(() => {
      expect(mocks.capture).toHaveBeenCalledWith("email_auth_completed", {
        return_to: "/studio",
      });
    });
    expect(JSON.stringify(mocks.capture.mock.calls)).not.toContain("max@example.com");
  });
});
