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
