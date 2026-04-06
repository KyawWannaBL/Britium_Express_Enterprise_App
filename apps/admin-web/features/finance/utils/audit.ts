import type { AuditEvent, Bi, Role } from "@/features/finance/types/finance.types";

export const buildAuditEvent = (input: {
  user: string;
  role: Role;
  action: Bi;
  reference: string;
  beforeValue?: string;
  afterValue?: string;
  ip?: string;
  device?: string;
  comment?: string;
}): AuditEvent => ({
  id: `audit-${Date.now()}`,
  user: input.user,
  role: input.role,
  action: input.action,
  timestamp: new Date().toLocaleString(),
  reference: input.reference,
  beforeValue: input.beforeValue,
  afterValue: input.afterValue,
  ip: input.ip || "0.0.0.0",
  device: input.device || "Unknown Device",
  comment: input.comment,
});
