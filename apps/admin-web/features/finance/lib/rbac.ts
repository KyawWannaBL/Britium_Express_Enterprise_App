import type {
  CODRecord,
  FraudAlert,
  Permission,
  Role,
  UserAccount,
  VoucherRecord,
} from "@/features/finance/types/finance.types";

export const rolePermissions: Record<Role, Permission[]> = {
  data_entry: [
    "view_dashboard",
    "view_deliveryman_accounting",
    "view_accounts",
    "create_simple_transaction",
    "create_journal_voucher",
    "create_cash_voucher",
    "upload_evidence",
    "save_draft",
    "edit_own_draft",
    "submit_for_review",
    "view_records",
    "view_limited_dashboard",
    "request_reversal",
  ],
  manager: [
    "view_dashboard",
    "view_deliveryman_accounting",
    "view_accounts",
    "manage_accounts",
    "create_simple_transaction",
    "create_journal_voucher",
    "create_cash_voucher",
    "upload_evidence",
    "save_draft",
    "edit_own_draft",
    "submit_for_review",
    "view_records",
    "view_limited_dashboard",
    "approve_voucher",
    "reject_voucher",
    "post_voucher",
    "request_reversal",
    "approve_reversal",
    "view_sensitive_reports",
    "view_reports",
    "export_reports",
    "view_fraud_center",
    "view_real_time_monitoring",
    "view_audit_trail",
    "manage_period_close",
    "manage_thresholds",
  ],
};

type ScopedRecord = VoucherRecord | FraudAlert | CODRecord;

export const hasPermission = (user: UserAccount, permission: Permission, record?: ScopedRecord) => {
  const allowed = rolePermissions[user.role].includes(permission);
  if (!allowed) return false;

  if (record && "branch" in record) {
    const inBranchScope = user.branches.includes("*") || user.branches.includes(record.branch);
    const inZoneScope = user.zones.includes("*") || user.zones.includes(record.zone);
    if (!inBranchScope || !inZoneScope) return false;
  }

  if (record && "creatorId" in record && permission === "approve_voucher") {
    if (record.creatorId === user.id) return false;
    if (record.amount > user.approvalLimit) return false;
  }

  if (record && "creatorId" in record && permission === "post_voucher") {
    if (record.creatorId === user.id) return false;
    if (record.status !== "approved") return false;
  }

  if (record && "voucherType" in record && permission === "approve_reversal") {
    if (record.voucherType !== "reversal") return false;
    if (record.creatorId === user.id) return false;
  }

  return true;
};
