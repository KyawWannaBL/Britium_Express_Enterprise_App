"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  ScanLine,
  AlertTriangle,
  History,
  FileSpreadsheet,
  Barcode,
  Search,
  Plus,
  RefreshCw,
} from "lucide-react";
import { DATA_ENTRY_ENDPOINTS, getItems, toNumber, toText, tryGet, tryPost } from "@/lib/enterpriseScreensApi";

type EntryRow = {
  id: string;
  trackingNo: string;
  sender: string;
  receiver: string;
  phone: string;
  address: string;
  status: string;
};

const demoRows: EntryRow[] = [
  { id: "1", trackingNo: "WB-240001", sender: "Britium Store", receiver: "Kyaw Zayar", phone: "09 44111 001", address: "Tamwe, Yangon", status: "saved" },
  { id: "2", trackingNo: "WB-240002", sender: "Royal Mart", receiver: "Su Mon", phone: "09 44111 002", address: "Hledan, Yangon", status: "draft" },
  { id: "3", trackingNo: "WB-240003", sender: "Daily Choice", receiver: "Mya Mya", phone: "09 44111 003", address: "Bahan, Yangon", status: "validated" },
];

function normalizeRows(input: unknown): EntryRow[] {
  const items = getItems(input);
  return items.map((row, index) => ({
    id: toText(row.id, `e-${index}`),
    trackingNo: toText(row.tracking_no, row.waybill_no, `WB-${index + 1}`),
    sender: toText(row.sender_name, row.sender, row.sender_contact_name, "Unknown"),
    receiver: toText(row.receiver_name, row.recipient_name, row.receiver, "Unknown"),
    phone: toText(row.receiver_phone, row.recipient_phone, row.phone, "-"),
    address: toText(row.receiver_address, row.address, row.delivery_address, "-"),
    status: toText(row.status, row.current_status, "draft"),
  }));
}

function badge(status: string) {
  const s = status.toLowerCase();
  if (["saved", "validated", "booked"].includes(s)) return "bg-emerald-100 text-emerald-700";
  if (["draft", "pending"].includes(s)) return "bg-amber-100 text-amber-700";
  if (["error", "rejected"].includes(s)) return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

export default function DataEntryTurboPage() {
  const [rows, setRows] = useState<EntryRow[]>(demoRows);
  const [usingDemo, setUsingDemo] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    sender: "",
    receiver: "",
    phone: "",
    address: "",
    product: "",
    qty: "1",
  });

  useEffect(() => {
    fetchRows();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function fetchRows() {
    try {
      const data = await tryGet<unknown>(DATA_ENTRY_ENDPOINTS.list);
      const normalized = normalizeRows(data);
      if (normalized.length > 0) {
        setRows(normalized);
        setUsingDemo(false);
        return;
      }
      setRows(demoRows);
      setUsingDemo(true);
    } catch {
      setRows(demoRows);
      setUsingDemo(true);
    }
  }

  async function createEntry() {
    const payload = {
      service_type: "regular",
      delivery_type: "pickup_to_address",
      sender: {
        contact_name: form.sender || "Sender",
        phone_primary: form.phone || "09 000000000",
        address_line_1: form.address || "Yangon",
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
        DATA_ENTRY_ENDPOINTS.create.map((path) => ({
          path,
          body: payload,
          idempotency: true,
        }))
      );
      setToast("Entry submitted to API / API သို့တင်ပို့ပြီး");
      await fetchRows();
    } catch {
      const demo: EntryRow = {
        id: `${Date.now()}`,
        trackingNo: `WB-${Math.floor(Math.random() * 900000 + 100000)}`,
        sender: form.sender || "Sender",
        receiver: form.receiver || "Receiver",
        phone: form.phone || "-",
        address: form.address || "-",
        status: "draft",
      };
      setRows((prev) => [demo, ...prev]);
      setUsingDemo(true);
      setToast("API unavailable, saved locally in demo mode / API မရသဖြင့် နမူနာမုဒ်ဖြင့် သိမ်းထားသည်");
    }

    setForm({
      sender: "",
      receiver: "",
      phone: "",
      address: "",
      product: "",
      qty: "1",
    });
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (row) =>
        row.trackingNo.toLowerCase().includes(q) ||
        row.sender.toLowerCase().includes(q) ||
        row.receiver.toLowerCase().includes(q) ||
        row.phone.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const stats = {
    quick: rows.length,
    draft: rows.filter((x) => x.status.toLowerCase() === "draft").length,
    errors: 3,
    recent: rows.length,
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] p-8">
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Logistics</p>
        <h1 className="text-4xl font-black uppercase tracking-tight text-[#0d2c54]">
          Data Entry Turbo <span className="font-normal">/ ဒေတာထည့်သွင်းမှုမြန်နှုန်း</span>
        </h1>
        <p className="text-slate-500">
          High-speed booking, validation, duplicate detection, and barcode-ready intake flow. /
          အမြန်စာရင်းသွင်းခြင်း၊ စစ်ဆေးခြင်း၊ ထပ်တူစာရင်းရှာဖွေခြင်းနှင့် ဘားကုဒ်အဆင်သင့်လုပ်ငန်းစဉ်
        </p>
      </div>

      {toast && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {toast}
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
        <div><strong>LIST:</strong> {DATA_ENTRY_ENDPOINTS.list.join(" , ")}</div>
        <div className="mt-1"><strong>CREATE:</strong> {DATA_ENTRY_ENDPOINTS.create.join(" , ")}</div>
        {usingDemo && <div className="mt-2 font-bold text-amber-700">DEMO MODE / နမူနာမုဒ်</div>}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Quick Booking" mm="အမြန်စာရင်းသွင်းမှု" value={`${stats.quick}`} />
        <StatCard title="Draft Queue" mm="မူကြမ်းစာရင်း" value={`${stats.draft}`} />
        <StatCard title="Validation Errors" mm="စစ်ဆေးမှုအမှားများ" value={`${stats.errors}`} />
        <StatCard title="Recent Entries" mm="နောက်ဆုံးထည့်သွင်းမှု" value={`${stats.recent}`} />
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Plus size={20} className="text-[#0d2c54]" />
            <h2 className="text-lg font-black text-[#0d2c54]">Quick Booking / အမြန်စာရင်းသွင်းမှု</h2>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input value={form.sender} onChange={(e) => setForm((p) => ({ ...p, sender: e.target.value }))} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Sender / ပို့သူ" />
            <input value={form.receiver} onChange={(e) => setForm((p) => ({ ...p, receiver: e.target.value }))} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Receiver / လက်ခံသူ" />
            <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Phone / ဖုန်း" />
            <input value={form.product} onChange={(e) => setForm((p) => ({ ...p, product: e.target.value }))} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Product / ကုန်ပစ္စည်း" />
            <input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Address / လိပ်စာ" />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={createEntry} className="rounded-2xl bg-[#ffd700] px-5 py-3 font-black uppercase tracking-wider text-[#0d2c54] hover:opacity-95">
              Create Entry / စာရင်းဖန်တီးမည်
            </button>
            <button onClick={fetchRows} className="inline-flex items-center gap-2 rounded-2xl bg-[#0d2c54] px-5 py-3 font-black uppercase tracking-wider text-white hover:opacity-95">
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-[#0d2c54]">Tools / ကိရိယာများ</h2>
          <div className="mt-4 space-y-3">
            <ToolItem icon={ClipboardList} en="Quick Booking" mm="အမြန်စာရင်းသွင်းမှု" />
            <ToolItem icon={ScanLine} en="Duplicate Detection" mm="ထပ်တူစာရင်းရှာဖွေခြင်း" />
            <ToolItem icon={AlertTriangle} en="Validation Errors" mm="စစ်ဆေးမှုအမှားများ" />
            <ToolItem icon={History} en="Draft Queue" mm="မူကြမ်းစာရင်း" />
            <ToolItem icon={FileSpreadsheet} en="Import / Export Jobs" mm="ဖိုင်တင်သွင်း / ထုတ်ယူမှု" />
            <ToolItem icon={Barcode} en="Barcode Generation" mm="ဘားကုဒ်ထုတ်လုပ်ခြင်း" />
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Search size={18} className="text-[#0d2c54]" />
          <h2 className="text-lg font-black text-[#0d2c54]">Recent Entries / နောက်ဆုံးထည့်သွင်းမှု</h2>
        </div>

        <div className="mt-4">
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Search tracking / sender / receiver / phone" />
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-black">Tracking</th>
                <th className="px-4 py-3 font-black">Sender</th>
                <th className="px-4 py-3 font-black">Receiver</th>
                <th className="px-4 py-3 font-black">Phone</th>
                <th className="px-4 py-3 font-black">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-bold text-[#0d2c54]">{row.trackingNo}</td>
                  <td className="px-4 py-3">{row.sender}</td>
                  <td className="px-4 py-3">{row.receiver}</td>
                  <td className="px-4 py-3">{row.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${badge(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, mm, value }: { title: string; mm: string; value: string }) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-sm border border-slate-200">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className="mt-1 text-[11px] font-bold text-slate-500" style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>{mm}</p>
      <p className="mt-4 text-4xl font-black text-[#0d2c54]">{value}</p>
    </div>
  );
}

function ToolItem({ icon: Icon, en, mm }: { icon: React.ComponentType<{ size?: number; className?: string }>; en: string; mm: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-[#0d2c54]" />
        <div>
          <p className="font-black text-[#0d2c54]">{en}</p>
          <p className="text-sm text-slate-500" style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>{mm}</p>
        </div>
      </div>
    </div>
  );
}
