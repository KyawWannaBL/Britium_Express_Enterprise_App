
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DualLine, MetricCard, SectionTitle, Shell, StatusPill } from "../_components/ui";

type RecentCustomer = {
  code: string;
  name: string;
  phone: string;
  city: string;
  shipments30d: number;
  codMmk: number;
  status: string;
};

type ShipmentRow = {
  id: string;
  tracking_number: string;
  sender_name: string;
  sender_phone: string | null;
  recipient_name: string;
  recipient_phone_e164: string;
  service_type: string;
  status: string;
  cod_amount_mmks: number;
  quoted_fee_mmks: number;
};

type WaybillRow = {
  id: string;
  shipment_id: string;
  waybill_number: string;
  qr_payload: string;
  printed_count: number;
  last_printed_at: string | null;
};

type LiveData = {
  mode: "live" | "mock";
  recentCustomers: RecentCustomer[];
  shipments: ShipmentRow[];
  waybills: WaybillRow[];
};

type CustomerLookupRow = {
  id: string;
  customer_code: string;
  customer_type: string;
  full_name: string;
  company_name: string | null;
  phone_e164: string;
  email: string | null;
  preferred_language: "en" | "my";
  notes: string | null;
  created_at: string;
};


function buildOpsHeaders(extra?: Record<string, string>) {
  return {
    "Content-Type": "application/json",
    ...(extra ?? {})
  };
}

function buildIdempotencyKey(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

type AddressLookupRow = {
  id: string;
  label: string | null;
  contact_name: string;
  phone_e164: string;
  address_line_1: string;
  township: string;
  city: string;
  state_region: string;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  serviceable: boolean;
  validation_status: string;
  customer_id: string | null;
  formattedLabel: string;
  serviceability: string;
};

type QuoteResponse = {
  requestId?: string;
  quoteId?: string;
  currency: string;
  routeCode: string;
  totalFeeMmks: number;
  baseFeeMmks: number;
  distanceSurchargeMmks: number;
  citySurchargeMmks: number;
  weightSurchargeMmks: number;
  fragileFeeMmks: number;
  fuelSurchargeMmks: number;
  insuranceFeeMmks: number;
  expiresAt: string;
  serviceType: string;
  pieces: number;
  parcelWeightKg: number;
};

type DeliveryResponse = {
  success: boolean;
  customer: { id: string; customer_code: string };
  pickupRequest: { id: string; pickup_number: string };
  shipment: {
    id: string;
    tracking_number: string;
    quoted_fee_mmks: number;
    cod_amount_mmks: number;
    service_type: string;
    recipient_name: string;
  };
  waybill: { id: string; waybill_number: string; qr_payload: string; printed_count: number };
  quote: QuoteResponse;
};

type PrintResponse = {
  queued: boolean;
  printJobId: string;
  renderPath: string;
  shipmentCount: number;
};

type FormState = {
  customerName: string;
  customerPhone: string;
  customerCompany: string;
  customerEmail: string;
  preferredLanguage: "en" | "my";
  customerType: "individual" | "merchant" | "business";
  senderLabel: string;
  senderContactName: string;
  senderPhone: string;
  senderAddressLine1: string;
  senderTownship: string;
  senderCity: string;
  senderStateRegion: string;
  senderLandmark: string;
  recipientLabel: string;
  recipientContactName: string;
  recipientPhone: string;
  recipientAddressLine1: string;
  recipientTownship: string;
  recipientCity: string;
  recipientStateRegion: string;
  recipientLandmark: string;
  serviceType: "same_day" | "next_day" | "standard";
  parcelWeightKg: string;
  pieces: string;
  parcelType: string;
  declaredValueMmks: string;
  codAmountMmks: string;
  fragile: boolean;
  preferredPickupDate: string;
  preferredTimeSlot: string;
  specialInstructions: string;
  printFormat: "4x6" | "4x3-2up" | "a4" | "a5";
  printCopies: string;
};

const INITIAL_FORM: FormState = {
  customerName: "",
  customerPhone: "",
  customerCompany: "",
  customerEmail: "",
  preferredLanguage: "en",
  customerType: "merchant",
  senderLabel: "Pickup",
  senderContactName: "",
  senderPhone: "",
  senderAddressLine1: "",
  senderTownship: "Ahlone",
  senderCity: "Yangon",
  senderStateRegion: "Myanmar",
  senderLandmark: "",
  recipientLabel: "Dropoff",
  recipientContactName: "",
  recipientPhone: "",
  recipientAddressLine1: "",
  recipientTownship: "",
  recipientCity: "Yangon",
  recipientStateRegion: "Myanmar",
  recipientLandmark: "",
  serviceType: "same_day",
  parcelWeightKg: "1",
  pieces: "1",
  parcelType: "parcel",
  declaredValueMmks: "0",
  codAmountMmks: "0",
  fragile: false,
  preferredPickupDate: "",
  preferredTimeSlot: "09:00-12:00",
  specialInstructions: "",
  printFormat: "4x6",
  printCopies: "1"
};

function formatMmks(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} MMK`;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function renderPseudoQr(payload: string) {
  const seed = Array.from(payload).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Array.from({ length: 25 * 25 }).map((_, index) => {
    const on = ((index * 7 + seed) % 11 === 0) || ((index + seed) % 13 === 0);
    return <span key={index} className={on ? "fill" : ""} />;
  });
}

export function CreateDeliveryConsole({ initialData }: { initialData: LiveData }) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [customerSearch, setCustomerSearch] = useState("");
  const [addressSearch, setAddressSearch] = useState("");
  const [customerResults, setCustomerResults] = useState<CustomerLookupRow[]>([]);
  const [addressResults, setAddressResults] = useState<AddressLookupRow[]>([]);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [booking, setBooking] = useState<DeliveryResponse | null>(null);
  const [printJob, setPrintJob] = useState<PrintResponse | null>(null);
  const [bulkRows, setBulkRows] = useState("delivery_no,sender_name,recipient_name,recipient_phone,delivery_address,parcel_count,cod_amount\n");
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<"" | "customers" | "addresses" | "quote" | "booking" | "print" | "bulk">("");

  const combinedWaybill = useMemo(() => {
    const latestWaybill = booking?.waybill ?? initialData.waybills[0] ?? null;
    const latestShipment = booking?.shipment ?? initialData.shipments[0] ?? null;
    const senderLine = [form.senderContactName || form.customerName, form.senderAddressLine1, form.senderTownship, form.senderCity]
      .filter(Boolean)
      .join(", ");
    const recipientLine = [form.recipientContactName, form.recipientAddressLine1, form.recipientTownship, form.recipientCity]
      .filter(Boolean)
      .join(", ");

    return {
      waybillNumber: latestWaybill?.waybill_number ?? "WB-PREVIEW",
      trackingNumber: latestShipment?.tracking_number ?? "PREVIEW-TRACK",
      qrPayload: latestWaybill?.qr_payload ?? JSON.stringify({ preview: true, tracking: latestShipment?.tracking_number ?? "PREVIEW-TRACK" }),
      senderName: form.customerCompany || form.customerName || "Britium Sender",
      senderPhone: form.customerPhone || "09xxxxxxxxx",
      senderAddress: senderLine || "Pickup address preview",
      recipientName: form.recipientContactName || latestShipment?.recipient_name || "Recipient",
      recipientPhone: form.recipientPhone || ((latestShipment as any)?.recipient_phone_e164 ?? ((latestShipment as any)?.recipientPhone)) || "09xxxxxxxxx",
      recipientAddress: recipientLine || "Drop-off address preview",
      serviceType: form.serviceType,
      codAmount: Number(form.codAmountMmks || 0),
      quotedFee: quote?.totalFeeMmks ?? latestShipment?.quoted_fee_mmks ?? 0,
      declaredValue: Number(form.declaredValueMmks || 0),
      pieces: Number(form.pieces || 1),
      weight: Number(form.parcelWeightKg || 0)
    };
  }, [booking, form, initialData.shipments, initialData.waybills, quote]);

  const metrics = useMemo(() => ({
    recentBookings: booking ? initialData.shipments.length + 1 : initialData.shipments.length,
    recentCustomers: initialData.recentCustomers.length,
    waybillsReady: booking ? initialData.waybills.length + 1 : initialData.waybills.length
  }), [booking, initialData]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function lookupCustomers() {
    setLoading("customers");
    setError("");
    try {
      const response = await fetch(`/api/customers?q=${encodeURIComponent(customerSearch)}`, { cache: "no-store" });
      const data = (await response.json()) as { customers?: CustomerLookupRow[]; error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Customer lookup failed");
      }
      setCustomerResults(data.customers ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Customer lookup failed");
    } finally {
      setLoading("");
    }
  }

  async function lookupAddresses() {
    setLoading("addresses");
    setError("");
    try {
      const params = new URLSearchParams();
      if (addressSearch) params.set("q", addressSearch);
      if (form.recipientCity) params.set("city", form.recipientCity);
      const response = await fetch(`/api/addresses/lookup?${params.toString()}`, { cache: "no-store" });
      const data = (await response.json()) as { addresses?: AddressLookupRow[]; error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Address lookup failed");
      }
      setAddressResults(data.addresses ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Address lookup failed");
    } finally {
      setLoading("");
    }
  }

  async function requestQuote() {
    setLoading("quote");
    setError("");
    setPrintJob(null);
    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: buildOpsHeaders({ "idempotency-key": buildIdempotencyKey("quote") }),
        body: JSON.stringify({
          senderAddress: {
            contactName: form.senderContactName || form.customerName,
            phoneE164: form.senderPhone || form.customerPhone,
            addressLine1: form.senderAddressLine1,
            township: form.senderTownship,
            city: form.senderCity,
            stateRegion: form.senderStateRegion,
            landmark: form.senderLandmark,
            label: form.senderLabel
          },
          recipientAddress: {
            contactName: form.recipientContactName,
            phoneE164: form.recipientPhone,
            addressLine1: form.recipientAddressLine1,
            township: form.recipientTownship,
            city: form.recipientCity,
            stateRegion: form.recipientStateRegion,
            landmark: form.recipientLandmark,
            label: form.recipientLabel
          },
          serviceType: form.serviceType,
          parcelWeightKg: Number(form.parcelWeightKg || 0),
          pieces: Number(form.pieces || 1),
          parcelType: form.parcelType,
          codAmountMmks: Number(form.codAmountMmks || 0),
          declaredValueMmks: Number(form.declaredValueMmks || 0),
          fragile: form.fragile
        })
      });
      const data = (await response.json()) as QuoteResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Quote request failed");
      }
      setQuote(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Quote request failed");
    } finally {
      setLoading("");
    }
  }

  async function createBooking() {
    setLoading("booking");
    setError("");
    setPrintJob(null);
    try {
      const response = await fetch("/api/deliveries", {
        method: "POST",
        headers: buildOpsHeaders({ "idempotency-key": buildIdempotencyKey("delivery") }),
        body: JSON.stringify({
          customer: {
            fullName: form.customerName,
            phoneE164: form.customerPhone,
            companyName: form.customerCompany,
            email: form.customerEmail,
            preferredLanguage: form.preferredLanguage,
            customerType: form.customerType
          },
          senderAddress: {
            label: form.senderLabel,
            contactName: form.senderContactName || form.customerName,
            phoneE164: form.senderPhone || form.customerPhone,
            addressLine1: form.senderAddressLine1,
            township: form.senderTownship,
            city: form.senderCity,
            stateRegion: form.senderStateRegion,
            landmark: form.senderLandmark
          },
          recipientAddress: {
            label: form.recipientLabel,
            contactName: form.recipientContactName,
            phoneE164: form.recipientPhone,
            addressLine1: form.recipientAddressLine1,
            township: form.recipientTownship,
            city: form.recipientCity,
            stateRegion: form.recipientStateRegion,
            landmark: form.recipientLandmark
          },
          serviceType: form.serviceType,
          parcelWeightKg: Number(form.parcelWeightKg || 0),
          pieces: Number(form.pieces || 1),
          parcelType: form.parcelType,
          codAmountMmks: Number(form.codAmountMmks || 0),
          declaredValueMmks: Number(form.declaredValueMmks || 0),
          fragile: form.fragile,
          preferredPickupDate: form.preferredPickupDate || null,
          preferredTimeSlot: form.preferredTimeSlot || null,
          specialInstructions: form.specialInstructions || null
        })
      });
      const data = (await response.json()) as DeliveryResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Booking failed");
      }
      setBooking(data);
      setQuote(data.quote);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setLoading("");
    }
  }

  async function queuePrint() {
    if (!booking?.shipment?.id) {
      setError("Create a booking before sending to the print queue.");
      return;
    }
    setLoading("print");
    setError("");
    try {
      const response = await fetch("/api/waybills/print", {
        method: "POST",
        headers: buildOpsHeaders({ "idempotency-key": buildIdempotencyKey("print") }),
        body: JSON.stringify({
          format: form.printFormat,
          copies: Number(form.printCopies || 1),
          shipmentIds: [booking.shipment.id]
        })
      });
      const data = (await response.json()) as PrintResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Print queue failed");
      }
      setPrintJob(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Print queue failed");
    } finally {
      setLoading("");
    }
  }

  async function registerBulkUpload() {
    setLoading("bulk");
    setError("");
    setBulkStatus("");
    try {
      if (bulkFile) {
        const formData = new FormData();
        formData.append("file", bulkFile);
        formData.append("branchCode", form.senderCity || "YGN");

        const response = await fetch("/api/pickups/bulk/upload", {
          method: "POST",
          headers: {
            "idempotency-key": buildIdempotencyKey("bulk-upload")
          },
          body: formData
        });

        const data = (await response.json()) as { job?: { job_number: string; parser_status?: string }; error?: string };
        if (!response.ok) {
          throw new Error(data.error || "Bulk upload failed");
        }

        setBulkStatus(`Bulk job ${data.job?.job_number ?? "created"} uploaded to Storage and queued for parser processing.`);
        return;
      }

      const lines = bulkRows.trim().split(/\r?\n/);
      const totalRows = Math.max(0, lines.length - 1);
      const response = await fetch("/api/pickups/bulk", {
        method: "POST",
        headers: buildOpsHeaders({ "idempotency-key": buildIdempotencyKey("bulk") }),
        body: JSON.stringify({
          filename: "britium-bulk-import.csv",
          rows: totalRows,
          acceptedRows: totalRows,
          rejectedRows: 0,
          templateVersion: "2026.03"
        })
      });
      const data = (await response.json()) as { job?: { job_number: string }; error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Bulk upload registration failed");
      }
      setBulkStatus(`Bulk job ${data.job?.job_number ?? "created"} registered for ${totalRows} row(s).`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk upload registration failed");
    } finally {
      setLoading("");
    }
  }

  function applyCustomer(customer: CustomerLookupRow) {
    update("customerName", customer.full_name);
    update("customerPhone", customer.phone_e164);
    update("customerCompany", customer.company_name ?? "");
    update("customerEmail", customer.email ?? "");
    update("preferredLanguage", customer.preferred_language);
    update("customerType", (customer.customer_type as FormState["customerType"]) || "merchant");
  }

  function applyRecipientAddress(address: AddressLookupRow) {
    update("recipientContactName", address.contact_name);
    update("recipientPhone", address.phone_e164);
    update("recipientAddressLine1", address.address_line_1);
    update("recipientTownship", address.township);
    update("recipientCity", address.city);
    update("recipientStateRegion", address.state_region);
    update("recipientLandmark", address.landmark ?? "");
  }

  return (
    <Shell activeHref="/create-delivery">
      <section className="hero">
        <article className="hero-card">
          <div className="kicker">Create Delivery / ပို့ဆောင်မှုဖန်တီးရန်</div>
          <h1 className="hero-title">Production booking console for counters, merchants, and customer service teams.</h1>
          <p className="hero-copy" style={{ marginTop: 16, maxWidth: 860 }}>
            Customer lookup, address lookup, quote engine, booking save, waybill preview, print queue, and bulk registration are now connected to the backend endpoints already present in this repo.
          </p>
          <div className="action-row">
            <Link className="btn btn-primary" href="/create-delivery/print-studio">Open print studio</Link>
            <Link className="btn btn-secondary" href="/print/waybill?format=4x6">Open live waybill</Link>
            <StatusPill tone={initialData.mode === "live" ? "success" : "pending"}>
              {initialData.mode === "live" ? "Supabase connected" : "Mock mode"}
            </StatusPill>
          </div>
          <div className="hero-grid">
            <MetricCard label="Recent bookings" value={String(metrics.recentBookings || 0)} meta="Live booking table and create-delivery feed" />
            <MetricCard label="Known customers" value={String(metrics.recentCustomers || 0)} meta="Recent sender profiles from the merged platform data" />
            <MetricCard label="Waybills ready" value={String(metrics.waybillsReady || 0)} meta="4x6, 4x3 two-up, A4, and A5 print profiles" />
          </div>
        </article>

        <aside className="card">
          <SectionTitle
            eyebrow="Operator workflow"
            title="End-to-end execution"
            copy="Use the left-side console to search customers, reuse known addresses, request a quote, save the booking, and send the generated waybill to print."
          />
          <div className="stack">
            {[
              ["1", "Customer lookup", "ရှာဖွေရန်", "Find or prefill merchant / sender records"],
              ["2", "Address lookup", "လိပ်စာရွေးရန်", "Reuse validated delivery addresses and serviceability"],
              ["3", "Quote", "ဈေးနှုန်း", "Call the pricing endpoint and review the commercial breakdown"],
              ["4", "Book", "စာရင်းသွင်းရန်", "Persist customer, addresses, pickup request, shipment, and waybill"],
              ["5", "Print", "ပုံနှိပ်ရန်", "Queue 4x6, 4x3 two-up, A4, or A5 printing"]
            ].map(([step, en, my, detail]) => (
              <div key={step} className="timeline-row">
                <div className="timeline-time">{step}</div>
                <div>
                  <DualLine en={en} my={my} />
                  <p className="muted" style={{ marginTop: 6 }}>{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      {error ? (
        <div className="alert alert-danger">{error}</div>
      ) : null}

      {booking ? (
        <div className="alert alert-success">
          Booking created: <strong>{booking.shipment.tracking_number}</strong> / <strong>{booking.waybill.waybill_number}</strong> — pickup request <strong>{booking.pickupRequest.pickup_number}</strong>.
        </div>
      ) : null}

      {printJob ? (
        <div className="alert alert-info">
          Print job queued: <strong>{printJob.printJobId}</strong> for {printJob.shipmentCount} shipment(s). <Link href={printJob.renderPath}>Open render surface</Link>.
        </div>
      ) : null}

      <section className="ops-grid">
        <div className="ops-main">
          <article className="panel">
            <SectionTitle
              eyebrow="Create Delivery form"
              title="Transaction console"
              copy="The form below writes to the quote, booking, pickup, shipment, scan, and waybill flows."
              action={<StatusPill tone={booking ? "success" : "info"}>{booking ? "Booking ready" : "Draft"}</StatusPill>}
            />

            <div className="console-grid">
              <section className="console-section">
                <h3>Customer / Customer အသေးစိတ်</h3>
                <div className="lookup-bar">
                  <input className="field" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} placeholder="Search customer, merchant, or phone" />
                  <button className="btn btn-secondary" onClick={lookupCustomers} disabled={!customerSearch || loading === "customers"}>
                    {loading === "customers" ? "Searching..." : "Lookup"}
                  </button>
                </div>
                <div className="form-grid form-grid-2">
                  <label className="field-group"><span>Customer name</span><input className="field" value={form.customerName} onChange={(e) => update("customerName", e.target.value)} /></label>
                  <label className="field-group"><span>Phone</span><input className="field" value={form.customerPhone} onChange={(e) => update("customerPhone", e.target.value)} /></label>
                  <label className="field-group"><span>Company</span><input className="field" value={form.customerCompany} onChange={(e) => update("customerCompany", e.target.value)} /></label>
                  <label className="field-group"><span>Email</span><input className="field" value={form.customerEmail} onChange={(e) => update("customerEmail", e.target.value)} /></label>
                  <label className="field-group"><span>Language</span>
                    <select className="field" value={form.preferredLanguage} onChange={(e) => update("preferredLanguage", e.target.value as FormState["preferredLanguage"])}>
                      <option value="en">English</option>
                      <option value="my">Myanmar</option>
                    </select>
                  </label>
                  <label className="field-group"><span>Type</span>
                    <select className="field" value={form.customerType} onChange={(e) => update("customerType", e.target.value as FormState["customerType"])}>
                      <option value="individual">Individual</option>
                      <option value="merchant">Merchant</option>
                      <option value="business">Business</option>
                    </select>
                  </label>
                </div>

                {customerResults.length > 0 ? (
                  <div className="selection-list">
                    {customerResults.map((customer) => (
                      <button key={customer.id} className="selection-card" onClick={() => applyCustomer(customer)} type="button">
                        <div>
                          <strong>{customer.full_name}</strong>
                          <div className="muted">{customer.company_name || customer.customer_code}</div>
                        </div>
                        <div className="selection-meta">
                          <div>{customer.phone_e164}</div>
                          <StatusPill tone="info">{customer.customer_type}</StatusPill>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : null}
              </section>

              <section className="console-section">
                <h3>Pickup address / စတင်ယူမည့်လိပ်စာ</h3>
                <div className="form-grid form-grid-2">
                  <label className="field-group"><span>Label</span><input className="field" value={form.senderLabel} onChange={(e) => update("senderLabel", e.target.value)} /></label>
                  <label className="field-group"><span>Contact</span><input className="field" value={form.senderContactName} onChange={(e) => update("senderContactName", e.target.value)} /></label>
                  <label className="field-group"><span>Phone</span><input className="field" value={form.senderPhone} onChange={(e) => update("senderPhone", e.target.value)} /></label>
                  <label className="field-group"><span>Landmark</span><input className="field" value={form.senderLandmark} onChange={(e) => update("senderLandmark", e.target.value)} /></label>
                  <label className="field-group field-group-full"><span>Address line 1</span><input className="field" value={form.senderAddressLine1} onChange={(e) => update("senderAddressLine1", e.target.value)} /></label>
                  <label className="field-group"><span>Township</span><input className="field" value={form.senderTownship} onChange={(e) => update("senderTownship", e.target.value)} /></label>
                  <label className="field-group"><span>City</span><input className="field" value={form.senderCity} onChange={(e) => update("senderCity", e.target.value)} /></label>
                </div>
              </section>

              <section className="console-section">
                <h3>Recipient address / ပို့ဆောင်မည့်လိပ်စာ</h3>
                <div className="lookup-bar">
                  <input className="field" value={addressSearch} onChange={(e) => setAddressSearch(e.target.value)} placeholder="Search validated address, township, landmark" />
                  <button className="btn btn-secondary" onClick={lookupAddresses} disabled={loading === "addresses"}>
                    {loading === "addresses" ? "Searching..." : "Lookup"}
                  </button>
                </div>
                <div className="form-grid form-grid-2">
                  <label className="field-group"><span>Label</span><input className="field" value={form.recipientLabel} onChange={(e) => update("recipientLabel", e.target.value)} /></label>
                  <label className="field-group"><span>Contact</span><input className="field" value={form.recipientContactName} onChange={(e) => update("recipientContactName", e.target.value)} /></label>
                  <label className="field-group"><span>Phone</span><input className="field" value={form.recipientPhone} onChange={(e) => update("recipientPhone", e.target.value)} /></label>
                  <label className="field-group"><span>Landmark</span><input className="field" value={form.recipientLandmark} onChange={(e) => update("recipientLandmark", e.target.value)} /></label>
                  <label className="field-group field-group-full"><span>Address line 1</span><input className="field" value={form.recipientAddressLine1} onChange={(e) => update("recipientAddressLine1", e.target.value)} /></label>
                  <label className="field-group"><span>Township</span><input className="field" value={form.recipientTownship} onChange={(e) => update("recipientTownship", e.target.value)} /></label>
                  <label className="field-group"><span>City</span><input className="field" value={form.recipientCity} onChange={(e) => update("recipientCity", e.target.value)} /></label>
                </div>

                {addressResults.length > 0 ? (
                  <div className="selection-list">
                    {addressResults.map((address) => (
                      <button key={address.id} className="selection-card" onClick={() => applyRecipientAddress(address)} type="button">
                        <div>
                          <strong>{address.formattedLabel}</strong>
                          <div className="muted">{address.landmark || address.validation_status}</div>
                        </div>
                        <div className="selection-meta">
                          <StatusPill tone={address.serviceable ? "success" : "warning"}>
                            {address.serviceable ? "Serviceable" : "Review"}
                          </StatusPill>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : null}
              </section>

              <section className="console-section">
                <h3>Commercials / ဈေးနှုန်းနှင့် ဝန်ဆောင်မှု</h3>
                <div className="form-grid form-grid-3">
                  <label className="field-group"><span>Service</span>
                    <select className="field" value={form.serviceType} onChange={(e) => update("serviceType", e.target.value as FormState["serviceType"])}>
                      <option value="same_day">Same day</option>
                      <option value="next_day">Next day</option>
                      <option value="standard">Standard</option>
                    </select>
                  </label>
                  <label className="field-group"><span>Weight (kg)</span><input className="field" value={form.parcelWeightKg} onChange={(e) => update("parcelWeightKg", e.target.value)} /></label>
                  <label className="field-group"><span>Pieces</span><input className="field" value={form.pieces} onChange={(e) => update("pieces", e.target.value)} /></label>
                  <label className="field-group"><span>Parcel type</span><input className="field" value={form.parcelType} onChange={(e) => update("parcelType", e.target.value)} /></label>
                  <label className="field-group"><span>Declared value</span><input className="field" value={form.declaredValueMmks} onChange={(e) => update("declaredValueMmks", e.target.value)} /></label>
                  <label className="field-group"><span>COD amount</span><input className="field" value={form.codAmountMmks} onChange={(e) => update("codAmountMmks", e.target.value)} /></label>
                  <label className="field-group"><span>Pickup date</span><input className="field" type="date" value={form.preferredPickupDate} onChange={(e) => update("preferredPickupDate", e.target.value)} /></label>
                  <label className="field-group"><span>Time slot</span><input className="field" value={form.preferredTimeSlot} onChange={(e) => update("preferredTimeSlot", e.target.value)} /></label>
                  <label className="field-group checkbox-group">
                    <span>Fragile handling</span>
                    <input type="checkbox" checked={form.fragile} onChange={(e) => update("fragile", e.target.checked)} />
                  </label>
                  <label className="field-group field-group-full"><span>Special instructions</span><textarea className="field textarea" value={form.specialInstructions} onChange={(e) => update("specialInstructions", e.target.value)} /></label>
                </div>

                <div className="action-row">
                  <button className="btn btn-secondary" onClick={requestQuote} disabled={loading === "quote"}>
                    {loading === "quote" ? "Calculating..." : "Get quote"}
                  </button>
                  <button className="btn btn-primary" onClick={createBooking} disabled={loading === "booking"}>
                    {loading === "booking" ? "Saving..." : "Create booking"}
                  </button>
                </div>

                {quote ? (
                  <div className="quote-breakdown">
                    {[
                      ["Route", quote.routeCode],
                      ["Base fee", formatMmks(quote.baseFeeMmks)],
                      ["Distance", formatMmks(quote.distanceSurchargeMmks)],
                      ["City", formatMmks(quote.citySurchargeMmks)],
                      ["Weight", formatMmks(quote.weightSurchargeMmks)],
                      ["Fragile", formatMmks(quote.fragileFeeMmks)],
                      ["Fuel", formatMmks(quote.fuelSurchargeMmks)],
                      ["Insurance", formatMmks(quote.insuranceFeeMmks)],
                      ["Total", formatMmks(quote.totalFeeMmks)],
                      ["Expires", formatDateTime(quote.expiresAt)]
                    ].map(([label, value]) => (
                      <div key={label} className="quote-cell">
                        <span>{label}</span>
                        <strong>{value}</strong>
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            </div>
          </article>

          <article className="panel">
            <SectionTitle
              eyebrow="Bulk pickup registration"
              title="Template-ready merchant intake"
              copy="Users and merchants can register pickup requests individually from the form above or register a bulk import job here before Excel processing is wired in."
              action={<StatusPill tone="info">CSV / XLSX ready</StatusPill>}
            />
            <div className="bulk-grid">
              <div className="stack">
                <p className="muted" style={{ margin: 0 }}>
                  Download starter templates and required document guidance.
                </p>
                <div className="action-row">
                  <Link className="btn btn-secondary" href="/templates/britium-bulk-upload-template.csv">CSV template</Link>
                  <Link className="btn btn-secondary" href="/templates/britium-bulk-upload-template.xlsx">XLSX template</Link>
                  <Link className="btn btn-secondary" href="/templates/britium-required-documents.txt">Required docs</Link>
                </div>
              </div>
              <label className="field-group">
                <span>Bulk rows preview</span>
                <textarea className="field textarea textarea-lg" value={bulkRows} onChange={(e) => setBulkRows(e.target.value)} />
              </label>
              <div className="action-row">
                <button className="btn btn-primary" onClick={registerBulkUpload} disabled={loading === "bulk"}>
                  {loading === "bulk" ? "Registering..." : "Register bulk upload job"}
                </button>
                {bulkStatus ? <span className="badge">{bulkStatus}</span> : null}
              </div>
            </div>
          </article>
        </div>

        <div className="ops-side">
          <article className="card sticky-card">
            <SectionTitle
              eyebrow="Live waybill preview"
              title="Print-ready reference"
              copy="This preview updates from the current form and switches to the saved waybill once the booking succeeds."
            />
            <div className="waybill-live">
              <div className="waybill-live-header">
                <div>
                  <div className="exact-brand-title">BRITIUM EXPRESS</div>
                  <div className="exact-brand-sub">DELIVERY SERVICE</div>
                  <div className="muted">HotLine: 09 - 897 44 77 44</div>
                </div>
                <div className="qr-live">{renderPseudoQr(combinedWaybill.qrPayload)}</div>
              </div>
              <div className="waybill-live-row"><span>Waybill</span><strong>{combinedWaybill.waybillNumber}</strong></div>
              <div className="waybill-live-row"><span>Tracking</span><strong>{combinedWaybill.trackingNumber}</strong></div>
              <div className="waybill-live-block">
                <div className="metric-label">Merchant / Sender</div>
                <strong>{combinedWaybill.senderName}</strong>
                <div className="muted">{combinedWaybill.senderPhone}</div>
                <div>{combinedWaybill.senderAddress}</div>
              </div>
              <div className="waybill-live-block">
                <div className="metric-label">Recipient</div>
                <strong>{combinedWaybill.recipientName}</strong>
                <div className="muted">{combinedWaybill.recipientPhone}</div>
                <div>{combinedWaybill.recipientAddress}</div>
              </div>
              <div className="quote-breakdown compact">
                <div className="quote-cell"><span>Service</span><strong>{combinedWaybill.serviceType}</strong></div>
                <div className="quote-cell"><span>Weight</span><strong>{combinedWaybill.weight} kg</strong></div>
                <div className="quote-cell"><span>Pieces</span><strong>{combinedWaybill.pieces}</strong></div>
                <div className="quote-cell"><span>COD</span><strong>{formatMmks(combinedWaybill.codAmount)}</strong></div>
                <div className="quote-cell"><span>Fee</span><strong>{formatMmks(combinedWaybill.quotedFee)}</strong></div>
                <div className="quote-cell"><span>Value</span><strong>{formatMmks(combinedWaybill.declaredValue)}</strong></div>
              </div>

              <div className="divider" />

              <div className="form-grid form-grid-2">
                <label className="field-group"><span>Print format</span>
                  <select className="field" value={form.printFormat} onChange={(e) => update("printFormat", e.target.value as FormState["printFormat"])}>
                    <option value="4x6">4 x 6 single</option>
                    <option value="4x3-2up">4 x 3 two-up on 4 x 6</option>
                    <option value="a4">A4 single / batch</option>
                    <option value="a5">A5 single / batch</option>
                  </select>
                </label>
                <label className="field-group"><span>Copies</span><input className="field" value={form.printCopies} onChange={(e) => update("printCopies", e.target.value)} /></label>
              </div>

              <div className="action-row">
                <button className="btn btn-primary" onClick={queuePrint} disabled={!booking || loading === "print"}>
                  {loading === "print" ? "Queueing..." : "Queue print"}
                </button>
                <Link className="btn btn-secondary" href={`/print/waybill?format=${form.printFormat}`}>Open print route</Link>
              </div>
            </div>
          </article>

          <article className="card">
            <SectionTitle
              eyebrow="Recent bookings"
              title="Saved shipments"
              copy="Operators can verify that created deliveries are immediately visible in the recent feed."
              action={<span className="badge">{initialData.shipments.length} rows</span>}
            />
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tracking</th>
                    <th>Recipient</th>
                    <th>Service</th>
                    <th>Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {initialData.shipments.slice(0, 8).map((row) => (
                    <tr key={row.id}>
                      <td>{row.tracking_number}</td>
                      <td>{row.recipient_name}</td>
                      <td>{row.service_type}</td>
                      <td>{formatMmks(row.quoted_fee_mmks)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </section>
    </Shell>
  );
}
