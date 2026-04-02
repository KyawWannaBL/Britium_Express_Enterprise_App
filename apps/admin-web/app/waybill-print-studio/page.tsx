"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Printer,
  QrCode,
  FileText,
  History,
  Settings2,
  Layers3,
  Search,
  RefreshCw,
} from "lucide-react";
import { PRINT_STUDIO_ENDPOINTS, getItems, toText, tryGet } from "@/lib/enterpriseScreensApi";

type PrintRow = {
  id: string;
  trackingNo: string;
  customer: string;
  status: string;
};

const demoRows: PrintRow[] = [
  { id: "1", trackingNo: "WB-240001", customer: "Kyaw Zayar", status: "ready" },
  { id: "2", trackingNo: "WB-240002", customer: "Su Mon", status: "queued" },
  { id: "3", trackingNo: "WB-240003", customer: "Mya Mya", status: "reprint" },
];

function normalizeRows(input: unknown): PrintRow[] {
  const items = getItems(input);
  return items.map((row, index) => ({
    id: toText(row.id, `p-${index}`),
    trackingNo: toText(row.tracking_no, row.waybill_no, `WB-${index + 1}`),
    customer: toText(row.receiver_name, row.recipient_name, row.customer_name, "Unknown"),
    status: toText(row.status, row.current_status, "ready"),
  }));
}

function badge(status: string) {
  const s = status.toLowerCase();
  if (["ready", "printed"].includes(s)) return "bg-emerald-100 text-emerald-700";
  if (["queued", "processing"].includes(s)) return "bg-amber-100 text-amber-700";
  if (["reprint", "failed"].includes(s)) return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

export default function WaybillPrintStudioPage() {
  const [rows, setRows] = useState<PrintRow[]>(demoRows);
  const [usingDemo, setUsingDemo] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [template, setTemplate] = useState("standard");

  useEffect(() => {
    fetchRows();
  }, []);

  async function fetchRows() {
    try {
      const data = await tryGet<unknown>(PRINT_STUDIO_ENDPOINTS.list);
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (row) =>
        row.trackingNo.toLowerCase().includes(q) ||
        row.customer.toLowerCase().includes(q)
    );
  }, [rows, search]);

  function toggle(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function printSelected() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] p-8 print:bg-white">
      <div className="space-y-2 print:hidden">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Logistics</p>
        <h1 className="text-4xl font-black uppercase tracking-tight text-[#0d2c54]">
          Waybill Print Studio <span className="font-normal">/ ဝေးဘေလ်ပရင့်ထုတ်ခန်း</span>
        </h1>
        <p className="text-slate-500">
          Print labels, manifests, dispatch slips, and barcode-ready waybills. /
          လေဘယ်များ၊ မန်နီဖက်များ၊ ပို့ဆောင်မှုစာရွက်များနှင့် ဘားကုဒ်ပါ ဝေးဘေလ်များထုတ်ရန်
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 print:hidden">
        <div><strong>LIST:</strong> {PRINT_STUDIO_ENDPOINTS.list.join(" , ")}</div>
        {usingDemo && <div className="mt-2 font-bold text-amber-700">DEMO MODE / နမူနာမုဒ်</div>}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3 print:hidden">
        <ModuleCard icon={Printer} title="Single Waybill Print" mm="တစ်စောင်ချင်း ပရင့်ထုတ်ရန်" />
        <ModuleCard icon={Layers3} title="Bulk Waybill Print" mm="အစုလိုက် ပရင့်ထုတ်ရန်" />
        <ModuleCard icon={QrCode} title="Barcode / QR Preview" mm="ဘားကုဒ် / QR အစမ်းကြည့်ရန်" />
        <ModuleCard icon={History} title="Reprint History" mm="ပြန်လည်ပရင့်ထုတ်မှတ်တမ်း" />
        <ModuleCard icon={FileText} title="Manifest Print" mm="မန်နီဖက်ပရင့်ထုတ်ရန်" />
        <ModuleCard icon={Settings2} title="Printer Configuration" mm="ပရင်တာချိန်ညှိမှု" />
      </div>

      <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm print:shadow-none print:border-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between print:hidden">
          <div className="flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              placeholder="Search tracking / customer"
            />
          </div>
          <div className="flex gap-3">
            <select value={template} onChange={(e) => setTemplate(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <option value="standard">Standard Label</option>
              <option value="qr-large">Large QR Label</option>
              <option value="dispatch">Dispatch Slip</option>
            </select>
            <button onClick={fetchRows} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 font-black text-[#0d2c54] hover:bg-slate-200">
              <RefreshCw size={14} />
              Refresh
            </button>
            <button onClick={printSelected} className="inline-flex items-center gap-2 rounded-2xl bg-[#ffd700] px-4 py-3 font-black text-[#0d2c54] hover:opacity-95">
              <Printer size={14} />
              Print Selected
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 print:border-0">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500 print:bg-white">
              <tr>
                <th className="px-4 py-3 font-black print:hidden">Select</th>
                <th className="px-4 py-3 font-black">Tracking</th>
                <th className="px-4 py-3 font-black">Customer</th>
                <th className="px-4 py-3 font-black">Status</th>
                <th className="px-4 py-3 font-black print:hidden">Preview</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 print:hidden">
                    <input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggle(row.id)} />
                  </td>
                  <td className="px-4 py-3 font-bold text-[#0d2c54]">{row.trackingNo}</td>
                  <td className="px-4 py-3">{row.customer}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${badge(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 print:hidden">
                    <button onClick={() => window.alert(`Preview ${row.trackingNo}\nTemplate: ${template}`)} className="rounded-xl bg-slate-100 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-700 hover:bg-slate-200">
                      Preview
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 hidden print:block">
          <h2 className="text-2xl font-black text-[#0d2c54]">Print Batch / ပရင့်အစု</h2>
          <p className="mt-2 text-sm text-slate-500">Template: {template}</p>
          <div className="mt-4 space-y-4">
            {filtered.filter((row) => selected.length === 0 || selected.includes(row.id)).map((row) => (
              <div key={row.id} className="rounded-xl border border-slate-300 p-4">
                <p className="text-xl font-black text-[#0d2c54]">{row.trackingNo}</p>
                <p className="mt-1 text-sm">{row.customer}</p>
                <p className="mt-2 text-xs text-slate-500">Barcode / QR placeholder</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleCard({ icon: Icon, title, mm }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; mm: string }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <Icon size={26} className="text-[#0d2c54]" />
      <p className="mt-5 text-sm font-black uppercase tracking-[0.2em] text-[#0d2c54]">{title}</p>
      <p className="mt-1 text-sm text-slate-500" style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>{mm}</p>
    </div>
  );
}
