import { describe, expect, it } from "vitest";
import { safeReturnPath } from "./return-path";

describe("safeReturnPath", () => {
  it("allows application-relative paths", () => {
    expect(safeReturnPath("/studio?order=1", "/studio")).toBe("/studio?order=1");
  });

  it("rejects external and protocol-relative redirects", () => {
    expect(safeReturnPath("https://attacker.example", "/studio")).toBe("/studio");
    expect(safeReturnPath("//attacker.example", "/studio")).toBe("/studio");
  });
});
