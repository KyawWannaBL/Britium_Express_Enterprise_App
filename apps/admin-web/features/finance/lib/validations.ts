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
