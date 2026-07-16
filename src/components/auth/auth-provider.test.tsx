import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./auth-provider";

const mocks = vi.hoisted(() => ({
  identify: vi.fn(),
  reset: vi.fn(),
  signOut: vi.fn(),
  unsubscribe: vi.fn(),
}));

const session = {
  user: { id: "user-42" },
};

vi.mock("@/lib/auth/client", () => ({
  hasSupabaseConfig: () => true,
  getSupabaseBrowserClient: () => ({
    auth: {
      getSession: async () => ({ data: { session } }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: mocks.unsubscribe } },
      }),
    },
  }),
}));

vi.mock("@/lib/auth/service", () => ({
  createAuthService: () => ({
    requestEmailCode: vi.fn(),
    verifyEmailCode: vi.fn(),
    signOut: mocks.signOut,
  }),
}));

vi.mock("@/lib/analytics", () => ({
  identifyAnalyticsUser: mocks.identify,
  resetAnalyticsUser: mocks.reset,
}));

function AccountActions() {
  const { user, signOut } = useAuth();
  return (
    <button type="button" onClick={() => void signOut()}>
      {user ? "Sign out" : "Loading"}
    </button>
  );
}

describe("AuthProvider analytics identity", () => {
  afterEach(() => {
    cleanup();
    mocks.identify.mockReset();
    mocks.reset.mockReset();
    mocks.signOut.mockReset();
    mocks.unsubscribe.mockReset();
  });

  it("identifies a confirmed user and resets PostHog after logout", async () => {
    const user = userEvent.setup();
    mocks.signOut.mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <AccountActions />
      </AuthProvider>,
    );

    await waitFor(() => expect(mocks.identify).toHaveBeenCalledWith("user-42"));
    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(mocks.reset).toHaveBeenCalledOnce();
  });
});
