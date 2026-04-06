#!/usr/bin/env bash
set -euo pipefail

ROOT="/d/Britium_Express_Enterprise_App/apps/admin-web"
ROUTE_FILE="$ROOT/app/finance-accounting-portal/page.tsx"

if [ ! -d "$ROOT" ]; then
  echo "ERROR: admin-web root not found: $ROOT"
  exit 1
fi

if [ ! -f "$ROUTE_FILE" ]; then
  echo "ERROR: expected route file not found: $ROUTE_FILE"
  exit 1
fi

write_file() {
  local path="$1"
  mkdir -p "$(dirname "$path")"
  cat > "$path"
}

create_module_placeholder() {
  local path="$1"
  local component="$2"
  local title_en="$3"
  local title_my="$4"
  local subtitle_en="$5"
  local subtitle_my="$6"

  write_file "$path" <<EOT
"use client";

import { useFinancePortal } from "@/features/finance/context/FinancePortalContext";
import { getBiText } from "@/features/finance/utils/bilingual";
import { SurfaceCard } from "@/components/finance/controls/SurfaceCard";
import { SectionTitle } from "@/components/finance/controls/SectionTitle";

export function $component() {
  const { languageMode } = useFinancePortal();

  return (
    <div className="space-y-4">
      <SectionTitle
        title={getBiText({ en: "$title_en", my: "$title_my" }, languageMode)}
        subtitle={getBiText({ en: "$subtitle_en", my: "$subtitle_my" }, languageMode)}
      />
      <SurfaceCard>
        <p className="text-sm text-slate-600">
          {getBiText(
            {
              en: "Scaffold created and compatible with the current finance portal page structure.",
              my: "လက်ရှိ finance portal page structure နှင့် ကိုက်ညီသော scaffold ကို ဖန်တီးပြီးဖြစ်သည်။",
            },
            languageMode
          )}
        </p>
      </SurfaceCard>
    </div>
  );
}
EOT
}

echo "Creating finance portal scaffold under: $ROOT"

mkdir -p \
  "$ROOT/components/finance/controls" \
  "$ROOT/components/finance/modules" \
  "$ROOT/features/finance/constants" \
  "$ROOT/features/finance/context" \
  "$ROOT/features/finance/data" \
  "$ROOT/features/finance/hooks" \
  "$ROOT/features/finance/lib" \
  "$ROOT/features/finance/types" \
  "$ROOT/features/finance/utils"

write_file "$ROOT/features/finance/types/finance.types.ts" <<'EOT'
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
EOT

write_file "$ROOT/features/finance/constants/branches.ts" <<'EOT'
export const BRANCHES = [
  "All Branches",
  "Yangon HQ",
  "Mandalay Branch",
  "Naypyitaw Branch",
  "Bago Branch",
] as const;

export const ZONES = [
  "All Zones",
  "North",
  "South",
  "Central",
  "East",
  "West",
] as const;
EOT

write_file "$ROOT/features/finance/constants/labels.ts" <<'EOT'
import type { Bi } from "@/features/finance/types/finance.types";

export const PORTAL_TITLE: Bi = {
  en: "Finance & Accounting Portal",
  my: "ဘဏ္ဍာရေးနှင့် စာရင်းအင်း Portal",
};
EOT

write_file "$ROOT/features/finance/constants/navigation.ts" <<'EOT'
import type { Bi, ModuleKey, Permission } from "@/features/finance/types/finance.types";

export type FinanceNavGroup = {
  heading: Bi;
  items: Array<{
    key: ModuleKey;
    label: Bi;
    permission: Permission;
  }>;
};

export const financeNavigation: FinanceNavGroup[] = [
  {
    heading: { en: "Finance Operations", my: "ငွေကြေးဆိုင်ရာလုပ်ငန်းဆောင်ရွက်မှုများ" },
    items: [
      { key: "dashboard", label: { en: "Dashboard", my: "ဒက်ရှ်ဘုတ်" }, permission: "view_dashboard" },
      { key: "deliveryman", label: { en: "Deliveryman Accounting", my: "ပို့ဆောင်သူငွေစာရင်း" }, permission: "view_deliveryman_accounting" },
      { key: "accounts", label: { en: "Chart of Accounts", my: "စာရင်းခေါင်းစဉ်များ" }, permission: "view_accounts" },
      { key: "transactions", label: { en: "Transactions", my: "လုပ်ငန်းသွင်းငွေစာရင်း" }, permission: "view_records" },
      { key: "records", label: { en: "Voucher Records", my: "voucher မှတ်တမ်းများ" }, permission: "view_records" },
      { key: "ledger", label: { en: "General Ledger", my: "အထွေထွေ ledger" }, permission: "view_records" },
    ],
  },
  {
    heading: { en: "Reports & Statements", my: "အစီရင်ခံစာများနှင့် စာရင်းရှင်းတမ်းများ" },
    items: [
      { key: "reports", label: { en: "Financial Reports", my: "ငွေကြေးအစီရင်ခံစာများ" }, permission: "view_reports" },
    ],
  },
  {
    heading: { en: "Controls & Monitoring", my: "ထိန်းချုပ်မှုနှင့် စောင့်ကြည့်မှု" },
    items: [
      { key: "approval", label: { en: "Approval Queue", my: "အတည်ပြုရန်စောင့်ဆိုင်းဇယား" }, permission: "approve_voucher" },
      { key: "fraud", label: { en: "Fraud Center", my: "လိမ်လည်မှုထိန်းချုပ်ရေးစင်တာ" }, permission: "view_fraud_center" },
      { key: "monitoring", label: { en: "Real-Time Monitoring", my: "တိုက်ရိုက်စောင့်ကြည့်မှု" }, permission: "view_real_time_monitoring" },
      { key: "audit", label: { en: "Audit Trail", my: "စစ်ဆေးမှုမှတ်တမ်း" }, permission: "view_audit_trail" },
      { key: "periods", label: { en: "Period Closing", my: "လအပိတ်စီမံခန့်ခွဲမှု" }, permission: "manage_period_close" },
    ],
  },
];
EOT

write_file "$ROOT/features/finance/utils/bilingual.ts" <<'EOT'
import type { Bi, LanguageMode } from "@/features/finance/types/finance.types";

export const BI = (en: string, my: string): Bi => ({ en, my });

export const getBiText = (text: Bi, mode: LanguageMode) => {
  if (mode === "my") return text.my;
  if (mode === "both") return `${text.en} / ${text.my}`;
  return text.en;
};
EOT

write_file "$ROOT/features/finance/utils/formatters.ts" <<'EOT'
export const formatMoney = (value: number) => `${Number(value || 0).toLocaleString()} Ks`;
export const formatNumber = (value: number) => Number(value || 0).toLocaleString();
export const formatDate = (value: string) => value || "-";
EOT

write_file "$ROOT/features/finance/utils/audit.ts" <<'EOT'
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
EOT

write_file "$ROOT/features/finance/data/financeSeed.ts" <<'EOT'
import { BRANCHES, ZONES } from "@/features/finance/constants/branches";
import { BI } from "@/features/finance/utils/bilingual";
import type {
  AccountRecord,
  AuditEvent,
  CODRecord,
  FraudAlert,
  MonitoringEvent,
  PeriodState,
  UserAccount,
  VoucherRecord,
} from "@/features/finance/types/finance.types";

export const users: UserAccount[] = [
  {
    id: "u-entry-1",
    name: "Ma Su Mon",
    role: "data_entry",
    branches: ["Yangon HQ", "Mandalay Branch"],
    zones: ["North", "Central"],
    approvalLimit: 0,
    canViewSensitive: false,
  },
  {
    id: "u-manager-1",
    name: "Ko Htet Aung",
    role: "manager",
    branches: ["*"],
    zones: ["*"],
    approvalLimit: 10000000,
    canViewSensitive: true,
  },
];

export const branches = [...BRANCHES];
export const zones = [...ZONES];

export const codRecords: CODRecord[] = [
  {
    id: "d1",
    deliveryman: "Aung Min Htet",
    branch: "Yangon HQ",
    zone: "Central",
    codOnHand: 182000,
    codTransferred: 320000,
    pendingCollection: 76000,
    prepaidOnHand: 0,
    prepaidTransferred: 86000,
    outstandingDays: 4,
    latestTransferDate: "2026-04-05 04:10 PM",
    historicalNorm: 70000,
    exceptionStatus: BI("Delayed transfer risk", "လွှဲပြောင်းမှုနောက်ကျမှုအန္တရာယ်"),
  },
];

export const accountData: AccountRecord[] = [
  {
    id: "a1",
    accountCode: "1010",
    accountTitle: BI("Cash on Hand", "လက်ဝယ်ငွေသား"),
    accountType: BI("Asset", "ပိုင်ဆိုင်မှု"),
    accountGroup: BI("Current Asset", "လက်ရှိပိုင်ဆိုင်မှု"),
    accountClass: BI("Cash", "ငွေသား"),
    normalBalance: "Debit",
    parentAccount: "1000",
    active: true,
    protected: true,
    remark: "System-controlled cash book account",
    createdBy: "System",
    updatedBy: "Ko Htet Aung",
    updatedDate: "2026-04-01",
  },
];

export const voucherData: VoucherRecord[] = [
  {
    id: "v1",
    voucherNo: "JV-2026-0041",
    referenceNo: "REF-90014",
    voucherType: "journal",
    voucherDate: "2026-04-05",
    branch: "Yangon HQ",
    zone: "Central",
    merchant: "Shwe Mart",
    customer: "",
    narrative: "COD clearing entry for merchant settlement",
    amount: 480000,
    status: "submitted",
    creatorId: "u-entry-1",
    creatorName: "Ma Su Mon",
    riskScore: 68,
    attachmentCount: 2,
    accountCategory: "Merchant Payable",
    reviewNotes: "Awaiting manager review",
    lines: [
      { id: "l1", accountCode: "1010", description: "Cash on Hand", debit: 480000, credit: 0 },
      { id: "l2", accountCode: "2020", description: "Merchant Payable", debit: 0, credit: 480000 },
    ],
  },
];

export const fraudData: FraudAlert[] = [
  {
    id: "f1",
    severity: "critical",
    title: BI("Duplicate voucher reference detected", "voucher reference ထပ်နေမှု တွေ့ရှိ"),
    description: BI("Reference REF-90014 appears twice across two branches.", "REF-90014 သည် ရုံးခွဲနှစ်ခုတွင် နှစ်ကြိမ်တွေ့ရှိနေသည်။"),
    branch: "Yangon HQ",
    zone: "Central",
    voucherNo: "JV-2026-0041",
    reviewer: "Ko Htet Aung",
    caseStatus: BI("Open Investigation", "စုံစမ်းဆဲ"),
    createdAt: "2026-04-06 10:10 AM",
    rule: "Duplicate reference detection",
  },
];

export const auditTrail: AuditEvent[] = [
  {
    id: "e1",
    user: "Ma Su Mon",
    role: "data_entry",
    action: BI("Created Journal Voucher", "Journal Voucher ဖန်တီးခဲ့သည်"),
    timestamp: "2026-04-05 03:12 PM",
    reference: "JV-2026-0041",
    beforeValue: "-",
    afterValue: "Draft created",
    ip: "172.16.8.45",
    device: "Chrome / Windows",
    comment: "Initial merchant COD clearing entry",
  },
];

export const monitoringData: MonitoringEvent[] = [
  {
    id: "m1",
    title: BI("High-risk journal submitted", "အန္တရာယ်မြင့် journal တင်သွင်းထားသည်"),
    subtitle: BI("JV-2026-0041 entered approval queue", "JV-2026-0041 ကို approval queue သို့ထည့်သွင်းထားသည်"),
    branch: "Yangon HQ",
    zone: "Central",
    tone: "amber",
    timestamp: "11 sec ago",
  },
];

export const periodData: PeriodState[] = [
  {
    month: "2026-03",
    closed: true,
    outstandingApprovals: 0,
    unresolvedExceptions: 1,
    pendingReconciliations: 0,
    notes: "Closed with one monitored exception",
  },
  {
    month: "2026-04",
    closed: false,
    outstandingApprovals: 5,
    unresolvedExceptions: 4,
    pendingReconciliations: 2,
    notes: "Open operational period",
  },
];
EOT

write_file "$ROOT/features/finance/lib/rbac.ts" <<'EOT'
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
EOT

write_file "$ROOT/features/finance/lib/filters.ts" <<'EOT'
import type {
  CODRecord,
  FraudAlert,
  SharedFilters,
  UserAccount,
  VoucherRecord,
} from "@/features/finance/types/finance.types";

export const inScope = (user: UserAccount, branch: string, zone: string) => {
  const branchOk = user.branches.includes("*") || user.branches.includes(branch);
  const zoneOk = user.zones.includes("*") || user.zones.includes(zone);
  return branchOk && zoneOk;
};

export const applyVoucherFilters = (
  vouchers: VoucherRecord[],
  filters: SharedFilters,
  user: UserAccount
) =>
  vouchers.filter((voucher) => {
    if (!inScope(user, voucher.branch, voucher.zone)) return false;
    const branchOk = filters.branch === "All Branches" || voucher.branch === filters.branch;
    const zoneOk = filters.zone === "All Zones" || voucher.zone === filters.zone;
    const query = filters.search.toLowerCase();
    const searchOk =
      !query ||
      voucher.voucherNo.toLowerCase().includes(query) ||
      voucher.referenceNo.toLowerCase().includes(query) ||
      voucher.creatorName.toLowerCase().includes(query) ||
      voucher.merchant.toLowerCase().includes(query);
    return branchOk && zoneOk && searchOk;
  });

export const applyCODFilters = (
  rows: CODRecord[],
  filters: SharedFilters,
  user: UserAccount
) =>
  rows.filter((row) => {
    if (!inScope(user, row.branch, row.zone)) return false;
    const branchOk = filters.branch === "All Branches" || row.branch === filters.branch;
    const zoneOk = filters.zone === "All Zones" || row.zone === filters.zone;
    const query = filters.search.toLowerCase();
    const searchOk =
      !query ||
      row.deliveryman.toLowerCase().includes(query) ||
      row.branch.toLowerCase().includes(query) ||
      row.zone.toLowerCase().includes(query);
    return branchOk && zoneOk && searchOk;
  });

export const applyFraudFilters = (
  rows: FraudAlert[],
  filters: SharedFilters,
  user: UserAccount
) =>
  rows.filter((row) => {
    if (!inScope(user, row.branch, row.zone)) return false;
    const branchOk = filters.branch === "All Branches" || row.branch === filters.branch;
    const zoneOk = filters.zone === "All Zones" || row.zone === filters.zone;
    return branchOk && zoneOk;
  });
EOT

write_file "$ROOT/features/finance/lib/fraudRules.ts" <<'EOT'
import { BI } from "@/features/finance/utils/bilingual";
import type { CODRecord, FraudAlert, VoucherRecord } from "@/features/finance/types/finance.types";

export const detectCODRisk = (row: CODRecord) =>
  row.codOnHand > row.historicalNorm * 2 || row.outstandingDays > 5 || row.prepaidOnHand < 0;

export const scoreVoucherRisk = (voucher: VoucherRecord) => {
  let score = 0;
  if (voucher.attachmentCount === 0) score += 25;
  if (voucher.amount > 300000) score += 35;
  if (voucher.voucherType === "reversal") score += 20;
  return score;
};

export const buildFraudAlerts = (vouchers: VoucherRecord[], cod: CODRecord[]): FraudAlert[] => {
  return [
    ...vouchers
      .filter((voucher) => scoreVoucherRisk(voucher) >= 50)
      .map((voucher) => ({
        id: `fraud-v-${voucher.id}`,
        severity: voucher.amount > 300000 ? "high" : "medium",
        title: BI("Suspicious voucher pattern", "မူမမှန်သော voucher pattern"),
        description: BI(
          `${voucher.voucherNo} triggered the risk rules.`,
          `${voucher.voucherNo} သည် risk rule များကို trigger လုပ်ထားသည်။`
        ),
        branch: voucher.branch,
        zone: voucher.zone,
        voucherNo: voucher.voucherNo,
        reviewer: "Unassigned",
        caseStatus: BI("Open", "ဖွင့်ထားသည်"),
        createdAt: new Date().toLocaleString(),
        rule: "Voucher risk scoring",
      })),
    ...cod
      .filter(detectCODRisk)
      .map((row) => ({
        id: `fraud-c-${row.id}`,
        severity: "high",
        title: BI("Unusual COD on hand", "COD လက်ဝယ်ငွေပမာဏ မူမမှန်"),
        description: BI(
          `${row.deliveryman} exceeds the historical threshold.`,
          `${row.deliveryman} သည် သမိုင်းဆိုင်ရာ threshold ကို ကျော်လွန်နေသည်။`
        ),
        branch: row.branch,
        zone: row.zone,
        reviewer: "Unassigned",
        caseStatus: BI("Open", "ဖွင့်ထားသည်"),
        createdAt: new Date().toLocaleString(),
        rule: "Historical deviation threshold",
      })),
  ];
};
EOT

write_file "$ROOT/features/finance/lib/postingRules.ts" <<'EOT'
import type { PeriodState } from "@/features/finance/types/finance.types";

export const isLockedPeriod = (dateValue: string, periods: PeriodState[]) => {
  const month = dateValue.slice(0, 7);
  return periods.some((period) => period.month === month && period.closed);
};
EOT

write_file "$ROOT/features/finance/lib/reportCalculations.ts" <<'EOT'
import type { VoucherRecord } from "@/features/finance/types/finance.types";

export const buildReportRows = (vouchers: VoucherRecord[]) =>
  vouchers.map((voucher) => ({
    accountCode: voucher.lines[0]?.accountCode ?? "-",
    accountHead: voucher.accountCategory,
    description: voucher.narrative,
    openingDebit: Math.round(voucher.amount * 0.15),
    openingCredit: Math.round(voucher.amount * 0.10),
    periodDebit: voucher.lines.reduce((sum, line) => sum + line.debit, 0),
    periodCredit: voucher.lines.reduce((sum, line) => sum + line.credit, 0),
    closingDebit: Math.round(voucher.amount * 0.25),
    closingCredit: Math.round(voucher.amount * 0.20),
  }));
EOT

write_file "$ROOT/features/finance/lib/validations.ts" <<'EOT'
import { BI } from "@/features/finance/utils/bilingual";
import { isLockedPeriod } from "@/features/finance/lib/postingRules";
import type {
  AccountRecord,
  Bi,
  PeriodState,
  VoucherRecord,
} from "@/features/finance/types/finance.types";

export const validateSimpleTransaction = (
  form: {
    transactionDate: string;
    accountCode: string;
    amount: string;
    referenceNo: string;
    attachments: number;
  },
  accounts: AccountRecord[],
  vouchers: VoucherRecord[],
  periods: PeriodState[]
): Bi | null => {
  if (!form.transactionDate || !form.accountCode || !form.amount || !form.referenceNo) {
    return BI("Required fields are missing", "လိုအပ်သော field များမပြည့်စုံပါ");
  }
  if (isLockedPeriod(form.transactionDate, periods)) {
    return BI("Posting period is locked", "posting လုပ်မည့်ကာလကို lock လုပ်ထားသည်");
  }
  const account = accounts.find((a) => a.accountCode === form.accountCode);
  if (!account || !account.active) {
    return BI("Selected account is inactive", "ရွေးချယ်ထားသော account သည် inactive ဖြစ်နေသည်");
  }
  if (vouchers.some((v) => v.referenceNo === form.referenceNo)) {
    return BI("Duplicate reference number detected", "reference number ထပ်နေသည်");
  }
  if (Number(form.amount) > 80000 && form.attachments === 0) {
    return BI("Attachment is mandatory above threshold", "threshold ကျော်လျှင် attachment လိုအပ်သည်");
  }
  return null;
};
EOT

write_file "$ROOT/features/finance/context/FinancePortalContext.tsx" <<'EOT'
"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import {
  accountData as seedAccounts,
  auditTrail as seedAuditTrail,
  branches as seedBranches,
  codRecords as seedCOD,
  fraudData as seedFraud,
  monitoringData as seedMonitoring,
  periodData as seedPeriods,
  users as seedUsers,
  voucherData as seedVouchers,
  zones as seedZones,
} from "@/features/finance/data/financeSeed";
import type {
  AsyncState,
  Bi,
  FinancePortalState,
  ModuleKey,
  SharedFilters,
  VoucherRecord,
} from "@/features/finance/types/finance.types";

type FinancePortalContextValue = FinancePortalState & {
  currentUser: FinancePortalState["activeUserId"] extends string ? any : never;
  setLanguageMode: (value: FinancePortalState["languageMode"]) => void;
  setActiveUserId: (value: string) => void;
  setActiveModule: (value: ModuleKey) => void;
  setFilters: (value: Partial<SharedFilters>) => void;
  setSelectedVoucherId: (value: string | null) => void;
  setModuleAsyncState: (module: ModuleKey, state: AsyncState) => void;
  pushToast: (value: Bi) => void;
  clearToast: () => void;
  setVoucherData: React.Dispatch<React.SetStateAction<VoucherRecord[]>>;
  setAccountData: React.Dispatch<React.SetStateAction<FinancePortalState["accountData"]>>;
  setFraudData: React.Dispatch<React.SetStateAction<FinancePortalState["fraudData"]>>;
  setAuditTrail: React.Dispatch<React.SetStateAction<FinancePortalState["auditTrail"]>>;
  setPeriodData: React.Dispatch<React.SetStateAction<FinancePortalState["periodData"]>>;
};

const moduleStateSeed: Record<ModuleKey, AsyncState> = {
  dashboard: "ready",
  deliveryman: "ready",
  accounts: "ready",
  transactions: "ready",
  records: "ready",
  ledger: "ready",
  reports: "ready",
  approval: "ready",
  fraud: "ready",
  monitoring: "ready",
  audit: "ready",
  periods: "ready",
};

const FinancePortalContext = createContext<FinancePortalContextValue | undefined>(undefined);

export function FinancePortalProvider({ children }: { children: React.ReactNode }) {
  const [languageMode, setLanguageMode] = useState<FinancePortalState["languageMode"]>("both");
  const [activeUserId, setActiveUserId] = useState(seedUsers[0]?.id || "");
  const [activeModule, setActiveModule] = useState<ModuleKey>("dashboard");
  const [moduleState, setModuleState] = useState(moduleStateSeed);
  const [filtersState, setFiltersState] = useState<SharedFilters>({
    dateFrom: "2026-04-01",
    dateTo: "2026-04-30",
    branch: "All Branches",
    zone: "All Zones",
    search: "",
  });
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null);
  const [voucherData, setVoucherData] = useState(seedVouchers);
  const [accountData, setAccountData] = useState(seedAccounts);
  const [fraudData, setFraudData] = useState(seedFraud);
  const [auditTrail, setAuditTrail] = useState(seedAuditTrail);
  const [periodData, setPeriodData] = useState(seedPeriods);
  const [toast, setToast] = useState<Bi | null>(null);

  const currentUser = useMemo(
    () => seedUsers.find((u) => u.id === activeUserId) ?? seedUsers[0],
    [activeUserId]
  );

  const value = useMemo(
    () => ({
      languageMode,
      activeUserId,
      activeModule,
      moduleState,
      filters: filtersState,
      selectedVoucherId,
      voucherData,
      accountData,
      fraudData,
      auditTrail,
      periodData,
      toast,
      users: seedUsers,
      branches: seedBranches,
      zones: seedZones,
      codRecords: seedCOD,
      monitoringData: seedMonitoring,
      currentUser,
      setLanguageMode,
      setActiveUserId,
      setActiveModule,
      setFilters: (value: Partial<SharedFilters>) =>
        setFiltersState((prev) => ({ ...prev, ...value })),
      setSelectedVoucherId,
      setModuleAsyncState: (module: ModuleKey, state: AsyncState) =>
        setModuleState((prev) => ({ ...prev, [module]: state })),
      pushToast: (value: Bi) => {
        setToast(value);
        window.setTimeout(() => setToast(null), 2400);
      },
      clearToast: () => setToast(null),
      setVoucherData,
      setAccountData,
      setFraudData,
      setAuditTrail,
      setPeriodData,
    }),
    [
      languageMode,
      activeUserId,
      activeModule,
      moduleState,
      filtersState,
      selectedVoucherId,
      voucherData,
      accountData,
      fraudData,
      auditTrail,
      periodData,
      toast,
      currentUser,
    ]
  );

  return (
    <FinancePortalContext.Provider value={value}>
      {children}
    </FinancePortalContext.Provider>
  );
}

export function useFinancePortal() {
  const ctx = useContext(FinancePortalContext);
  if (!ctx) throw new Error("useFinancePortal must be used inside FinancePortalProvider");
  return ctx;
}
EOT

write_file "$ROOT/features/finance/hooks/useFinancePermissions.ts" <<'EOT'
"use client";

import { useFinancePortal } from "@/features/finance/context/FinancePortalContext";
import { hasPermission } from "@/features/finance/lib/rbac";
import type { CODRecord, FraudAlert, Permission, VoucherRecord } from "@/features/finance/types/finance.types";

export function useFinancePermissions() {
  const { currentUser } = useFinancePortal();
  return {
    has: (permission: Permission, record?: VoucherRecord | FraudAlert | CODRecord) =>
      currentUser ? hasPermission(currentUser, permission, record) : false,
  };
}
EOT

write_file "$ROOT/features/finance/hooks/useScopedFinanceData.ts" <<'EOT'
"use client";

import { useMemo } from "react";
import { useFinancePortal } from "@/features/finance/context/FinancePortalContext";
import { applyCODFilters, applyFraudFilters, applyVoucherFilters } from "@/features/finance/lib/filters";

export function useScopedFinanceData() {
  const {
    currentUser,
    filters,
    voucherData,
    fraudData,
    periodData,
    codRecords,
  } = useFinancePortal();

  return useMemo(() => {
    if (!currentUser) {
      return {
        scopedCOD: [],
        scopedVouchers: [],
        scopedFraud: [],
        pendingApprovals: [],
        approvedUnposted: [],
        suspiciousTransactions: [],
      };
    }

    const scopedCOD = applyCODFilters(codRecords, filters, currentUser);
    const scopedVouchers = applyVoucherFilters(voucherData, filters, currentUser);
    const scopedFraud = applyFraudFilters(fraudData, filters, currentUser);

    return {
      scopedCOD,
      scopedVouchers,
      scopedFraud,
      pendingApprovals: scopedVouchers.filter((v) => v.status === "submitted"),
      approvedUnposted: scopedVouchers.filter((v) => v.status === "approved"),
      suspiciousTransactions: scopedFraud.filter((a) => a.severity === "critical" || a.severity === "high"),
      periodData,
    };
  }, [currentUser, filters, voucherData, fraudData, periodData, codRecords]);
}
EOT

write_file "$ROOT/features/finance/hooks/useFinanceExports.ts" <<'EOT'
"use client";

import { useFinancePortal } from "@/features/finance/context/FinancePortalContext";
import { BI } from "@/features/finance/utils/bilingual";

export function useFinanceExports() {
  const { pushToast } = useFinancePortal();

  const exportReport = async (format: "csv" | "xlsx" | "pdf", payload: unknown, context: string) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `${context}.${format}.json`;
    a.click();
    URL.revokeObjectURL(href);
    pushToast(BI("Export prepared", "export အဆင်သင့်ဖြစ်ပါပြီ"));
  };

  return { exportReport };
}
EOT

write_file "$ROOT/features/finance/hooks/useVoucherActions.ts" <<'EOT'
"use client";

import { useFinancePortal } from "@/features/finance/context/FinancePortalContext";
import { buildAuditEvent } from "@/features/finance/utils/audit";
import { BI } from "@/features/finance/utils/bilingual";
import type { VoucherRecord, VoucherStatus } from "@/features/finance/types/finance.types";

export function useVoucherActions() {
  const {
    currentUser,
    setVoucherData,
    setAuditTrail,
    pushToast,
  } = useFinancePortal();

  const applyStatus = async (voucher: VoucherRecord, nextStatus: VoucherStatus, comment?: string) => {
    if (!currentUser) return;

    setVoucherData((prev) =>
      prev.map((row) =>
        row.id === voucher.id
          ? {
              ...row,
              status: nextStatus,
              approverId: currentUser.id,
              approverName: currentUser.name,
              postedAt: nextStatus === "posted" ? new Date().toLocaleString() : row.postedAt,
              rejectedReason: nextStatus === "rejected" ? comment : row.rejectedReason,
              reviewNotes: comment || row.reviewNotes,
            }
          : row
      )
    );

    setAuditTrail((prev) => [
      buildAuditEvent({
        user: currentUser.name,
        role: currentUser.role,
        action: BI(`Changed voucher status to ${nextStatus}`, `voucher အခြေအနေကို ${nextStatus} သို့ပြောင်းလဲခဲ့သည်`),
        reference: voucher.voucherNo,
        beforeValue: voucher.status,
        afterValue: nextStatus,
        comment,
      }),
      ...prev,
    ]);

    pushToast(BI(`Voucher ${nextStatus}`, `voucher ကို ${nextStatus} လုပ်ပြီး`));
  };

  return { applyStatus };
}
EOT

write_file "$ROOT/components/finance/controls/SurfaceCard.tsx" <<'EOT'
import React from "react";

export function SurfaceCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </section>
  );
}
EOT

write_file "$ROOT/components/finance/controls/Surfac_eCard.tsx" <<'EOT'
export { SurfaceCard } from "./SurfaceCard";
EOT

write_file "$ROOT/components/finance/controls/DarkCard.tsx" <<'EOT'
import React from "react";

export function DarkCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[28px] border border-slate-800 bg-slate-900 p-5 text-white shadow-lg ${className}`}>
      {children}
    </section>
  );
}
EOT

write_file "$ROOT/components/finance/controls/ActionButton.tsx" <<'EOT'
import React from "react";

export function ActionButton({
  children,
  tone = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary" | "danger";
}) {
  const styles =
    tone === "secondary"
      ? "border border-slate-200 bg-white text-slate-700"
      : tone === "danger"
      ? "bg-rose-600 text-white"
      : "bg-[#0d2c54] text-white";

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.16em] disabled:opacity-50 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
EOT

write_file "$ROOT/components/finance/controls/StatusBadge.tsx" <<'EOT'
import type { Bi } from "@/features/finance/types/finance.types";
import { useFinancePortal } from "@/features/finance/context/FinancePortalContext";
import { getBiText } from "@/features/finance/utils/bilingual";

export function StatusBadge({
  text,
  tone = "blue",
}: {
  text: Bi;
  tone?: "blue" | "amber" | "green" | "rose" | "violet" | "slate";
}) {
  const { languageMode } = useFinancePortal();
  const palette = {
    blue: "bg-sky-50 text-sky-700 border-sky-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    violet: "bg-violet-50 text-violet-700 border-violet-100",
    slate: "bg-slate-50 text-slate-700 border-slate-200",
  }[tone];

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-black ${palette}`}>
      {getBiText(text, languageMode)}
    </span>
  );
}
EOT

write_file "$ROOT/components/finance/controls/MetricCard.tsx" <<'EOT'
import type { Bi } from "@/features/finance/types/finance.types";
import { SurfaceCard } from "@/components/finance/controls/SurfaceCard";
import { useFinancePortal } from "@/features/finance/context/FinancePortalContext";
import { getBiText } from "@/features/finance/utils/bilingual";

export function MetricCard({
  label,
  value,
}: {
  label: Bi;
  value: string;
}) {
  const { languageMode } = useFinancePortal();

  return (
    <SurfaceCard className="p-4">
      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
        {getBiText(label, languageMode)}
      </div>
      <div className="mt-3 text-2xl font-black text-[#0d2c54]">{value}</div>
    </SurfaceCard>
  );
}
EOT

write_file "$ROOT/components/finance/controls/SectionTitle.tsx" <<'EOT'
export function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="border-b border-slate-200 pb-4">
      <h2 className="text-xl font-black text-[#0d2c54]">{title}</h2>
      {subtitle ? <p className="mt-2 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );
}
EOT

write_file "$ROOT/components/finance/controls/TextInput.tsx" <<'EOT'
import React from "react";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-[#0d2c54] outline-none ${props.className || ""}`}
    />
  );
}
EOT

write_file "$ROOT/components/finance/controls/SelectInput.tsx" <<'EOT'
import React from "react";

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-[#0d2c54] outline-none ${props.className || ""}`}
    />
  );
}
EOT

write_file "$ROOT/components/finance/controls/TextArea.tsx" <<'EOT'
import React from "react";

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-[#0d2c54] outline-none ${props.className || ""}`}
    />
  );
}
EOT

write_file "$ROOT/components/finance/AccessDenied.tsx" <<'EOT'
"use client";

import { useFinancePortal } from "@/features/finance/context/FinancePortalContext";
import { getBiText } from "@/features/finance/utils/bilingual";

export function AccessDenied() {
  const { languageMode } = useFinancePortal();

  return (
    <div className="rounded-[28px] border border-amber-200 bg-amber-50 px-8 py-10">
      <div className="text-lg font-black text-amber-700">
        {getBiText(
          { en: "Access restricted by role-based policy", my: "RBAC မူဝါဒအရ အသုံးပြုခွင့်ကန့်သတ်ထားသည်" },
          languageMode
        )}
      </div>
    </div>
  );
}
EOT

write_file "$ROOT/components/finance/AsyncStateView.tsx" <<'EOT'
"use client";

import React from "react";
import type { AsyncState } from "@/features/finance/types/finance.types";
import { useFinancePortal } from "@/features/finance/context/FinancePortalContext";
import { getBiText } from "@/features/finance/utils/bilingual";
import { ActionButton } from "@/components/finance/controls/ActionButton";

export function AsyncStateView({
  state,
  onRetry,
  children,
}: {
  state: AsyncState;
  onRetry: () => void;
  children: React.ReactNode;
}) {
  const { languageMode } = useFinancePortal();

  if (state === "loading") {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/60 px-8 py-12 text-center">
        {getBiText({ en: "Loading finance workspace...", my: "Finance workspace ကို တင်နေသည်..." }, languageMode)}
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/60 px-8 py-12 text-center">
        {getBiText(
          { en: "No records matched your current filters", my: "လက်ရှိ filter များနှင့် ကိုက်ညီသောမှတ်တမ်းမတွေ့ရှိပါ" },
          languageMode
        )}
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-8 py-12 text-center">
        <div className="text-lg font-black text-rose-700">
          {getBiText({ en: "Unable to load this module", my: "ဤ module ကို မတင်နိုင်ပါ" }, languageMode)}
        </div>
        <div className="mt-4">
          <ActionButton onClick={onRetry}>Retry</ActionButton>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
EOT

write_file "$ROOT/components/finance/VoucherDetailDrawer.tsx" <<'EOT'
"use client";

import { useMemo } from "react";
import { useFinancePortal } from "@/features/finance/context/FinancePortalContext";
import { SurfaceCard } from "@/components/finance/controls/SurfaceCard";
import { ActionButton } from "@/components/finance/controls/ActionButton";
import { formatMoney } from "@/features/finance/utils/formatters";

export function VoucherDetailDrawer() {
  const { selectedVoucherId, setSelectedVoucherId, voucherData } = useFinancePortal();

  const selectedVoucher = useMemo(
    () => voucherData.find((voucher) => voucher.id === selectedVoucherId) ?? null,
    [voucherData, selectedVoucherId]
  );

  if (!selectedVoucher) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-slate-50 p-4 shadow-2xl">
      <SurfaceCard>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-[#0d2c54]">{selectedVoucher.voucherNo}</h3>
            <p className="mt-1 text-sm text-slate-500">{selectedVoucher.narrative}</p>
          </div>
          <ActionButton tone="secondary" onClick={() => setSelectedVoucherId(null)}>
            Close
          </ActionButton>
        </div>

        <div className="mt-5 space-y-3 text-sm text-slate-600">
          <div>Reference: {selectedVoucher.referenceNo}</div>
          <div>Type: {selectedVoucher.voucherType}</div>
          <div>Amount: {formatMoney(selectedVoucher.amount)}</div>
          <div>Creator: {selectedVoucher.creatorName}</div>
          <div>Approver: {selectedVoucher.approverName ?? "Pending"}</div>
        </div>
      </SurfaceCard>
    </div>
  );
}
EOT

write_file "$ROOT/components/finance/FinanceHeader.tsx" <<'EOT'
"use client";

import { PORTAL_TITLE } from "@/features/finance/constants/labels";
import { useFinancePortal } from "@/features/finance/context/FinancePortalContext";
import { getBiText } from "@/features/finance/utils/bilingual";
import { ActionButton } from "@/components/finance/controls/ActionButton";
import { SelectInput } from "@/components/finance/controls/SelectInput";
import { SurfaceCard } from "@/components/finance/controls/SurfaceCard";

export function FinanceHeader() {
  const {
    languageMode,
    setLanguageMode,
    users,
    currentUser,
    activeUserId,
    setActiveUserId,
  } = useFinancePortal();

  return (
    <SurfaceCard className="p-6">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">
            {getBiText(PORTAL_TITLE, languageMode)}
          </div>
          <p className="mt-3 text-sm text-slate-500">
            {currentUser?.name} • {currentUser?.role}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:w-[520px]">
          <div>
            <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
              User Context
            </div>
            <SelectInput value={activeUserId} onChange={(e) => setActiveUserId(e.target.value)}>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} • {user.role}
                </option>
              ))}
            </SelectInput>
          </div>

          <div>
            <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
              Language Mode
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton tone={languageMode === "en" ? "primary" : "secondary"} onClick={() => setLanguageMode("en")}>EN</ActionButton>
              <ActionButton tone={languageMode === "my" ? "primary" : "secondary"} onClick={() => setLanguageMode("my")}>မြန်မာ</ActionButton>
              <ActionButton tone={languageMode === "both" ? "primary" : "secondary"} onClick={() => setLanguageMode("both")}>EN + မြန်မာ</ActionButton>
            </div>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
EOT

write_file "$ROOT/components/finance/FinanceSidebar.tsx" <<'EOT'
"use client";

import { financeNavigation } from "@/features/finance/constants/navigation";
import { useFinancePortal } from "@/features/finance/context/FinancePortalContext";
import { getBiText } from "@/features/finance/utils/bilingual";
import { SurfaceCard } from "@/components/finance/controls/SurfaceCard";
import { useFinancePermissions } from "@/features/finance/hooks/useFinancePermissions";

export function FinanceSidebar() {
  const { activeModule, setActiveModule, languageMode } = useFinancePortal();
  const { has } = useFinancePermissions();

  return (
    <SurfaceCard className="p-3">
      {financeNavigation.map((group) => (
        <div key={group.heading.en} className="mb-5">
          <div className="px-3 pb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
            {getBiText(group.heading, languageMode)}
          </div>
          <div className="space-y-1">
            {group.items.map((item) => {
              const locked = !has(item.permission);
              return (
                <button
                  key={item.key}
                  type="button"
                  disabled={locked}
                  onClick={() => setActiveModule(item.key)}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    activeModule === item.key ? "bg-[#0d2c54] text-white" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>{getBiText(item.label, languageMode)}</span>
                  {locked ? <span>🔒</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </SurfaceCard>
  );
}
EOT

write_file "$ROOT/components/finance/SharedFiltersBar.tsx" <<'EOT'
"use client";

import { useFinancePortal } from "@/features/finance/context/FinancePortalContext";
import { ActionButton } from "@/components/finance/controls/ActionButton";
import { SelectInput } from "@/components/finance/controls/SelectInput";
import { SurfaceCard } from "@/components/finance/controls/SurfaceCard";
import { TextInput } from "@/components/finance/controls/TextInput";

export function SharedFiltersBar() {
  const {
    filters,
    setFilters,
    branches,
    zones,
    activeModule,
    setModuleAsyncState,
  } = useFinancePortal();

  return (
    <SurfaceCard>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid flex-1 gap-3 md:grid-cols-5">
          <TextInput type="date" value={filters.dateFrom} onChange={(e) => setFilters({ dateFrom: e.target.value })} />
          <TextInput type="date" value={filters.dateTo} onChange={(e) => setFilters({ dateTo: e.target.value })} />
          <SelectInput value={filters.branch} onChange={(e) => setFilters({ branch: e.target.value })}>
            {branches.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
          </SelectInput>
          <SelectInput value={filters.zone} onChange={(e) => setFilters({ zone: e.target.value })}>
            {zones.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
          </SelectInput>
          <TextInput value={filters.search} onChange={(e) => setFilters({ search: e.target.value })} placeholder="Search..." />
        </div>

        <div className="flex flex-wrap gap-2">
          <ActionButton tone="secondary" onClick={() => setModuleAsyncState(activeModule, "loading")}>Loading</ActionButton>
          <ActionButton tone="secondary" onClick={() => setModuleAsyncState(activeModule, "empty")}>Empty</ActionButton>
          <ActionButton tone="secondary" onClick={() => setModuleAsyncState(activeModule, "error")}>Error</ActionButton>
          <ActionButton onClick={() => setModuleAsyncState(activeModule, "ready")}>Ready</ActionButton>
        </div>
      </div>
    </SurfaceCard>
  );
}
EOT

create_module_placeholder "$ROOT/components/finance/modules/DashboardModule.tsx" "DashboardModule" "Dashboard" "ဒက်ရှ်ဘုတ်" "KPI, approvals, fraud, and recent activity" "KPI၊ approval၊ fraud နှင့် မကြာသေးမီလုပ်ဆောင်ချက်များ"
create_module_placeholder "$ROOT/components/finance/modules/DeliverymanAccountingModule.tsx" "DeliverymanAccountingModule" "Deliveryman Accounting Workspace" "ပို့ဆောင်သူငွေစာရင်း workspace" "COD, prepaid, aging, and exception monitoring" "COD၊ prepaid၊ aging နှင့် exception စောင့်ကြည့်မှု"
create_module_placeholder "$ROOT/components/finance/modules/ChartOfAccountsModule.tsx" "ChartOfAccountsModule" "Chart of Accounts" "စာရင်းခေါင်းစဉ်များ" "Protected accounts and bilingual metadata" "protected account များနှင့် ဘာသာနှစ်မျိုး metadata"
create_module_placeholder "$ROOT/components/finance/modules/TransactionEntryModule.tsx" "TransactionEntryModule" "Transaction Entry Workflows" "transaction ထည့်သွင်းခြင်း workflow" "Simple, journal, and cash voucher entry" "simple၊ journal နှင့် cash voucher entry"
create_module_placeholder "$ROOT/components/finance/modules/VoucherRecordsModule.tsx" "VoucherRecordsModule" "Voucher Records" "voucher မှတ်တမ်းများ" "Open a voucher to view detail drawer" "detail drawer ဖြင့် voucher ကိုဖွင့်ကြည့်ပါ"
create_module_placeholder "$ROOT/components/finance/modules/GeneralLedgerModule.tsx" "GeneralLedgerModule" "General Ledger" "အထွေထွေ ledger" "Opening, period, and closing balances" "opening၊ period နှင့် closing balance များ"
create_module_placeholder "$ROOT/components/finance/modules/ReportsSuiteModule.tsx" "ReportsSuiteModule" "Financial Reports" "ငွေကြေးအစီရင်ခံစာများ" "Export-ready report views" "export-ready report view များ"
create_module_placeholder "$ROOT/components/finance/modules/ApprovalCenterModule.tsx" "ApprovalCenterModule" "Approval Workflow Center" "approval workflow center" "Maker-checker and threshold-aware approval queue" "maker-checker နှင့် threshold-aware approval queue"
create_module_placeholder "$ROOT/components/finance/modules/FraudCenterModule.tsx" "FraudCenterModule" "Fraud Center" "လိမ်လည်မှုထိန်းချုပ်ရေးစင်တာ" "Risk rules, alerts, and case status" "risk rule၊ alert နှင့် case status"
create_module_placeholder "$ROOT/components/finance/modules/MonitoringCenterModule.tsx" "MonitoringCenterModule" "Real-Time Monitoring" "တိုက်ရိုက်စောင့်ကြည့်မှု" "Live event feed and branch monitoring widgets" "live event feed နှင့် branch monitoring widget များ"
create_module_placeholder "$ROOT/components/finance/modules/AuditTrailModule.tsx" "AuditTrailModule" "Audit Trail" "စစ်ဆေးမှုမှတ်တမ်း" "Immutable action history" "ပြောင်းလဲ၍မရသော action history"
create_module_placeholder "$ROOT/components/finance/modules/PeriodClosingModule.tsx" "PeriodClosingModule" "Period Closing" "လအပိတ်စီမံခန့်ခွဲမှု" "Month-end close and reopen actions" "month-end close နှင့် reopen action များ"

write_file "$ROOT/components/finance/FinancePortalShell.tsx" <<'EOT'
"use client";

import { AccessDenied } from "@/components/finance/AccessDenied";
import { AsyncStateView } from "@/components/finance/AsyncStateView";
import { FinanceHeader } from "@/components/finance/FinanceHeader";
import { FinanceSidebar } from "@/components/finance/FinanceSidebar";
import { SharedFiltersBar } from "@/components/finance/SharedFiltersBar";
import { VoucherDetailDrawer } from "@/components/finance/VoucherDetailDrawer";
import { DashboardModule } from "@/components/finance/modules/DashboardModule";
import { DeliverymanAccountingModule } from "@/components/finance/modules/DeliverymanAccountingModule";
import { ChartOfAccountsModule } from "@/components/finance/modules/ChartOfAccountsModule";
import { TransactionEntryModule } from "@/components/finance/modules/TransactionEntryModule";
import { VoucherRecordsModule } from "@/components/finance/modules/VoucherRecordsModule";
import { GeneralLedgerModule } from "@/components/finance/modules/GeneralLedgerModule";
import { ReportsSuiteModule } from "@/components/finance/modules/ReportsSuiteModule";
import { ApprovalCenterModule } from "@/components/finance/modules/ApprovalCenterModule";
import { FraudCenterModule } from "@/components/finance/modules/FraudCenterModule";
import { MonitoringCenterModule } from "@/components/finance/modules/MonitoringCenterModule";
import { AuditTrailModule } from "@/components/finance/modules/AuditTrailModule";
import { PeriodClosingModule } from "@/components/finance/modules/PeriodClosingModule";
import { useFinancePortal } from "@/features/finance/context/FinancePortalContext";
import { useFinancePermissions } from "@/features/finance/hooks/useFinancePermissions";
import type { ModuleKey } from "@/features/finance/types/finance.types";

const moduleMap: Record<ModuleKey, React.ReactNode> = {
  dashboard: <DashboardModule />,
  deliveryman: <DeliverymanAccountingModule />,
  accounts: <ChartOfAccountsModule />,
  transactions: <TransactionEntryModule />,
  records: <VoucherRecordsModule />,
  ledger: <GeneralLedgerModule />,
  reports: <ReportsSuiteModule />,
  approval: <ApprovalCenterModule />,
  fraud: <FraudCenterModule />,
  monitoring: <MonitoringCenterModule />,
  audit: <AuditTrailModule />,
  periods: <PeriodClosingModule />,
};

const modulePermissionMap = {
  dashboard: "view_dashboard",
  deliveryman: "view_deliveryman_accounting",
  accounts: "view_accounts",
  transactions: "view_records",
  records: "view_records",
  ledger: "view_records",
  reports: "view_reports",
  approval: "approve_voucher",
  fraud: "view_fraud_center",
  monitoring: "view_real_time_monitoring",
  audit: "view_audit_trail",
  periods: "manage_period_close",
} as const;

export function FinancePortalShell() {
  const { activeModule, moduleState, toast, clearToast } = useFinancePortal();
  const { has } = useFinancePermissions();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef4fb_54%,#f8fafc_100%)] px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1800px] space-y-6">
        <FinanceHeader />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[310px_minmax(0,1fr)]">
          <div className="xl:sticky xl:top-6 xl:self-start">
            <FinanceSidebar />
          </div>

          <main className="space-y-6">
            <SharedFiltersBar />

            {has(modulePermissionMap[activeModule]) ? (
              <AsyncStateView state={moduleState[activeModule]} onRetry={() => window.location.reload()}>
                {moduleMap[activeModule]}
              </AsyncStateView>
            ) : (
              <AccessDenied />
            )}
          </main>
        </div>
      </div>

      <VoucherDetailDrawer />

      {toast ? (
        <div className="fixed bottom-4 right-4 z-[60] rounded-2xl bg-[#0d2c54] px-4 py-3 text-sm font-semibold text-white shadow-lg">
          <div className="flex items-center gap-3">
            <span>{toast.en} / {toast.my}</span>
            <button type="button" onClick={clearToast}>✕</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
EOT

echo "Done."
echo "Files created under $ROOT"
echo "Existing page.tsx was not overwritten."
