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
