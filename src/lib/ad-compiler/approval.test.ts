import { describe, expect, it } from "vitest";

import creativeSpec from "../../../samples/nova-one/creative-spec.json";
import {
  ApprovalReceiptSchema,
  createApprovalReceipt,
  isApprovalReceiptCurrent,
} from "./approval";

const renderHash = "b".repeat(64);

describe("approval receipts", () => {
  it("binds an approval to the exact creative spec and render", () => {
    const receipt = createApprovalReceipt({
      spec: creativeSpec,
      renderHash,
      approver: "  KreoFlow fixture owner  ",
      approvedAt: "2026-07-20T12:00:00.000Z",
    });

    expect(receipt).toMatchObject({
      version: "1.0.0",
      approvedAt: "2026-07-20T12:00:00.000Z",
      approver: "KreoFlow fixture owner",
      renderHash,
    });
    expect(receipt.specHash).toMatch(/^[a-f0-9]{64}$/u);
    expect(receipt.approvalHash).toMatch(/^[a-f0-9]{64}$/u);
    expect(ApprovalReceiptSchema.parse(receipt)).toEqual(receipt);
    expect(isApprovalReceiptCurrent(receipt, creativeSpec, renderHash)).toBe(true);
  });

  it("becomes stale when the spec changes", () => {
    const receipt = createApprovalReceipt({
      spec: creativeSpec,
      renderHash,
      approver: "KreoFlow fixture owner",
      approvedAt: "2026-07-20T12:00:00.000Z",
    });
    const changedSpec = { ...creativeSpec, angle: `${creativeSpec.angle} — changed` };

    expect(isApprovalReceiptCurrent(receipt, changedSpec, renderHash)).toBe(false);
  });

  it("becomes stale when the encoded render changes", () => {
    const receipt = createApprovalReceipt({
      spec: creativeSpec,
      renderHash,
      approver: "KreoFlow fixture owner",
      approvedAt: "2026-07-20T12:00:00.000Z",
    });

    expect(isApprovalReceiptCurrent(receipt, creativeSpec, "c".repeat(64))).toBe(false);
  });

  it("rejects malformed hashes and timestamps", () => {
    expect(() =>
      createApprovalReceipt({
        spec: creativeSpec,
        renderHash: "not-a-sha256",
        approver: "KreoFlow fixture owner",
        approvedAt: "yesterday",
      }),
    ).toThrow();
  });
});
