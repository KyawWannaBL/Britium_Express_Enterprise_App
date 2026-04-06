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
