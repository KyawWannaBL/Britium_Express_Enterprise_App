"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import {
  accountData as seedAccounts,
  auditTrail as seedAuditTrail,
  branches as seedBranches,
  codRecords as seedCOD,
  fraudData as seedFraud,
  monitoringData as seedMonitoring,
  periodData as seedPeriods,
  users as seedUsers,
  voucherData as seedVouchers,
  zones as seedZones,
} from "@/features/finance/data/financeSeed";
import type {
  AsyncState,
  Bi,
  FinancePortalState,
  ModuleKey,
  SharedFilters,
  VoucherRecord,
} from "@/features/finance/types/finance.types";

type FinancePortalContextValue = FinancePortalState & {
  currentUser: FinancePortalState["activeUserId"] extends string ? any : never;
  setLanguageMode: (value: FinancePortalState["languageMode"]) => void;
  setActiveUserId: (value: string) => void;
  setActiveModule: (value: ModuleKey) => void;
  setFilters: (value: Partial<SharedFilters>) => void;
  setSelectedVoucherId: (value: string | null) => void;
  setModuleAsyncState: (module: ModuleKey, state: AsyncState) => void;
  pushToast: (value: Bi) => void;
  clearToast: () => void;
  setVoucherData: React.Dispatch<React.SetStateAction<VoucherRecord[]>>;
  setAccountData: React.Dispatch<React.SetStateAction<FinancePortalState["accountData"]>>;
  setFraudData: React.Dispatch<React.SetStateAction<FinancePortalState["fraudData"]>>;
  setAuditTrail: React.Dispatch<React.SetStateAction<FinancePortalState["auditTrail"]>>;
  setPeriodData: React.Dispatch<React.SetStateAction<FinancePortalState["periodData"]>>;
};

const moduleStateSeed: Record<ModuleKey, AsyncState> = {
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
};

const FinancePortalContext = createContext<FinancePortalContextValue | undefined>(undefined);

export function FinancePortalProvider({ children }: { children: React.ReactNode }) {
  const [languageMode, setLanguageMode] = useState<FinancePortalState["languageMode"]>("both");
  const [activeUserId, setActiveUserId] = useState(seedUsers[0]?.id || "");
  const [activeModule, setActiveModule] = useState<ModuleKey>("dashboard");
  const [moduleState, setModuleState] = useState(moduleStateSeed);
  const [filtersState, setFiltersState] = useState<SharedFilters>({
    dateFrom: "2026-04-01",
    dateTo: "2026-04-30",
    branch: "All Branches",
    zone: "All Zones",
    search: "",
  });
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null);
  const [voucherData, setVoucherData] = useState(seedVouchers);
  const [accountData, setAccountData] = useState(seedAccounts);
  const [fraudData, setFraudData] = useState(seedFraud);
  const [auditTrail, setAuditTrail] = useState(seedAuditTrail);
  const [periodData, setPeriodData] = useState(seedPeriods);
  const [toast, setToast] = useState<Bi | null>(null);

  const currentUser = useMemo(
    () => seedUsers.find((u) => u.id === activeUserId) ?? seedUsers[0],
    [activeUserId]
  );

  const value = useMemo(
    () => ({
      languageMode,
      activeUserId,
      activeModule,
      moduleState,
      filters: filtersState,
      selectedVoucherId,
      voucherData,
      accountData,
      fraudData,
      auditTrail,
      periodData,
      toast,
      users: seedUsers,
      branches: seedBranches,
      zones: seedZones,
      codRecords: seedCOD,
      monitoringData: seedMonitoring,
      currentUser,
      setLanguageMode,
      setActiveUserId,
      setActiveModule,
      setFilters: (value: Partial<SharedFilters>) =>
        setFiltersState((prev) => ({ ...prev, ...value })),
      setSelectedVoucherId,
      setModuleAsyncState: (module: ModuleKey, state: AsyncState) =>
        setModuleState((prev) => ({ ...prev, [module]: state })),
      pushToast: (value: Bi) => {
        setToast(value);
        window.setTimeout(() => setToast(null), 2400);
      },
      clearToast: () => setToast(null),
      setVoucherData,
      setAccountData,
      setFraudData,
      setAuditTrail,
      setPeriodData,
    }),
    [
      languageMode,
      activeUserId,
      activeModule,
      moduleState,
      filtersState,
      selectedVoucherId,
      voucherData,
      accountData,
      fraudData,
      auditTrail,
      periodData,
      toast,
      currentUser,
    ]
  );

  return (
    <FinancePortalContext.Provider value={value}>
      {children}
    </FinancePortalContext.Provider>
  );
}

export function useFinancePortal() {
  const ctx = useContext(FinancePortalContext);
  if (!ctx) throw new Error("useFinancePortal must be used inside FinancePortalProvider");
  return ctx;
}
