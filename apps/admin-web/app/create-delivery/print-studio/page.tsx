import Link from "next/link";
import { Shell, SectionTitle, StatusPill } from "../../_components/ui";
import { batchWaybills, printFormats } from "../../_lib/waybill";

export default function PrintStudioPage() {
  return (
    <Shell activeHref="/create-delivery">
      <section className="hero">
        <article className="hero-card">
          <div className="kicker">Waybill Print Studio / အညွှန်းပုံနှိပ်စက်ခန်း</div>
          <h1 className="hero-title">Production-ready print routing for thermal labels, A4, A5, single, and batch output.</h1>
          <p className="hero-copy" style={{ marginTop: 16, maxWidth: 760 }}>
            This studio wires the exact Britium sample layout into a reusable print pipeline. Operators can print one waybill,
            two 4 x 3 labels on a 4 x 6 sheet, or paginated A4 and A5 batches from the same shipment payload.
          </p>
          <div className="action-row">
            <Link className="btn btn-primary" href="/print/waybill?format=4x6_single">Open 4 x 6 preview</Link>
            <Link className="btn btn-secondary" href="/print/waybill?format=4x3_two_up_on_4x6">Open 4 x 3 two-up</Link>
            <span className="badge">API: /api/waybills/print</span>
          </div>
        </article>
        <aside className="card">
          <SectionTitle
            eyebrow="Jobs"
            title="Queued design profiles"
            copy="All templates are batch-safe and can be called from booking, manifest closure, or customer-service reprint flows."
          />
          <div className="stack">
            {printFormats.map((format) => (
              <div key={format.code} className="inner-card card">
                <div className="split-row">
                  <div>
                    <div style={{ fontWeight: 800 }}>{format.title}</div>
                    <div className="muted" style={{ marginTop: 6 }}>{format.subtitle}</div>
                  </div>
                  <StatusPill tone="success">Ready</StatusPill>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="page-grid">
        <div className="page-main">
          <article className="panel">
            <SectionTitle
              eyebrow="Single + batch"
              title="Shipment payloads bound to output formats"
              copy="The print backend receives shipment IDs, the selected format profile, and the requested number of copies. It then routes the user to the matching print surface."
            />
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tracking</th>
                    <th>Recipient</th>
                    <th>COD</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batchWaybills.map((shipment) => (
                    <tr key={shipment.shipmentId}>
                      <td>{shipment.trackingNumber}</td>
                      <td>{shipment.recipientName}</td>
                      <td>{shipment.codAmountMmks.toLocaleString()} MMK</td>
                      <td>
                        <div className="action-row" style={{ marginTop: 0 }}>
                          <Link className="btn btn-secondary" href={`/print/waybill?format=4x6_single&shipmentIds=${shipment.shipmentId}`}>4 x 6</Link>
                          <Link className="btn btn-secondary" href={`/print/waybill?format=a5_single&shipmentIds=${shipment.shipmentId}`}>A5</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>

        <aside className="card">
          <SectionTitle
            eyebrow="Reference"
            title="Master sample"
            copy="The layout aligns to your uploaded sample: brand header, timestamp, QR, merchant, recipient, pricing matrix, COD box, remarks, and footer."
          />
          <img src="/references/waybill-reference.png" alt="Waybill reference" style={{ width: "100%", borderRadius: 24, border: "1px solid var(--line)" }} />
        </aside>
      </section>
    </Shell>
  );
}
