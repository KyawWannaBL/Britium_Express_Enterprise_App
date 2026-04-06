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
