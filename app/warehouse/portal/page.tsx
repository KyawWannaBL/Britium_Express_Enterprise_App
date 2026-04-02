"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowDownToLine, Boxes, ArrowUpFromLine, ShieldAlert, RefreshCw } from "lucide-react";
import { envList, formatDate, getItems, toText, tryGetCandidates } from "@/lib/ops-api";

const SCAN_ENDPOINTS = envList("NEXT_PUBLIC_WAREHOUSE_SCAN_ENDPOINTS", [
  "/api/v1/warehouse/scans",
  "/api/warehouse/scans",
]);
const MANIFEST_ENDPOINTS = envList("NEXT_PUBLIC_WAREHOUSE_MANIFEST_ENDPOINTS", [
  "/api/v1/manifests",
  "/api/manifests",
]);
const BAG_ENDPOINTS = envList("NEXT_PUBLIC_WAREHOUSE_BAG_ENDPOINTS", [
  "/api/v1/warehouse/bags",
  "/api/warehouse/bags",
]);

type RowItem = {
  id: string;
  code: string;
  status: string;
  branch: string;
  createdAt: string;
};

function normalize(input: unknown, type: "scan" | "manifest" | "bag"): RowItem[] {
  return getItems(input).map((row, index) => ({
    id: toText(row.id, `${type}-${index}`),
    code: toText(row.code, row.tracking_no, row.manifest_no, row.bag_no, `${type.toUpperCase()}-${index + 1}`),
    status: toText(row.status, "pending"),
    branch: toText(row.branch_name, row.branch_id, row.location, "-"),
    createdAt: toText(row.created_at, row.updated_at, "-"),
  }));
}

export default function WarehousePortalPage() {
  const [scans, setScans] = useState<RowItem[]>([]);
  const [manifests, setManifests] = useState<RowItem[]>([]);
  const [bags, setBags] = useState<RowItem[]>([]);
  const [view, setView] = useState<"scan" | "manifest" | "bag">("scan");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setBusy(true);
    setError("");

    const [scanRes, manifestRes, bagRes] = await Promise.allSettled([
      tryGetCandidates<unknown>(SCAN_ENDPOINTS),
      tryGetCandidates<unknown>(MANIFEST_ENDPOINTS),
      tryGetCandidates<unknown>(BAG_ENDPOINTS),
    ]);

    if (scanRes.status === "fulfilled") setScans(normalize(scanRes.value, "scan"));
    else setScans([]);

    if (manifestRes.status === "fulfilled") setManifests(normalize(manifestRes.value, "manifest"));
    else setManifests([]);

    if (bagRes.status === "fulfilled") setBags(normalize(bagRes.value, "bag"));
    else setBags([]);

    if (
      scanRes.status === "rejected" &&
      manifestRes.status === "rejected" &&
      bagRes.status === "rejected"
    ) {
      setError("Warehouse APIs are not available yet. Please verify scan, manifest, and bag endpoints.");
    }

    setBusy(false);
  }

  const activeRows = useMemo(() => {
    if (view === "scan") return scans;
    if (view === "manifest") return manifests;
    return bags;
  }, [view, scans, manifests, bags]);

  return (
    <div className="min-h-screen bg-[#f7f9fc] p-8">
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Logistics Operations</p>
        <h1 className="text-4xl font-black uppercase tracking-tight text-[#0d2c54]">
          Warehouse Hub <span className="font-normal">/ ဂိုဒေါင်စီမံခန့်ခွဲမှု</span>
        </h1>
        <p className="text-slate-500">
          Inbound receiving, sorting, scan verification, dispatch preparation, manifest control, and exception handling.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={<ArrowDownToLine size={24} className="text-[#0d2c54]" />} title="Inbound Receiving" value={String(scans.length)} />
        <StatCard icon={<Boxes size={24} className="text-[#0d2c54]" />} title="Bag / Sack Mgmt" value={String(bags.length)} />
        <StatCard icon={<Boxes size={24} className="text-[#0d2c54]" />} title="Sorting Queue" value={String(scans.filter((x) => x.status.toLowerCase() !== "completed").length)} />
        <StatCard icon={<ArrowUpFromLine size={24} className="text-[#0d2c54]" />} title="Dispatch Ready" value={String(manifests.length)} />
        <StatCard icon={<ShieldAlert size={24} className="text-rose-500" />} title="Exceptions" value={String(activeRows.filter((x) => x.status.toLowerCase().includes("error")).length)} />
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-[#0d2c54]">Warehouse Modules / ဂိုဒေါင်လုပ်ငန်းများ</h2>
          <div className="mt-5 space-y-3">
            <ModuleButton label="Inbound Receiving" mm="ဝင်ကုန်လက်ခံခြင်း" active={view === "scan"} onClick={() => setView("scan")} />
            <ModuleButton label="Manifest Control" mm="မန်နီဖက်စီမံခန့်ခွဲမှု" active={view === "manifest"} onClick={() => setView("manifest")} />
            <ModuleButton label="Bag / Sack Management" mm="အိတ် / အထုပ်စီမံခန့်ခွဲမှု" active={view === "bag"} onClick={() => setView("bag")} />
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#0d2c54]">Active Workspace / လက်ရှိအလုပ်ခွင်</h2>
            <button
              onClick={fetchAll}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0d2c54] px-4 py-3 text-xs font-black uppercase tracking-wider text-white"
            >
              <RefreshCw size={14} />
              {busy ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-black">Code</th>
                  <th className="px-4 py-3 font-black">Status</th>
                  <th className="px-4 py-3 font-black">Branch</th>
                  <th className="px-4 py-3 font-black">Created</th>
                </tr>
              </thead>
              <tbody>
                {activeRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                      No records available for this module.
                    </td>
                  </tr>
                ) : (
                  activeRows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-bold text-[#0d2c54]">{row.code}</td>
                      <td className="px-4 py-3">{row.status}</td>
                      <td className="px-4 py-3">{row.branch}</td>
                      <td className="px-4 py-3">{formatDate(row.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      {icon}
      <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className="mt-4 text-4xl font-black text-[#0d2c54]">{value}</p>
    </div>
  );
}

function ModuleButton({
  label,
  mm,
  active,
  onClick,
}: {
  label: string;
  mm: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl px-4 py-4 text-left ${active ? "bg-[#0d2c54] text-white" : "bg-slate-50 text-[#0d2c54]"}`}
    >
      <div className="font-black">{label}</div>
      <div className="mt-1 text-sm opacity-80">{mm}</div>
    </button>
  );
}
