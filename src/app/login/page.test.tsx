import { cleanup, render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
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

describe("LoginPage assets", () => {
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
});
