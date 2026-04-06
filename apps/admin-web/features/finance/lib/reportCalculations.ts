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
