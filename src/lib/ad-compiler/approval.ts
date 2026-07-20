import { z } from "zod";

import {
  type TechnicalQaReceipt,
  TechnicalQaReceiptSchema,
} from "./qa";
import {
  compileCreativeSpec,
  hashCanonical,
  ProductEvidenceSchema,
} from "./schema";

export const APPROVAL_RECEIPT_VERSION = "1.0.0" as const;

const Sha256Schema = z
  .string()
  .regex(/^[a-f0-9]{64}$/u, "Expected a lowercase SHA-256 hash");

const ApprovalPayloadSchema = z
  .object({
    version: z.literal(APPROVAL_RECEIPT_VERSION),
    approvedAt: z.string().datetime({ offset: true }),
    approver: z.string().trim().min(1).max(100),
    evidenceHash: Sha256Schema,
    specHash: Sha256Schema,
    renderHash: Sha256Schema,
    qaReceiptHash: Sha256Schema,
  })
  .strict();

export const ApprovalReceiptSchema = ApprovalPayloadSchema.extend({
  approvalHash: Sha256Schema,
})
  .strict()
  .superRefine((receipt, context) => {
    const { approvalHash, ...payload } = receipt;
    if (approvalHash !== hashCanonical(payload)) {
      context.addIssue({
        code: "custom",
        path: ["approvalHash"],
        message: "Approval receipt integrity hash does not match its payload",
      });
    }
  });

export type ApprovalReceipt = z.infer<typeof ApprovalReceiptSchema>;

export function createApprovalReceipt({
  evidence: evidenceInput,
  spec,
  renderHash,
  qaReceipt: qaReceiptInput,
  approver,
  approvedAt = new Date().toISOString(),
}: {
  evidence: unknown;
  spec: unknown;
  renderHash: string;
  qaReceipt: unknown;
  approver: string;
  approvedAt?: string;
}): ApprovalReceipt {
  const evidence = ProductEvidenceSchema.parse(evidenceInput);
  const compiled = compileCreativeSpec({ evidence, spec });
  const evidenceHash = hashCanonical(evidence);
  const qaReceipt = TechnicalQaReceiptSchema.parse(qaReceiptInput);

  if (!qaReceipt.passed) {
    throw new Error("Cannot approve: technical QA is not a complete PASS");
  }
  if (qaReceipt.evidenceHash !== evidenceHash) {
    throw new Error("Cannot approve: QA receipt is stale for the current evidence");
  }
  if (qaReceipt.specHash !== compiled.specHash) {
    throw new Error("Cannot approve: QA receipt is stale for the current CreativeSpec");
  }
  if (qaReceipt.renderHash !== renderHash) {
    throw new Error("Cannot approve: QA receipt is stale for the current encoded render");
  }

  const payload = ApprovalPayloadSchema.parse({
    version: APPROVAL_RECEIPT_VERSION,
    approvedAt,
    approver,
    evidenceHash,
    specHash: compiled.specHash,
    renderHash,
    qaReceiptHash: hashCanonical(qaReceipt),
  });

  return ApprovalReceiptSchema.parse({
    ...payload,
    approvalHash: hashCanonical(payload),
  });
}

export function isApprovalReceiptCurrent(
  receiptInput: unknown,
  {
    evidence: evidenceInput,
    spec,
    renderHash,
    qaReceipt: qaReceiptInput,
  }: {
    evidence: unknown;
    spec: unknown;
    renderHash: string;
    qaReceipt: unknown;
  },
): boolean {
  try {
    const receipt = ApprovalReceiptSchema.parse(receiptInput);
    const evidence = ProductEvidenceSchema.parse(evidenceInput);
    const compiled = compileCreativeSpec({ evidence, spec });
    const qaReceipt: TechnicalQaReceipt =
      TechnicalQaReceiptSchema.parse(qaReceiptInput);
    const evidenceHash = hashCanonical(evidence);

    return (
      qaReceipt.passed &&
      qaReceipt.evidenceHash === evidenceHash &&
      qaReceipt.specHash === compiled.specHash &&
      qaReceipt.renderHash === renderHash &&
      receipt.evidenceHash === evidenceHash &&
      receipt.specHash === compiled.specHash &&
      receipt.renderHash === renderHash &&
      receipt.qaReceiptHash === hashCanonical(qaReceipt)
    );
  } catch {
    return false;
  }
}
