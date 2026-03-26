import { MetricCard, SectionTitle, Shell, StatusPill } from "../_components/ui";
import { financialRows } from "../_lib/mock-data";
import { getFinancialReportData } from "../../lib/data";

function formatMmk(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} MMK`;
}

export default async function FinancialReportsPage() {
  const live = await getFinancialReportData();
  const rows = live.branchSummary.length
    ? live.branchSummary.map((row) => ({
        branch: row.branch,
        bookedMmk: row.bookedMmk,
        codMmk: row.codMmk,
        settlementMmk: row.settlementMmk,
        varianceMmk: row.varianceMmk,
        status: row.varianceMmk === 0 ? "Balanced" : row.varianceMmk < 500000 ? "Review" : "Delayed"
      }))
    : financialRows.map((row) => ({
        branch: row.branch,
        bookedMmk: Number(row.bookedMmk.replace(/,/g, "")),
        codMmk: Number(row.codMmk.replace(/,/g, "")),
        settlementMmk: Number(row.settlementMmk.replace(/,/g, "")),
        varianceMmk: Number(row.varianceMmk.replace(/,/g, "")),
        status: row.status
      }));

  const totals = rows.reduce((acc, row) => {
    acc.booked += row.bookedMmk;
    acc.cod += row.codMmk;
    acc.settled += row.settlementMmk;
    acc.variance += row.varianceMmk;
    return acc;
  }, { booked: 0, cod: 0, settled: 0, variance: 0 });

  const tone = (value: string) => value === "Balanced" ? "success" : value === "Review" ? "warning" : "danger";

  return (
    <Shell activeHref="/financial-reports">
      <section className="hero">
        <article className="hero-card">
          <div className="kicker">Financial Reports / ငွေကြေးအစီရင်ခံစာများ</div>
          <h1 className="hero-title">Settlement, COD, and branch variance reports with live Supabase aggregation.</h1>
          <p className="hero-copy" style={{ marginTop: 16, maxWidth: 760 }}>
            This screen now computes branch-level summaries from shipment rows when live data is available. It stays visually polished while becoming materially closer to a production finance console.
          </p>
          <div className="action-row">
            <StatusPill tone={live.mode === "live" ? "success" : "pending"}>
              {live.mode === "live" ? "Supabase connected" : "Mock mode"}
            </StatusPill>
            <span className="badge">COD aware</span>
            <span className="badge">Export-ready layout</span>
          </div>
          <div className="financial-stats" style={{ marginTop: 22 }}>
            <MetricCard label="Gross booked" value={formatMmk(totals.booked)} meta="Aggregated quoted fees across visible branches" />
            <MetricCard label="COD captured" value={formatMmk(totals.cod)} meta="Expected customer collections" />
            <MetricCard label="Settled" value={formatMmk(totals.settled)} meta="Delivered shipments treated as settled in this starter logic" />
            <MetricCard label="Variance" value={formatMmk(totals.variance)} meta="Use this to drive exception queues and reconciliation" />
          </div>
        </article>

        <aside className="card">
          <SectionTitle
            eyebrow="Report scope"
            title="Finance stack"
            copy="Daily cut-off, branch-level variance, COD aging, and leadership-ready summaries can all build on the same query shape."
          />
          <div className="stack">
            <div className="badge">Branch settlement</div>
            <div className="badge">COD outstanding</div>
            <div className="badge">Variance review</div>
            <div className="badge">Audit export</div>
          </div>
        </aside>
      </section>

      <section className="page-grid">
        <div className="page-main">
          <article className="panel">
            <SectionTitle
              eyebrow="Settlement matrix"
              title="Branch-level reconciliation"
              copy="This table is now data-driven when the merged Supabase backend is configured."
              action={<span className="badge">{rows.length} branches</span>}
            />
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Branch</th>
                    <th>Booked MMK</th>
                    <th>COD MMK</th>
                    <th>Settled MMK</th>
                    <th>Variance MMK</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.branch}>
                      <td>{row.branch}</td>
                      <td>{formatMmk(row.bookedMmk)}</td>
                      <td>{formatMmk(row.codMmk)}</td>
                      <td>{formatMmk(row.settlementMmk)}</td>
                      <td>{formatMmk(row.varianceMmk)}</td>
                      <td><StatusPill tone={tone(row.status)}>{row.status}</StatusPill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>

        <div className="page-side" style={{ display: "grid", gap: 22 }}>
          <article className="card">
            <SectionTitle
              eyebrow="Interpretation"
              title="Current starter logic"
              copy="In this production scaffold, delivered shipments count as settled. You can later replace this with dedicated remittance and settlement tables."
            />
            <div className="stack">
              <div className="tile"><strong>Step 1</strong><p className="muted" style={{ marginTop: 8 }}>Quoted fees roll into booked totals.</p></div>
              <div className="tile"><strong>Step 2</strong><p className="muted" style={{ marginTop: 8 }}>COD is aggregated by branch-origin grouping.</p></div>
              <div className="tile"><strong>Step 3</strong><p className="muted" style={{ marginTop: 8 }}>Delivered status marks settled value for the starter dashboard.</p></div>
            </div>
          </article>
        </div>
      </section>
    </Shell>
  );
}
