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
