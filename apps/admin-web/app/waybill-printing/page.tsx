
import { EditableFormCard } from "../../components/EditableFormCard";
import { ReferenceStrip } from "../../components/ReferenceStrip";
import { SectionHeader } from "../../components/SectionHeader";
import { Shell } from "../../components/Shell";
import { StatusTable } from "../../components/StatusTable";

const custodyPoints = [
  ["Pickup scan", "Courier mobile", "Creates first chain-of-custody event"],
  ["Origin hub inbound", "Branch scanner", "Confirms branch receipt"],
  ["Linehaul load", "Hub operator", "Links manifest and route run"],
  ["Destination hub inbound", "Branch scanner", "Updates intercity movement"],
  ["Out for delivery", "Courier mobile", "Enables realtime ETA"],
  ["Delivered", "Courier mobile + signature pad", "Stores OTP, photo, or signature proof"]
];

export default function WaybillPage() {
  return (
    <Shell
      title="Waybill printing and QR chain-of-custody"
      subtitle="This page implements the production pattern you requested: every shipment has a printable waybill, QR lookup token, append-only scan trail, and signature-ready proof of delivery."
    >
      <div className="twoCol">
        <div className="listGrid">
          <SectionHeader
            eyebrow="Chain of custody"
            title="Waybill print and scan controls"
            subtitle="Supports A4 and thermal labels, mobile camera scanning, dedicated scanner devices, and signature-pad capture."
          />
          <EditableFormCard
            title="Waybill template editor"
            description="Editable operator fields for a contractor-ready label generator."
            fields={[
              { label: "Waybill number", placeholder: "WB-240326-0001" },
              { label: "Tracking number", placeholder: "BEX-240326-0001" },
              { label: "QR payload", placeholder: "Signed lookup token" },
              { label: "Service type", placeholder: "Same day / next day / standard" },
              { label: "COD flag", placeholder: "Yes / No" },
              { label: "Printer target", placeholder: "Thermal / A4 / branch queue" }
            ]}
          />
          <StatusTable
            headers={["Custody point", "Device", "Purpose"]}
            rows={custodyPoints}
          />
        </div>
        <div className="listGrid">
          <ReferenceStrip pages={[4, 5, 6, 8, 9, 10, 12]} />
          <div className="card">
            <h3>Scan ingestion rules</h3>
            <ul className="muted" style={{ paddingLeft: 18, lineHeight: 1.7 }}>
              <li>Every scan writes an immutable event row plus latest shipment state update.</li>
              <li>QR payload should use signed tokens, not raw customer PII.</li>
              <li>Duplicate scans are handled via idempotency keys.</li>
              <li>Delivery scan can require OTP, photo, signature, or mixed proof.</li>
            </ul>
          </div>
        </div>
      </div>
    </Shell>
  );
}
