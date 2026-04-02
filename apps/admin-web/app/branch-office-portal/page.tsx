"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Building2, Package, Truck, CheckCircle2, Coins, RefreshCw, MapPin, UserCircle, AlertTriangle } from "lucide-react";
import {
  BRANCH_ENDPOINTS,
  appendQuery,
  formatDateTime,
  formatMMK,
  getItems,
  toNumber,
  toText,
  tryGet,
} from "@/lib/productionApi";

type BranchRow = {
  id: string;
  name: string;
  code: string;
  city: string;
  manager: string;
  status: string;
};

type ShipmentRow = {
  id: string;
  trackingNo: string;
  customer: string;
  status: string;
  codAmount: number;
  updatedAt: string;
};

function normalizeBranches(input: unknown): BranchRow[] {
  return getItems(input).map((row, index) => ({
    id: toText(row.id, `b-${index}`),
    name: toText(row.name, row.branch_name, `Branch ${index + 1}`),
    code: toText(row.code, row.branch_code, "-"),
    city: toText(row.city, row.township, "-"),
    manager: toText(row.manager_name, row.branch_manager, "-"),
    status: toText(row.status, "active"),
  }));
}

function normalizeShipments(input: unknown): ShipmentRow[] {
  return getItems(input).map((row, index) => ({
    id: toText(row.id, `s-${index}`),
    trackingNo: toText(row.tracking_no, row.waybill_no, `WB-${index + 1}`),
    customer: toText(row.customer_name, row.recipient_name, row.receiver_name, "-"),
    status: toText(row.current_status, row.status, "processing"),
    codAmount: toNumber(row.cod_amount, row.total_collectable),
    updatedAt: toText(row.updated_at, row.created_at, "-"),
  }));
}

function badge(status: string) {
  const s = status.toLowerCase();
  if (["active", "delivered", "completed"].includes(s)) return "bg-emerald-100 text-emerald-700";
  if (["processing", "out_for_delivery", "in_transit", "pending"].includes(s)) return "bg-amber-100 text-amber-700";
  if (["failed", "returned", "closed"].includes(s)) return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

export default function BranchOfficePortalPage() {
  const [branches, setBranches] = useState<BranchRow[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [shipments, setShipments] = useState<ShipmentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [shipmentLoading, setShipmentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedBranch = useMemo(
    () => branches.find((x) => x.id === selectedBranchId) ?? null,
    [branches, selectedBranchId]
  );

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (!selectedBranchId) return;
    fetchShipments(selectedBranchId);
  }, [selectedBranchId]);

  async function fetchBranches() {
    setLoading(true);
    setError(null);

    try {
      const data = await tryGet<unknown>(BRANCH_ENDPOINTS.branches);
      const normalized = normalizeBranches(data);
      setBranches(normalized);
      if (!selectedBranchId && normalized.length > 0) {
        setSelectedBranchId(normalized[0].id);
      }
    } catch {
      setBranches([]);
      setError("Unable to load branch directory. Check branch endpoints and API base URL.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchShipments(branchId: string) {
    setShipmentLoading(true);

    try {
      const data = await tryGet<unknown>(
        appendQuery(BRANCH_ENDPOINTS.shipments, { branch_id: branchId })
      );
      setShipments(normalizeShipments(data));
    } catch {
      setShipments([]);
    } finally {
      setShipmentLoading(false);
    }
  }

  const totals = useMemo(() => {
    const delivered = shipments.filter((x) => x.status.toLowerCase() === "delivered").length;
    const inTransit = shipments.filter((x) => ["processing", "in_transit", "out_for_delivery"].includes(x.status.toLowerCase())).length;
    const codTotal = shipments.reduce((sum, row) => sum + row.codAmount, 0);
    const issues = shipments.filter((x) => ["failed", "returned"].includes(x.status.toLowerCase())).length;

    return {
      queue: shipments.length,
      delivered,
      inTransit,
      codTotal,
      issues,
    };
  }, [shipments]);

  React.useEffect(() => {
    if (!selectedBranchId && branches.length > 0) {
      setSelectedBranchId(branches[0].id);
    }
  }, [branches, selectedBranchId]);

  return (
    <div className="min-h-screen bg-[#f7f9fc] p-8">
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Administration</p>
        <h1 className="text-4xl font-black uppercase tracking-tight text-[#0d2c54]">
          Branch Office Portal <span className="font-normal">/ ဌာနခွဲရုံးပေါ်တယ်</span>
        </h1>
        <p className="text-slate-500">
          Branch dashboard, local shipment queue, dispatch control, cash summary, and issue visibility. /
          ဌာနခွဲဒက်ရှ်ဘုတ်၊ ဒေသတွင်းကုန်စည်စာရင်း၊ ပို့ဆောင်ထိန်းချုပ်မှု၊ ငွေစာရင်းနှင့် ပြဿနာကြည့်ရှုမှု
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              Select Branch
            </label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none"
            >
              <option value="">Choose branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} ({branch.code})
                </option>
              ))}
            </select>
          </div>

          <button onClick={fetchBranches} className="inline-flex items-center gap-2 rounded-2xl bg-[#0d2c54] px-4 py-3 text-xs font-black uppercase tracking-wider text-white hover:opacity-95">
            <RefreshCw size={14} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Package} title="Local Queue" value={`${totals.queue}`} />
        <StatCard icon={Truck} title="In Transit" value={`${totals.inTransit}`} />
        <StatCard icon={CheckCircle2} title="Delivered" value={`${totals.delivered}`} />
        <StatCard icon={Coins} title="Cash & COD" value={formatMMK(totals.codTotal)} />
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Panel title="Branch Dashboard / ဌာနခွဲအခြေအနေ">
          {!selectedBranch ? (
            <div className="rounded-2xl bg-slate-50 p-6 text-slate-500">
              Select a branch to load branch details.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard icon={<Building2 size={16} className="text-[#0d2c54]" />} title="Branch" value={selectedBranch.name} />
              <InfoCard icon={<MapPin size={16} className="text-[#0d2c54]" />} title="City" value={selectedBranch.city} />
              <InfoCard icon={<UserCircle size={16} className="text-[#0d2c54]" />} title="Manager" value={selectedBranch.manager} />
              <InfoCard icon={<CheckCircle2 size={16} className="text-[#0d2c54]" />} title="Status" value={selectedBranch.status.toUpperCase()} />
              <InfoCard icon={<AlertTriangle size={16} className="text-[#0d2c54]" />} title="Issue Register" value={`${totals.issues} open issues`} />
              <InfoCard icon={<Coins size={16} className="text-[#0d2c54]" />} title="COD Summary" value={formatMMK(totals.codTotal)} />
            </div>
          )}
        </Panel>

        <Panel title="Local Shipment Queue / ဒေသတွင်းကုန်စည်စာရင်း">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-black">Tracking</th>
                  <th className="px-4 py-3 font-black">Customer</th>
                  <th className="px-4 py-3 font-black">Status</th>
                  <th className="px-4 py-3 font-black">COD</th>
                  <th className="px-4 py-3 font-black">Updated</th>
                </tr>
              </thead>
              <tbody>
                {shipmentLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      Loading branch shipments...
                    </td>
                  </tr>
                ) : shipments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      No branch shipments found.
                    </td>
                  </tr>
                ) : (
                  shipments.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-bold text-[#0d2c54]">{row.trackingNo}</td>
                      <td className="px-4 py-3">{row.customer}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${badge(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{formatMMK(row.codAmount)}</td>
                      <td className="px-4 py-3">{formatDateTime(row.updatedAt)}</td>
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

function InfoCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</span>
      </div>
      <div className="mt-2 font-black text-[#0d2c54]">{value}</div>
    </div>
  );
}
