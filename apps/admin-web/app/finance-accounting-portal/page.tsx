"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  Bell,
  BookOpen,
  Building2,
  Calculator,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  CreditCard,
  Download,
  Eye,
  FileBadge,
  FileSpreadsheet,
  FileText,
  Filter,
  Flag,
  FolderKanban,
  Globe2,
  HandCoins,
  History,
  Landmark,
  Layers3,
  Lock,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  SquarePen,
  TrendingUp,
  UserRound,
  Wallet,
  XCircle,
} from "lucide-react";

type LanguageMode = "en" | "my" | "both";
type Role = "data_entry" | "manager";
type VoucherType = "simple" | "journal" | "cash" | "reversal";
type VoucherStatus = "draft" | "submitted" | "approved" | "posted" | "rejected" | "reversed";
type ModuleKey =
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
type Permission =
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

type Bi = { en: string; my: string };

type UserAccount = {
  id: string;
  name: string;
  role: Role;
  branches: string[];
  zones: string[];
  approvalLimit: number;
  canViewSensitive: boolean;
};

type SharedFilters = {
  dateFrom: string;
  dateTo: string;
  branch: string;
  zone: string;
  search: string;
};

type CODRecord = {
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

type AccountRecord = {
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

type VoucherLine = {
  id: string;
  accountCode: string;
  description: string;
  debit: number;
  credit: number;
};

type VoucherRecord = {
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

type FraudAlert = {
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

type AuditEvent = {
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

type MonitoringEvent = {
  id: string;
  title: Bi;
  subtitle: Bi;
  branch: string;
  zone: string;
  tone: "blue" | "amber" | "green" | "rose";
  timestamp: string;
};

type PeriodState = {
  month: string;
  closed: boolean;
  outstandingApprovals: number;
  unresolvedExceptions: number;
  pendingReconciliations: number;
  notes: string;
};

type AsyncState = "ready" | "loading" | "empty" | "error";

type SimpleTransactionForm = {
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

type JournalForm = {
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

type CashVoucherForm = {
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

const LanguageContext = createContext<LanguageMode>("both");

const BI = (en: string, my: string): Bi => ({ en, my });

const users: UserAccount[] = [
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

const branches = ["All Branches", "Yangon HQ", "Mandalay Branch", "Naypyitaw Branch", "Bago Branch"];
const zones = ["All Zones", "North", "South", "Central", "East", "West"];

const rolePermissions: Record<Role, Permission[]> = {
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

const codSeed: CODRecord[] = [
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
  {
    id: "d2",
    deliveryman: "Thura Kyaw",
    branch: "Yangon HQ",
    zone: "North",
    codOnHand: 42000,
    codTransferred: 270000,
    pendingCollection: 36000,
    prepaidOnHand: 12000,
    prepaidTransferred: 45000,
    outstandingDays: 1,
    latestTransferDate: "2026-04-06 11:30 AM",
    historicalNorm: 55000,
    exceptionStatus: BI("Normal", "ပုံမှန်"),
  },
  {
    id: "d3",
    deliveryman: "Nyein Chan",
    branch: "Mandalay Branch",
    zone: "Central",
    codOnHand: 295000,
    codTransferred: 0,
    pendingCollection: 91000,
    prepaidOnHand: -3000,
    prepaidTransferred: 12000,
    outstandingDays: 7,
    latestTransferDate: "2026-04-01 05:45 PM",
    historicalNorm: 80000,
    exceptionStatus: BI("Exception", "မူမမှန်မှု"),
  },
  {
    id: "d4",
    deliveryman: "Zaw Lin Tun",
    branch: "Bago Branch",
    zone: "South",
    codOnHand: 61000,
    codTransferred: 193000,
    pendingCollection: 22000,
    prepaidOnHand: 11000,
    prepaidTransferred: 28000,
    outstandingDays: 2,
    latestTransferDate: "2026-04-05 03:00 PM",
    historicalNorm: 60000,
    exceptionStatus: BI("Watch", "စောင့်ကြည့်ရန်"),
  },
];

const accountSeed: AccountRecord[] = [
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
  {
    id: "a2",
    accountCode: "2020",
    accountTitle: BI("Merchant Payable", "ကုန်သည်ပေးရန်ရှိငွေ"),
    accountType: BI("Liability", "တာဝန်ရှိမှု"),
    accountGroup: BI("Current Liability", "လက်ရှိတာဝန်ရှိမှု"),
    accountClass: BI("Payable", "ပေးရန်ရှိ"),
    normalBalance: "Credit",
    parentAccount: "2000",
    active: true,
    protected: false,
    remark: "Used for COD settlements",
    createdBy: "Ma Su Mon",
    updatedBy: "Ma Su Mon",
    updatedDate: "2026-03-21",
  },
  {
    id: "a3",
    accountCode: "4010",
    accountTitle: BI("Delivery Revenue", "ပို့ဆောင်မှုဝင်ငွေ"),
    accountType: BI("Income", "ဝင်ငွေ"),
    accountGroup: BI("Operating Income", "လုပ်ငန်းဆောင်ရွက်မှုဝင်ငွေ"),
    accountClass: BI("Revenue", "ဝင်ငွေ"),
    normalBalance: "Credit",
    parentAccount: "4000",
    active: true,
    protected: false,
    remark: "Primary logistics income account",
    createdBy: "Ko Htet Aung",
    updatedBy: "Ko Htet Aung",
    updatedDate: "2026-03-30",
  },
  {
    id: "a4",
    accountCode: "5030",
    accountTitle: BI("Fuel Expense", "ဆီဖိုးအသုံးစရိတ်"),
    accountType: BI("Expense", "အသုံးစရိတ်"),
    accountGroup: BI("Operating Expense", "လုပ်ငန်းဆောင်ရွက်မှုအသုံးစရိတ်"),
    accountClass: BI("Expense", "အသုံးစရိတ်"),
    normalBalance: "Debit",
    parentAccount: "5000",
    active: true,
    protected: false,
    remark: "Branch transport cost account",
    createdBy: "Ma Su Mon",
    updatedBy: "Ko Htet Aung",
    updatedDate: "2026-04-04",
  },
];

const voucherSeed: VoucherRecord[] = [
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
  {
    id: "v2",
    voucherNo: "CV-2026-0094",
    referenceNo: "BANK-4451",
    voucherType: "cash",
    voucherDate: "2026-04-06",
    branch: "Mandalay Branch",
    zone: "Central",
    merchant: "",
    customer: "Aye Thandar",
    narrative: "Cash receipt for urgent parcel delivery",
    amount: 126000,
    status: "approved",
    creatorId: "u-entry-1",
    creatorName: "Ma Su Mon",
    approverId: "u-manager-1",
    approverName: "Ko Htet Aung",
    riskScore: 22,
    attachmentCount: 1,
    accountCategory: "Cash",
    reviewNotes: "Approved within limit",
    lines: [
      { id: "l1", accountCode: "1010", description: "Cash on Hand", debit: 126000, credit: 0 },
      { id: "l2", accountCode: "4010", description: "Delivery Revenue", debit: 0, credit: 126000 },
    ],
  },
  {
    id: "v3",
    voucherNo: "ST-2026-0201",
    referenceNo: "COD-7751",
    voucherType: "simple",
    voucherDate: "2026-04-06",
    branch: "Yangon HQ",
    zone: "North",
    merchant: "City Fresh",
    customer: "",
    narrative: "Manual adjustment pending evidence",
    amount: 89000,
    status: "draft",
    creatorId: "u-entry-1",
    creatorName: "Ma Su Mon",
    riskScore: 74,
    attachmentCount: 0,
    accountCategory: "Adjustment",
    reviewNotes: "Attachment missing",
    lines: [
      { id: "l1", accountCode: "5030", description: "Fuel Expense", debit: 89000, credit: 0 },
      { id: "l2", accountCode: "1010", description: "Cash on Hand", debit: 0, credit: 89000 },
    ],
  },
  {
    id: "v4",
    voucherNo: "RV-2026-0003",
    referenceNo: "REV-003",
    voucherType: "reversal",
    voucherDate: "2026-04-04",
    branch: "Bago Branch",
    zone: "South",
    merchant: "Golden Shop",
    customer: "",
    narrative: "Reversal request for duplicate posting",
    amount: 225000,
    status: "submitted",
    creatorId: "u-manager-1",
    creatorName: "Ko Htet Aung",
    riskScore: 81,
    attachmentCount: 3,
    accountCategory: "Reversal",
    reviewNotes: "Needs second manager confirmation",
    lines: [
      { id: "l1", accountCode: "2020", description: "Merchant Payable", debit: 225000, credit: 0 },
      { id: "l2", accountCode: "1010", description: "Cash on Hand", debit: 0, credit: 225000 },
    ],
  },
];

const fraudSeed: FraudAlert[] = [
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
  {
    id: "f2",
    severity: "high",
    title: BI("Unusual COD on hand", "COD လက်ဝယ်ငွေပမာဏ မူမမှန်"),
    description: BI("Nyein Chan COD on hand is 3.6x above historical norm.", "Nyein Chan ၏ COD လက်ဝယ်ငွေသည် ပုံမှန်ထက် 3.6 ဆကျော်နေသည်။"),
    branch: "Mandalay Branch",
    zone: "Central",
    reviewer: "Ko Htet Aung",
    caseStatus: BI("Under Review", "စစ်ဆေးနေသည်"),
    createdAt: "2026-04-06 09:20 AM",
    rule: "Historical deviation threshold",
  },
  {
    id: "f3",
    severity: "medium",
    title: BI("Missing evidence for manual adjustment", "manual adjustment အတွက်အထောက်အထားမရှိ"),
    description: BI("Simple transaction ST-2026-0201 was saved without required attachment.", "Simple transaction ST-2026-0201 ကို လိုအပ်သော attachment မပါဘဲသိမ်းဆည်းထားသည်။"),
    branch: "Yangon HQ",
    zone: "North",
    voucherNo: "ST-2026-0201",
    reviewer: "Ma Su Mon",
    caseStatus: BI("Open", "ဖွင့်ထားသည်"),
    createdAt: "2026-04-06 08:55 AM",
    rule: "Attachment mandatory rule",
  },
];

const auditSeed: AuditEvent[] = [
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
  {
    id: "e2",
    user: "Ko Htet Aung",
    role: "manager",
    action: BI("Approved Cash Voucher", "Cash Voucher အတည်ပြုခဲ့သည်"),
    timestamp: "2026-04-06 09:42 AM",
    reference: "CV-2026-0094",
    beforeValue: "submitted",
    afterValue: "approved",
    ip: "172.16.2.11",
    device: "Safari / MacOS",
    comment: "Approved within threshold",
  },
];

const monitoringSeed: MonitoringEvent[] = [
  {
    id: "m1",
    title: BI("High-risk journal submitted", "အန္တရာယ်မြင့် journal တင်သွင်းထားသည်"),
    subtitle: BI("JV-2026-0041 entered approval queue", "JV-2026-0041 ကို approval queue သို့ထည့်သွင်းထားသည်"),
    branch: "Yangon HQ",
    zone: "Central",
    tone: "amber",
    timestamp: "11 sec ago",
  },
  {
    id: "m2",
    title: BI("Branch cash balance updated", "ရုံးခွဲ cash balance ပြောင်းလဲထားသည်"),
    subtitle: BI("Mandalay cash position increased by 126,000 Ks", "Mandalay cash position 126,000 Ks တိုးလာသည်"),
    branch: "Mandalay Branch",
    zone: "Central",
    tone: "green",
    timestamp: "1 min ago",
  },
  {
    id: "m3",
    title: BI("Suspicious after-hours edit", "အလုပ်ချိန်ပြင်ပ edit မူမမှန်မှု"),
    subtitle: BI("A draft voucher was modified after policy cutoff", "policy cutoff ပြီးနောက် draft voucher ကိုပြင်ဆင်ထားသည်"),
    branch: "Bago Branch",
    zone: "South",
    tone: "rose",
    timestamp: "4 min ago",
  },
];

const periodSeed: PeriodState[] = [
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

const navigation = [
  {
    heading: BI("Finance Operations", "ငွေကြေးဆိုင်ရာလုပ်ငန်းဆောင်ရွက်မှုများ"),
    items: [
      { key: "dashboard" as ModuleKey, label: BI("Dashboard", "ဒက်ရှ်ဘုတ်"), icon: Activity, permission: "view_dashboard" as Permission },
      { key: "deliveryman" as ModuleKey, label: BI("Deliveryman Accounting", "ပို့ဆောင်သူငွေစာရင်း"), icon: HandCoins, permission: "view_deliveryman_accounting" as Permission },
      { key: "accounts" as ModuleKey, label: BI("Chart of Accounts", "စာရင်းခေါင်းစဉ်များ"), icon: Layers3, permission: "view_accounts" as Permission },
      { key: "transactions" as ModuleKey, label: BI("Transactions", "လုပ်ငန်းသွင်းငွေစာရင်း"), icon: SquarePen, permission: "view_records" as Permission },
      { key: "records" as ModuleKey, label: BI("Voucher Records", "voucher မှတ်တမ်းများ"), icon: FolderKanban, permission: "view_records" as Permission },
      { key: "ledger" as ModuleKey, label: BI("General Ledger", "အထွေထွေ ledger"), icon: BookOpen, permission: "view_records" as Permission },
    ],
  },
  {
    heading: BI("Reports & Statements", "အစီရင်ခံစာများနှင့် စာရင်းရှင်းတမ်းများ"),
    items: [
      { key: "reports" as ModuleKey, label: BI("Financial Reports", "ငွေကြေးအစီရင်ခံစာများ"), icon: FileSpreadsheet, permission: "view_reports" as Permission },
    ],
  },
  {
    heading: BI("Controls & Monitoring", "ထိန်းချုပ်မှုနှင့် စောင့်ကြည့်မှု"),
    items: [
      { key: "approval" as ModuleKey, label: BI("Approval Queue", "အတည်ပြုရန်စောင့်ဆိုင်းဇယား"), icon: CheckCircle2, permission: "approve_voucher" as Permission },
      { key: "fraud" as ModuleKey, label: BI("Fraud Center", "လိမ်လည်မှုထိန်းချုပ်ရေးစင်တာ"), icon: ShieldAlert, permission: "view_fraud_center" as Permission },
      { key: "monitoring" as ModuleKey, label: BI("Real-Time Monitoring", "တိုက်ရိုက်စောင့်ကြည့်မှု"), icon: TrendingUp, permission: "view_real_time_monitoring" as Permission },
      { key: "audit" as ModuleKey, label: BI("Audit Trail", "စစ်ဆေးမှုမှတ်တမ်း"), icon: History, permission: "view_audit_trail" as Permission },
      { key: "periods" as ModuleKey, label: BI("Period Closing", "လအပိတ်စီမံခန့်ခွဲမှု"), icon: Lock, permission: "manage_period_close" as Permission },
    ],
  },
];

function useLanguageMode() {
  return useContext(LanguageContext);
}

function tw(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function BiText({
  text,
  className = "",
  secondaryClassName = "",
  align = "left",
}: {
  text: Bi;
  className?: string;
  secondaryClassName?: string;
  align?: "left" | "center";
}) {
  const mode = useLanguageMode();

  if (mode === "en") {
    return <div className={tw(align === "center" && "text-center", className)}>{text.en}</div>;
  }
  if (mode === "my") {
    return <div className={tw(align === "center" && "text-center", secondaryClassName || className)}>{text.my}</div>;
  }
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <div className={className}>{text.en}</div>
      <div className={secondaryClassName}>{text.my}</div>
    </div>
  );
}

function SurfaceCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className={tw(
        "rounded-[28px] border border-white/70 bg-white/78 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </motion.section>
  );
}

function DarkCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
      className={tw(
        "relative overflow-hidden rounded-[30px] border border-[#17375f] bg-[linear-gradient(180deg,#0d2c54_0%,#0a2343_100%)] p-6 text-white shadow-[0_24px_64px_rgba(13,44,84,0.38)]",
        className,
      )}
    >
      <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-[#ffd700]/10 blur-3xl" />
      <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="relative z-10">{children}</div>
    </motion.section>
  );
}

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: Bi;
  subtitle?: Bi;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-200/80 pb-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-[#0d2c54] shadow-inner">
          {icon}
        </div>
        <div>
          <BiText
            text={title}
            className="text-lg font-black tracking-tight text-[#0d2c54]"
            secondaryClassName="mt-1 text-sm font-semibold text-slate-500"
          />
          {subtitle ? (
            <BiText
              text={subtitle}
              className="mt-3 text-sm font-medium leading-6 text-slate-500"
              secondaryClassName="mt-1 text-sm font-medium leading-6 text-slate-500"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Label({ text, helper, light = false }: { text: Bi; helper?: Bi; light?: boolean }) {
  return (
    <div className="mb-2">
      <BiText
        text={text}
        className={tw(
          "text-[11px] font-black uppercase tracking-[0.18em]",
          light ? "text-white/60" : "text-slate-500",
        )}
        secondaryClassName={tw("mt-1 text-xs font-semibold", light ? "text-white/45" : "text-slate-400")}
      />
      {helper ? (
        <BiText
          text={helper}
          className={tw("mt-2 text-xs font-medium", light ? "text-white/45" : "text-slate-400")}
          secondaryClassName={tw("mt-1 text-xs font-medium", light ? "text-white/45" : "text-slate-400")}
        />
      ) : null}
    </div>
  );
}

function InputShell({ children, icon, light = false }: { children: ReactNode; icon?: ReactNode; light?: boolean }) {
  return (
    <div
      className={tw(
        "group relative rounded-2xl border transition",
        light
          ? "border-white/12 bg-white/8 hover:border-white/22 focus-within:border-[#ffd700]/70 focus-within:bg-white/10 focus-within:shadow-[0_0_0_4px_rgba(255,215,0,0.08)]"
          : "border-slate-200/90 bg-white/95 shadow-[0_8px_24px_rgba(15,23,42,0.04)] hover:border-slate-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)] focus-within:border-[#0d2c54]/35 focus-within:shadow-[0_0_0_4px_rgba(13,44,84,0.08)]",
      )}
    >
      {icon ? (
        <div className={tw("pointer-events-none absolute left-4 top-1/2 -translate-y-1/2", light ? "text-white/45" : "text-slate-400")}>{icon}</div>
      ) : null}
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
  light = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: ReactNode;
  type?: string;
  light?: boolean;
}) {
  return (
    <InputShell icon={icon} light={light}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={tw(
          "w-full rounded-2xl bg-transparent px-4 py-3.5 text-sm font-semibold outline-none placeholder:font-medium",
          icon ? "pl-11" : "",
          light ? "text-white placeholder:text-white/32" : "text-[#0d2c54] placeholder:text-slate-300",
        )}
      />
    </InputShell>
  );
}

function SelectInput({
  value,
  onChange,
  options,
  light = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  light?: boolean;
}) {
  return (
    <InputShell light={light}>
      <ChevronRight
        size={16}
        className={tw(
          "pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90",
          light ? "text-white/35" : "text-slate-400",
        )}
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={tw(
          "w-full appearance-none rounded-2xl bg-transparent px-4 py-3.5 pr-10 text-sm font-semibold outline-none",
          light ? "text-white" : "text-[#0d2c54]",
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-slate-900">
            {option.label}
          </option>
        ))}
      </select>
    </InputShell>
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <InputShell>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full resize-none rounded-2xl bg-transparent px-4 py-3.5 text-sm font-semibold text-[#0d2c54] outline-none placeholder:font-medium placeholder:text-slate-300"
      />
    </InputShell>
  );
}

function ActionButton({
  children,
  tone = "primary",
  onClick,
  disabled,
}: {
  children: ReactNode;
  tone?: "primary" | "secondary" | "danger";
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -1, scale: 1.01 }}
      whileTap={disabled ? undefined : { scale: 0.985 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={tw(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.16em] outline-none disabled:cursor-not-allowed disabled:opacity-50",
        tone === "primary" && "bg-[#0d2c54] text-white shadow-[0_18px_36px_rgba(13,44,84,0.2)]",
        tone === "secondary" && "border border-slate-200 bg-white text-slate-700 shadow-[0_12px_24px_rgba(15,23,42,0.05)]",
        tone === "danger" && "bg-rose-600 text-white shadow-[0_18px_36px_rgba(225,29,72,0.18)]",
      )}
    >
      {children}
    </motion.button>
  );
}

function StatusBadge({
  text,
  tone = "blue",
}: {
  text: Bi;
  tone?: "blue" | "amber" | "green" | "rose" | "violet" | "slate";
}) {
  const palette = {
    blue: "bg-sky-50 text-sky-700 border-sky-100 before:bg-sky-500",
    amber: "bg-amber-50 text-amber-700 border-amber-100 before:bg-amber-500",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100 before:bg-emerald-500",
    rose: "bg-rose-50 text-rose-700 border-rose-100 before:bg-rose-500",
    violet: "bg-violet-50 text-violet-700 border-violet-100 before:bg-violet-500",
    slate: "bg-slate-50 text-slate-700 border-slate-200 before:bg-slate-500",
  }[tone];
  return (
    <span className={tw("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 before:h-2 before:w-2 before:rounded-full before:content-['']", palette)}>
      <span className="text-xs font-black uppercase tracking-[0.16em]">{text.en}</span>
      <span className="text-xs font-semibold">{text.my}</span>
    </span>
  );
}

function MetricCard({ label, value, icon }: { label: Bi; value: string; icon: ReactNode }) {
  return (
    <SurfaceCard className="relative overflow-hidden p-5">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#0d2c54]/[0.04] blur-2xl" />
      <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-[#0d2c54] shadow-inner">
        {icon}
      </div>
      <BiText
        text={label}
        className="mt-5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500"
        secondaryClassName="mt-1 text-xs font-semibold text-slate-400"
      />
      <div className="mt-3 text-3xl font-black tracking-tight text-[#0d2c54]">{value}</div>
    </SurfaceCard>
  );
}

function AsyncStateView({
  state,
  onRetry,
}: {
  state: AsyncState;
  onRetry: () => void;
}) {
  if (state === "ready") return null;
  if (state === "loading") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-[28px] border border-dashed border-slate-200 bg-white/60"
      >
        <Activity className="animate-pulse text-[#0d2c54]" size={26} />
        <BiText
          text={BI("Loading finance workspace...", "Finance workspace ကို တင်နေသည်...")}
          align="center"
          className="text-base font-black text-[#0d2c54]"
          secondaryClassName="mt-1 text-sm font-semibold text-slate-500"
        />
      </motion.div>
    );
  }
  if (state === "empty") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-[28px] border border-dashed border-slate-200 bg-white/60 px-8"
      >
        <FileText className="text-slate-400" size={28} />
        <BiText
          text={BI("No records matched your current filters", "လက်ရှိ filter များနှင့် ကိုက်ညီသောမှတ်တမ်းမတွေ့ရှိပါ")}
          align="center"
          className="text-lg font-black text-[#0d2c54]"
          secondaryClassName="mt-2 text-sm font-semibold text-slate-500"
        />
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-[28px] border border-rose-200 bg-rose-50/70 px-8"
    >
      <XCircle className="text-rose-500" size={28} />
      <BiText
        text={BI("Unable to load this module", "ဤ module ကို မတင်နိုင်ပါ")}
        align="center"
        className="text-lg font-black text-rose-700"
        secondaryClassName="mt-2 text-sm font-semibold text-rose-600"
      />
      <ActionButton onClick={onRetry}>Retry / ထပ်မံကြိုးစားမည်</ActionButton>
    </motion.div>
  );
}

function AccessDenied() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-[28px] border border-amber-200 bg-amber-50/70 px-8"
    >
      <Lock className="text-amber-600" size={28} />
      <BiText
        text={BI("Access restricted by role-based policy", "RBAC မူဝါဒအရ အသုံးပြုခွင့်ကန့်သတ်ထားသည်")}
        align="center"
        className="text-lg font-black text-amber-700"
        secondaryClassName="mt-2 text-sm font-semibold text-amber-600"
      />
    </motion.div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  locked,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: Bi;
  locked?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={!locked ? { y: -1 } : undefined}
      whileTap={!locked ? { scale: 0.985 } : undefined}
      disabled={locked}
      className={tw(
        "flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-55",
        active
          ? "bg-[#0d2c54] text-white shadow-[0_16px_30px_rgba(13,44,84,0.22)]"
          : "text-slate-600 hover:bg-slate-50",
      )}
    >
      {icon}
      <div className="min-w-0">
        <div className="text-[11px] font-black uppercase tracking-[0.16em]">{label.en}</div>
        <div className={tw("mt-1 text-xs font-semibold", active ? "text-white/70" : "text-slate-400")}>{label.my}</div>
      </div>
      {locked ? <Lock size={14} className="ml-auto shrink-0" /> : null}
    </motion.button>
  );
}

export default function FinanceAccountingPortal() {
  const [languageMode, setLanguageMode] = useState<LanguageMode>("both");
  const [activeUserId, setActiveUserId] = useState<string>(users[0].id);
  const [activeModule, setActiveModule] = useState<ModuleKey>("dashboard");
  const [moduleState, setModuleState] = useState<Record<ModuleKey, AsyncState>>({
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
  });
  const [filters, setFilters] = useState<SharedFilters>({
    dateFrom: "2026-04-01",
    dateTo: "2026-04-30",
    branch: "All Branches",
    zone: "All Zones",
    search: "",
  });
  const [deliveryTab, setDeliveryTab] = useState<"cod_on_hand" | "cod_transferred" | "pending_cod" | "prepaid_on_hand" | "prepaid_transferred">("cod_on_hand");
  const [transactionTab, setTransactionTab] = useState<"simple" | "journal" | "cash" | "drafts" | "submitted" | "approved" | "reversal">("simple");
  const [reportTab, setReportTab] = useState<"cash_book" | "journal_summary" | "trial_balance" | "income_statement" | "balance_sheet" | "profit_loss">("cash_book");
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null);
  const [voucherData, setVoucherData] = useState<VoucherRecord[]>(voucherSeed);
  const [accountData, setAccountData] = useState<AccountRecord[]>(accountSeed);
  const [fraudData, setFraudData] = useState<FraudAlert[]>(fraudSeed);
  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>(auditSeed);
  const [toast, setToast] = useState<Bi | null>(null);
  const [periodData, setPeriodData] = useState<PeriodState[]>(periodSeed);
  const [accountForm, setAccountForm] = useState({
    accountCode: "",
    accountTitleEn: "",
    accountTitleMy: "",
    accountType: "Asset",
    accountGroup: "Current Asset",
    accountClass: "Cash",
    normalBalance: "Debit",
    parentAccount: "",
    remark: "",
  });
  const [simpleForm, setSimpleForm] = useState<SimpleTransactionForm>({
    transactionDate: "2026-04-06",
    branch: "Yangon HQ",
    zone: "Central",
    merchant: "Shwe Mart",
    customer: "",
    accountCode: "5030",
    transactionType: "manual_adjustment",
    amount: "",
    description: "",
    referenceNo: "",
    notes: "",
    attachments: 0,
  });
  const [journalForm, setJournalForm] = useState<JournalForm>({
    voucherNo: "JV-2026-0045",
    voucherDate: "2026-04-06",
    branch: "Yangon HQ",
    zone: "Central",
    merchant: "Shwe Mart",
    customer: "",
    narrative: "",
    reviewerAssignment: "Ko Htet Aung",
    attachments: 0,
    lines: [
      { id: "jl1", accountCode: "1010", description: "Cash on Hand", debit: 0, credit: 0 },
      { id: "jl2", accountCode: "2020", description: "Merchant Payable", debit: 0, credit: 0 },
    ],
  });
  const [cashForm, setCashForm] = useState<CashVoucherForm>({
    voucherNo: "CV-2026-0098",
    voucherDate: "2026-04-06",
    branch: "Yangon HQ",
    zone: "North",
    receivedInAccount: "1010",
    receivedFromAccount: "4010",
    amount: "",
    paymentMethod: "cash",
    bankIndicator: "cash",
    attachments: 0,
    notes: "",
  });

  const currentUser = useMemo(() => users.find((u) => u.id === activeUserId) ?? users[0], [activeUserId]);

  const hasPermission = (permission: Permission, record?: VoucherRecord | FraudAlert | CODRecord) => {
    const allowed = rolePermissions[currentUser.role].includes(permission);
    if (!allowed) return false;

    if (record && "branch" in record) {
      const inBranchScope = currentUser.branches.includes("*") || currentUser.branches.includes(record.branch);
      const inZoneScope = currentUser.zones.includes("*") || currentUser.zones.includes(record.zone);
      if (!inBranchScope || !inZoneScope) return false;
    }

    if (record && "creatorId" in record && permission === "approve_voucher") {
      if (record.creatorId === currentUser.id) return false;
      if (record.amount > currentUser.approvalLimit) return false;
    }

    if (record && "creatorId" in record && permission === "post_voucher") {
      if (record.creatorId === currentUser.id) return false;
      if (record.status !== "approved") return false;
    }

    if (record && "voucherType" in record && permission === "approve_reversal") {
      if (record.voucherType !== "reversal") return false;
      if (record.creatorId === currentUser.id) return false;
    }

    return true;
  };

  const selectedVoucher = useMemo(
    () => voucherData.find((voucher) => voucher.id === selectedVoucherId) ?? null,
    [voucherData, selectedVoucherId],
  );

  const logAudit = (action: Bi, reference: string, beforeValue?: string, afterValue?: string, comment?: string) => {
    setAuditTrail((prev) => [
      {
        id: `e-${Date.now()}`,
        user: currentUser.name,
        role: currentUser.role,
        action,
        timestamp: new Date().toLocaleString(),
        reference,
        beforeValue,
        afterValue,
        ip: currentUser.role === "manager" ? "172.16.2.11" : "172.16.8.45",
        device: currentUser.role === "manager" ? "Safari / MacOS" : "Chrome / Windows",
        comment,
      },
      ...prev,
    ]);
  };

  const pushToast = (message: Bi) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  const setField = <T extends object, K extends keyof T>(setter: React.Dispatch<React.SetStateAction<T>>, key: K, value: T[K]) => {
    setter((prev) => ({ ...prev, [key]: value }));
  };

  const isLockedPeriod = (dateValue: string) => {
    const month = dateValue.slice(0, 7);
    return periodData.some((period) => period.month === month && period.closed);
  };

  const scopedCOD = useMemo(() => {
    return codSeed.filter((row) => {
      const inBranch = currentUser.branches.includes("*") || currentUser.branches.includes(row.branch);
      const inZone = currentUser.zones.includes("*") || currentUser.zones.includes(row.zone);
      const branchOk = filters.branch === "All Branches" || row.branch === filters.branch;
      const zoneOk = filters.zone === "All Zones" || row.zone === filters.zone;
      const query = filters.search.toLowerCase();
      const searchOk =
        !query ||
        row.deliveryman.toLowerCase().includes(query) ||
        row.branch.toLowerCase().includes(query) ||
        row.zone.toLowerCase().includes(query);
      return inBranch && inZone && branchOk && zoneOk && searchOk;
    });
  }, [currentUser.branches, currentUser.zones, filters.branch, filters.zone, filters.search]);

  const scopedVouchers = useMemo(() => {
    return voucherData.filter((voucher) => {
      const inBranch = currentUser.branches.includes("*") || currentUser.branches.includes(voucher.branch);
      const inZone = currentUser.zones.includes("*") || currentUser.zones.includes(voucher.zone);
      const branchOk = filters.branch === "All Branches" || voucher.branch === filters.branch;
      const zoneOk = filters.zone === "All Zones" || voucher.zone === filters.zone;
      const searchQuery = filters.search.toLowerCase();
      const searchOk =
        !searchQuery ||
        voucher.voucherNo.toLowerCase().includes(searchQuery) ||
        voucher.referenceNo.toLowerCase().includes(searchQuery) ||
        voucher.creatorName.toLowerCase().includes(searchQuery) ||
        voucher.merchant.toLowerCase().includes(searchQuery);
      return inBranch && inZone && branchOk && zoneOk && searchOk;
    });
  }, [voucherData, currentUser.branches, currentUser.zones, filters.branch, filters.zone, filters.search]);

  const scopedFraud = useMemo(() => {
    return fraudData.filter((alert) => {
      const inBranch = currentUser.branches.includes("*") || currentUser.branches.includes(alert.branch);
      const inZone = currentUser.zones.includes("*") || currentUser.zones.includes(alert.zone);
      const branchOk = filters.branch === "All Branches" || alert.branch === filters.branch;
      const zoneOk = filters.zone === "All Zones" || alert.zone === filters.zone;
      return inBranch && inZone && branchOk && zoneOk;
    });
  }, [fraudData, currentUser.branches, currentUser.zones, filters.branch, filters.zone]);

  const pendingApprovals = scopedVouchers.filter((v) => v.status === "submitted");
  const approvedUnposted = scopedVouchers.filter((v) => v.status === "approved");
  const suspiciousTransactions = scopedFraud.filter((alert) => alert.severity === "critical" || alert.severity === "high");

  const dashboardKpis = useMemo(() => {
    const totalCashOnHand = scopedCOD.reduce((sum, row) => sum + row.codOnHand + Math.max(0, row.prepaidOnHand), 0);
    const totalCodOnHand = scopedCOD.reduce((sum, row) => sum + row.codOnHand, 0);
    const totalCodTransferred = scopedCOD.reduce((sum, row) => sum + row.codTransferred, 0);
    const totalPendingCod = scopedCOD.reduce((sum, row) => sum + row.pendingCollection, 0);
    const merchantPrepaidOnHand = scopedCOD.reduce((sum, row) => sum + row.prepaidOnHand, 0);
    const merchantPrepaidTransferred = scopedCOD.reduce((sum, row) => sum + row.prepaidTransferred, 0);
    const currentRevenue = scopedVouchers.filter((v) => v.accountCategory !== "Expense").reduce((sum, v) => sum + v.amount, 0);
    const currentExpense = scopedVouchers.filter((v) => v.accountCategory === "Expense").reduce((sum, v) => sum + v.amount, 0);

    return [
      { label: BI("Total Cash on Hand", "လက်ဝယ်ငွေသားစုစုပေါင်း"), value: `${totalCashOnHand.toLocaleString()} Ks`, icon: <Wallet size={18} /> },
      { label: BI("Total COD on Hand", "COD လက်ဝယ်စုစုပေါင်း"), value: `${totalCodOnHand.toLocaleString()} Ks`, icon: <HandCoins size={18} /> },
      { label: BI("Total COD Transferred", "လွှဲပြောင်းပြီး COD စုစုပေါင်း"), value: `${totalCodTransferred.toLocaleString()} Ks`, icon: <ArrowLeftRight size={18} /> },
      { label: BI("Pending COD Collection", "ကောက်ခံရန်ကျန် COD"), value: `${totalPendingCod.toLocaleString()} Ks`, icon: <Clock3 size={18} /> },
      { label: BI("Merchant Prepaid on Hand", "ကုန်သည်ကြိုတင်ငွေလက်ဝယ်"), value: `${merchantPrepaidOnHand.toLocaleString()} Ks`, icon: <CreditCard size={18} /> },
      { label: BI("Merchant Prepaid Transferred", "လွှဲပြောင်းပြီး ကြိုတင်ငွေ"), value: `${merchantPrepaidTransferred.toLocaleString()} Ks`, icon: <Landmark size={18} /> },
      { label: BI("Unposted Vouchers", "မတင်သွင်းရသေးသော voucher"), value: `${approvedUnposted.length}`, icon: <FileBadge size={18} /> },
      { label: BI("Pending Approvals", "အတည်ပြုရန်စောင့်ဆိုင်းမှု"), value: `${pendingApprovals.length}`, icon: <CheckCircle2 size={18} /> },
      { label: BI("Overdue Reconciliations", "နောက်ကျ reconciliation များ"), value: `${periodData[1]?.pendingReconciliations ?? 0}`, icon: <CalendarClock size={18} /> },
      { label: BI("Suspicious Transactions", "မူမမှန် transactions များ"), value: `${suspiciousTransactions.length}`, icon: <ShieldAlert size={18} /> },
      { label: BI("Net Profit", "အမြတ်စစ်စစ်"), value: `${(currentRevenue - currentExpense).toLocaleString()} Ks`, icon: <TrendingUp size={18} /> },
      { label: BI("Accounts Payable", "ပေးရန်ရှိစာရင်း"), value: "1,280,000 Ks", icon: <Building2 size={18} /> },
      { label: BI("Branch Cash Position", "ရုံးခွဲငွေသားအနေအထား"), value: `${branches.length - 1} Branches`, icon: <Building2 size={18} /> },
      { label: BI("Current Period Revenue", "လက်ရှိကာလဝင်ငွေ"), value: `${currentRevenue.toLocaleString()} Ks`, icon: <Sparkles size={18} /> },
      { label: BI("Current Period Expense", "လက်ရှိကာလအသုံးစရိတ်"), value: `${currentExpense.toLocaleString()} Ks`, icon: <AlertTriangle size={18} /> },
    ];
  }, [approvedUnposted.length, pendingApprovals.length, periodData, scopedCOD, scopedVouchers, suspiciousTransactions.length]);

  const exportAction = (format: "CSV" | "XLSX" | "PDF", context: string) => {
    if (!hasPermission("export_reports")) {
      pushToast(BI("Export permission denied", "export လုပ်ခွင့်မရှိပါ"));
      return;
    }
    logAudit(BI("Exported report", "အစီရင်ခံစာ ထုတ်ယူခဲ့သည်"), `${context}-${format}`, "-", format, `Filters: ${JSON.stringify(filters)}`);
    pushToast(BI(`${format} export prepared`, `${format} export အဆင်သင့်ဖြစ်ပါပြီ`));
  };

  const addAccount = () => {
    if (!hasPermission("manage_accounts")) {
      pushToast(BI("Account management is restricted", "account စီမံခန့်ခွဲခွင့်ကန့်သတ်ထားသည်"));
      return;
    }
    const duplicate = accountData.some((a) => a.accountCode === accountForm.accountCode);
    if (duplicate) {
      pushToast(BI("Duplicate account code detected", "account code ထပ်နေသည်"));
      return;
    }
    if (!accountForm.accountCode || !accountForm.accountTitleEn) {
      pushToast(BI("Please complete required account fields", "လိုအပ်သော account အချက်အလက်များကို ဖြည့်ပါ"));
      return;
    }
    const newAccount: AccountRecord = {
      id: `a-${Date.now()}`,
      accountCode: accountForm.accountCode,
      accountTitle: BI(accountForm.accountTitleEn, accountForm.accountTitleMy || accountForm.accountTitleEn),
      accountType: BI(accountForm.accountType, accountForm.accountType),
      accountGroup: BI(accountForm.accountGroup, accountForm.accountGroup),
      accountClass: BI(accountForm.accountClass, accountForm.accountClass),
      normalBalance: accountForm.normalBalance as "Debit" | "Credit",
      parentAccount: accountForm.parentAccount,
      active: true,
      protected: false,
      remark: accountForm.remark,
      createdBy: currentUser.name,
      updatedBy: currentUser.name,
      updatedDate: new Date().toLocaleDateString(),
    };
    setAccountData((prev) => [newAccount, ...prev]);
    logAudit(BI("Created account title", "account title အသစ်ဖန်တီးခဲ့သည်"), newAccount.accountCode, "-", newAccount.accountTitle.en, newAccount.remark);
    pushToast(BI("Account created successfully", "account ကို အောင်မြင်စွာဖန်တီးပြီး"));
    setAccountForm({
      accountCode: "",
      accountTitleEn: "",
      accountTitleMy: "",
      accountType: "Asset",
      accountGroup: "Current Asset",
      accountClass: "Cash",
      normalBalance: "Debit",
      parentAccount: "",
      remark: "",
    });
  };

  const validateSimple = () => {
    if (!simpleForm.transactionDate || !simpleForm.accountCode || !simpleForm.amount || !simpleForm.referenceNo) {
      return BI("Required fields are missing", "လိုအပ်သော field များမပြည့်စုံပါ");
    }
    if (isLockedPeriod(simpleForm.transactionDate)) {
      return BI("Posting period is locked", "posting လုပ်မည့်ကာလကို lock လုပ်ထားသည်");
    }
    if (new Date(simpleForm.transactionDate) > new Date()) {
      return BI("Future posting is not allowed by policy", "policy အရအနာဂတ်ရက်စွဲတင်သွင်းခွင့်မပြုပါ");
    }
    const account = accountData.find((a) => a.accountCode === simpleForm.accountCode);
    if (!account || !account.active) {
      return BI("Selected account is inactive", "ရွေးချယ်ထားသော account သည် inactive ဖြစ်နေသည်");
    }
    if (voucherData.some((v) => v.referenceNo === simpleForm.referenceNo)) {
      return BI("Duplicate reference number detected", "reference number ထပ်နေသည်" );
    }
    if (Number(simpleForm.amount) > 80000 && simpleForm.attachments === 0) {
      return BI("Attachment is mandatory above threshold", "threshold ကျော်လျှင် attachment လိုအပ်သည်");
    }
    return null;
  };

  const submitSimple = (status: VoucherStatus) => {
    if (status === "submitted" && !hasPermission("submit_for_review")) {
      pushToast(BI("Submission is not allowed for this role", "ဤ role အတွက် submit လုပ်ခွင့်မရှိပါ"));
      return;
    }
    const error = validateSimple();
    if (error && status !== "draft") {
      pushToast(error);
      return;
    }
    const newVoucher: VoucherRecord = {
      id: `v-${Date.now()}`,
      voucherNo: `ST-2026-${String(voucherData.length + 205).padStart(4, "0")}`,
      referenceNo: simpleForm.referenceNo || `REF-${Date.now()}`,
      voucherType: "simple",
      voucherDate: simpleForm.transactionDate,
      branch: simpleForm.branch,
      zone: simpleForm.zone,
      merchant: simpleForm.merchant,
      customer: simpleForm.customer,
      narrative: simpleForm.description,
      amount: Number(simpleForm.amount || 0),
      status,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      riskScore: Number(simpleForm.amount) > 100000 ? 72 : 32,
      attachmentCount: simpleForm.attachments,
      accountCategory: simpleForm.transactionType,
      reviewNotes: simpleForm.notes,
      lines: [
        { id: `sl-${Date.now()}`, accountCode: simpleForm.accountCode, description: simpleForm.description, debit: Number(simpleForm.amount || 0), credit: 0 },
      ],
    };
    setVoucherData((prev) => [newVoucher, ...prev]);
    logAudit(
      status === "draft" ? BI("Saved simple transaction draft", "simple transaction draft သိမ်းခဲ့သည်") : BI("Submitted simple transaction", "simple transaction တင်သွင်းခဲ့သည်"),
      newVoucher.voucherNo,
      "-",
      status,
      simpleForm.notes,
    );
    pushToast(status === "draft" ? BI("Draft saved", "draft သိမ်းပြီး") : BI("Transaction submitted", "transaction တင်သွင်းပြီး"));
  };

  const validateJournal = () => {
    if (!journalForm.voucherNo || !journalForm.voucherDate || !journalForm.narrative) {
      return BI("Voucher header fields are incomplete", "voucher ခေါင်းစီးအချက်အလက် မပြည့်စုံပါ");
    }
    if (voucherData.some((v) => v.voucherNo === journalForm.voucherNo)) {
      return BI("Duplicate voucher number detected", "voucher number ထပ်နေသည်");
    }
    if (isLockedPeriod(journalForm.voucherDate)) {
      return BI("Posting period is locked", "posting ကာလကို lock လုပ်ထားသည်");
    }
    if (new Date(journalForm.voucherDate) > new Date()) {
      return BI("Future posting is disallowed", "အနာဂတ်ရက်စွဲ posting မပြုနိုင်ပါ");
    }
    const debit = journalForm.lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
    const credit = journalForm.lines.reduce((sum, line) => sum + Number(line.credit || 0), 0);
    if (debit !== credit) {
      return BI("Debit and credit must balance", "debit နှင့် credit တူညီရမည်");
    }
    const hasInactive = journalForm.lines.some((line) => {
      const account = accountData.find((a) => a.accountCode === line.accountCode);
      return !account || !account.active;
    });
    if (hasInactive) {
      return BI("Inactive accounts cannot be posted", "inactive account များသို့ posting မလုပ်နိုင်ပါ");
    }
    if (debit > 300000 && journalForm.attachments === 0) {
      return BI("Evidence is mandatory for high-value voucher", "တန်ဖိုးမြင့် voucher အတွက်အထောက်အထားလိုအပ်သည်");
    }
    return null;
  };

  const submitJournal = (status: VoucherStatus) => {
    const error = validateJournal();
    if (error && status !== "draft") {
      pushToast(error);
      return;
    }
    const total = journalForm.lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
    const newVoucher: VoucherRecord = {
      id: `v-${Date.now()}`,
      voucherNo: journalForm.voucherNo,
      referenceNo: `REF-${Date.now()}`,
      voucherType: "journal",
      voucherDate: journalForm.voucherDate,
      branch: journalForm.branch,
      zone: journalForm.zone,
      merchant: journalForm.merchant,
      customer: journalForm.customer,
      narrative: journalForm.narrative,
      amount: total,
      status,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      riskScore: total > 300000 ? 78 : 35,
      attachmentCount: journalForm.attachments,
      accountCategory: "Journal",
      reviewNotes: journalForm.reviewerAssignment,
      lines: journalForm.lines,
    };
    setVoucherData((prev) => [newVoucher, ...prev]);
    logAudit(
      status === "draft" ? BI("Saved journal voucher draft", "journal voucher draft သိမ်းခဲ့သည်") : BI("Submitted journal voucher", "journal voucher တင်သွင်းခဲ့သည်"),
      newVoucher.voucherNo,
      "-",
      status,
      journalForm.narrative,
    );
    pushToast(status === "draft" ? BI("Journal draft saved", "journal draft သိမ်းပြီး") : BI("Journal voucher submitted", "journal voucher တင်သွင်းပြီး"));
  };

  const validateCash = () => {
    if (!cashForm.voucherNo || !cashForm.amount || !cashForm.receivedInAccount || !cashForm.receivedFromAccount) {
      return BI("Required cash voucher fields are missing", "လိုအပ်သော cash voucher field များမပြည့်စုံပါ");
    }
    if (voucherData.some((v) => v.voucherNo === cashForm.voucherNo)) {
      return BI("Duplicate voucher number detected", "voucher number ထပ်နေသည်");
    }
    if (isLockedPeriod(cashForm.voucherDate)) {
      return BI("Posting period is locked", "posting ကာလကို lock လုပ်ထားသည်");
    }
    if (Number(cashForm.amount) > 150000 && cashForm.attachments === 0) {
      return BI("Supporting evidence is mandatory above threshold", "threshold ကျော်လျှင် supporting evidence လိုအပ်သည်");
    }
    return null;
  };

  const submitCash = (status: VoucherStatus) => {
    const error = validateCash();
    if (error && status !== "draft") {
      pushToast(error);
      return;
    }
    const amount = Number(cashForm.amount || 0);
    const newVoucher: VoucherRecord = {
      id: `v-${Date.now()}`,
      voucherNo: cashForm.voucherNo,
      referenceNo: `CASH-${Date.now()}`,
      voucherType: "cash",
      voucherDate: cashForm.voucherDate,
      branch: cashForm.branch,
      zone: cashForm.zone,
      merchant: "",
      customer: "",
      narrative: cashForm.notes,
      amount,
      status,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      riskScore: amount > 200000 ? 61 : 24,
      attachmentCount: cashForm.attachments,
      accountCategory: cashForm.bankIndicator,
      reviewNotes: cashForm.paymentMethod,
      lines: [
        { id: `cl1-${Date.now()}`, accountCode: cashForm.receivedInAccount, description: "Cash receipt", debit: amount, credit: 0 },
        { id: `cl2-${Date.now()}`, accountCode: cashForm.receivedFromAccount, description: "Counter account", debit: 0, credit: amount },
      ],
    };
    setVoucherData((prev) => [newVoucher, ...prev]);
    logAudit(
      status === "draft" ? BI("Saved cash voucher draft", "cash voucher draft သိမ်းခဲ့သည်") : BI("Submitted cash voucher", "cash voucher တင်သွင်းခဲ့သည်"),
      newVoucher.voucherNo,
      "-",
      status,
      cashForm.notes,
    );
    pushToast(status === "draft" ? BI("Cash voucher draft saved", "cash voucher draft သိမ်းပြီး") : BI("Cash voucher submitted", "cash voucher တင်သွင်းပြီး"));
  };

  const updateVoucherStatus = (voucher: VoucherRecord, nextStatus: VoucherStatus, comment: string) => {
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
          : row,
      ),
    );
    logAudit(BI(`Changed voucher status to ${nextStatus}`, `voucher အခြေအနေကို ${nextStatus} သို့ပြောင်းလဲခဲ့သည်`), voucher.voucherNo, voucher.status, nextStatus, comment);
    pushToast(BI(`Voucher ${nextStatus}`, `voucher ကို ${nextStatus} လုပ်ပြီး`));
  };

  const reportRows = useMemo(() => {
    const base = scopedVouchers.map((voucher) => ({
      accountCode: voucher.lines[0]?.accountCode ?? "-",
      accountHead: voucher.accountCategory,
      description: voucher.narrative,
      openingDebit: Math.round(voucher.amount * 0.15),
      openingCredit: Math.round(voucher.amount * 0.1),
      periodDebit: voucher.lines.reduce((sum, line) => sum + line.debit, 0),
      periodCredit: voucher.lines.reduce((sum, line) => sum + line.credit, 0),
      closingDebit: Math.round(voucher.amount * 0.25),
      closingCredit: Math.round(voucher.amount * 0.2),
    }));
    return base;
  }, [scopedVouchers]);

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {dashboardKpis.map((card) => (
          <MetricCard key={card.label.en} label={card.label} value={card.value} icon={card.icon} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <SurfaceCard>
            <SectionTitle
              icon={<CheckCircle2 size={18} />}
              title={BI("Approval Queue Summary", "အတည်ပြုရန်စောင့်ဆိုင်းဇယားအနှစ်ချုပ်")}
              subtitle={BI("Unified view of finance workflow queues, approvals, and SLA pressure.", "finance workflow queue များ၊ approval နှင့် SLA ဖိအားများ၏ အနှစ်ချုပ်။")}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Pending / စောင့်ဆိုင်း</div>
                <div className="mt-3 text-3xl font-black text-[#0d2c54]">{pendingApprovals.length}</div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">High Value / တန်ဖိုးမြင့်</div>
                <div className="mt-3 text-3xl font-black text-[#0d2c54]">{pendingApprovals.filter((p) => p.amount > 300000).length}</div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Reversal / ပြန်လည်ပြင်ဆင်ရန်</div>
                <div className="mt-3 text-3xl font-black text-[#0d2c54]">{pendingApprovals.filter((p) => p.voucherType === "reversal").length}</div>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <SectionTitle
              icon={<TrendingUp size={18} />}
              title={BI("Cash Flow Trend", "ငွေသားစီးဆင်းမှုပုံစံ")}
              subtitle={BI("Refined visual trend by branch with premium bar components and shared reporting context.", "shared reporting context ဖြင့် ရုံးခွဲအလိုက် ငွေသားစီးဆင်းမှုပုံစံ။")}
            />
            <div className="space-y-4">
              {[
                { label: "Yangon HQ", value: 82 },
                { label: "Mandalay Branch", value: 64 },
                { label: "Naypyitaw Branch", value: 41 },
                { label: "Bago Branch", value: 53 },
              ].map((bar) => (
                <div key={bar.label}>
                  <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-600">
                    <span>{bar.label}</span>
                    <span>{bar.value}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className="h-3 rounded-full bg-[linear-gradient(90deg,#0d2c54_0%,#2563eb_100%)]" style={{ width: `${bar.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <SectionTitle
              icon={<History size={18} />}
              title={BI("Recent Financial Activities", "မကြာသေးမီငွေကြေးလှုပ်ရှားမှုများ")}
              subtitle={BI("Maker, checker, posting, export, and control-sensitive actions in one readable stream.", "maker၊ checker၊ posting၊ export နှင့် control-sensitive action များ၏ အကြမ်းဖျဉ်း stream။")}
            />
            <div className="space-y-3">
              {auditTrail.slice(0, 5).map((event) => (
                <div key={event.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <BiText
                        text={event.action}
                        className="text-sm font-black text-[#0d2c54]"
                        secondaryClassName="mt-1 text-sm font-semibold text-slate-500"
                      />
                      <div className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{event.reference} • {event.timestamp}</div>
                    </div>
                    <StatusBadge
                      text={event.role === "manager" ? BI("Manager", "မန်နေဂျာ") : BI("Data Entry", "data entry")}
                      tone={event.role === "manager" ? "violet" : "blue"}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <DarkCard>
            <BiText
              text={BI("Fraud Alerts Summary", "လိမ်လည်မှုသတိပေးချက်အနှစ်ချုပ်")}
              className="text-2xl font-black text-white"
              secondaryClassName="mt-2 text-sm font-medium leading-6 text-white/60"
            />
            <div className="mt-5 space-y-3">
              {scopedFraud.slice(0, 3).map((alert) => (
                <div key={alert.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <BiText text={alert.title} className="text-sm font-black text-white" secondaryClassName="mt-1 text-sm font-semibold text-white/70" />
                  <div className="mt-3 flex items-center justify-between">
                    <StatusBadge text={alert.caseStatus} tone={alert.severity === "critical" ? "rose" : alert.severity === "high" ? "amber" : "blue"} />
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">{alert.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </DarkCard>

          <SurfaceCard>
            <SectionTitle
              icon={<Building2 size={18} />}
              title={BI("Branch Performance Snapshot", "ရုံးခွဲစွမ်းဆောင်ရည်အနှစ်ချုပ်")}
              subtitle={BI("Branch cash positions, exception pressure, and finance health at a glance.", "ရုံးခွဲငွေသားအနေအထား၊ exception ဖိအားနှင့် finance health ကိုအမြန်ကြည့်ရှုနိုင်သည်။")}
            />
            <div className="space-y-3">
              {branches.slice(1).map((branch) => (
                <div key={branch} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-black text-[#0d2c54]">{branch}</div>
                    <div className="text-sm font-semibold text-slate-500">{Math.round(Math.random() * 100)}%</div>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-[linear-gradient(90deg,#0d2c54_0%,#f59e0b_100%)]" style={{ width: `${35 + Math.round(Math.random() * 55)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <SectionTitle
              icon={<FileSpreadsheet size={18} />}
              title={BI("Report Shortcuts", "အစီရင်ခံစာအမြန်ဖြတ်လမ်းများ")}
              subtitle={BI("Frequently used report actions with export and print expectations built in.", "အသုံးများသော report shortcut များနှင့် export/print လုပ်ဆောင်ချက်များ။")}
            />
            <div className="grid grid-cols-1 gap-3">
              {[
                BI("Cash Book Summary", "Cash Book Summary"),
                BI("Trial Balance", "Trial Balance"),
                BI("Income Statement", "Income Statement"),
                BI("Profit and Loss", "Profit and Loss"),
              ].map((item) => (
                <button key={item.en} type="button" onClick={() => setActiveModule("reports")} className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300">
                  <BiText text={item} className="text-sm font-black text-[#0d2c54]" secondaryClassName="mt-1 text-sm font-semibold text-slate-500" />
                </button>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </div>
  );

  const renderDeliveryman = () => {
    const rows = scopedCOD;
    const viewValue = (row: CODRecord) => {
      if (deliveryTab === "cod_on_hand") return row.codOnHand;
      if (deliveryTab === "cod_transferred") return row.codTransferred;
      if (deliveryTab === "pending_cod") return row.pendingCollection;
      if (deliveryTab === "prepaid_on_hand") return row.prepaidOnHand;
      return row.prepaidTransferred;
    };

    return (
      <div className="space-y-6">
        <SurfaceCard>
          <SectionTitle
            icon={<HandCoins size={18} />}
            title={BI("Deliveryman Accounting Workspace", "ပို့ဆောင်သူငွေစာရင်း workspace")}
            subtitle={BI("Unified COD and prepaid monitoring with aging, transfer timing, exception flags, and fraud-aware drill-downs.", "COD နှင့် prepaid စောင့်ကြည့်မှုကို aging၊ transfer timing၊ exception flag နှင့် fraud-aware drill-down များဖြင့် တစ်နေရာတည်းတွင် ပြသထားသည်။")}
          />
          <div className="mb-5 flex flex-wrap gap-2">
            {[
              ["cod_on_hand", BI("COD on Hand", "COD လက်ဝယ်")],
              ["cod_transferred", BI("COD Transferred", "လွှဲပြောင်းပြီး COD")],
              ["pending_cod", BI("Pending COD", "စောင့်ဆိုင်း COD")],
              ["prepaid_on_hand", BI("Prepaid on Hand", "လက်ဝယ်ကြိုတင်ငွေ")],
              ["prepaid_transferred", BI("Prepaid Transferred", "လွှဲပြောင်းပြီးကြိုတင်ငွေ")],
            ].map(([key, label]) => (
              <ActionButton key={String(key)} tone={deliveryTab === key ? "primary" : "secondary"} onClick={() => setDeliveryTab(key as typeof deliveryTab)}>
                {label.en}
              </ActionButton>
            ))}
          </div>
          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-7 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
              <div>Deliveryman</div>
              <div>Branch / Zone</div>
              <div>Amount</div>
              <div>Aging</div>
              <div>Latest Transfer</div>
              <div>Status</div>
              <div>Review</div>
            </div>
            {rows.map((row) => {
              const amount = viewValue(row);
              const unusual = row.codOnHand > row.historicalNorm * 2 || row.outstandingDays > 5 || row.prepaidOnHand < 0;
              return (
                <div key={row.id} className={tw("grid grid-cols-7 gap-4 border-b border-slate-100 px-4 py-4 text-sm font-semibold text-[#0d2c54] last:border-b-0", unusual && "bg-rose-50/50") }>
                  <div>{row.deliveryman}</div>
                  <div>{row.branch} • {row.zone}</div>
                  <div>{amount.toLocaleString()} Ks</div>
                  <div>{row.outstandingDays} days</div>
                  <div>{row.latestTransferDate}</div>
                  <div>
                    <StatusBadge
                      text={row.exceptionStatus}
                      tone={unusual ? "rose" : row.exceptionStatus.en === "Watch" ? "amber" : "green"}
                    />
                  </div>
                  <div>
                    <button type="button" onClick={() => pushToast(BI(`Drill-down opened for ${row.deliveryman}`, `${row.deliveryman} အတွက် drill-down ဖွင့်ပြီး`))} className="font-black text-[#0d2c54] hover:text-sky-600">
                      Review
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </SurfaceCard>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <SurfaceCard>
            <SectionTitle icon={<AlertTriangle size={18} />} title={BI("Fraud & Delay Signals", "fraud နှင့် နောက်ကျသတိပေးချက်")}/>
            <div className="space-y-3">
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">Unusually high COD on hand is highlighted automatically / COD လက်ဝယ်ငွေပမာဏ မူမမှန်လျှင်အလိုအလျောက် flag ပြသည်</div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-700">Delayed transfer warnings appear after defined aging thresholds / aging threshold ကျော်လျှင် transfer warning ပြသည်</div>
              <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm font-semibold text-violet-700">Repeated unresolved COD balances are tracked against historical norms / သမိုင်းအခြေအနေနှင့်နှိုင်းယှဉ်၍ COD balance များကိုစောင့်ကြည့်သည်</div>
            </div>
          </SurfaceCard>
          <SurfaceCard>
            <SectionTitle icon={<Flag size={18} />} title={BI("Exception Categories", "မူမမှန်မှုအမျိုးအစားများ")}/>
            <div className="space-y-3">
              {[
                BI("Negative prepaid balances", "ကြိုတင်ငွေ negative balance"),
                BI("Missing transfer evidence", "လွှဲပြောင်းအထောက်အထားမရှိ"),
                BI("Long-aged COD on hand", "လက်ဝယ် COD ကြာမြင့်နေမှု"),
              ].map((item) => (
                <div key={item.en} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <BiText text={item} className="text-sm font-black text-[#0d2c54]" secondaryClassName="mt-1 text-sm font-semibold text-slate-500" />
                </div>
              ))}
            </div>
          </SurfaceCard>
          <DarkCard>
            <BiText text={BI("Export & Thresholds", "export နှင့် threshold များ")} className="text-xl font-black text-white" secondaryClassName="mt-2 text-sm font-medium leading-6 text-white/60" />
            <div className="mt-5 grid grid-cols-1 gap-3">
              <ActionButton tone="secondary" onClick={() => exportAction("CSV", "deliveryman-accounting")}>CSV</ActionButton>
              <ActionButton tone="secondary" onClick={() => exportAction("XLSX", "deliveryman-accounting")}>XLSX</ActionButton>
              <ActionButton tone="secondary" onClick={() => exportAction("PDF", "deliveryman-accounting")}>PDF</ActionButton>
            </div>
          </DarkCard>
        </div>
      </div>
    );
  };

  const renderAccounts = () => (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <div className="space-y-6 xl:col-span-8">
        <SurfaceCard>
          <SectionTitle
            icon={<Layers3 size={18} />}
            title={BI("Chart of Accounts / Account Master", "စာရင်းခေါင်းစဉ်များ / Account Master")}
            subtitle={BI("Protected system accounts, duplicate prevention, controlled updates, and bilingual account metadata.", "system account ကာကွယ်မှု၊ duplicate prevention၊ controlled update နှင့် ဘာသာနှစ်မျိုး account metadata များ။")}
          />
          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-9 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
              <div>Code</div>
              <div>Title</div>
              <div>Type</div>
              <div>Group</div>
              <div>Class</div>
              <div>Normal</div>
              <div>Status</div>
              <div>Updated</div>
              <div>Action</div>
            </div>
            {accountData.map((account) => (
              <div key={account.id} className="grid grid-cols-9 gap-4 border-b border-slate-100 px-4 py-4 text-sm font-semibold text-[#0d2c54] last:border-b-0">
                <div>{account.accountCode}</div>
                <div>
                  <BiText text={account.accountTitle} className="text-sm font-black text-[#0d2c54]" secondaryClassName="mt-1 text-xs font-semibold text-slate-500" />
                </div>
                <div>{account.accountType.en}</div>
                <div>{account.accountGroup.en}</div>
                <div>{account.accountClass.en}</div>
                <div>{account.normalBalance}</div>
                <div>
                  <StatusBadge text={account.active ? BI("Active", "အသုံးပြုနိုင်သည်") : BI("Inactive", "အသုံးမပြု") } tone={account.active ? "green" : "rose"} />
                </div>
                <div>{account.updatedDate}</div>
                <div>
                  {account.protected ? (
                    <StatusBadge text={BI("Protected", "ကာကွယ်ထားသည်")} tone="violet" />
                  ) : (
                    <button type="button" className="font-black text-[#0d2c54] hover:text-sky-600">Edit</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>
      <div className="space-y-6 xl:col-span-4">
        <SurfaceCard>
          <SectionTitle
            icon={<SquarePen size={18} />}
            title={BI("Add / Manage Account", "account ထည့်သွင်း / စီမံမည်")}
            subtitle={BI("Manager-only maintenance for account master records with duplicate prevention and protected account rules.", "duplicate prevention နှင့် protected account rule များပါဝင်သော manager-only account maintenance screen။")}
          />
          <div className="space-y-4">
            <div><Label text={BI("Account Code", "account code")}/><TextInput value={accountForm.accountCode} onChange={(v) => setField(setAccountForm, "accountCode", v)} placeholder="e.g. 6010" /></div>
            <div><Label text={BI("Account Title (EN)", "account title (EN)")}/><TextInput value={accountForm.accountTitleEn} onChange={(v) => setField(setAccountForm, "accountTitleEn", v)} placeholder="Account title in English" /></div>
            <div><Label text={BI("Account Title (MY)", "account title (MY)")}/><TextInput value={accountForm.accountTitleMy} onChange={(v) => setField(setAccountForm, "accountTitleMy", v)} placeholder="Myanmar account title" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label text={BI("Type", "အမျိုးအစား")}/><SelectInput value={accountForm.accountType} onChange={(v) => setField(setAccountForm, "accountType", v)} options={[{ value: "Asset", label: "Asset" }, { value: "Liability", label: "Liability" }, { value: "Income", label: "Income" }, { value: "Expense", label: "Expense" }]} /></div>
              <div><Label text={BI("Normal Balance", "မူလ balance")}/><SelectInput value={accountForm.normalBalance} onChange={(v) => setField(setAccountForm, "normalBalance", v)} options={[{ value: "Debit", label: "Debit" }, { value: "Credit", label: "Credit" }]} /></div>
            </div>
            <div><Label text={BI("Remark", "မှတ်ချက်")}/><TextArea value={accountForm.remark} onChange={(v) => setField(setAccountForm, "remark", v)} placeholder="Protected system accounts cannot be edited / system account များကိုပြင်၍မရ" /></div>
            <ActionButton disabled={!hasPermission("manage_accounts")} onClick={addAccount}><Send size={15} /> Create Account / account ဖန်တီးမည်</ActionButton>
          </div>
        </SurfaceCard>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      <SurfaceCard>
        <SectionTitle
          icon={<SquarePen size={18} />}
          title={BI("Transaction Entry Workflows", "transaction ထည့်သွင်းခြင်း workflow")}
          subtitle={BI("Simple transaction, journal voucher, cash voucher, draft saving, reviewer routing, and submission controls in one workspace.", "simple transaction၊ journal voucher၊ cash voucher၊ draft save၊ reviewer routing နှင့် submit control များကို တစ်နေရာတည်းတွင်စီမံနိုင်သည်။")}
        />
        <div className="mb-5 flex flex-wrap gap-2">
          {[
            ["simple", BI("Simple Transaction", "Simple Transaction")],
            ["journal", BI("Journal Voucher", "Journal Voucher")],
            ["cash", BI("Cash Voucher", "Cash Voucher")],
            ["drafts", BI("Voucher Drafts", "voucher draft များ")],
            ["submitted", BI("Submitted", "တင်သွင်းပြီး")],
            ["approved", BI("Approved / Posted", "အတည်ပြုပြီး / တင်သွင်းပြီး")],
            ["reversal", BI("Reversal Requests", "ပြန်လည်ပြင်ဆင်ရန်တောင်းဆိုချက်")],
          ].map(([key, label]) => (
            <ActionButton key={String(key)} tone={transactionTab === key ? "primary" : "secondary"} onClick={() => setTransactionTab(key as typeof transactionTab)}>
              {label.en}
            </ActionButton>
          ))}
        </div>

        {transactionTab === "simple" ? (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="space-y-4 xl:col-span-8">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div><Label text={BI("Transaction Date", "transaction ရက်စွဲ")}/><TextInput value={simpleForm.transactionDate} onChange={(v) => setField(setSimpleForm, "transactionDate", v)} placeholder="Date" type="date" /></div>
                <div><Label text={BI("Reference Number", "reference number")}/><TextInput value={simpleForm.referenceNo} onChange={(v) => setField(setSimpleForm, "referenceNo", v)} placeholder="Enter reference" /></div>
                <div><Label text={BI("Branch", "ရုံးခွဲ")}/><SelectInput value={simpleForm.branch} onChange={(v) => setField(setSimpleForm, "branch", v)} options={branches.slice(1).map((b) => ({ value: b, label: b }))} /></div>
                <div><Label text={BI("Zone", "ဇုန်")}/><SelectInput value={simpleForm.zone} onChange={(v) => setField(setSimpleForm, "zone", v)} options={zones.slice(1).map((z) => ({ value: z, label: z }))} /></div>
                <div><Label text={BI("Merchant", "ကုန်သည်")}/><TextInput value={simpleForm.merchant} onChange={(v) => setField(setSimpleForm, "merchant", v)} placeholder="Merchant" /></div>
                <div><Label text={BI("Customer", "ဖောက်သည်")}/><TextInput value={simpleForm.customer} onChange={(v) => setField(setSimpleForm, "customer", v)} placeholder="Customer if applicable" /></div>
                <div><Label text={BI("Account", "account")}/><SelectInput value={simpleForm.accountCode} onChange={(v) => setField(setSimpleForm, "accountCode", v)} options={accountData.map((a) => ({ value: a.accountCode, label: `${a.accountCode} - ${a.accountTitle.en}` }))} /></div>
                <div><Label text={BI("Transaction Type", "transaction အမျိုးအစား")}/><SelectInput value={simpleForm.transactionType} onChange={(v) => setField(setSimpleForm, "transactionType", v)} options={[{ value: "manual_adjustment", label: "Manual Adjustment" }, { value: "expense", label: "Expense" }, { value: "cod_clearing", label: "COD Clearing" }]} /></div>
                <div><Label text={BI("Amount", "ပမာဏ")}/><TextInput value={simpleForm.amount} onChange={(v) => setField(setSimpleForm, "amount", v)} placeholder="0" type="number" /></div>
                <div><Label text={BI("Attachment Count", "attachment အရေအတွက်")}/><TextInput value={String(simpleForm.attachments)} onChange={(v) => setField(setSimpleForm, "attachments", Number(v) || 0)} placeholder="0" type="number" /></div>
              </div>
              <div><Label text={BI("Description", "ဖော်ပြချက်")}/><TextArea value={simpleForm.description} onChange={(v) => setField(setSimpleForm, "description", v)} placeholder="Describe the transaction / transaction အကြောင်းဖော်ပြပါ" /></div>
              <div><Label text={BI("Notes", "မှတ်ချက်")}/><TextArea value={simpleForm.notes} onChange={(v) => setField(setSimpleForm, "notes", v)} placeholder="Required for adjustments / adjustment အတွက်လိုအပ်သောမှတ်ချက်" /></div>
              <div className="flex flex-wrap gap-3">
                <ActionButton disabled={!hasPermission("save_draft")} onClick={() => submitSimple("draft")}><FileText size={15} /> Save Draft / draft သိမ်းမည်</ActionButton>
                <ActionButton disabled={!hasPermission("submit_for_review")} onClick={() => submitSimple("submitted")}><Send size={15} /> Submit / တင်သွင်းမည်</ActionButton>
              </div>
            </div>
            <div className="space-y-4 xl:col-span-4">
              <DarkCard>
                <BiText text={BI("Validation Controls", "validation ထိန်းချုပ်မှုများ")} className="text-xl font-black text-white" secondaryClassName="mt-2 text-sm font-medium leading-6 text-white/60" />
                <div className="mt-5 space-y-3 text-sm font-semibold text-white/75">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">No posting to inactive accounts / inactive account သို့ posting မလုပ်နိုင်ပါ</div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">No future posting if policy disallows / policy အရအနာဂတ် posting မလုပ်နိုင်ပါ</div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Duplicate reference detection / reference ထပ်နေမှုစစ်ဆေးသည်</div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Threshold-based mandatory review / threshold ကျော်လျှင် review လိုအပ်သည်</div>
                </div>
              </DarkCard>
            </div>
          </div>
        ) : null}

        {transactionTab === "journal" ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div><Label text={BI("Voucher Number", "voucher number")}/><TextInput value={journalForm.voucherNo} onChange={(v) => setField(setJournalForm, "voucherNo", v)} placeholder="JV-2026-0045" /></div>
              <div><Label text={BI("Voucher Date", "voucher ရက်စွဲ")}/><TextInput value={journalForm.voucherDate} onChange={(v) => setField(setJournalForm, "voucherDate", v)} placeholder="Date" type="date" /></div>
              <div><Label text={BI("Branch", "ရုံးခွဲ")}/><SelectInput value={journalForm.branch} onChange={(v) => setField(setJournalForm, "branch", v)} options={branches.slice(1).map((b) => ({ value: b, label: b }))} /></div>
              <div><Label text={BI("Zone", "ဇုန်")}/><SelectInput value={journalForm.zone} onChange={(v) => setField(setJournalForm, "zone", v)} options={zones.slice(1).map((z) => ({ value: z, label: z }))} /></div>
            </div>
            <div><Label text={BI("Narrative", "ဖော်ပြချက်")}/><TextArea value={journalForm.narrative} onChange={(v) => setField(setJournalForm, "narrative", v)} placeholder="Narrative / ဖော်ပြချက်" /></div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-black text-[#0d2c54]">Journal Lines / Journal လိုင်းများ</div>
                <ActionButton tone="secondary" onClick={() => setJournalForm((prev) => ({ ...prev, lines: [...prev.lines, { id: `jl-${Date.now()}`, accountCode: "1010", description: "", debit: 0, credit: 0 }] }))}><PlusIcon /> Add Line</ActionButton>
              </div>
              <div className="space-y-3">
                {journalForm.lines.map((line, idx) => (
                  <div key={line.id} className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1.6fr_1.8fr_1fr_1fr_auto]">
                    <SelectInput value={line.accountCode} onChange={(v) => setJournalForm((prev) => ({ ...prev, lines: prev.lines.map((item, i) => i === idx ? { ...item, accountCode: v } : item) }))} options={accountData.map((a) => ({ value: a.accountCode, label: `${a.accountCode} - ${a.accountTitle.en}` }))} />
                    <TextInput value={line.description} onChange={(v) => setJournalForm((prev) => ({ ...prev, lines: prev.lines.map((item, i) => i === idx ? { ...item, description: v } : item) }))} placeholder="Line description" />
                    <TextInput type="number" value={String(line.debit || "")} onChange={(v) => setJournalForm((prev) => ({ ...prev, lines: prev.lines.map((item, i) => i === idx ? { ...item, debit: Number(v) || 0 } : item) }))} placeholder="Debit" />
                    <TextInput type="number" value={String(line.credit || "")} onChange={(v) => setJournalForm((prev) => ({ ...prev, lines: prev.lines.map((item, i) => i === idx ? { ...item, credit: Number(v) || 0 } : item) }))} placeholder="Credit" />
                    <ActionButton tone="danger" onClick={() => setJournalForm((prev) => ({ ...prev, lines: prev.lines.filter((item) => item.id !== line.id) }))}>Remove</ActionButton>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div><Label text={BI("Reviewer Assignment", "reviewer တာဝန်ပေးခြင်း")}/><TextInput value={journalForm.reviewerAssignment} onChange={(v) => setField(setJournalForm, "reviewerAssignment", v)} placeholder="Reviewer" /></div>
              <div><Label text={BI("Attachment Count", "attachment အရေအတွက်")}/><TextInput type="number" value={String(journalForm.attachments)} onChange={(v) => setField(setJournalForm, "attachments", Number(v) || 0)} placeholder="0" /></div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Balanced / တူညီမှု</div>
                <div className="mt-2 text-xl font-black text-[#0d2c54]">
                  {journalForm.lines.reduce((sum, line) => sum + line.debit, 0) === journalForm.lines.reduce((sum, line) => sum + line.credit, 0) ? "YES" : "NO"}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <ActionButton onClick={() => submitJournal("draft")}><FileText size={15} /> Save Draft</ActionButton>
              <ActionButton onClick={() => submitJournal("submitted")}><Send size={15} /> Submit Journal</ActionButton>
            </div>
          </div>
        ) : null}

        {transactionTab === "cash" ? (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="space-y-4 xl:col-span-8">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div><Label text={BI("Voucher Number", "voucher number")}/><TextInput value={cashForm.voucherNo} onChange={(v) => setField(setCashForm, "voucherNo", v)} placeholder="CV-2026-0098" /></div>
                <div><Label text={BI("Voucher Date", "voucher ရက်စွဲ")}/><TextInput value={cashForm.voucherDate} onChange={(v) => setField(setCashForm, "voucherDate", v)} placeholder="Date" type="date" /></div>
                <div><Label text={BI("Branch", "ရုံးခွဲ")}/><SelectInput value={cashForm.branch} onChange={(v) => setField(setCashForm, "branch", v)} options={branches.slice(1).map((b) => ({ value: b, label: b }))} /></div>
                <div><Label text={BI("Zone", "ဇုန်")}/><SelectInput value={cashForm.zone} onChange={(v) => setField(setCashForm, "zone", v)} options={zones.slice(1).map((z) => ({ value: z, label: z }))} /></div>
                <div><Label text={BI("Received In Account", "လက်ခံသည့် account")}/><SelectInput value={cashForm.receivedInAccount} onChange={(v) => setField(setCashForm, "receivedInAccount", v)} options={accountData.map((a) => ({ value: a.accountCode, label: `${a.accountCode} - ${a.accountTitle.en}` }))} /></div>
                <div><Label text={BI("Received From Account", "မှ လက်ခံသော account")}/><SelectInput value={cashForm.receivedFromAccount} onChange={(v) => setField(setCashForm, "receivedFromAccount", v)} options={accountData.map((a) => ({ value: a.accountCode, label: `${a.accountCode} - ${a.accountTitle.en}` }))} /></div>
                <div><Label text={BI("Amount", "ပမာဏ")}/><TextInput type="number" value={cashForm.amount} onChange={(v) => setField(setCashForm, "amount", v)} placeholder="0" /></div>
                <div><Label text={BI("Payment Method", "ငွေပေးချေမှုပုံစံ")}/><SelectInput value={cashForm.paymentMethod} onChange={(v) => setField(setCashForm, "paymentMethod", v)} options={[{ value: "cash", label: "Cash" }, { value: "bank_transfer", label: "Bank Transfer" }, { value: "mobile_money", label: "Mobile Money" }]} /></div>
                <div><Label text={BI("Bank / Cash Indicator", "ဘဏ် / ငွေသား indicator")}/><SelectInput value={cashForm.bankIndicator} onChange={(v) => setField(setCashForm, "bankIndicator", v)} options={[{ value: "cash", label: "Cash" }, { value: "bank", label: "Bank" }]} /></div>
                <div><Label text={BI("Attachment Count", "attachment အရေအတွက်")}/><TextInput type="number" value={String(cashForm.attachments)} onChange={(v) => setField(setCashForm, "attachments", Number(v) || 0)} placeholder="0" /></div>
              </div>
              <div><Label text={BI("Notes", "မှတ်ချက်")}/><TextArea value={cashForm.notes} onChange={(v) => setField(setCashForm, "notes", v)} placeholder="Supporting notes / supporting မှတ်ချက်များ" /></div>
              <div className="flex flex-wrap gap-3">
                <ActionButton onClick={() => submitCash("draft")}><FileText size={15} /> Save Draft</ActionButton>
                <ActionButton onClick={() => submitCash("submitted")}><Send size={15} /> Submit Cash Voucher</ActionButton>
              </div>
            </div>
            <div className="xl:col-span-4">
              <DarkCard>
                <BiText text={BI("Cash Voucher Controls", "cash voucher control များ")} className="text-xl font-black text-white" secondaryClassName="mt-2 text-sm font-medium leading-6 text-white/60" />
                <div className="mt-5 space-y-3 text-sm font-semibold text-white/75">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Duplicate voucher prevention / voucher ထပ်နေမှုကာကွယ်ခြင်း</div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Locked period restriction / lock လုပ်ထားသောကာလကန့်သတ်ချက်</div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Mandatory evidence for sensitive amounts / တန်ဖိုးမြင့်ပမာဏအတွက်အထောက်အထားလိုအပ်သည်</div>
                </div>
              </DarkCard>
            </div>
          </div>
        ) : null}

        {["drafts", "submitted", "approved", "reversal"].includes(transactionTab) ? (
          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-8 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
              <div>Voucher</div>
              <div>Type</div>
              <div>Branch</div>
              <div>Amount</div>
              <div>Creator</div>
              <div>Status</div>
              <div>Risk</div>
              <div>Action</div>
            </div>
            {scopedVouchers
              .filter((voucher) => {
                if (transactionTab === "drafts") return voucher.status === "draft";
                if (transactionTab === "submitted") return voucher.status === "submitted";
                if (transactionTab === "approved") return voucher.status === "approved" || voucher.status === "posted";
                return voucher.voucherType === "reversal";
              })
              .map((voucher) => (
                <div key={voucher.id} className="grid grid-cols-8 gap-4 border-b border-slate-100 px-4 py-4 text-sm font-semibold text-[#0d2c54] last:border-b-0">
                  <div>{voucher.voucherNo}</div>
                  <div>{voucher.voucherType}</div>
                  <div>{voucher.branch}</div>
                  <div>{voucher.amount.toLocaleString()} Ks</div>
                  <div>{voucher.creatorName}</div>
                  <div><StatusBadge text={BI(voucher.status, voucher.status)} tone={voucher.status === "draft" ? "slate" : voucher.status === "submitted" ? "amber" : voucher.status === "approved" || voucher.status === "posted" ? "green" : "rose"} /></div>
                  <div>{voucher.riskScore}</div>
                  <div><button type="button" onClick={() => setSelectedVoucherId(voucher.id)} className="font-black text-[#0d2c54] hover:text-sky-600">Open</button></div>
                </div>
              ))}
          </div>
        ) : null}
      </SurfaceCard>
    </div>
  );

  const renderRecords = () => (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <SurfaceCard>
        <SectionTitle
          icon={<FolderKanban size={18} />}
          title={BI("Voucher Lists and Record Browsing", "voucher စာရင်းများနှင့် record browsing")}
          subtitle={BI("Draft, submitted, approved, rejected, posted, and reversed vouchers with detail drawer, attachments, approval history, and ledger impact preview.", "draft၊ submitted၊ approved၊ rejected၊ posted နှင့် reversed voucher များကို detail drawer၊ attachment၊ approval history နှင့် ledger impact preview ဖြင့် ကြည့်ရှုနိုင်သည်။")}
        />
        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-9 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
            <div>Voucher</div>
            <div>Type</div>
            <div>Date</div>
            <div>Branch</div>
            <div>Zone</div>
            <div>Amount</div>
            <div>Status</div>
            <div>Approver</div>
            <div>Action</div>
          </div>
          {scopedVouchers.map((voucher) => (
            <div key={voucher.id} className="grid grid-cols-9 gap-4 border-b border-slate-100 px-4 py-4 text-sm font-semibold text-[#0d2c54] last:border-b-0">
              <div>{voucher.voucherNo}</div>
              <div>{voucher.voucherType}</div>
              <div>{voucher.voucherDate}</div>
              <div>{voucher.branch}</div>
              <div>{voucher.zone}</div>
              <div>{voucher.amount.toLocaleString()} Ks</div>
              <div><StatusBadge text={BI(voucher.status, voucher.status)} tone={voucher.status === "submitted" ? "amber" : voucher.status === "approved" || voucher.status === "posted" ? "green" : voucher.status === "draft" ? "slate" : "rose"} /></div>
              <div>{voucher.approverName ?? "-"}</div>
              <div><button type="button" onClick={() => setSelectedVoucherId(voucher.id)} className="font-black text-[#0d2c54] hover:text-sky-600">Detail</button></div>
            </div>
          ))}
        </div>
      </SurfaceCard>

      <AnimatePresence mode="wait">
        <motion.div key={selectedVoucher?.id ?? "empty"} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
          <SurfaceCard>
            <SectionTitle icon={<Eye size={18} />} title={BI("Detail Drawer", "အသေးစိတ် drawer")} subtitle={BI("Full voucher metadata, attachments, approval history, audit events, and ledger impact preview.", "voucher metadata၊ attachment၊ approval history၊ audit event နှင့် ledger impact preview များကို ပြသသည်။")} />
            {selectedVoucher ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="text-sm font-black text-[#0d2c54]">{selectedVoucher.voucherNo}</div>
                  <div className="mt-2 text-sm font-medium text-slate-500">{selectedVoucher.narrative}</div>
                </div>
                <div className="space-y-2 text-sm font-semibold text-slate-600">
                  <div>Type: {selectedVoucher.voucherType}</div>
                  <div>Reference: {selectedVoucher.referenceNo}</div>
                  <div>Attachment Count: {selectedVoucher.attachmentCount}</div>
                  <div>Risk Score: {selectedVoucher.riskScore}</div>
                  <div>Creator: {selectedVoucher.creatorName}</div>
                  <div>Approver: {selectedVoucher.approverName ?? "Pending"}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-2 text-sm font-black text-[#0d2c54]">Ledger Impact Preview</div>
                  <div className="space-y-2">
                    {selectedVoucher.lines.map((line) => (
                      <div key={line.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-600">
                        {line.accountCode} • {line.description} • D {line.debit.toLocaleString()} / C {line.credit.toLocaleString()}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-2 text-sm font-black text-[#0d2c54]">Approval / Audit Notes</div>
                  <div className="text-sm font-medium text-slate-500">{selectedVoucher.reviewNotes ?? "No notes"}</div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-sm font-semibold text-slate-500">Select a voucher row to open details / voucher row ကိုရွေးချယ်ပြီးအသေးစိတ်ကြည့်ပါ</div>
            )}
          </SurfaceCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );

  const renderLedger = () => (
    <div className="space-y-6">
      <SurfaceCard>
        <SectionTitle
          icon={<BookOpen size={18} />}
          title={BI("General Ledger and Account Balances", "General Ledger နှင့် account balance များ")}
          subtitle={BI("Account balance summary, opening/closing balances, running balance, branch and zone detail, and source voucher drill-downs.", "opening/closing balance၊ running balance၊ branch/zone detail နှင့် source voucher drill-down များကို ပြသသည်။")}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {reportRows.slice(0, 4).map((row, idx) => (
            <MetricCard
              key={`${row.accountCode}-${idx}`}
              label={BI(`Account ${row.accountCode}`, `စာရင်း ${row.accountCode}`)}
              value={`${(row.closingDebit - row.closingCredit).toLocaleString()} Ks`}
              icon={<Landmark size={18} />}
            />
          ))}
        </div>
        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-8 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
            <div>Account Code</div>
            <div>Description</div>
            <div>Opening</div>
            <div>Debit</div>
            <div>Credit</div>
            <div>Closing</div>
            <div>Branch</div>
            <div>Source</div>
          </div>
          {reportRows.map((row, index) => (
            <div key={`${row.accountCode}-${index}`} className="grid grid-cols-8 gap-4 border-b border-slate-100 px-4 py-4 text-sm font-semibold text-[#0d2c54] last:border-b-0">
              <div>{row.accountCode}</div>
              <div>{row.description}</div>
              <div>{(row.openingDebit - row.openingCredit).toLocaleString()}</div>
              <div>{row.periodDebit.toLocaleString()}</div>
              <div>{row.periodCredit.toLocaleString()}</div>
              <div>{(row.closingDebit - row.closingCredit).toLocaleString()}</div>
              <div>{filters.branch === "All Branches" ? "Scoped" : filters.branch}</div>
              <div><button type="button" className="font-black text-[#0d2c54] hover:text-sky-600">Open Voucher</button></div>
            </div>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );

  const renderReports = () => {
    const totals = reportRows.reduce(
      (acc, row) => {
        acc.openingDebit += row.openingDebit;
        acc.openingCredit += row.openingCredit;
        acc.periodDebit += row.periodDebit;
        acc.periodCredit += row.periodCredit;
        acc.closingDebit += row.closingDebit;
        acc.closingCredit += row.closingCredit;
        return acc;
      },
      { openingDebit: 0, openingCredit: 0, periodDebit: 0, periodCredit: 0, closingDebit: 0, closingCredit: 0 },
    );

    const reportTitleMap = {
      cash_book: BI("Cash Book Summary", "Cash Book Summary"),
      journal_summary: BI("Journal Summary", "Journal Summary"),
      trial_balance: BI("Trial Balance", "Trial Balance"),
      income_statement: BI("Income Statement", "Income Statement"),
      balance_sheet: BI("Balance Sheet", "Balance Sheet"),
      profit_loss: BI("Profit and Loss", "Profit and Loss"),
    } as const;

    return (
      <div className="space-y-6">
        <SurfaceCard>
          <SectionTitle
            icon={<FileSpreadsheet size={18} />}
            title={BI("Financial Reports Suite", "ငွေကြေးအစီရင်ခံစာစုစည်းမှု")}
            subtitle={BI("Unified report tabs with shared report filters, bilingual presentation, validation checks, and export actions.", "shared filter၊ ဘာသာနှစ်မျိုးပြသမှု၊ validation check နှင့် export action များပါသော unified report tabs။")}
          />
          <div className="mb-5 flex flex-wrap gap-2">
            {Object.entries(reportTitleMap).map(([key, label]) => (
              <ActionButton key={key} tone={reportTab === key ? "primary" : "secondary"} onClick={() => setReportTab(key as typeof reportTab)}>
                {label.en}
              </ActionButton>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <MetricCard label={BI("Opening Total", "ဖွင့်လှစ်စုစုပေါင်း")} value={`${(totals.openingDebit - totals.openingCredit).toLocaleString()} Ks`} icon={<Landmark size={18} />} />
            <MetricCard label={BI("Period Debit", "ကာလအတွင်း Debit")} value={`${totals.periodDebit.toLocaleString()} Ks`} icon={<ArrowLeftRight size={18} />} />
            <MetricCard label={BI("Period Credit", "ကာလအတွင်း Credit")} value={`${totals.periodCredit.toLocaleString()} Ks`} icon={<ArrowLeftRight size={18} />} />
            <MetricCard label={BI("Closing Total", "ပိတ်ချိန်စုစုပေါင်း")} value={`${(totals.closingDebit - totals.closingCredit).toLocaleString()} Ks`} icon={<TrendingUp size={18} />} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <ActionButton tone="secondary" onClick={() => exportAction("CSV", reportTab)}>CSV</ActionButton>
            <ActionButton tone="secondary" onClick={() => exportAction("XLSX", reportTab)}>XLSX</ActionButton>
            <ActionButton tone="secondary" onClick={() => exportAction("PDF", reportTab)}>PDF</ActionButton>
          </div>
          <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-8 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
              <div>Account Code</div>
              <div>Account Head</div>
              <div>Description</div>
              <div>Opening D/C</div>
              <div>Period D/C</div>
              <div>Closing D/C</div>
              <div>Validation</div>
              <div>Scope</div>
            </div>
            {reportRows.map((row, idx) => (
              <div key={`${row.accountCode}-${idx}`} className="grid grid-cols-8 gap-4 border-b border-slate-100 px-4 py-4 text-sm font-semibold text-[#0d2c54] last:border-b-0">
                <div>{row.accountCode}</div>
                <div>{row.accountHead}</div>
                <div>{row.description}</div>
                <div>{row.openingDebit.toLocaleString()} / {row.openingCredit.toLocaleString()}</div>
                <div>{row.periodDebit.toLocaleString()} / {row.periodCredit.toLocaleString()}</div>
                <div>{row.closingDebit.toLocaleString()} / {row.closingCredit.toLocaleString()}</div>
                <div>
                  <StatusBadge text={row.periodDebit >= row.periodCredit ? BI("Balanced", "ညီမျှသည်") : BI("Check", "စစ်ဆေးရန်")} tone={row.periodDebit >= row.periodCredit ? "green" : "amber"} />
                </div>
                <div>{filters.branch === "All Branches" ? "Branch + Zone" : filters.branch}</div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>
    );
  };

  const renderApproval = () => {
    if (!hasPermission("approve_voucher")) return <AccessDenied />;
    return (
      <div className="space-y-6">
        <SurfaceCard>
          <SectionTitle
            icon={<CheckCircle2 size={18} />}
            title={BI("Approval Workflow Center", "approval workflow center")}
            subtitle={BI("Maker-checker separation, amount-threshold routing, reversal controls, rejection comments, and approval SLA visibility.", "maker-checker separation၊ amount threshold routing၊ reversal control၊ rejection comment နှင့် approval SLA ကို ပြသသည်။")}
          />
          <div className="space-y-4">
            {pendingApprovals.map((voucher) => {
              const canApprove = hasPermission(voucher.voucherType === "reversal" ? "approve_reversal" : "approve_voucher", voucher);
              const highValue = voucher.amount > 300000;
              return (
                <div key={voucher.id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-base font-black text-[#0d2c54]">{voucher.voucherNo}</div>
                        <StatusBadge text={BI(voucher.voucherType, voucher.voucherType)} tone="blue" />
                        {highValue ? <StatusBadge text={BI("High Value", "တန်ဖိုးမြင့်") } tone="amber" /> : null}
                      </div>
                      <div className="mt-3 text-sm font-semibold text-slate-600">{voucher.branch} • {voucher.zone} • {voucher.creatorName}</div>
                      <div className="mt-2 text-sm font-medium text-slate-500">{voucher.narrative}</div>
                      <div className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Risk {voucher.riskScore} • SLA 02:14:55</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-[#0d2c54]">{voucher.amount.toLocaleString()} Ks</div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <ActionButton disabled={!canApprove} onClick={() => updateVoucherStatus(voucher, "approved", highValue ? "Approved with threshold review" : "Approved") }><CheckCircle2 size={15} /> Approve</ActionButton>
                    <ActionButton tone="danger" disabled={!hasPermission("reject_voucher", voucher)} onClick={() => updateVoucherStatus(voucher, "rejected", "Returned due to control review comment") }><XCircle size={15} /> Reject</ActionButton>
                    <ActionButton tone="secondary" onClick={() => updateVoucherStatus(voucher, "draft", "Returned for correction") }><SquarePen size={15} /> Return</ActionButton>
                  </div>
                  {!canApprove ? (
                    <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                      Maker-checker rule or approval threshold blocks this action / maker-checker rule သို့မဟုတ် approval threshold ကြောင့်လုပ်ဆောင်ခွင့်မရှိပါ
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </SurfaceCard>
      </div>
    );
  };

  const renderFraud = () => {
    if (!hasPermission("view_fraud_center")) return <AccessDenied />;
    return (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <SurfaceCard>
            <SectionTitle
              icon={<ShieldAlert size={18} />}
              title={BI("Fraud Prevention & Internal Controls", "လိမ်လည်မှုကာကွယ်ရေးနှင့် အတွင်းထိန်းချုပ်မှု")}
              subtitle={BI("Suspicious transaction alerts, duplicate detection, unusual amount monitoring, missing evidence, manual override tracking, and policy breach visibility.", "suspicious transaction alert၊ duplicate detection၊ unusual amount monitoring၊ missing evidence၊ manual override tracking နှင့် policy breach visibility များ။")}
            />
            <div className="space-y-4">
              {scopedFraud.map((alert) => (
                <div key={alert.id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <StatusBadge text={BI(alert.severity.toUpperCase(), alert.severity.toUpperCase())} tone={alert.severity === "critical" ? "rose" : alert.severity === "high" ? "amber" : "blue"} />
                        <StatusBadge text={alert.caseStatus} tone="violet" />
                      </div>
                      <BiText text={alert.title} className="mt-3 text-base font-black text-[#0d2c54]" secondaryClassName="mt-1 text-sm font-semibold text-slate-500" />
                      <BiText text={alert.description} className="mt-3 text-sm font-medium leading-6 text-slate-600" secondaryClassName="mt-1 text-sm font-medium leading-6 text-slate-500" />
                      <div className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{alert.rule} • {alert.branch} • {alert.zone}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-[#0d2c54]">{alert.createdAt}</div>
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>
        <div className="space-y-6 xl:col-span-4">
          <DarkCard>
            <BiText text={BI("Preventive Controls", "ကြိုတင်ကာကွယ်ထိန်းချုပ်မှုများ")} className="text-xl font-black text-white" secondaryClassName="mt-2 text-sm font-medium leading-6 text-white/60" />
            <div className="mt-5 space-y-3 text-sm font-semibold text-white/75">
              {[
                BI("Maker-checker separation", "maker-checker ခွဲခြားထားသည်"),
                BI("Locked periods", "ကာလ lock လုပ်ထားသည်"),
                BI("Approval thresholds", "approval threshold များ"),
                BI("Mandatory evidence", "အထောက်အထားမဖြစ်မနေလိုအပ်သည်"),
                BI("Immutable audit log", "ပြောင်းလဲ၍မရသော audit log"),
                BI("No delete after posting", "posting ပြီးနောက်ဖျက်၍မရ")
              ].map((item) => (
                <div key={item.en} className="rounded-2xl border border-white/10 bg-white/5 p-4">{item.en} / {item.my}</div>
              ))}
            </div>
          </DarkCard>
        </div>
      </div>
    );
  };

  const renderMonitoring = () => {
    if (!hasPermission("view_real_time_monitoring")) return <AccessDenied />;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label={BI("Live Incoming Transactions", "တိုက်ရိုက်ဝင်လာသော transaction များ")} value="18" icon={<Activity size={18} />} />
          <MetricCard label={BI("Pending Postings", "pending posting များ")} value={`${approvedUnposted.length}`} icon={<FileBadge size={18} />} />
          <MetricCard label={BI("Unapproved Queue", "မအတည်ပြုရသေးသောဇယား")} value={`${pendingApprovals.length}`} icon={<Clock3 size={18} />} />
          <MetricCard label={BI("High-Risk Alerts", "အန္တရာယ်မြင့်သတိပေးချက်များ")} value={`${suspiciousTransactions.length}`} icon={<ShieldAlert size={18} />} />
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <SurfaceCard className="xl:col-span-8">
            <SectionTitle
              icon={<TrendingUp size={18} />}
              title={BI("Real-Time Monitoring Center", "တိုက်ရိုက်စောင့်ကြည့်ရေးစင်တာ")}
              subtitle={BI("Live incoming transactions, branch cash position, COD risk, unbalanced journal attempts, and suspicious event stream with timestamped updates.", "live transaction၊ branch cash၊ COD risk၊ unbalanced journal attempt နှင့် suspicious event stream များကိုအချိန်အလိုက်ပြသသည်။")}
            />
            <div className="space-y-4">
              {monitoringSeed.map((event) => (
                <div key={event.id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <BiText text={event.title} className="text-base font-black text-[#0d2c54]" secondaryClassName="mt-1 text-sm font-semibold text-slate-500" />
                      <BiText text={event.subtitle} className="mt-3 text-sm font-medium leading-6 text-slate-600" secondaryClassName="mt-1 text-sm font-medium leading-6 text-slate-500" />
                      <div className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{event.branch} • {event.zone}</div>
                    </div>
                    <StatusBadge text={BI(event.timestamp, event.timestamp)} tone={event.tone} />
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>
          <DarkCard className="xl:col-span-4">
            <BiText text={BI("Today’s Monitoring Widgets", "ယနေ့စောင့်ကြည့်မှု widgets")}
              className="text-xl font-black text-white"
              secondaryClassName="mt-2 text-sm font-medium leading-6 text-white/60"
            />
            <div className="mt-5 space-y-3">
              {[
                BI("Branch cash position is stable", "ရုံးခွဲငွေသားအနေအထား တည်ငြိမ်သည်"),
                BI("COD risk heatmap updated", "COD risk heatmap ကို update လုပ်ထားသည်"),
                BI("Exceptions by branch recalculated", "ရုံးခွဲအလိုက် exception များကို ပြန်လည်တွက်ချက်ပြီး"),
                BI("Today’s receipts vs payments refreshed", "ယနေ့ရရှိငွေနှင့်ပေးချေငွေကို refresh လုပ်ထားသည်"),
              ].map((item) => (
                <div key={item.en} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-white/75">{item.en} / {item.my}</div>
              ))}
            </div>
          </DarkCard>
        </div>
      </div>
    );
  };

  const renderAudit = () => {
    if (!hasPermission("view_audit_trail")) return <AccessDenied />;
    return (
      <div className="space-y-6">
        <SurfaceCard>
          <SectionTitle
            icon={<History size={18} />}
            title={BI("Audit Trail and Compliance", "Audit Trail နှင့် Compliance")}
            subtitle={BI("Immutable history of create, edit, submit, approve, reject, post, reverse, export, login-sensitive, and configuration actions with before/after traceability.", "create၊ edit၊ submit၊ approve၊ reject၊ post၊ reverse၊ export၊ login-sensitive နှင့် configuration action များကို immutable history အဖြစ် သိမ်းဆည်းထားသည်။")}
          />
          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-9 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
              <div>User</div>
              <div>Role</div>
              <div>Action</div>
              <div>Timestamp</div>
              <div>Reference</div>
              <div>Before</div>
              <div>After</div>
              <div>IP / Device</div>
              <div>Comment</div>
            </div>
            {auditTrail.map((event) => (
              <div key={event.id} className="grid grid-cols-9 gap-4 border-b border-slate-100 px-4 py-4 text-sm font-semibold text-[#0d2c54] last:border-b-0">
                <div>{event.user}</div>
                <div>{event.role}</div>
                <div>
                  <BiText text={event.action} className="text-sm font-black text-[#0d2c54]" secondaryClassName="mt-1 text-xs font-semibold text-slate-500" />
                </div>
                <div>{event.timestamp}</div>
                <div>{event.reference}</div>
                <div>{event.beforeValue ?? "-"}</div>
                <div>{event.afterValue ?? "-"}</div>
                <div>{event.ip}<div className="text-xs font-medium text-slate-500">{event.device}</div></div>
                <div>{event.comment ?? "-"}</div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>
    );
  };

  const renderPeriods = () => {
    if (!hasPermission("manage_period_close")) return <AccessDenied />;
    return (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <SurfaceCard>
            <SectionTitle
              icon={<Lock size={18} />}
              title={BI("Period Closing and Financial Controls", "ကာလပိတ်သိမ်းခြင်းနှင့် ငွေကြေးထိန်းချုပ်မှု")}
              subtitle={BI("Month-end close checklist, open/closed periods, unresolved exceptions, pending reconciliations, required reports, and posting locks.", "month-end close checklist၊ open/closed period၊ unresolved exception၊ pending reconciliation၊ required report နှင့် posting lock များကို ပြသသည်။")}
            />
            <div className="space-y-4">
              {periodData.map((period) => (
                <div key={period.month} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="text-base font-black text-[#0d2c54]">{period.month}</div>
                      <div className="mt-2 text-sm font-medium text-slate-500">{period.notes}</div>
                    </div>
                    <StatusBadge text={period.closed ? BI("Closed", "ပိတ်ပြီး") : BI("Open", "ဖွင့်ထားသည်")} tone={period.closed ? "green" : "amber"} />
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">Outstanding Approvals: {period.outstandingApprovals}</div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">Unresolved Exceptions: {period.unresolvedExceptions}</div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">Pending Reconciliations: {period.pendingReconciliations}</div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {period.closed ? (
                      <ActionButton tone="secondary" onClick={() => {
                        setPeriodData((prev) => prev.map((item) => item.month === period.month ? { ...item, closed: false } : item));
                        logAudit(BI("Reopened period", "ကာလကို ပြန်ဖွင့်ခဲ့သည်"), period.month, "closed", "open", "Approved reopen request");
                      }}>
                        Reopen Period / ကာလပြန်ဖွင့်မည်
                      </ActionButton>
                    ) : (
                      <ActionButton onClick={() => {
                        setPeriodData((prev) => prev.map((item) => item.month === period.month ? { ...item, closed: true } : item));
                        logAudit(BI("Closed period", "ကာလပိတ်ခဲ့သည်"), period.month, "open", "closed", "Month-end close confirmed");
                      }}>
                        Close Period / ကာလပိတ်မည်
                      </ActionButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>
        <div className="space-y-6 xl:col-span-4">
          <DarkCard>
            <BiText
              text={BI("Close Checklist", "ပိတ်သိမ်းခြင်း checklist")}
              className="text-xl font-black text-white"
              secondaryClassName="mt-2 text-sm font-medium leading-6 text-white/60"
            />
            <div className="mt-5 space-y-3 text-sm font-semibold text-white/75">
              {[
                BI("All approvals completed", "approval များအားလုံးပြီးစီးရမည်"),
                BI("All exceptions reviewed", "exception များအားလုံးစစ်ဆေးရမည်"),
                BI("Reconciliation queue cleared", "reconciliation queue ကိုရှင်းလင်းရမည်"),
                BI("Financial statements generated", "financial statement များဖန်တီးပြီးဖြစ်ရမည်"),
              ].map((item) => (
                <div key={item.en} className="rounded-2xl border border-white/10 bg-white/5 p-4">{item.en} / {item.my}</div>
              ))}
            </div>
          </DarkCard>
        </div>
      </div>
    );
  };

  const moduleViews: Record<ModuleKey, ReactNode> = {
    dashboard: renderDashboard(),
    deliveryman: renderDeliveryman(),
    accounts: renderAccounts(),
    transactions: renderTransactions(),
    records: renderRecords(),
    ledger: renderLedger(),
    reports: hasPermission("view_reports") ? renderReports() : <AccessDenied />,
    approval: renderApproval(),
    fraud: renderFraud(),
    monitoring: renderMonitoring(),
    audit: renderAudit(),
    periods: renderPeriods(),
  };

  return (
    <LanguageContext.Provider value={languageMode}>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(13,44,84,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_20%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_54%,#f8fafc_100%)] px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1800px] space-y-6">
          <motion.header
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42 }}
            className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/76 p-6 shadow-[0_24px_56px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-7"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent" />
            <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />
            <div className="absolute left-0 top-0 h-32 w-32 rounded-full bg-[#ffd700]/10 blur-3xl" />
            <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-4xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-3 py-1.5 shadow-sm">
                  <Sparkles size={14} className="text-[#0d2c54]" />
                  <span className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">Finance & Accounting Portal</span>
                </div>
                <BiText
                  text={BI("Unified Finance & Accounting Workspace", "Finance နှင့် Accounting စနစ်ပေါင်းစည်းထားသော workspace")}
                  className="mt-4 text-3xl font-black tracking-tight text-[#0d2c54] md:text-5xl"
                  secondaryClassName="mt-3 text-base font-semibold text-slate-500 md:text-lg"
                />
                <BiText
                  text={BI("An enterprise-grade ERP-style portal for finance operations, accounting workflows, approvals, fraud controls, monitoring, reporting, and auditability.", "finance operation၊ accounting workflow၊ approval၊ fraud control၊ monitoring၊ reporting နှင့် auditability အတွက် ERP-grade portal ဖြစ်သည်။")}
                  className="mt-4 text-sm font-medium leading-6 text-slate-500 md:text-[15px]"
                  secondaryClassName="mt-1 text-sm font-medium leading-6 text-slate-500 md:text-[15px]"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:w-[560px]">
                <SurfaceCard className="p-4">
                  <BiText text={BI("Signed-in Role", "လက်ရှိဝင်ရောက်ထားသော role")} className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400" secondaryClassName="mt-1 text-xs font-semibold text-slate-400" />
                  <div className="mt-3"><StatusBadge text={currentUser.role === "manager" ? BI("Financial Manager", "ငွေကြေးမန်နေဂျာ") : BI("Financial Data Entry", "ငွေကြေး data entry")} tone={currentUser.role === "manager" ? "violet" : "blue"} /></div>
                  <div className="mt-3 text-sm font-semibold text-slate-500">{currentUser.name}</div>
                </SurfaceCard>
                <SurfaceCard className="p-4">
                  <BiText text={BI("Language Mode", "ဘာသာစကား mode")} className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400" secondaryClassName="mt-1 text-xs font-semibold text-slate-400" />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      ["en", "EN"],
                      ["my", "မြန်မာ"],
                      ["both", "EN + မြန်မာ"],
                    ].map(([value, label]) => (
                      <ActionButton key={value} tone={languageMode === value ? "primary" : "secondary"} onClick={() => setLanguageMode(value as LanguageMode)}>
                        <Globe2 size={14} /> {label}
                      </ActionButton>
                    ))}
                  </div>
                </SurfaceCard>
              </div>
            </div>
          </motion.header>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[310px_minmax(0,1fr)]">
            <motion.aside
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.42 }}
              className="xl:sticky xl:top-6 xl:self-start"
            >
              <SurfaceCard className="p-3">
                <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Label text={BI("User Context", "အသုံးပြုသူအကြောင်းအရာ")} helper={BI("Switch role to test true RBAC gating and maker-checker restrictions.", "RBAC နှင့် maker-checker ကန့်သတ်ချက်များကို စမ်းသပ်ရန် role ကိုပြောင်းပါ။")} />
                  <SelectInput value={currentUser.id} onChange={setActiveUserId} options={users.map((u) => ({ value: u.id, label: `${u.name} • ${u.role}` }))} />
                </div>

                <div className="mb-4 grid grid-cols-1 gap-3 px-1">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Branch Scope</div>
                    <div className="mt-2 text-sm font-semibold text-[#0d2c54]">{currentUser.branches.join(", ")}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Zone Scope</div>
                    <div className="mt-2 text-sm font-semibold text-[#0d2c54]">{currentUser.zones.join(", ")}</div>
                  </div>
                </div>

                {navigation.map((group) => (
                  <div key={group.heading.en} className="mb-5">
                    <div className="px-3 pb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{group.heading.en}<div className="mt-1 text-xs font-semibold normal-case tracking-normal">{group.heading.my}</div></div>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const locked = !hasPermission(item.permission);
                        return (
                          <TabButton
                            key={item.key}
                            active={activeModule === item.key}
                            onClick={() => setActiveModule(item.key)}
                            icon={<Icon size={17} />}
                            label={item.label}
                            locked={locked}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </SurfaceCard>
            </motion.aside>

            <main className="space-y-6">
              <SurfaceCard>
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <BiText
                      text={BI("Shared Filters", "shared filter များ")}
                      className="text-lg font-black text-[#0d2c54]"
                      secondaryClassName="mt-1 text-sm font-semibold text-slate-500"
                    />
                    <BiText
                      text={BI("Date, branch, zone, and search are shared across operations, inquiry, reports, and monitoring for one connected finance context.", "ရက်စွဲ၊ ရုံးခွဲ၊ ဇုန် နှင့် search filter များကို operations၊ inquiry၊ report နှင့် monitoring တစ်လျှောက် shared context အဖြစ်အသုံးပြုသည်။")}
                      className="mt-2 text-sm font-medium leading-6 text-slate-500"
                      secondaryClassName="mt-1 text-sm font-medium leading-6 text-slate-500"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ActionButton tone="secondary" onClick={() => setModuleState((prev) => ({ ...prev, [activeModule]: "loading" }))}>Loading</ActionButton>
                    <ActionButton tone="secondary" onClick={() => setModuleState((prev) => ({ ...prev, [activeModule]: "empty" }))}>Empty</ActionButton>
                    <ActionButton tone="secondary" onClick={() => setModuleState((prev) => ({ ...prev, [activeModule]: "error" }))}>Error</ActionButton>
                    <ActionButton tone="secondary" onClick={() => setModuleState((prev) => ({ ...prev, [activeModule]: "ready" }))}>Ready</ActionButton>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <div><Label text={BI("Start Date", "စတင်ရက်")}/><TextInput value={filters.dateFrom} onChange={(v) => setFilters((prev) => ({ ...prev, dateFrom: v }))} placeholder="Start" type="date" icon={<CalendarClock size={15} />} /></div>
                  <div><Label text={BI("End Date", "ပြီးဆုံးရက်")}/><TextInput value={filters.dateTo} onChange={(v) => setFilters((prev) => ({ ...prev, dateTo: v }))} placeholder="End" type="date" icon={<CalendarClock size={15} />} /></div>
                  <div><Label text={BI("Branch", "ရုံးခွဲ")}/><SelectInput value={filters.branch} onChange={(v) => setFilters((prev) => ({ ...prev, branch: v }))} options={branches.map((b) => ({ value: b, label: b }))} /></div>
                  <div><Label text={BI("Zone", "ဇုန်")}/><SelectInput value={filters.zone} onChange={(v) => setFilters((prev) => ({ ...prev, zone: v }))} options={zones.map((z) => ({ value: z, label: z }))} /></div>
                  <div><Label text={BI("Search", "ရှာဖွေမှု")}/><TextInput value={filters.search} onChange={(v) => setFilters((prev) => ({ ...prev, search: v }))} placeholder="Voucher, merchant, branch..." icon={<Search size={15} />} /></div>
                </div>
              </SurfaceCard>

              <AnimatePresence mode="wait">
                <motion.div key={`${activeModule}-${moduleState[activeModule]}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }}>
                  {moduleState[activeModule] !== "ready" ? <AsyncStateView state={moduleState[activeModule]} onRetry={() => setModuleState((prev) => ({ ...prev, [activeModule]: "ready" }))} /> : moduleViews[activeModule]}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>

        <AnimatePresence>
          {toast ? (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed bottom-6 right-6 z-50 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_16px_36px_rgba(15,23,42,0.12)]"
            >
              <BiText text={toast} className="text-sm font-black text-[#0d2c54]" secondaryClassName="mt-1 text-sm font-semibold text-slate-500" />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </LanguageContext.Provider>
  );
}

function PlusIcon() {
  return <span className="text-base font-black">+</span>;
}
