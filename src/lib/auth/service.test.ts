import { describe, expect, it, vi } from "vitest";
import { createAuthService } from "./service";

describe("auth service", () => {
  it("requests an OTP without forcing an existing user", async () => {
    const signInWithOtp = vi.fn().mockResolvedValue({ error: null });
    const service = createAuthService({
      auth: { signInWithOtp, verifyOtp: vi.fn(), signOut: vi.fn() },
    });

    await service.requestEmailCode("max@example.com");

    expect(signInWithOtp).toHaveBeenCalledWith({
      email: "max@example.com",
      options: { shouldCreateUser: true },
    });
  });

  it("verifies an email token and forwards provider failures", async () => {
    const providerError = new Error("invalid token");
    const verifyOtp = vi.fn().mockResolvedValueOnce({ error: null }).mockResolvedValueOnce({ error: providerError });
    const service = createAuthService({
      auth: { signInWithOtp: vi.fn(), verifyOtp, signOut: vi.fn() },
    });

    await service.verifyEmailCode("max@example.com", "123456");
    expect(verifyOtp).toHaveBeenCalledWith({ email: "max@example.com", token: "123456", type: "email" });
    await expect(service.verifyEmailCode("max@example.com", "654321")).rejects.toBe(providerError);
  });
});
