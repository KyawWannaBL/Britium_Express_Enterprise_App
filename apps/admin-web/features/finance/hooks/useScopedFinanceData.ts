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
