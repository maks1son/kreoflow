import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProtectedRoute } from "./protected-route";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  auth: {
    configured: false,
    loading: false,
    user: null as { id: string } | null,
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/brief",
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("./auth-provider", () => ({
  useAuth: () => mocks.auth,
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    mocks.replace.mockReset();
    mocks.auth.configured = false;
    mocks.auth.loading = false;
    mocks.auth.user = null;
  });

  afterEach(() => cleanup());

  it("fails closed when strict protection is requested without auth configuration", () => {
    render(
      <ProtectedRoute requireConfigured>
        <div>Protected content</div>
      </ProtectedRoute>,
    );

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(screen.getByText("Вход временно недоступен.")).toBeInTheDocument();
  });

  it("redirects a signed-out visitor back through login", async () => {
    mocks.auth.configured = true;

    render(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>,
    );

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith("/login?returnTo=%2Fbrief");
    });
  });

  it("renders children for an authenticated visitor", () => {
    mocks.auth.configured = true;
    mocks.auth.user = { id: "user-1" };

    render(
      <ProtectedRoute requireConfigured>
        <div>Protected content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
