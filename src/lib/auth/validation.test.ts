import { describe, expect, it } from "vitest";
import { isValidEmail, normalizeEmail, normalizeOtp } from "./validation";

describe("auth validation", () => {
  it("normalizes email whitespace and case", () => {
    expect(normalizeEmail("  MAX@Example.COM ")).toBe("max@example.com");
  });

  it("accepts a plausible email and rejects malformed input", () => {
    expect(isValidEmail("max@example.com")).toBe(true);
    expect(isValidEmail("max@localhost")).toBe(false);
    expect(isValidEmail("max example.com")).toBe(false);
  });

  it("keeps only the first six OTP digits", () => {
    expect(normalizeOtp(" 12a 34-567 ")).toBe("123456");
  });
});
