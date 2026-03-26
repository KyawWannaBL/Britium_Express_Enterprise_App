import Link from "next/link";
import { deliveryStages, financialRows, routeStops } from "./_lib/mock-data";
import { DualLine, HeroActions, MetricCard, SectionTitle, Shell, StatusPill } from "./_components/ui";

export default function HomePage() {
  return (
    <Shell activeHref="/">
      <section className="hero">
        <article className="hero-card">
          <div className="kicker">Britium command center</div>
          <h1 className="hero-title">Beautiful operations surfaces for every logistics moment.</h1>
          <p className="hero-copy" style={{ marginTop: 16, maxWidth: 620 }}>
            Start with Create Delivery, Way Management, and Financial Reports. Each module is designed
            for bilingual operators in Myanmar, waybill-first tracking, branch visibility, and clean
            executive reporting.
          </p>
          <HeroActions />
          <div className="hero-grid">
            <MetricCard label="Daily bookings" value="2,481" meta="Yangon, Mandalay, Naypyitaw combined" />
            <MetricCard label="Scan compliance" value="98.4%" meta="QR and barcode events within SLA" />
            <MetricCard label="COD accuracy" value="99.1%" meta="Branch settlement variance under control" />
          </div>
        </article>

        <aside className="card">
          <SectionTitle
            eyebrow="Module order"
            title="Your requested build sequence"
            copy="Create Delivery first, followed by Way Management and Financial Reports, all in a stronger branded UI."
          />
          <div className="stack">
            <Link className="btn btn-primary" href="/create-delivery">
              Open Create Delivery
            </Link>
            <Link className="btn btn-secondary" href="/way-management">
              Open Way Management
            </Link>
            <Link className="btn btn-secondary" href="/financial-reports">
              Open Financial Reports
            </Link>
          </div>
        </aside>
      </section>

      <section className="page-grid">
        <div className="page-main">
          <article className="panel">
            <SectionTitle
              eyebrow="Delivery journey"
              title="Operational design highlights"
              copy="The following stages reflect the shipment lifecycle that the apps, waybill scans, and workflows will enforce."
            />
            <div className="split">
              {deliveryStages.map((stage) => (
                <div className="card" key={stage.title.en}>
                  <DualLine en={stage.title.en} my={stage.title.my} />
                  <p className="muted" style={{ marginTop: 12 }}>{stage.detail.en}</p>
                  <p className="muted" style={{ marginTop: 6 }}>{stage.detail.my}</p>
                  <div className="badge" style={{ marginTop: 16 }}>ETA {stage.eta}</div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <SectionTitle
              eyebrow="Route readiness"
              title="Live stop sequencing"
              copy="Way Management will use these route abstractions to batch work across city zones and hub transfers."
            />
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Stop</th>
                    <th>Township</th>
                    <th>Shipments</th>
                    <th>ETA</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {routeStops.map((stop) => (
                    <tr key={stop.stopCode}>
                      <td>#{stop.order} · {stop.stopCode}</td>
                      <td>{stop.township}</td>
                      <td>{stop.shipmentCount}</td>
                      <td>{stop.eta}</td>
                      <td>
                        <StatusPill
                          tone={stop.status === "Ready" ? "success" : stop.status === "At Risk" ? "warning" : "info"}
                        >
                          {stop.status}
                        </StatusPill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>

        <aside className="page-main">
          <article className="card">
            <SectionTitle
              eyebrow="Finance pulse"
              title="Branch reconciliation snapshot"
              copy="Financial Reports will convert raw branch settlement data into a cleaner executive layer."
            />
            <div className="stack">
              {financialRows.map((row) => (
                <div className="card" key={row.branch}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                    <strong>{row.branch}</strong>
                    <StatusPill tone={row.status === "Balanced" ? "success" : row.status === "Review" ? "warning" : "danger"}>
                      {row.status}
                    </StatusPill>
                  </div>
                  <p className="muted" style={{ marginTop: 10 }}>Booked MMK {row.bookedMmk}</p>
                  <p className="muted" style={{ marginTop: 6 }}>COD MMK {row.codMmk}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="card">
            <SectionTitle
              eyebrow="Brand direction"
              title="Professional visual language"
              copy="Dark premium surfaces, high-contrast data cards, bilingual labels, and route-centric layouts are applied consistently."
            />
            <div className="note">
              This pass keeps the code TypeScript-safe and framework-light so it remains stable on Vercel while we deepen each workflow.
            </div>
          </article>
        </aside>
      </section>
      <div className="footer-space" />
    </Shell>
  );
}
