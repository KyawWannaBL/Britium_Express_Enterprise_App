export type LanguageMode = "en" | "my" | "both";
export type Role = "data_entry" | "manager";
export type VoucherType = "simple" | "journal" | "cash" | "reversal";
export type VoucherStatus = "draft" | "submitted" | "approved" | "posted" | "rejected" | "reversed";
export type ModuleKey =
  | "dashboard"
  | "deliveryman"
  | "accounts"
  | "transactions"
  | "records"
  | "ledger"
  | "reports"
  | "approval"
  | "fraud"
  | "monitoring"
  | "audit"
  | "periods";

export type Permission =
  | "view_dashboard"
  | "view_deliveryman_accounting"
  | "view_accounts"
  | "manage_accounts"
  | "create_simple_transaction"
  | "create_journal_voucher"
  | "create_cash_voucher"
  | "upload_evidence"
  | "save_draft"
  | "edit_own_draft"
  | "submit_for_review"
  | "view_records"
  | "view_limited_dashboard"
  | "approve_voucher"
  | "reject_voucher"
  | "post_voucher"
  | "request_reversal"
  | "approve_reversal"
  | "view_sensitive_reports"
  | "view_reports"
  | "export_reports"
  | "view_fraud_center"
  | "view_real_time_monitoring"
  | "view_audit_trail"
  | "manage_period_close"
  | "manage_thresholds";

export type Bi = { en: string; my: string };

export type UserAccount = {
  id: string;
  name: string;
  role: Role;
  branches: string[];
  zones: string[];
  approvalLimit: number;
  canViewSensitive: boolean;
};

export type SharedFilters = {
  dateFrom: string;
  dateTo: string;
  branch: string;
  zone: string;
  search: string;
};

export type CODRecord = {
  id: string;
  deliveryman: string;
  branch: string;
  zone: string;
  codOnHand: number;
  codTransferred: number;
  pendingCollection: number;
  prepaidOnHand: number;
  prepaidTransferred: number;
  outstandingDays: number;
  latestTransferDate: string;
  historicalNorm: number;
  exceptionStatus: Bi;
};

export type AccountRecord = {
  id: string;
  accountCode: string;
  accountTitle: Bi;
  accountType: Bi;
  accountGroup: Bi;
  accountClass: Bi;
  normalBalance: "Debit" | "Credit";
  parentAccount: string;
  active: boolean;
  protected: boolean;
  remark: string;
  createdBy: string;
  updatedBy: string;
  updatedDate: string;
};

export type VoucherLine = {
  id: string;
  accountCode: string;
  description: string;
  debit: number;
  credit: number;
};

export type VoucherRecord = {
  id: string;
  voucherNo: string;
  referenceNo: string;
  voucherType: VoucherType;
  voucherDate: string;
  branch: string;
  zone: string;
  merchant: string;
  customer: string;
  narrative: string;
  amount: number;
  status: VoucherStatus;
  creatorId: string;
  creatorName: string;
  approverId?: string;
  approverName?: string;
  riskScore: number;
  attachmentCount: number;
  accountCategory: string;
  lines: VoucherLine[];
  postedAt?: string;
  rejectedReason?: string;
  reviewNotes?: string;
};

export type FraudAlert = {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  title: Bi;
  description: Bi;
  branch: string;
  zone: string;
  voucherNo?: string;
  reviewer: string;
  caseStatus: Bi;
  createdAt: string;
  rule: string;
};

export type AuditEvent = {
  id: string;
  user: string;
  role: Role;
  action: Bi;
  timestamp: string;
  reference: string;
  beforeValue?: string;
  afterValue?: string;
  ip: string;
  device: string;
  comment?: string;
};

export type MonitoringEvent = {
  id: string;
  title: Bi;
  subtitle: Bi;
  branch: string;
  zone: string;
  tone: "blue" | "amber" | "green" | "rose";
  timestamp: string;
};

export type PeriodState = {
  month: string;
  closed: boolean;
  outstandingApprovals: number;
  unresolvedExceptions: number;
  pendingReconciliations: number;
  notes: string;
};

export type AsyncState = "ready" | "loading" | "empty" | "error";

export type FinancePortalState = {
  languageMode: LanguageMode;
  activeUserId: string;
  activeModule: ModuleKey;
  moduleState: Record<ModuleKey, AsyncState>;
  filters: SharedFilters;
  selectedVoucherId: string | null;
  voucherData: VoucherRecord[];
  accountData: AccountRecord[];
  fraudData: FraudAlert[];
  auditTrail: AuditEvent[];
  periodData: PeriodState[];
  toast: Bi | null;
};
