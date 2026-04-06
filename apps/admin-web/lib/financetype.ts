export type LanguageMode = "en" | "my" | "both";

export type Role = "data_entry" | "manager";

export type VoucherType = "simple" | "journal" | "cash" | "reversal";

export type VoucherStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "posted"
  | "rejected"
  | "reversed";

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

export type AsyncState = "ready" | "loading" | "empty" | "error";

export type Tone = "blue" | "amber" | "green" | "rose" | "violet" | "slate";

export type Severity = "low" | "medium" | "high" | "critical";

export type NormalBalance = "Debit" | "Credit";

export type Bi = {
  en: string;
  my: string;
};

export type SharedFilters = {
  dateFrom: string;
  dateTo: string;
  branch: string;
  zone: string;
  search: string;
};

export type UserAccount = {
  id: string;
  name: string;
  role: Role;
  branches: string[];
  zones: string[];
  approvalLimit: number;
  canViewSensitive: boolean;
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
  normalBalance: NormalBalance;
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
  severity: Severity;
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
  tone: Extract<Tone, "blue" | "amber" | "green" | "rose">;
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

export type SimpleTransactionForm = {
  transactionDate: string;
  branch: string;
  zone: string;
  merchant: string;
  customer: string;
  accountCode: string;
  transactionType: string;
  amount: string;
  description: string;
  referenceNo: string;
  notes: string;
  attachments: number;
};

export type JournalForm = {
  voucherNo: string;
  voucherDate: string;
  branch: string;
  zone: string;
  merchant: string;
  customer: string;
  narrative: string;
  reviewerAssignment: string;
  attachments: number;
  lines: VoucherLine[];
};

export type CashVoucherForm = {
  voucherNo: string;
  voucherDate: string;
  branch: string;
  zone: string;
  receivedInAccount: string;
  receivedFromAccount: string;
  amount: string;
  paymentMethod: string;
  bankIndicator: string;
  attachments: number;
  notes: string;
};

export type AccountForm = {
  accountCode: string;
  accountTitleEn: string;
  accountTitleMy: string;
  accountType: string;
  accountGroup: string;
  accountClass: string;
  normalBalance: NormalBalance;
  parentAccount: string;
  remark: string;
};

export type DeliveryAccountingTab =
  | "cod_on_hand"
  | "cod_transferred"
  | "pending_cod"
  | "prepaid_on_hand"
  | "prepaid_transferred";

export type TransactionTab =
  | "simple"
  | "journal"
  | "cash"
  | "drafts"
  | "submitted"
  | "approved"
  | "reversal";

export type ReportTab =
  | "cash_book"
  | "journal_summary"
  | "trial_balance"
  | "income_statement"
  | "balance_sheet"
  | "profit_loss";

export type FinanceNavigationItem = {
  key: ModuleKey;
  label: Bi;
  icon: unknown;
  permission: Permission;
};

export type FinanceNavigationGroup = {
  heading: Bi;
  items: FinanceNavigationItem[];
};

export type ScopedRecord = {
  branch: string;
  zone: string;
};

export type ExportFormat = "CSV" | "XLSX" | "PDF";

export type ReportRow = {
  accountCode: string;
  accountHead: string;
  description: string;
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
};

export type ReportTotals = {
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
};

export type FinancePortalState = {
  languageMode: LanguageMode;
  activeUserId: string;
  activeModule: ModuleKey;
  moduleState: Record<ModuleKey, AsyncState>;
  filters: SharedFilters;
  deliveryTab: DeliveryAccountingTab;
  transactionTab: TransactionTab;
  reportTab: ReportTab;
  selectedVoucherId: string | null;
  vouchers: VoucherRecord[];
  accounts: AccountRecord[];
  fraudAlerts: FraudAlert[];
  auditTrail: AuditEvent[];
  monitoringFeed: MonitoringEvent[];
  codRecords: CODRecord[];
  periods: PeriodState[];
  toast: Bi | null;
  accountForm: AccountForm;
  simpleForm: SimpleTransactionForm;
  journalForm: JournalForm;
  cashForm: CashVoucherForm;
};

export type FinancePortalComputed = {
  currentUser: UserAccount;
  selectedVoucher: VoucherRecord | null;
  pendingApprovals: VoucherRecord[];
  approvedUnposted: VoucherRecord[];
  suspiciousTransactions: FraudAlert[];
  scopedCOD: CODRecord[];
  scopedVouchers: VoucherRecord[];
  scopedFraud: FraudAlert[];
  reportRows: ReportRow[];
  reportTotals: ReportTotals;
};

export type FinancePortalActions = {
  setLanguageMode: (mode: LanguageMode) => void;
  setActiveUserId: (userId: string) => void;
  setActiveModule: (module: ModuleKey) => void;
  setSelectedVoucherId: (voucherId: string | null) => void;
  setDeliveryTab: (tab: DeliveryAccountingTab) => void;
  setTransactionTab: (tab: TransactionTab) => void;
  setReportTab: (tab: ReportTab) => void;
  setModuleState: (module: ModuleKey, state: AsyncState) => void;
  setFilters: (updater: SharedFilters | ((prev: SharedFilters) => SharedFilters)) => void;
  pushToast: (message: Bi | null) => void;
  setAccountForm: (updater: AccountForm | ((prev: AccountForm) => AccountForm)) => void;
  setSimpleForm: (updater: SimpleTransactionForm | ((prev: SimpleTransactionForm) => SimpleTransactionForm)) => void;
  setJournalForm: (updater: JournalForm | ((prev: JournalForm) => JournalForm)) => void;
  setCashForm: (updater: CashVoucherForm | ((prev: CashVoucherForm) => CashVoucherForm)) => void;
  setVouchers: (updater: VoucherRecord[] | ((prev: VoucherRecord[]) => VoucherRecord[])) => void;
  setAccounts: (updater: AccountRecord[] | ((prev: AccountRecord[]) => AccountRecord[])) => void;
  setFraudAlerts: (updater: FraudAlert[] | ((prev: FraudAlert[]) => FraudAlert[])) => void;
  setAuditTrail: (updater: AuditEvent[] | ((prev: AuditEvent[]) => AuditEvent[])) => void;
  setMonitoringFeed: (updater: MonitoringEvent[] | ((prev: MonitoringEvent[]) => MonitoringEvent[])) => void;
  setCODRecords: (updater: CODRecord[] | ((prev: CODRecord[]) => CODRecord[])) => void;
  setPeriods: (updater: PeriodState[] | ((prev: PeriodState[]) => PeriodState[])) => void;
};

export type FinancePortalContextValue = FinancePortalState &
  FinancePortalComputed &
  FinancePortalActions;

export function BI(en: string, my: string): Bi {
  return { en, my };
}
