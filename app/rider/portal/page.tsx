"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Bike, CheckCircle2, XCircle, Wallet, RefreshCw } from "lucide-react";
import { envList, formatDate, formatMMK, getItems, toNumber, toText, tryGetCandidates } from "@/lib/ops-api";

const TASK_ENDPOINTS = envList("NEXT_PUBLIC_RIDER_TASK_ENDPOINTS", [
  "/api/v1/rider/tasks",
  "/api/rider/tasks",
  "/api/v1/delivery-tasks",
  "/api/delivery-tasks",
]);

const COD_ENDPOINTS = envList("NEXT_PUBLIC_RIDER_COD_ENDPOINTS", [
  "/api/v1/rider/cod-collections",
  "/api/rider/cod-collections",
]);

type TaskRow = {
  id: string;
  trackingNo: string;
  customer: string;
  status: string;
  area: string;
  codAmount: number;
  updatedAt: string;
};

function normalizeTasks(input: unknown): TaskRow[] {
  return getItems(input).map((row, index) => ({
    id: toText(row.id, `task-${index}`),
    trackingNo: toText(row.tracking_no, row.shipment_tracking_no, row.code, `TASK-${index + 1}`),
    customer: toText(row.customer_name, row.recipient_name, row.receiver_name, "-"),
    status: toText(row.status, "assigned"),
    area: toText(row.area, row.branch_name, row.township, "-"),
    codAmount: toNumber(row.cod_amount, row.collectable_amount, row.total_collectable),
    updatedAt: toText(row.updated_at, row.created_at, "-"),
  }));
}

export default function RiderPortalPage() {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [view, setView] = useState<"assigned" | "completed" | "failed">("assigned");
  const [codTotal, setCodTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setBusy(true);
    setError("");

    const [taskRes, codRes] = await Promise.allSettled([
      tryGetCandidates<unknown>(TASK_ENDPOINTS),
      tryGetCandidates<unknown>(COD_ENDPOINTS),
    ]);

    if (taskRes.status === "fulfilled") {
      setTasks(normalizeTasks(taskRes.value));
    } else {
      setTasks([]);
    }

    if (codRes.status === "fulfilled") {
      const items = getItems(codRes.value);
      const total = items.reduce(
        (sum, row) => sum + toNumber(row.amount, row.cod_amount, row.collected_amount),
        0
      );
      setCodTotal(total);
    } else {
      setCodTotal(0);
    }

    if (taskRes.status === "rejected" && codRes.status === "rejected") {
      setError("Rider APIs are not available yet. Please verify rider task and COD endpoints.");
    }

    setBusy(false);
  }

  const visibleTasks = useMemo(() => {
    if (view === "assigned") {
      return tasks.filter((task) =>
        ["assigned", "accepted", "in_progress", "pending"].includes(task.status.toLowerCase())
      );
    }
    if (view === "completed") {
      return tasks.filter((task) => task.status.toLowerCase() === "completed" || task.status.toLowerCase() === "delivered");
    }
    return tasks.filter((task) =>
      ["failed", "delivery_failed", "cancelled"].includes(task.status.toLowerCase())
    );
  }, [tasks, view]);

  return (
    <div className="min-h-screen bg-[#f7f9fc] p-8">
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Field & Logistics</p>
        <h1 className="text-4xl font-black uppercase tracking-tight text-[#0d2c54]">
          Rider Portal <span className="font-normal">/ ပို့ဆောင်ရေး (Rider)</span>
        </h1>
        <p className="text-slate-500">
          Delivery tasks, route list, failed attempts, COD collection, wallet earnings, and incident support.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Bike size={24} className="text-[#0d2c54]" />} title="Assigned Deliveries" value={String(tasks.filter((x) => ["assigned", "accepted", "in_progress", "pending"].includes(x.status.toLowerCase())).length)} />
        <StatCard icon={<CheckCircle2 size={24} className="text-emerald-500" />} title="Completed" value={String(tasks.filter((x) => ["completed", "delivered"].includes(x.status.toLowerCase())).length)} />
        <StatCard icon={<XCircle size={24} className="text-rose-500" />} title="Failed Attempts" value={String(tasks.filter((x) => ["failed", "delivery_failed", "cancelled"].includes(x.status.toLowerCase())).length)} />
        <StatCard icon={<Wallet size={24} className="text-[#ffd700]" />} title="COD & Earnings" value={formatMMK(codTotal)} dark />
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-[#0d2c54]">Rider Modules / Rider လုပ်ငန်းများ</h2>
          <div className="mt-5 space-y-3">
            <ModuleButton label="Assigned Deliveries" mm="တာဝန်ပေးအပ်ထားသောပို့ဆောင်မှု" active={view === "assigned"} onClick={() => setView("assigned")} />
            <ModuleButton label="Completed" mm="ပြီးစီး" active={view === "completed"} onClick={() => setView("completed")} />
            <ModuleButton label="Failed Attempts" mm="မအောင်မြင်သောကြိုးစားမှု" active={view === "failed"} onClick={() => setView("failed")} />
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
                  <th className="px-4 py-3 font-black">Tracking</th>
                  <th className="px-4 py-3 font-black">Customer</th>
                  <th className="px-4 py-3 font-black">Area</th>
                  <th className="px-4 py-3 font-black">COD</th>
                  <th className="px-4 py-3 font-black">Status</th>
                  <th className="px-4 py-3 font-black">Updated</th>
                </tr>
              </thead>
              <tbody>
                {visibleTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                      No task records available for this module.
                    </td>
                  </tr>
                ) : (
                  visibleTasks.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-bold text-[#0d2c54]">{row.trackingNo}</td>
                      <td className="px-4 py-3">{row.customer}</td>
                      <td className="px-4 py-3">{row.area}</td>
                      <td className="px-4 py-3">{formatMMK(row.codAmount)}</td>
                      <td className="px-4 py-3">{row.status}</td>
                      <td className="px-4 py-3">{formatDate(row.updatedAt)}</td>
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

function StatCard({ icon, title, value, dark = false }: { icon: React.ReactNode; title: string; value: string; dark?: boolean }) {
  return (
    <div className={`rounded-[28px] border border-slate-200 p-6 shadow-sm ${dark ? "bg-[#0d2c54] text-white" : "bg-white"}`}>
      {icon}
      <p className={`mt-5 text-xs font-black uppercase tracking-[0.2em] ${dark ? "text-white/70" : "text-slate-400"}`}>{title}</p>
      <p className={`mt-4 text-4xl font-black ${dark ? "text-[#ffd700]" : "text-[#0d2c54]"}`}>{value}</p>
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
