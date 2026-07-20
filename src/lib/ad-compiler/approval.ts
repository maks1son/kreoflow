import { z } from "zod";

import {
  hashCanonical,
  hashCreativeSpec,
  isApprovalCurrent,
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
    specHash: Sha256Schema,
    renderHash: Sha256Schema,
  })
  .strict();

export const ApprovalReceiptSchema = ApprovalPayloadSchema.extend({
  approvalHash: Sha256Schema,
}).strict();

export type ApprovalReceipt = z.infer<typeof ApprovalReceiptSchema>;

export function createApprovalReceipt({
  spec,
  renderHash,
  approver,
  approvedAt = new Date().toISOString(),
}: {
  spec: unknown;
  renderHash: string;
  approver: string;
  approvedAt?: string;
}): ApprovalReceipt {
  const payload = ApprovalPayloadSchema.parse({
    version: APPROVAL_RECEIPT_VERSION,
    approvedAt,
    approver,
    specHash: hashCreativeSpec(spec),
    renderHash,
  });

  return ApprovalReceiptSchema.parse({
    ...payload,
    approvalHash: hashCanonical(payload),
  });
}

export function isApprovalReceiptCurrent(
  receiptInput: unknown,
  currentSpec: unknown,
  currentRenderHash: string,
): boolean {
  const parsed = ApprovalReceiptSchema.safeParse(receiptInput);
  if (!parsed.success) return false;

  const { approvalHash, ...payload } = parsed.data;
  if (approvalHash !== hashCanonical(payload)) return false;

  return isApprovalCurrent(parsed.data, currentSpec, currentRenderHash);
}
