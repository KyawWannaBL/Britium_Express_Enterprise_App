
import { EditableFormCard } from "../../components/EditableFormCard";
import { ReferenceStrip } from "../../components/ReferenceStrip";
import { SectionHeader } from "../../components/SectionHeader";
import { Shell } from "../../components/Shell";
import { StatusTable } from "../../components/StatusTable";

const reports = [
  ["Daily receipts", "Cash, transfer, and COD receipts by branch", "Ready"],
  ["Invoice scheduling", "Business account billing cycles", "Ready"],
  ["COD reconciliation", "Courier remittance vs delivered amount", "Priority"],
  ["Branch settlement", "Branch cashbook and bank deposit report", "Ready"],
  ["Refund tracker", "Billing problems and refund exceptions", "Ready"]
];

export default function FinancialCenterPage() {
  return (
    <Shell
      title="Financial center and report formats"
      subtitle="This page folds the uploaded BE finance pages into a cleaner production layout for receipts, bank accounts, invoices, overdue balances, refunds, COD reconciliation, and exports."
    >
      <div className="twoCol">
        <div className="listGrid">
          <SectionHeader
            eyebrow="Finance suite"
            title="Report control center"
            subtitle="Designed for finance operators and branch managers with Vercel-hosted UI and Supabase SQL views."
          />
          <EditableFormCard
            title="Finance run filter"
            description="Single control surface for daily receipts, overdue reports, merchant balances, and COD settlements."
            fields={[
              { label: "Report family", placeholder: "Receipts / COD / invoice / refunds" },
              { label: "Date range", placeholder: "YYYY-MM-DD to YYYY-MM-DD" },
              { label: "Branch", placeholder: "All branches or specific branch" },
              { label: "Merchant", placeholder: "Optional merchant filter" },
              { label: "Export", placeholder: "CSV / XLSX / PDF" }
            ]}
          />
          <StatusTable
            headers={["Report", "Purpose", "Status"]}
            rows={reports}
          />
        </div>
        <div className="listGrid">
          <ReferenceStrip pages={[18, 19, 20, 21, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]} />
          <div className="card">
            <h3>Recommended Supabase SQL views</h3>
            <ul className="muted" style={{ paddingLeft: 18, lineHeight: 1.7 }}>
              <li>finance_daily_receipts_v</li>
              <li>finance_cod_reconciliation_v</li>
              <li>finance_overdue_accounts_v</li>
              <li>finance_refunds_v</li>
              <li>finance_branch_settlement_v</li>
            </ul>
          </div>
        </div>
      </div>
    </Shell>
  );
}
