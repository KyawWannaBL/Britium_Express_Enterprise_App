"use client";

import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw, Store, PackagePlus, Truck, Coins, Webhook, CheckCircle2 } from "lucide-react";
import {
  MERCHANT_ENDPOINTS,
  formatDateTime,
  formatMMK,
  getItems,
  toNumber,
  toText,
  tryGet,
  tryPost,
} from "@/lib/productionApi";

type ShipmentRow = {
  id: string;
  trackingNo: string;
  receiver: string;
  status: string;
  codAmount: number;
  createdAt: string;
};

type WebhookRow = {
  id: string;
  url: string;
  eventType: string;
  status: string;
};

function normalizeShipments(input: unknown): ShipmentRow[] {
  return getItems(input).map((row, index) => ({
    id: toText(row.id, `m-${index}`),
    trackingNo: toText(row.tracking_no, row.waybill_no, `WB-${index + 1}`),
    receiver: toText(row.receiver_name, row.recipient_name, row.customer_name, "-"),
    status: toText(row.current_status, row.status, "booked"),
    codAmount: toNumber(row.cod_amount, row.total_collectable),
    createdAt: toText(row.created_at, row.booked_at, "-"),
  }));
}

function normalizeWebhooks(input: unknown): WebhookRow[] {
  return getItems(input).map((row, index) => ({
    id: toText(row.id, `w-${index}`),
    url: toText(row.target_url, row.url, "-"),
    eventType: toText(row.event_type, row.topic, "shipment.*"),
    status: toText(row.status, "active"),
  }));
}

function badge(status: string) {
  const s = status.toLowerCase();
  if (["active", "booked", "delivered"].includes(s)) return "bg-emerald-100 text-emerald-700";
  if (["pending", "queued", "in_transit"].includes(s)) return "bg-amber-100 text-amber-700";
  if (["failed", "disabled", "returned"].includes(s)) return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

export default function MerchantPortalPage() {
  const [shipments, setShipments] = useState<ShipmentRow[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    receiver: "",
    phone: "",
    address: "",
    product: "",
    qty: "1",
    codAmount: "0",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    setError(null);

    const [shipmentRes, webhookRes] = await Promise.allSettled([
      tryGet<unknown>(MERCHANT_ENDPOINTS.shipments),
      tryGet<unknown>(MERCHANT_ENDPOINTS.webhooks),
    ]);

    if (shipmentRes.status === "fulfilled") {
      setShipments(normalizeShipments(shipmentRes.value));
    } else {
      setShipments([]);
    }

    if (webhookRes.status === "fulfilled") {
      setWebhooks(normalizeWebhooks(webhookRes.value));
    } else {
      setWebhooks([]);
    }

    if (shipmentRes.status === "rejected" && webhookRes.status === "rejected") {
      setError("Unable to load merchant APIs. Check merchant endpoints and API base URL.");
    }

    setLoading(false);
  }

  async function createShipment() {
    setError(null);

    const payload = {
      service_type: "regular",
      delivery_type: "pickup_to_address",
      is_cod: Number(form.codAmount || 0) > 0,
      cod_amount: Number(form.codAmount || 0),
      sender: {
        contact_name: "Merchant Sender",
        phone_primary: form.phone || "09 000000000",
        address_line_1: "Merchant Origin",
        city: "Yangon",
        country_code: "MM",
      },
      receiver: {
        contact_name: form.receiver || "Receiver",
        phone_primary: form.phone || "09 000000000",
        address_line_1: form.address || "Yangon",
        city: "Yangon",
        country_code: "MM",
      },
      packages: [
        {
          package_no: "PKG-1",
          package_type: form.product || "general",
          quantity: Number(form.qty || 1),
        },
      ],
    };

    try {
      await tryPost(
        MERCHANT_ENDPOINTS.shipments.map((path) => ({
          path,
          body: payload,
          idempotency: true,
        }))
      );
      await fetchAll();
      setForm({
        receiver: "",
        phone: "",
        address: "",
        product: "",
        qty: "1",
        codAmount: "0",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? "Merchant shipment creation failed. Confirm merchant auth and shipment endpoint mapping."
          : "Merchant shipment creation failed."
      );
    }
  }

  const totals = useMemo(() => {
    const delivered = shipments.filter((x) => x.status.toLowerCase() === "delivered").length;
    const inTransit = shipments.filter((x) => ["booked", "processing", "in_transit", "out_for_delivery"].includes(x.status.toLowerCase())).length;
    const cod = shipments.reduce((sum, row) => sum + row.codAmount, 0);

    return {
      total: shipments.length,
      delivered,
      inTransit,
      cod,
      webhooks: webhooks.length,
    };
  }, [shipments, webhooks]);

  return (
    <div className="min-h-screen bg-[#f7f9fc] p-8">
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">External</p>
        <h1 className="text-4xl font-black uppercase tracking-tight text-[#0d2c54]">
          Merchant VIP Portal <span className="font-normal">/ ကုန်သည်အထူးပေါ်တယ်</span>
        </h1>
        <p className="text-slate-500">
          Merchant shipment creation, order history, webhook visibility, and shipment status tracking. /
          ကုန်သည်ကုန်စည်ဖန်တီးမှု၊ မှာယူမှုမှတ်တမ်း၊ webhook ကြည့်ရှုမှုနှင့် ကုန်စည်အခြေအနေစောင့်ကြည့်မှု
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Store} title="Orders" value={`${totals.total}`} />
        <StatCard icon={Truck} title="In Transit" value={`${totals.inTransit}`} />
        <StatCard icon={CheckCircle2} title="Delivered" value={`${totals.delivered}`} />
        <StatCard icon={Coins} title="COD Exposure" value={formatMMK(totals.cod)} />
        <StatCard icon={Webhook} title="Webhooks" value={`${totals.webhooks}`} />
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel title="Create Shipment / ကုန်စည်ဖန်တီးမည်">
          <div className="grid gap-3 md:grid-cols-2">
            <input value={form.receiver} onChange={(e) => setForm((p) => ({ ...p, receiver: e.target.value }))} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Receiver / လက်ခံသူ" />
            <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Phone / ဖုန်း" />
            <input value={form.product} onChange={(e) => setForm((p) => ({ ...p, product: e.target.value }))} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Product / ကုန်ပစ္စည်း" />
            <input value={form.qty} onChange={(e) => setForm((p) => ({ ...p, qty: e.target.value }))} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Qty / အရေအတွက်" />
            <input value={form.codAmount} onChange={(e) => setForm((p) => ({ ...p, codAmount: e.target.value }))} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="COD Amount / COD ပမာဏ" />
            <input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Delivery Address / ပို့ဆောင်လိပ်စာ" />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={createShipment} className="inline-flex items-center gap-2 rounded-2xl bg-[#ffd700] px-5 py-3 font-black uppercase tracking-wider text-[#0d2c54] hover:opacity-95">
              <PackagePlus size={16} />
              Create Shipment
            </button>
            <button onClick={fetchAll} className="inline-flex items-center gap-2 rounded-2xl bg-[#0d2c54] px-5 py-3 font-black uppercase tracking-wider text-white hover:opacity-95">
              <RefreshCw size={16} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </Panel>

        <Panel title="Order History / မှာယူမှုမှတ်တမ်း">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-black">Tracking</th>
                  <th className="px-4 py-3 font-black">Receiver</th>
                  <th className="px-4 py-3 font-black">Status</th>
                  <th className="px-4 py-3 font-black">COD</th>
                  <th className="px-4 py-3 font-black">Created</th>
                </tr>
              </thead>
              <tbody>
                {shipments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">No merchant shipments found.</td>
                  </tr>
                ) : (
                  shipments.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-bold text-[#0d2c54]">{row.trackingNo}</td>
                      <td className="px-4 py-3">{row.receiver}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${badge(row.status)}`}>{row.status}</span>
                      </td>
                      <td className="px-4 py-3">{formatMMK(row.codAmount)}</td>
                      <td className="px-4 py-3">{formatDateTime(row.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div className="mt-8">
        <Panel title="Webhook Registry / Webhook စာရင်း">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-black">URL</th>
                  <th className="px-4 py-3 font-black">Event Type</th>
                  <th className="px-4 py-3 font-black">Status</th>
                </tr>
              </thead>
              <tbody>
                {webhooks.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-400">No merchant webhooks found.</td>
                  </tr>
                ) : (
                  webhooks.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 text-[#0d2c54]">{row.url}</td>
                      <td className="px-4 py-3">{row.eventType}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${badge(row.status)}`}>{row.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <Icon size={24} className="text-[#0d2c54]" />
      <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className="mt-4 text-3xl font-black text-[#0d2c54]">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-black text-[#0d2c54]">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}
