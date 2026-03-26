
import Link from "next/link";
import { notFound } from "next/navigation";
import { Shell } from "../../../components/Shell";
import { EditableFormCard } from "../../../components/EditableFormCard";
import { KeyValueGrid } from "../../../components/KeyValueGrid";
import { ReferenceStrip } from "../../../components/ReferenceStrip";
import { SectionHeader } from "../../../components/SectionHeader";
import { StatusTable } from "../../../components/StatusTable";
import { sections } from "../../../lib/data";

type Props = {
  params: Promise<{ slug: string }>;
};

const contentMap: Record<string, {
  metrics: Array<{ label: string; value: string; note?: string }>;
  forms: Array<{ title: string; description: string; fields: Array<{ label: string; placeholder: string; value?: string }> }>;
  headers: string[];
  rows: string[][];
}> = {
  dashboard: {
    metrics: [
      { label: "Today's ways", value: "180", note: "Visible pattern from the uploaded dashboard" },
      { label: "To assign", value: "82", note: "Ops load waiting for dispatch" },
      { label: "Pickup success", value: "27", note: "KPI example" },
      { label: "Delivery success", value: "19", note: "KPI example" }
    ],
    forms: [
      {
        title: "Operations filter",
        description: "Editable filter block that mirrors the BE top-bar style while remaining implementation-friendly.",
        fields: [
          { label: "Date range", placeholder: "25/12/2025 - 25/01/2026" },
          { label: "Branch", placeholder: "Yangon HQ" },
          { label: "Service line", placeholder: "Merchant direct order" },
          { label: "Language", placeholder: "English / မြန်မာ" }
        ]
      }
    ],
    headers: ["Widget", "Source", "Supabase view", "Refresh"],
    rows: [
      ["Way count trend", "shipment_events", "ops_dashboard_daily", "5 min"],
      ["Assign backlog", "assignments", "ops_assignment_backlog", "1 min"],
      ["Branch performance", "shipments", "ops_branch_sla", "15 min"]
    ]
  },
  "create-delivery": {
    metrics: [
      { label: "Booking modes", value: "3", note: "Merchant, office, post office" },
      { label: "Mandatory checks", value: "6", note: "Address, phone, parcel, service, fee, assignment" },
      { label: "Launch languages", value: "2", note: "English + Myanmar" }
    ],
    forms: [
      {
        title: "Pickup booking form",
        description: "Built from the uploaded Create Delivery screens and aligned to the master spec.",
        fields: [
          { label: "Merchant name / phone / ID", placeholder: "Type merchant name, phone, or merchant ID" },
          { label: "Pickup location", placeholder: "Pickup from merchant / highway gate / post office" },
          { label: "Pickup address", placeholder: "Select or add address" },
          { label: "Number of ways", placeholder: "1" },
          { label: "Remark", placeholder: "Parcel note or promo code" },
          { label: "Auto assign rider", placeholder: "Yes / No" }
        ]
      },
      {
        title: "In-office delivery creation",
        description: "Matches the office-received parcel flow shown in the PDF.",
        fields: [
          { label: "Sender name", placeholder: "Aqua Pa La Tar Aquarium Store" },
          { label: "Mobile phone", placeholder: "+95..." },
          { label: "Pickup date", placeholder: "YYYY-MM-DD" },
          { label: "Other phones", placeholder: "Optional" },
          { label: "Parcel type", placeholder: "Document / parcel / fragile" },
          { label: "Declared value", placeholder: "MMK" }
        ]
      }
    ],
    headers: ["Rule", "Description", "Workflow owner", "Status"],
    rows: [
      ["Quote before confirm", "Fee estimate locked before booking", "Booking workflow", "Required"],
      ["Idempotent submit", "Prevents duplicate bookings on weak networks", "API", "Required"],
      ["Branch catchment", "Assigns origin branch from geocoded address", "Zone service", "Required"]
    ]
  },
  "way-management": {
    metrics: [
      { label: "Canonical states", value: "18", note: "From draft to returned" },
      { label: "Custody scans", value: "8", note: "Pickup through delivered/returned" },
      { label: "Tracking freshness", value: "< 60s", note: "Realtime target" }
    ],
    forms: [
      {
        title: "Shipment command panel",
        description: "Operator control surface for pickup, delivery, failure, return, and parcel in/out actions.",
        fields: [
          { label: "Tracking number", placeholder: "BEX-240326-0001" },
          { label: "Action", placeholder: "Assign / Pickup / Fail / Return / Transit" },
          { label: "Branch", placeholder: "Yangon North" },
          { label: "Operator note", placeholder: "Reason or scan exception" }
        ]
      },
      {
        title: "Tracking map side sheet",
        description: "State-of-the-art route and map overlay using Mapbox snapshots and event breadcrumbs.",
        fields: [
          { label: "Mapbox route ID", placeholder: "rt_..." },
          { label: "Latest lat/lng", placeholder: "16.8661, 96.1951" },
          { label: "ETA", placeholder: "16:40" },
          { label: "Deviation reason", placeholder: "Traffic / customer unavailable / weather" }
        ]
      }
    ],
    headers: ["Queue", "Primary actor", "Scan required", "Customer visible"],
    rows: [
      ["Pickup ways", "Courier", "Yes", "Yes"],
      ["Deliver ways", "Courier", "Yes", "Yes"],
      ["Failed ways", "Dispatcher", "Optional exception", "Yes"],
      ["Return ways", "Branch", "Yes", "Yes"],
      ["Parcel in/out", "Hub operator", "Yes", "Internal"],
      ["Transit route", "Linehaul", "Yes", "Yes"]
    ]
  },
  merchants: {
    metrics: [
      { label: "Merchant account types", value: "2", note: "Retail and business contract" },
      { label: "Receipt channels", value: "3", note: "Cash, transfer, COD" },
      { label: "Billing cycles", value: "4", note: "Daily, weekly, biweekly, monthly" }
    ],
    forms: [
      {
        title: "Merchant profile",
        description: "Editable merchant form with addresses, payout preferences, and invoice scheduling.",
        fields: [
          { label: "Merchant legal name", placeholder: "Nora Store" },
          { label: "Trading name", placeholder: "Mee Lay Online Shop" },
          { label: "Primary phone", placeholder: "+95..." },
          { label: "Default pickup address", placeholder: "Township, landmark, map pin" },
          { label: "Billing type", placeholder: "Prepaid / Postpaid" },
          { label: "Settlement cycle", placeholder: "Weekly" }
        ]
      },
      {
        title: "Cash advance / receipt block",
        description: "Derived from the PDF financial sub-pages and aligned with merchant accounting.",
        fields: [
          { label: "Advance amount", placeholder: "MMK" },
          { label: "Received by", placeholder: "Operator name" },
          { label: "Bank account", placeholder: "Merchant settlement account" },
          { label: "Receipt number", placeholder: "RCT-..." }
        ]
      }
    ],
    headers: ["Feature", "MVP behavior", "Supabase object"],
    rows: [
      ["Receipts", "Issue printable PDF + event log", "receipt_ledger view"],
      ["Bank accounts", "Masked account storage", "merchant_bank_accounts"],
      ["Invoice scheduling", "Cron-based batch invoice generation", "invoice_runs"]
    ]
  },
  "delivery-team": {
    metrics: [
      { label: "Login mode", value: "OTP + device bind", note: "For couriers" },
      { label: "Work states", value: "6", note: "Offline, online, assigned, picking, delivering, settlement" },
      { label: "Pilot cities", value: "3", note: "Yangon, Mandalay, Naypyitaw" }
    ],
    forms: [
      {
        title: "Deliveryman onboarding",
        description: "Editable rider profile for first-party operations and future fleet migration.",
        fields: [
          { label: "Employee code", placeholder: "DRV-0012" },
          { label: "Full name", placeholder: "Aung Ko Ko" },
          { label: "Branch", placeholder: "Yangon HQ" },
          { label: "Vehicle type", placeholder: "Bike / Van / Car" },
          { label: "Phone", placeholder: "+95..." },
          { label: "Emergency contact", placeholder: "Optional" }
        ]
      }
    ],
    headers: ["Screen", "Purpose", "Primary store", "Visibility"],
    rows: [
      ["Rider list", "Roster and search", "couriers", "Admin"],
      ["Payout center", "Cash and COD summary", "courier_settlements", "Finance"],
      ["Attendance sync", "HR / shift alignment", "hr_sync_jobs", "Admin"]
    ]
  },
  "financial-suite": {
    metrics: [
      { label: "Core ledgers", value: "5", note: "Receipts, invoices, COD, refunds, deposits" },
      { label: "Critical reports", value: "8", note: "From the uploaded financial pages and Britium spec" },
      { label: "Export formats", value: "3", note: "CSV, XLSX, PDF" }
    ],
    forms: [
      {
        title: "Finance report filter",
        description: "One filter surface for daily receipts, overdue accounts, COD reconciliation, and branch settlement.",
        fields: [
          { label: "Report type", placeholder: "Daily receipts / COD reconciliation / branch settlement" },
          { label: "Date range", placeholder: "YYYY-MM-DD to YYYY-MM-DD" },
          { label: "Branch or merchant", placeholder: "Select target scope" },
          { label: "Export format", placeholder: "CSV / XLSX / PDF" }
        ]
      },
      {
        title: "Refund and billing exception",
        description: "Editable finance form based on the refund and billing problem pages visible in the PDF.",
        fields: [
          { label: "Shipment / invoice reference", placeholder: "BEX-..." },
          { label: "Exception type", placeholder: "Refund / billing problem / missing remittance" },
          { label: "Amount", placeholder: "MMK" },
          { label: "Resolution note", placeholder: "Explain decision" }
        ]
      }
    ],
    headers: ["Report", "Owner", "Cadence", "Status"],
    rows: [
      ["Daily receipts", "Finance", "Daily", "Ready"],
      ["Account overdue ways", "Finance", "Daily", "Ready"],
      ["Merchant cash advance", "Finance", "Daily", "Ready"],
      ["COD reconciliation", "Finance", "Daily", "Priority"],
      ["Refund ledger", "Finance", "Daily", "Ready"]
    ]
  },
  reporting: {
    metrics: [
      { label: "Communication channels", value: "3", note: "Push, SMS, email" },
      { label: "Broadcast scopes", value: "4", note: "All users, branch, merchant, courier" },
      { label: "Support SLA queues", value: "5", note: "New, assigned, waiting, resolved, escalated" }
    ],
    forms: [
      {
        title: "Broadcast message composer",
        description: "Admin tool for English and Myanmar messaging with target filters and audit trail.",
        fields: [
          { label: "Audience", placeholder: "All couriers / branch / merchants / customers" },
          { label: "English message", placeholder: "Type English content" },
          { label: "Myanmar message", placeholder: "မြန်မာဘာသာ စာသား" },
          { label: "Schedule", placeholder: "Send now / schedule" }
        ]
      }
    ],
    headers: ["Queue", "Purpose", "Integration", "Audit"],
    rows: [
      ["Customer support", "Ticket handling", "support_tickets", "Yes"],
      ["Broadcast delivery", "Operational notices", "notification_jobs", "Yes"],
      ["Performance reports", "Ops review", "analytics schema", "Yes"]
    ]
  },
  "network-and-routing": {
    metrics: [
      { label: "Routing engine", value: "Mapbox", note: "Directions + Optimization APIs" },
      { label: "Route snapshots", value: "Immutable", note: "Auditable dispatch decisions" },
      { label: "Coverage layers", value: "4", note: "City, township, station, zone" }
    ],
    forms: [
      {
        title: "Way plan management",
        description: "Dispatcher planning tool inspired by the uploaded route/zone pages and extended with Mapbox.",
        fields: [
          { label: "Plan name", placeholder: "Yangon AM Run A" },
          { label: "Start branch", placeholder: "Yangon HQ" },
          { label: "Vehicle", placeholder: "Van 03" },
          { label: "Stops", placeholder: "12" },
          { label: "Optimization mode", placeholder: "Fastest / balanced / SLA-first" },
          { label: "Traffic profile", placeholder: "Driving traffic" }
        ]
      },
      {
        title: "Zone auto assign",
        description: "Configuration form for branch coverage and automated rider matching.",
        fields: [
          { label: "Zone code", placeholder: "YGN-NORTH-01" },
          { label: "City / township", placeholder: "Yangon / Hlaing" },
          { label: "Service type", placeholder: "Same day / next day / standard" },
          { label: "Fallback branch", placeholder: "Yangon Central" }
        ]
      }
    ],
    headers: ["Layer", "Stored as", "Used by", "Live update"],
    rows: [
      ["Station network", "service_zones", "dispatch + quote engine", "Manual"],
      ["Coverage polygons", "GeoJSON", "serviceability check", "Manual"],
      ["Route runs", "route_runs", "courier app + admin", "Realtime"]
    ]
  },
  "pricing-and-settings": {
    metrics: [
      { label: "Pricing dimensions", value: "5", note: "Zone, distance, parcel class, SLA, COD" },
      { label: "Admin scopes", value: "6", note: "Global, region, branch, finance, support, courier ops" },
      { label: "Provider adapters", value: "5", note: "Maps, SMS, email, payment, signature" }
    ],
    forms: [
      {
        title: "Pricing rule editor",
        description: "Editable state-of-the-art pricing surface for Myanmar branch logistics.",
        fields: [
          { label: "Rule name", placeholder: "Yangon same-day base fee" },
          { label: "Origin zone", placeholder: "YGN-CENTRAL" },
          { label: "Destination zone", placeholder: "YGN-NORTH" },
          { label: "Base fee", placeholder: "MMK 3,500" },
          { label: "Per kg surcharge", placeholder: "MMK 500" },
          { label: "COD fee", placeholder: "MMK 300" }
        ]
      },
      {
        title: "System settings",
        description: "Covers contacts, HR sync, signature devices, notification templates, and branch settings.",
        fields: [
          { label: "Support email", placeholder: "support@britium.mm" },
          { label: "Mapbox token alias", placeholder: "MAPBOX_PUBLIC_TOKEN" },
          { label: "Signature provider", placeholder: "Vendor adapter key" },
          { label: "Default locale", placeholder: "en / my" }
        ]
      }
    ],
    headers: ["Setting group", "Persistence", "Change control", "Launch priority"],
    rows: [
      ["Pricing", "pricing_rules", "Finance + admin approval", "High"],
      ["Settings", "system_settings", "Super admin", "High"],
      ["Contacts", "contact_directory", "Admin", "Medium"]
    ]
  },
  "reference-tail": {
    metrics: [
      { label: "Preserved pages", value: "24", note: "Tail of the uploaded reference bundle" },
      { label: "Migration mode", value: "Section by section", note: "Safe modernization path" },
      { label: "Delivery target", value: "Contractor-ready", note: "No blind OCR rewrites" }
    ],
    forms: [
      {
        title: "Screen migration checklist",
        description: "Use this tracker when converting the remaining PDF pages into exact code screens.",
        fields: [
          { label: "Reference page range", placeholder: "65-88" },
          { label: "Target route", placeholder: "/blueprint/..." },
          { label: "Confirmed labels", placeholder: "English / Myanmar" },
          { label: "Approved by", placeholder: "Ops / Finance / Product" }
        ]
      }
    ],
    headers: ["Step", "Description", "Output"],
    rows: [
      ["Review", "Compare screenshot to route", "Gap list"],
      ["Model", "Normalize fields into schema", "Typed contracts"],
      ["Implement", "Build page in Next.js", "Editable screen"],
      ["Verify", "Ops sign-off against reference", "Approved"]
    ]
  }
};

export default async function BlueprintDetailPage({ params }: Props) {
  const { slug } = await params;
  const section = sections.find((item) => item.slug === slug);
  const content = contentMap[slug];

  if (!section || !content) {
    notFound();
  }

  return (
    <Shell
      title={`${section.title} / ${section.titleMy}`}
      subtitle={section.description}
    >
      <div className="twoCol">
        <div className="listGrid">
          <SectionHeader
            eyebrow="Editable section"
            title="Key operational data points"
            subtitle="These widgets convert the uploaded reference pages into implementation-ready state, tables, and forms."
          />
          <KeyValueGrid items={content.metrics} />
          <SectionHeader
            eyebrow="Forms and actions"
            title="Editable contractor-ready controls"
            subtitle="The controls below are typed React inputs instead of static screenshots so your team can wire them to Supabase immediately."
          />
          {content.forms.map((form) => (
            <EditableFormCard key={form.title} {...form} />
          ))}
          <SectionHeader
            eyebrow="Data contracts"
            title="Suggested data view"
            subtitle="These tables show how the visual PDF sections map to stable backend objects and operational workflows."
          />
          <StatusTable headers={content.headers} rows={content.rows} />
        </div>

        <div className="listGrid">
          <ReferenceStrip pages={section.referencePages} />
          <div className="card">
            <h3>Why this rebuild is safer</h3>
            <ul className="muted" style={{ paddingLeft: 18, lineHeight: 1.7 }}>
              <li>Preserves the uploaded BE visual intent without copying unreadable OCR blindly.</li>
              <li>Converts static pages into typed forms and tables ready for Vercel + Supabase.</li>
              <li>Keeps English and Myanmar labels visible so bilingual hardening can continue safely.</li>
              <li>Links every module back to the PDF gallery for side-by-side operator review.</li>
            </ul>
          </div>
          <div className="card">
            <h3>Next migration steps</h3>
            <p className="muted">
              Use this section as the editable baseline. Then copy exact field labels from the PDF into the
              bilingual dictionaries after operator review.
            </p>
            <Link className="navlink" href="/reference">
              Open attached PDF gallery
            </Link>
          </div>
        </div>
      </div>
    </Shell>
  );
}

export function generateStaticParams() {
  return sections.map((section) => ({ slug: section.slug }));
}
