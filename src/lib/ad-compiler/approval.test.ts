import { describe, expect, it } from "vitest";

import creativeSpec from "../../../samples/nova-one/creative-spec.json";
import productEvidence from "../../../samples/nova-one/product-evidence.json";
import {
  ApprovalReceiptSchema,
  createApprovalReceipt,
  isApprovalReceiptCurrent,
} from "./approval";
import { buildTechnicalQaReceipt, type TechnicalQaReceipt } from "./qa";
import {
  hashCanonical,
  hashCreativeSpec,
  ProductEvidenceSchema,
} from "./schema";

const renderHash = "b".repeat(64);
const evidenceHash = hashCanonical(ProductEvidenceSchema.parse(productEvidence));
const specHash = hashCreativeSpec(creativeSpec);

const qaReceipt = (): TechnicalQaReceipt =>
  buildTechnicalQaReceipt({
    probe: {
      durationSeconds: 12,
      sizeBytes: 3_456_789,
      video: {
        codec: "h264",
        profile: "High",
        width: 1080,
        height: 1920,
        pixelFormat: "yuv420p",
        fps: 30,
      },
      audio: { codec: "aac", sampleRate: 48_000, channels: 2 },
    },
    loudness: {
      integratedLufs: -17.2,
      loudnessRangeLu: 11.6,
      truePeakDbfs: -3.5,
    },
    expectedDurationSeconds: 12,
    evidenceHash,
    specHash,
    renderHash,
    generatedAt: "2026-07-20T11:59:00.000Z",
  });

const approvalInput = () => ({
  evidence: productEvidence,
  spec: creativeSpec,
  renderHash,
  qaReceipt: qaReceipt(),
  approver: "  KreoFlow human reviewer  ",
  approvedAt: "2026-07-20T12:00:00.000Z",
});

describe("approval receipts", () => {
  it("binds approval to evidence, spec, encoded render, and the full QA receipt", () => {
    const input = approvalInput();
    const receipt = createApprovalReceipt(input);

    expect(receipt).toMatchObject({
      version: "1.0.0",
      approvedAt: "2026-07-20T12:00:00.000Z",
      approver: "KreoFlow human reviewer",
      evidenceHash,
      specHash,
      renderHash,
    });
    expect(receipt.qaReceiptHash).toMatch(/^[a-f0-9]{64}$/u);
    expect(receipt.approvalHash).toMatch(/^[a-f0-9]{64}$/u);
    expect(ApprovalReceiptSchema.parse(receipt)).toEqual(receipt);
    expect(
      isApprovalReceiptCurrent(receipt, {
        evidence: productEvidence,
        spec: creativeSpec,
        renderHash,
        qaReceipt: input.qaReceipt,
      }),
    ).toBe(true);
  });

  it("rejects a forged one-check QA receipt even when it claims PASS", () => {
    const input = approvalInput();
    const forgedQa = {
      ...input.qaReceipt,
      passed: true,
      checks: [input.qaReceipt.checks[0]],
    };

    expect(() => createApprovalReceipt({ ...input, qaReceipt: forgedQa })).toThrow();
  });

  it("becomes stale when evidence is revoked", () => {
    const input = approvalInput();
    const receipt = createApprovalReceipt(input);
    const revokedEvidence = {
      ...productEvidence,
      claims: productEvidence.claims.map((claim) =>
        claim.id === "adaptive-anc" ? { ...claim, status: "blocked" } : claim,
      ),
    };

    expect(
      isApprovalReceiptCurrent(receipt, {
        evidence: revokedEvidence,
        spec: creativeSpec,
        renderHash,
        qaReceipt: input.qaReceipt,
      }),
    ).toBe(false);
  });

  it("becomes stale when the spec, render, or QA receipt changes", () => {
    const input = approvalInput();
    const receipt = createApprovalReceipt(input);
    const changedSpec = { ...creativeSpec, angle: `${creativeSpec.angle} — changed` };
    const changedQa = {
      ...input.qaReceipt,
      generatedAt: "2026-07-20T12:01:00.000Z",
    };

    expect(
      isApprovalReceiptCurrent(receipt, {
        evidence: productEvidence,
        spec: changedSpec,
        renderHash,
        qaReceipt: input.qaReceipt,
      }),
    ).toBe(false);
    expect(
      isApprovalReceiptCurrent(receipt, {
        evidence: productEvidence,
        spec: creativeSpec,
        renderHash: "c".repeat(64),
        qaReceipt: input.qaReceipt,
      }),
    ).toBe(false);
    expect(
      isApprovalReceiptCurrent(receipt, {
        evidence: productEvidence,
        spec: creativeSpec,
        renderHash,
        qaReceipt: changedQa,
      }),
    ).toBe(false);
  });

  it("rejects malformed hashes and timestamps", () => {
    const input = approvalInput();
    expect(() =>
      createApprovalReceipt({
        ...input,
        renderHash: "not-a-sha256",
        approvedAt: "yesterday",
      }),
    ).toThrow();
  });
});
