"use client";

import { AccessDenied } from "@/components/finance/AccessDenied";
import { AsyncStateView } from "@/components/finance/AsyncStateView";
import { FinanceHeader } from "@/components/finance/FinanceHeader";
import { FinanceSidebar } from "@/components/finance/FinanceSidebar";
import { SharedFiltersBar } from "@/components/finance/SharedFiltersBar";
import { VoucherDetailDrawer } from "@/components/finance/VoucherDetailDrawer";
import { DashboardModule } from "@/components/finance/modules/DashboardModule";
import { DeliverymanAccountingModule } from "@/components/finance/modules/DeliverymanAccountingModule";
import { ChartOfAccountsModule } from "@/components/finance/modules/ChartOfAccountsModule";
import { TransactionEntryModule } from "@/components/finance/modules/TransactionEntryModule";
import { VoucherRecordsModule } from "@/components/finance/modules/VoucherRecordsModule";
import { GeneralLedgerModule } from "@/components/finance/modules/GeneralLedgerModule";
import { ReportsSuiteModule } from "@/components/finance/modules/ReportsSuiteModule";
import { ApprovalCenterModule } from "@/components/finance/modules/ApprovalCenterModule";
import { FraudCenterModule } from "@/components/finance/modules/FraudCenterModule";
import { MonitoringCenterModule } from "@/components/finance/modules/MonitoringCenterModule";
import { AuditTrailModule } from "@/components/finance/modules/AuditTrailModule";
import { PeriodClosingModule } from "@/components/finance/modules/PeriodClosingModule";
import { useFinancePortal } from "@/features/finance/context/FinancePortalContext";
import { useFinancePermissions } from "@/features/finance/hooks/useFinancePermissions";
import type { ModuleKey } from "@/features/finance/types/finance.types";

const moduleMap: Record<ModuleKey, React.ReactNode> = {
  dashboard: <DashboardModule />,
  deliveryman: <DeliverymanAccountingModule />,
  accounts: <ChartOfAccountsModule />,
  transactions: <TransactionEntryModule />,
  records: <VoucherRecordsModule />,
  ledger: <GeneralLedgerModule />,
  reports: <ReportsSuiteModule />,
  approval: <ApprovalCenterModule />,
  fraud: <FraudCenterModule />,
  monitoring: <MonitoringCenterModule />,
  audit: <AuditTrailModule />,
  periods: <PeriodClosingModule />,
};

const modulePermissionMap = {
  dashboard: "view_dashboard",
  deliveryman: "view_deliveryman_accounting",
  accounts: "view_accounts",
  transactions: "view_records",
  records: "view_records",
  ledger: "view_records",
  reports: "view_reports",
  approval: "approve_voucher",
  fraud: "view_fraud_center",
  monitoring: "view_real_time_monitoring",
  audit: "view_audit_trail",
  periods: "manage_period_close",
} as const;

export function FinancePortalShell() {
  const { activeModule, moduleState, toast, clearToast } = useFinancePortal();
  const { has } = useFinancePermissions();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef4fb_54%,#f8fafc_100%)] px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1800px] space-y-6">
        <FinanceHeader />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[310px_minmax(0,1fr)]">
          <div className="xl:sticky xl:top-6 xl:self-start">
            <FinanceSidebar />
          </div>

          <main className="space-y-6">
            <SharedFiltersBar />

            {has(modulePermissionMap[activeModule]) ? (
              <AsyncStateView state={moduleState[activeModule]} onRetry={() => window.location.reload()}>
                {moduleMap[activeModule]}
              </AsyncStateView>
            ) : (
              <AccessDenied />
            )}
          </main>
        </div>
      </div>

      <VoucherDetailDrawer />

      {toast ? (
        <div className="fixed bottom-4 right-4 z-[60] rounded-2xl bg-[#0d2c54] px-4 py-3 text-sm font-semibold text-white shadow-lg">
          <div className="flex items-center gap-3">
            <span>{toast.en} / {toast.my}</span>
            <button type="button" onClick={clearToast}>✕</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
