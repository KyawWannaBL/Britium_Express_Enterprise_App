"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpToLine,
  Boxes,
  ClipboardList,
  Loader2,
  PackageSearch,
  ScanLine,
  ShieldAlert,
  Truck,
  Warehouse,
  Workflow,
  CircleAlert,
  FileStack,
  Clock3,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";
import { tryGet, tryPost, WAREHOUSE_ENDPOINTS, withId } from "@/lib/opsApi";

type ScanRow = {
  id: string;
  trackingNo: string;
  operation: string;
  zone: string;
  status: string;
  operator: string;
  time: string;
};

type ManifestRow = {
  id: string;
  manifestNo: string;
  route: string;
  shipmentCount: number;
  status: string;
  vehicle: string;
};

type BagRow = {
  id: string;
  bagNo: string;
  branch: string;
  destination: string;
  status: string;
};

type ModalType = "inbound" | "bag" | "manifest" | "dispatch" | null;

function toText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "-";
}

function toNumber(...values: unknown[]): number {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
}

function badgeClass(status: string) {
  const s = status.toLowerCase();
  if (["verified", "ready", "received", "dispatched", "ok", "open"].includes(s)) return "bg-emerald-100 text-emerald-700";
  if (["pending", "loading", "processing", "draft", "sealed"].includes(s)) return "bg-amber-100 text-amber-700";
  if (["exception", "damaged", "misroute", "failed", "cancelled"].includes(s)) return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

function normalizeScans(input: unknown): ScanRow[] {
  const source = Array.isArray(input)
    ? input
    : input && typeof input === "object" && Array.isArray((input as Record<string, unknown>).items)
    ? ((input as Record<string, unknown>).items as Record<string, unknown>[])
    : [];

  return source.map((row, index) => ({
    id: toText(row.id, `scan-${index}`),
    trackingNo: toText(row.tracking_no, row.shipment_id, row.code),
    operation: toText(row.scan_type, row.operation, "scan"),
    zone: toText(row.zone, row.branch_id, row.location, "warehouse"),
    status: toText(row.scan_result, row.status, "ok"),
    operator: toText(row.actor_name, row.operator, row.actor_user_id, "-"),
    time: toText(row.scanned_at, row.created_at, "-"),
  }));
}

function normalizeManifests(input: unknown): ManifestRow[] {
  const source = Array.isArray(input)
    ? input
    : input && typeof input === "object" && Array.isArray((input as Record<string, unknown>).items)
    ? ((input as Record<string, unknown>).items as Record<string, unknown>[])
    : [];

  return source.map((row, index) => ({
    id: toText(row.id, `manifest-${index}`),
    manifestNo: toText(row.manifest_no, row.code, `MAN-${index + 1}`),
    route: `${toText(row.origin_branch_name, row.origin_branch_id, "Origin")} → ${toText(row.destination_branch_name, row.destination_branch_id, "Destination")}`,
    shipmentCount: toNumber(row.shipment_count, row.total_shipments, 0),
    status: toText(row.status, "draft"),
    vehicle: toText(row.vehicle_no, row.vehicle, "-"),
  }));
}

function normalizeBags(input: unknown): BagRow[] {
  const source = Array.isArray(input)
    ? input
    : input && typeof input === "object" && Array.isArray((input as Record<string, unknown>).items)
    ? ((input as Record<string, unknown>).items as Record<string, unknown>[])
    : [];

  return source.map((row, index) => ({
    id: toText(row.id, `bag-${index}`),
    bagNo: toText(row.bag_no, row.code, `BAG-${index + 1}`),
    branch: toText(row.branch_name, row.branch_id, "YGN"),
    destination: toText(row.destination_branch_name, row.destination_branch_id, "-"),
    status: toText(row.status, "open"),
  }));
}

export default function WarehousePortalPage() {
  const [activeTab, setActiveTab] = useState("inbound");
  const [search, setSearch] = useState("");

  const [scans, setScans] = useState<ScanRow[]>([]);
  const [manifests, setManifests] = useState<ManifestRow[]>([]);
  const [bags, setBags] = useState<BagRow[]>([]);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedManifestId, setSelectedManifestId] = useState<string>("");

  const [form, setForm] = useState({
    shipment_id: "",
    scan_type: "inbound_receive",
    bag_no: "",
    branch_id: "",
    destination_branch_id: "",
    manifest_type: "linehaul",
    origin_branch_id: "",
    vehicle_no: "",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function fetchAll() {
    setLoading(true);
    setError(null);

    try {
      const [scanRes, manifestRes, bagRes] = await Promise.allSettled([
        tryGet<unknown>(WAREHOUSE_ENDPOINTS.scans),
        tryGet<unknown>(WAREHOUSE_ENDPOINTS.manifests),
        tryGet<unknown>(WAREHOUSE_ENDPOINTS.bags),
      ]);

      if (scanRes.status === "fulfilled") setScans(normalizeScans(scanRes.value));
      if (manifestRes.status === "fulfilled") setManifests(normalizeManifests(manifestRes.value));
      if (bagRes.status === "fulfilled") setBags(normalizeBags(bagRes.value));

      const errors: string[] = [];
      if (scanRes.status === "rejected") errors.push(String(scanRes.reason?.message || scanRes.reason));
      if (manifestRes.status === "rejected") errors.push(String(manifestRes.reason?.message || manifestRes.reason));
      if (bagRes.status === "rejected") errors.push(String(bagRes.reason?.message || bagRes.reason));

      if (errors.length === 3) {
        setError(errors.join("\n\n"));
      }
    } finally {
      setLoading(false);
    }
  }

  async function submitAction() {
    setActionLoading(true);
    setError(null);

    try {
      if (modalType === "inbound") {
        await tryPost(
          WAREHOUSE_ENDPOINTS.inboundReceipts.map((path) => ({
            path,
            body: {
              shipment_id: form.shipment_id || null,
              scan_type: form.scan_type,
              branch_id: form.branch_id || null,
            },
            idempotency: true,
          }))
        );
      }

      if (modalType === "bag") {
        await tryPost(
          WAREHOUSE_ENDPOINTS.bags.map((path) => ({
            path,
            body: {
              bag_no: form.bag_no || null,
              branch_id: form.branch_id || null,
              destination_branch_id: form.destination_branch_id || null,
            },
            idempotency: true,
          }))
        );
      }

      if (modalType === "manifest") {
        await tryPost(
          WAREHOUSE_ENDPOINTS.manifests.map((path) => ({
            path,
            body: {
              manifest_type: form.manifest_type,
              origin_branch_id: form.origin_branch_id || null,
              destination_branch_id: form.destination_branch_id || null,
              vehicle_no: form.vehicle_no || null,
            },
            idempotency: true,
          }))
        );
      }

      if (modalType === "dispatch" && selectedManifestId) {
        await tryPost(
          withId(WAREHOUSE_ENDPOINTS.manifestDispatch, selectedManifestId).map((path) => ({
            path,
            body: { notes: "Dispatched from warehouse hub" },
            idempotency: true,
          }))
        );
      }

      setToast("Warehouse action completed / ဂိုဒေါင်လုပ်ဆောင်ချက်ပြီးပါပြီ");
      setModalType(null);
      await fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Warehouse action failed");
    } finally {
      setActionLoading(false);
    }
  }

  const filteredScans = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return scans;
    return scans.filter(
      (row) =>
        row.trackingNo.toLowerCase().includes(q) ||
        row.operation.toLowerCase().includes(q) ||
        row.zone.toLowerCase().includes(q)
    );
  }, [scans, search]);

  const scanCount = scans.length;
  const bagCount = bags.length;
  const readyDispatch = manifests.filter((x) => ["ready", "loading"].includes(x.status.toLowerCase())).length;
  const exceptionCount = scans.filter((x) => ["exception", "damaged", "misroute", "failed"].includes(x.status.toLowerCase())).length;

  return (
    <div className="min-h-screen bg-[#f7f9fc] p-8">
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
          Logistics Operations
        </p>
        <h1 className="text-4xl font-black uppercase tracking-tight text-[#0d2c54]">
          Warehouse Hub <span className="font-normal text-blue-500">/ ဂိုဒေါင်စီမံခန့်ခွဲမှု</span>
        </h1>
        <p className="text-slate-500">
          Inbound receiving, sorting, scan verification, dispatch preparation, manifest control, and exception handling. /
          ဝင်ကုန်လက်ခံခြင်း၊ အမျိုးအစားခွဲခြင်း၊ စကင်န်အတည်ပြုခြင်း၊ ထွက်ကုန်ပြင်ဆင်ခြင်း၊ မန်နီဖက်ထိန်းချုပ်ခြင်းနှင့် ပြဿနာဖြေရှင်းမှု
        </p>
      </div>

      {toast && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {toast}
        </div>
      )}

      {error && (
        <div className="mt-6 whitespace-pre-line rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
        <div><strong>SCAN:</strong> {WAREHOUSE_ENDPOINTS.scans.join(" , ")}</div>
        <div className="mt-1"><strong>MANIFEST:</strong> {WAREHOUSE_ENDPOINTS.manifests.join(" , ")}</div>
        <div className="mt-1"><strong>BAG:</strong> {WAREHOUSE_ENDPOINTS.bags.join(" , ")}</div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={ArrowDownToLine} title="Inbound Receiving" mm="ဝင်ကုန်လက်ခံခြင်း" value={`${scanCount}`} />
        <StatCard icon={Boxes} title="Bag / Sack Mgmt" mm="အိတ် / ဆာ့ခ်စီမံမှု" value={`${bagCount}`} />
        <StatCard icon={Workflow} title="Sorting Queue" mm="အမျိုးအစားခွဲစာရင်း" value={`${scanCount}`} />
        <StatCard icon={ArrowUpToLine} title="Dispatch Ready" mm="ထွက်ကုန်အဆင်သင့်" value={`${readyDispatch}`} />
        <StatCard icon={ShieldAlert} title="Exceptions" mm="ပြဿနာများ" value={`${exceptionCount}`} danger />
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-[#0d2c54]">Warehouse Modules / ဂိုဒေါင်လုပ်ငန်းများ</h2>
          <div className="mt-4 grid gap-3">
            <TabButton icon={ArrowDownToLine} active={activeTab === "inbound"} onClick={() => setActiveTab("inbound")} en="Inbound Receiving" mm="ဝင်ကုန်လက်ခံခြင်း" />
            <TabButton icon={Boxes} active={activeTab === "bags"} onClick={() => setActiveTab("bags")} en="Bag / Sack Management" mm="အိတ် / ဆာ့ခ်စီမံခန့်ခွဲမှု" />
            <TabButton icon={Workflow} active={activeTab === "sorting"} onClick={() => setActiveTab("sorting")} en="Sorting Queue" mm="အမျိုးအစားခွဲစာရင်း" />
            <TabButton icon={ScanLine} active={activeTab === "scan"} onClick={() => setActiveTab("scan")} en="Scan & Verify" mm="စကင်န်နှင့်အတည်ပြုခြင်း" />
            <TabButton icon={Truck} active={activeTab === "dispatch"} onClick={() => setActiveTab("dispatch")} en="Dispatch Preparation" mm="ထွက်ကုန်ပြင်ဆင်ခြင်း" />
            <TabButton icon={FileStack} active={activeTab === "manifest"} onClick={() => setActiveTab("manifest")} en="Manifest Creation" mm="မန်နီဖက်ဖန်တီးခြင်း" />
            <TabButton icon={Warehouse} active={activeTab === "inventory"} onClick={() => setActiveTab("inventory")} en="Inventory / Cage View" mm="စတော့ / ကေ့ခ်ျမြင်ကွင်း" />
            <TabButton icon={CircleAlert} active={activeTab === "exception"} onClick={() => setActiveTab("exception")} en="Misroute / Damage Desk" mm="လမ်းကြောင်းမှား / ပျက်စီးကုန်ခန်း" />
          </div>

          <div className="mt-5 grid gap-3">
            <QuickAction onClick={() => setModalType("inbound")} label="Create Inbound Receipt / ဝင်ကုန်လက်ခံမှုဖန်တီးမည်" />
            <QuickAction onClick={() => setModalType("bag")} label="Create Bag / အိတ်ဖန်တီးမည်" />
            <QuickAction onClick={() => setModalType("manifest")} label="Create Manifest / မန်နီဖက်ဖန်တီးမည်" />
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-[#0d2c54]">Active Workspace / လက်ရှိအလုပ်ခန်း</h2>
              <p className="mt-1 text-sm text-slate-500">{workspaceSubtitle(activeTab)}</p>
            </div>
            <button
              onClick={fetchAll}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0d2c54] px-4 py-3 text-xs font-black uppercase tracking-wider text-white hover:opacity-95"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Refresh
            </button>
          </div>

          <div className="mt-5">
            {activeTab === "manifest" ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-black">Manifest</th>
                      <th className="px-4 py-3 font-black">Route</th>
                      <th className="px-4 py-3 font-black">Shipments</th>
                      <th className="px-4 py-3 font-black">Vehicle</th>
                      <th className="px-4 py-3 font-black">Status</th>
                      <th className="px-4 py-3 font-black">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manifests.map((row) => (
                      <tr key={row.id} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-bold text-[#0d2c54]">{row.manifestNo}</td>
                        <td className="px-4 py-3">{row.route}</td>
                        <td className="px-4 py-3">{row.shipmentCount}</td>
                        <td className="px-4 py-3">{row.vehicle}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${badgeClass(row.status)}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              setSelectedManifestId(row.id);
                              setModalType("dispatch");
                            }}
                            className="rounded-xl bg-blue-50 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-blue-700 hover:bg-blue-100"
                          >
                            Dispatch / ပို့မည်
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : activeTab === "bags" ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-black">Bag</th>
                      <th className="px-4 py-3 font-black">Branch</th>
                      <th className="px-4 py-3 font-black">Destination</th>
                      <th className="px-4 py-3 font-black">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bags.map((row) => (
                      <tr key={row.id} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-bold text-[#0d2c54]">{row.bagNo}</td>
                        <td className="px-4 py-3">{row.branch}</td>
                        <td className="px-4 py-3">{row.destination}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${badgeClass(row.status)}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : activeTab === "inventory" ? (
              <div className="grid gap-4 md:grid-cols-3">
                <InventoryCard zone="Cage A1" count={`${scanCount}`} status="Dynamic from scans / စကင်န်မှရယူ" />
                <InventoryCard zone="Bag Zone" count={`${bagCount}`} status="Dynamic from bags / အိတ်စာရင်းမှရယူ" />
                <InventoryCard zone="Dispatch Bay" count={`${readyDispatch}`} status="Ready manifests / အဆင်သင့်မန်နီဖက်" />
              </div>
            ) : activeTab === "exception" ? (
              <div className="space-y-3">
                {scans
                  .filter((x) => ["exception", "damaged", "misroute", "failed"].includes(x.status.toLowerCase()))
                  .map((row) => (
                    <ExceptionRow
                      key={row.id}
                      code={row.trackingNo}
                      text={`${row.operation} at ${row.zone} / ${row.zone} တွင် ${row.operation}`}
                    />
                  ))}
              </div>
            ) : (
              <>
                <div className="relative">
                  <PackageSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by tracking / operation / zone ... | ကုန်စည်နံပါတ်၊ လုပ်ငန်းစဉ်၊ ဇုန်ဖြင့်ရှာရန်"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-[#0d2c54] focus:bg-white"
                  />
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-left text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-black">Tracking</th>
                        <th className="px-4 py-3 font-black">Operation</th>
                        <th className="px-4 py-3 font-black">Zone</th>
                        <th className="px-4 py-3 font-black">Operator</th>
                        <th className="px-4 py-3 font-black">Time</th>
                        <th className="px-4 py-3 font-black">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredScans.map((row) => (
                        <tr key={row.id} className="border-t border-slate-100">
                          <td className="px-4 py-3 font-bold text-[#0d2c54]">{row.trackingNo}</td>
                          <td className="px-4 py-3">{row.operation}</td>
                          <td className="px-4 py-3">{row.zone}</td>
                          <td className="px-4 py-3">{row.operator}</td>
                          <td className="px-4 py-3">{row.time}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${badgeClass(row.status)}`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <ClipboardList size={20} className="text-[#0d2c54]" />
          <h2 className="text-lg font-black text-[#0d2c54]">Shift Handover Log / အလှည့်လွှဲပြောင်းမှတ်တမ်း</h2>
        </div>
        <div className="mt-4 grid gap-3">
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Dynamic warehouse state synced from scans, bags, and manifests. / စကင်န်၊ အိတ်၊ မန်နီဖက်မှ အခြေအနေများကို ချိတ်ဆက်ဖတ်ရှုထားသည်</div>
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Use actions above to create receipts, bags, and manifests. / အထက်ပါလုပ်ဆောင်ချက်များကို အသုံးပြုပြီး လက်ခံမှု၊ အိတ်နှင့် မန်နီဖက်ဖန်တီးနိုင်သည်</div>
        </div>
      </div>

      {modalType && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <h3 className="text-2xl font-black text-[#0d2c54]">{modalTitle(modalType)}</h3>
              <button
                onClick={() => setModalType(null)}
                className="rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {modalType === "inbound" && (
                <>
                  <Field label="Shipment ID / ကုန်စည် ID">
                    <input value={form.shipment_id} onChange={(e) => setForm((p) => ({ ...p, shipment_id: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
                  </Field>
                  <Field label="Branch ID / ရုံး ID">
                    <input value={form.branch_id} onChange={(e) => setForm((p) => ({ ...p, branch_id: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
                  </Field>
                </>
              )}

              {modalType === "bag" && (
                <>
                  <Field label="Bag No / အိတ်နံပါတ်">
                    <input value={form.bag_no} onChange={(e) => setForm((p) => ({ ...p, bag_no: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
                  </Field>
                  <Field label="Branch ID / ရုံး ID">
                    <input value={form.branch_id} onChange={(e) => setForm((p) => ({ ...p, branch_id: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
                  </Field>
                  <Field label="Destination Branch ID / သွားမည့်ရုံး ID">
                    <input value={form.destination_branch_id} onChange={(e) => setForm((p) => ({ ...p, destination_branch_id: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
                  </Field>
                </>
              )}

              {modalType === "manifest" && (
                <>
                  <Field label="Manifest Type / မန်နီဖက်အမျိုးအစား">
                    <select value={form.manifest_type} onChange={(e) => setForm((p) => ({ ...p, manifest_type: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <option value="linehaul">linehaul</option>
                      <option value="branch_dispatch">branch_dispatch</option>
                      <option value="pickup_run">pickup_run</option>
                      <option value="delivery_run">delivery_run</option>
                    </select>
                  </Field>
                  <Field label="Origin Branch ID / မူလရုံး ID">
                    <input value={form.origin_branch_id} onChange={(e) => setForm((p) => ({ ...p, origin_branch_id: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
                  </Field>
                  <Field label="Destination Branch ID / သွားမည့်ရုံး ID">
                    <input value={form.destination_branch_id} onChange={(e) => setForm((p) => ({ ...p, destination_branch_id: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
                  </Field>
                  <Field label="Vehicle No / ယာဉ်နံပါတ်">
                    <input value={form.vehicle_no} onChange={(e) => setForm((p) => ({ ...p, vehicle_no: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
                  </Field>
                </>
              )}

              {modalType === "dispatch" && (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  Dispatch selected manifest now. / ရွေးထားသော မန်နီဖက်ကို ယခု ပို့မည်
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setModalType(null)} className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black uppercase tracking-wider text-slate-700 hover:bg-slate-200">
                Cancel
              </button>
              <button
                onClick={submitAction}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0d2c54] px-5 py-3 text-sm font-black uppercase tracking-wider text-white disabled:opacity-60"
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function modalTitle(type: ModalType) {
  switch (type) {
    case "inbound":
      return "Create Inbound Receipt / ဝင်ကုန်လက်ခံမှုဖန်တီးမည်";
    case "bag":
      return "Create Bag / အိတ်ဖန်တီးမည်";
    case "manifest":
      return "Create Manifest / မန်နီဖက်ဖန်တီးမည်";
    case "dispatch":
      return "Dispatch Manifest / မန်နီဖက်ပို့မည်";
    default:
      return "Warehouse Action";
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</div>
      {children}
    </label>
  );
}

function StatCard({
  icon: Icon,
  title,
  mm,
  value,
  danger = false,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  mm: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <Icon size={26} className={danger ? "text-rose-500" : "text-[#0d2c54]"} />
      <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className="mt-1 text-[11px] font-bold text-slate-500" style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>{mm}</p>
      <p className="mt-4 text-4xl font-black text-[#0d2c54]">{value}</p>
    </div>
  );
}

function TabButton({
  icon: Icon,
  active,
  onClick,
  en,
  mm,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  active: boolean;
  onClick: () => void;
  en: string;
  mm: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-4 py-3 text-left transition ${
        active ? "bg-[#0d2c54] text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} />
        <div>
          <p className="font-black">{en}</p>
          <p className={`text-sm ${active ? "text-white/70" : "text-slate-500"}`} style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>{mm}</p>
        </div>
      </div>
    </button>
  );
}

function InventoryCard({ zone, count, status }: { zone: string; count: string; status: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <p className="text-sm font-black text-[#0d2c54]">{zone}</p>
      <p className="mt-3 text-4xl font-black text-[#0d2c54]">{count}</p>
      <p className="mt-2 text-sm text-slate-500">{status}</p>
    </div>
  );
}

function ExceptionRow({ code, text }: { code: string; text: string }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
      <p className="font-black text-rose-700">{code}</p>
      <p className="mt-1 text-sm text-rose-600">{text}</p>
    </div>
  );
}

function QuickAction({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="rounded-2xl bg-slate-50 px-4 py-3 text-left font-black text-[#0d2c54] hover:bg-slate-100">
      {label}
    </button>
  );
}

function workspaceSubtitle(tab: string) {
  const map: Record<string, string> = {
    inbound: "Inbound receive queue and verification desk. / ဝင်ကုန်လက်ခံစာရင်းနှင့် အတည်ပြုခန်း",
    bags: "Bag sealing, bag mapping, and sack control. / အိတ်ပိတ်ခြင်း၊ အိတ်ချိတ်ဆက်ခြင်းနှင့် ဆာ့ခ်ထိန်းချုပ်မှု",
    sorting: "Sorting lanes, rack assignment, and scan queue. / ခွဲခြမ်းလမ်းကြောင်း၊ ရက်ခ်သတ်မှတ်ခြင်းနှင့် စကင်န်စာရင်း",
    scan: "Scan and verify every package movement. / ကုန်စည်လှုပ်ရှားမှုတိုင်းကို စကင်န်နှင့်အတည်ပြု",
    dispatch: "Prepare outbound shipments before release. / ထွက်ကုန်မထုတ်မီ ပြင်ဆင်ရန်",
    manifest: "Create and monitor outbound manifests. / ထွက်ကုန်မန်နီဖက်များဖန်တီးပြီးစောင့်ကြည့်ရန်",
    inventory: "View cages, bins, and current stock positions. / ကေ့ခ်ျ၊ ဘင်နှင့် လက်ရှိစတော့တည်နေရာများကြည့်ရန်",
    exception: "Review misroute, damage, and mismatch cases. / လမ်းကြောင်းမှား၊ ပျက်စီးမှုနှင့် မကိုက်ညီမှုများစစ်ဆေးရန်",
  };
  return map[tab] || "";
}
