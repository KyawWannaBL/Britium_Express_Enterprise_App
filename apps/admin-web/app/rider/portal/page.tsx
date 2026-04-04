"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Bike,
  CalendarClock,
  CircleCheckBig,
  Coins,
  CreditCard,
  Loader2,
  MapPinned,
  PhoneCall,
  ShieldAlert,
  Wallet,
  Clock3,
  PackageCheck,
  XCircle,
  Search,
  Route,
  Play,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

// Using this for type definitions, but bypassing the actual fetch calls for now.
import { RIDER_ENDPOINTS } from "@/lib/opsApi";

type TaskRow = {
  id: string;
  trackingNo: string;
  customer: string;
  phone: string;
  area: string;
  status: string;
  cod: number;
};

type ModalType = "accept" | "start" | "complete" | "attempt" | "cod" | null;

// --- MOCK DATA ---
const MOCK_TASKS: TaskRow[] = [
  { id: "task-1", trackingNo: "WB-100294", customer: "U Aung Aung", phone: "09400011122", area: "Kamayut", status: "assigned", cod: 15000 },
  { id: "task-2", trackingNo: "WB-100295", customer: "Daw Su Su", phone: "09255533344", area: "Hlaing", status: "in_progress", cod: 0 },
  { id: "task-3", trackingNo: "WB-100296", customer: "Ko Kyaw", phone: "09777788899", area: "Bahan", status: "completed", cod: 25000 },
  { id: "task-4", trackingNo: "WB-100297", customer: "Ma Aye", phone: "09999900011", area: "Sanchaung", status: "failed_attempt", cod: 5000 },
  { id: "task-5", trackingNo: "WB-100298", customer: "U Tun", phone: "09555544433", area: "Dagon", status: "assigned", cod: 12000 },
  { id: "task-6", trackingNo: "WB-100299", customer: "Daw Mya", phone: "09222211100", area: "Mingaladon", status: "accepted", cod: 4500 },
];
// -----------------

function badgeClass(status: string) {
  const s = status.toLowerCase();
  if (["delivered", "completed"].includes(s)) return "bg-emerald-100 text-emerald-700";
  if (["failed_attempt", "failed", "rejected"].includes(s)) return "bg-rose-100 text-rose-700";
  if (["assigned", "accepted", "out_for_delivery", "in_progress"].includes(s)) return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

function statusText(status: string) {
  return status.replace(/_/g, " ").toUpperCase();
}

export default function RiderPortalPage() {
  const [activeTab, setActiveTab] = useState("deliveries");
  const [search, setSearch] = useState("");

  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [selected, setSelected] = useState<TaskRow | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);

  const [form, setForm] = useState({
    notes: "",
    amount: "",
    outcome: "failed",
    failure_reason_code: "CUSTOMER_NOT_HOME",
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function fetchTasks() {
    setLoading(true);
    setError(null);

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Use mock data instead of tryGet()
      setTasks(MOCK_TASKS);
    } catch (err) {
      setTasks([]);
      setError(err instanceof Error ? err.message : "Failed to load rider tasks");
    } finally {
      setLoading(false);
    }
  }

  async function submitAction() {
    if (!selected || !modalType) return;

    setActionLoading(true);
    setError(null);

    try {
      // Simulate network delay for the action
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Optimistically update the UI instead of calling tryPost()
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === selected.id) {
            if (modalType === "accept") return { ...t, status: "accepted" };
            if (modalType === "start") return { ...t, status: "in_progress" };
            if (modalType === "complete") return { ...t, status: "completed" };
            if (modalType === "attempt") return { ...t, status: "failed_attempt" };
            // COD doesn't change status directly in this view
          }
          return t;
        })
      );

      setToast("Rider action completed / Rider လုပ်ဆောင်ချက်ပြီးပါပြီ");
      setModalType(null);
      setForm({ notes: "", amount: "", outcome: "failed", failure_reason_code: "CUSTOMER_NOT_HOME" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rider action failed");
    } finally {
      setActionLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (row) =>
        row.trackingNo.toLowerCase().includes(q) ||
        row.customer.toLowerCase().includes(q) ||
        row.area.toLowerCase().includes(q)
    );
  }, [tasks, search]);

  const stats = {
    assigned: tasks.filter((x) => ["assigned", "accepted", "out_for_delivery", "in_progress"].includes(x.status)).length,
    delivered: tasks.filter((x) => ["delivered", "completed"].includes(x.status)).length,
    failed: tasks.filter((x) => ["failed_attempt", "failed", "rejected"].includes(x.status)).length,
    cod: tasks.reduce((sum, x) => sum + x.cod, 0),
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] p-8">
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
          Field & Logistics
        </p>
        <h1 className="text-4xl font-black uppercase tracking-tight text-[#0d2c54]">
          Rider Portal <span className="font-normal text-blue-500">/ ပို့ဆောင်ရေး (Rider)</span>
        </h1>
        <p className="text-slate-500">
          Delivery tasks, route list, failed attempts, COD collection, wallet earnings, and incident support. /
          ပို့ဆောင်ရေးတာဝန်များ၊ လမ်းကြောင်းစာရင်း၊ မအောင်မြင်သောပို့ဆောင်မှုများ၊ COD ကောက်ခံမှု၊ ဝင်ငွေစာရင်းနှင့် အကူအညီတင်ပြမှု
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

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Bike} title="Assigned Deliveries" mm="ပေးအပ်ထားသောပို့ဆောင်မှု" value={`${stats.assigned}`} />
        <StatCard icon={CircleCheckBig} title="Completed" mm="ပြီးစီး" value={`${stats.delivered}`} success />
        <StatCard icon={XCircle} title="Failed Attempts" mm="မအောင်မြင်သောကြိုးစားမှု" value={`${stats.failed}`} danger />
        <StatCard icon={Wallet} title="COD & Earnings" mm="COD နှင့်ဝင်ငွေ" value={`${new Intl.NumberFormat("en-US").format(stats.cod)} MMK`} dark />
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-[#0d2c54]">Rider Modules / Rider လုပ်ငန်းများ</h2>
          <div className="mt-4 grid gap-3">
            <TabButton icon={PackageCheck} active={activeTab === "deliveries"} onClick={() => setActiveTab("deliveries")} en="Assigned Deliveries" mm="ပေးအပ်ထားသောပို့ဆောင်မှု" />
            <TabButton icon={MapPinned} active={activeTab === "route"} onClick={() => setActiveTab("route")} en="Route List / Map" mm="လမ်းကြောင်းစာရင်း / မြေပုံ" />
            <TabButton icon={Clock3} active={activeTab === "pickup"} onClick={() => setActiveTab("pickup")} en="Pickup Tasks" mm="လာယူရေးတာဝန်များ" />
            <TabButton icon={CircleCheckBig} active={activeTab === "confirm"} onClick={() => setActiveTab("confirm")} en="Delivery Confirmation" mm="ပို့ဆောင်မှုအတည်ပြုခြင်း" />
            <TabButton icon={ShieldAlert} active={activeTab === "failed"} onClick={() => setActiveTab("failed")} en="Failed Attempt Capture" mm="မအောင်မြင်မှုမှတ်တမ်း" />
            <TabButton icon={Coins} active={activeTab === "cash"} onClick={() => setActiveTab("cash")} en="Cash Collection Entry" mm="ငွေကောက်ခံမှုထည့်သွင်းခြင်း" />
            <TabButton icon={CreditCard} active={activeTab === "settlement"} onClick={() => setActiveTab("settlement")} en="COD Settlement" mm="COD စာရင်းရှင်းခြင်း" />
            <TabButton icon={CalendarClock} active={activeTab === "attendance"} onClick={() => setActiveTab("attendance")} en="Attendance / Shift" mm="တက်ရောက်မှု / အလုပ်ချိန်" />
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-[#0d2c54]">Active Workspace / လက်ရှိအလုပ်ခန်း</h2>
              <p className="mt-1 text-sm text-slate-500">{workspaceText(activeTab)}</p>
            </div>
            <button
              onClick={fetchTasks}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0d2c54] px-4 py-3 text-xs font-black uppercase tracking-wider text-white hover:opacity-95"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Refresh
            </button>
          </div>

          {activeTab === "route" ? (
            <div className="mt-5 rounded-[28px] border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <Route size={48} className="mx-auto text-slate-300" />
              <p className="mt-4 text-lg font-black text-slate-400">Route Map Initializing... / လမ်းကြောင်းမြေပုံစတင်နေသည်...</p>
            </div>
          ) : activeTab === "attendance" ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InfoCard title="Shift Start / အလုပ်စ" value="08:00 AM" />
              <InfoCard title="Shift End / အလုပ်ပြီး" value="06:00 PM" />
              <InfoCard title="Check-In / ရောက်ရှိချိန်" value="Live from attendance service" />
              <InfoCard title="Status / အခြေအနေ" value="ON DUTY / တာဝန်ထမ်းဆောင်နေ" />
            </div>
          ) : activeTab === "settlement" ? (
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <InfoCard title="Collected COD / ကောက်ခံပြီး" value={`${new Intl.NumberFormat("en-US").format(stats.cod)} MMK`} />
              <InfoCard title="Pending Submit / မတင်သွင်းရသေး" value="12,000 MMK" />
              <InfoCard title="Wallet / Wallet" value="25,500 MMK" />
            </div>
          ) : (
            <>
              <div className="relative mt-5">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by tracking / customer / area ... | ကုန်စည်၊ ဖောက်သည်၊ နေရာဖြင့်ရှာရန်"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-[#0d2c54] focus:bg-white"
                />
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-black">Tracking</th>
                      <th className="px-4 py-3 font-black">Customer</th>
                      <th className="px-4 py-3 font-black">Area</th>
                      <th className="px-4 py-3 font-black">COD</th>
                      <th className="px-4 py-3 font-black">Status</th>
                      <th className="px-4 py-3 font-black">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => (
                      <tr key={row.id} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-bold text-[#0d2c54]">{row.trackingNo}</td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-700">{row.customer}</div>
                          <div className="mt-1 text-xs text-slate-400 inline-flex items-center gap-1">
                            <PhoneCall size={12} />
                            {row.phone}
                          </div>
                        </td>
                        <td className="px-4 py-3">{row.area}</td>
                        <td className="px-4 py-3 font-black text-emerald-600">
                          {new Intl.NumberFormat("en-US").format(row.cod)} MMK
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${badgeClass(row.status)}`}>
                            {statusText(row.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <MiniAction
                              label="Accept"
                              icon={<Check size={12} />}
                              onClick={() => {
                                setSelected(row);
                                setModalType("accept");
                              }}
                            />
                            <MiniAction
                              label="Start"
                              icon={<Play size={12} />}
                              onClick={() => {
                                setSelected(row);
                                setModalType("start");
                              }}
                            />
                            <MiniAction
                              label="Complete"
                              icon={<CircleCheckBig size={12} />}
                              onClick={() => {
                                setSelected(row);
                                setModalType("complete");
                              }}
                            />
                            <MiniAction
                              label="Attempt"
                              icon={<AlertTriangle size={12} />}
                              onClick={() => {
                                setSelected(row);
                                setModalType("attempt");
                              }}
                            />
                            <MiniAction
                              label="COD"
                              icon={<Coins size={12} />}
                              onClick={() => {
                                setSelected(row);
                                setModalType("cod");
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && !loading && (
                  <div className="py-8 text-center text-slate-500">No tasks found.</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {modalType && selected && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-2xl font-black text-[#0d2c54]">{modalTitle(modalType)}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {selected.trackingNo} · {selected.customer}
                </p>
              </div>
              <button onClick={() => setModalType(null)} className="rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-slate-200">
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {(modalType === "complete" || modalType === "attempt" || modalType === "cod") && (
                <label className="block">
                  <div className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Notes / မှတ်ချက်
                  </div>
                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#0d2c54]"
                  />
                </label>
              )}

              {modalType === "attempt" && (
                <>
                  <label className="block">
                    <div className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Outcome / ရလဒ်
                    </div>
                    <select
                      value={form.outcome}
                      onChange={(e) => setForm((p) => ({ ...p, outcome: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#0d2c54]"
                    >
                      <option value="failed">failed</option>
                      <option value="rescheduled">rescheduled</option>
                      <option value="rejected">rejected</option>
                    </select>
                  </label>

                  <label className="block">
                    <div className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Failure Reason / အကြောင်းပြချက်
                    </div>
                    <input
                      value={form.failure_reason_code}
                      onChange={(e) => setForm((p) => ({ ...p, failure_reason_code: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#0d2c54]"
                    />
                  </label>
                </>
              )}

              {modalType === "cod" && (
                <label className="block">
                  <div className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Amount / ငွေပမာဏ
                  </div>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#0d2c54]"
                  />
                </label>
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
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
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
    case "accept":
      return "Accept Task / တာဝန်လက်ခံမည်";
    case "start":
      return "Start Task / တာဝန်စမည်";
    case "complete":
      return "Complete Delivery / ပို့ဆောင်မှုပြီးဆုံးမည်";
    case "attempt":
      return "Record Failed Attempt / မအောင်မြင်မှုမှတ်တမ်းတင်မည်";
    case "cod":
      return "Submit COD Collection / COD ကောက်ခံမှုတင်ပို့မည်";
    default:
      return "Rider Action";
  }
}

function StatCard({
  icon: Icon,
  title,
  mm,
  value,
  success = false,
  danger = false,
  dark = false,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  mm: string;
  value: string;
  success?: boolean;
  danger?: boolean;
  dark?: boolean;
}) {
  const iconClass = danger ? "text-rose-500" : success ? "text-emerald-500" : dark ? "text-white" : "text-[#0d2c54]";
  return (
    <div className={`rounded-[28px] border border-slate-200 p-6 shadow-sm ${dark ? "bg-[#0d2c54] text-white" : "bg-white"}`}>
      <Icon size={26} className={iconClass} />
      <p className={`mt-5 text-xs font-black uppercase tracking-[0.2em] ${dark ? "text-white/60" : "text-slate-400"}`}>{title}</p>
      <p className={`mt-1 text-[11px] font-bold ${dark ? "text-white/70" : "text-slate-500"}`} style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>
        {mm}
      </p>
      <p className={`mt-4 text-4xl font-black ${dark ? "text-[#ffd700]" : "text-[#0d2c54]"}`}>{value}</p>
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
          <p className={`text-sm ${active ? "text-white/70" : "text-slate-500"}`} style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>
            {mm}
          </p>
        </div>
      </div>
    </button>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <p className="text-sm font-black text-slate-400">{title}</p>
      <p className="mt-3 text-2xl font-black text-[#0d2c54]">{value}</p>
    </div>
  );
}

function MiniAction({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-700 hover:bg-slate-200">
      {icon}
      {label}
    </button>
  );
}

function workspaceText(tab: string) {
  const map: Record<string, string> = {
    deliveries: "Assigned deliveries and live task handling. / ပေးအပ်ထားသောပို့ဆောင်မှုများနှင့် လက်ရှိတာဝန်များ",
    route: "Route list and delivery map. / လမ်းကြောင်းစာရင်းနှင့် ပို့ဆောင်မြေပုံ",
    pickup: "Pickup task queue for assigned rider. / Rider အတွက် လာယူရေးတာဝန်စာရင်း",
    confirm: "Confirm successful delivery and POD flow. / အောင်မြင်သောပို့ဆောင်မှုနှင့် POD အတည်ပြုမှု",
    failed: "Capture failed attempts and reasons. / မအောင်မြင်သောကြိုးစားမှုများနှင့် အကြောင်းရင်းများမှတ်တမ်းတင်",
    cash: "Record cash and COD collection. / ငွေသားနှင့် COD ကောက်ခံမှုမှတ်တမ်းတင်",
    settlement: "COD settlement and rider wallet overview. / COD စာရင်းရှင်းမှုနှင့် Rider ဝင်ငွေစာရင်း",
    attendance: "Attendance, shift start, and end-of-day control. / တက်ရောက်မှု၊ အလုပ်စနှင့် တာဝန်ပြီးချိန်ထိန်းချုပ်မှု",
  };
  return map[tab] || "";
}