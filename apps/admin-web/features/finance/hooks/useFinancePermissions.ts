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
