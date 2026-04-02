"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck,
  BellRing,
  Users,
  CalendarDays,
  ShieldAlert,
  Route,
  Target,
  FileWarning,
  Megaphone,
  Activity,
  RefreshCw,
} from "lucide-react";
import { SUPERVISOR_ENDPOINTS, getItems, toNumber, toText, tryGet } from "@/lib/enterpriseScreensApi";

type ApprovalRow = { id: string; type: string; subject: string; owner: string; status: string };
type IncidentRow = { id: string; code: string; title: string; priority: string };
type StaffRow = { id: string; name: string; role: string; branch: string; status: string };

const demoApprovals: ApprovalRow[] = [
  { id: "1", type: "Shift Change", subject: "Yangon PM shift", owner: "Ko Min", status: "pending" },
  { id: "2", type: "Route Override", subject: "Tamwe dispatch swap", owner: "Su Su", status: "pending" },
  { id: "3", type: "Cash Adjustment", subject: "COD review", owner: "Htet Naing", status: "pending" },
];

const demoIncidents: IncidentRow[] = [
  { id: "1", code: "INC-001", title: "Warehouse delay escalation", priority: "high" },
  { id: "2", code: "INC-002", title: "Rider attendance exception", priority: "medium" },
  { id: "3", code: "INC-003", title: "Route overload on South zone", priority: "urgent" },
];

const demoStaff: StaffRow[] = [
  { id: "1", name: "Ko Min", role: "Supervisor", branch: "YGN-MAIN", status: "active" },
  { id: "2", name: "Su Su", role: "Ops Lead", branch: "YGN-MAIN", status: "active" },
  { id: "3", name: "Htet Aung", role: "Warehouse Shift", branch: "MDY-HUB", status: "on_shift" },
  { id: "4", name: "Mya Mya", role: "Customer Service", branch: "BGO", status: "offline" },
];

function normApprovals(input: unknown): ApprovalRow[] {
  const items = getItems(input);
  return items.map((x, i) => ({
    id: toText(x.id, `a-${i}`),
    type: toText(x.type, x.category, "Approval"),
    subject: toText(x.subject, x.title, x.name, "-"),
    owner: toText(x.owner, x.created_by, x.assignee_name, "-"),
    status: toText(x.status, "pending"),
  }));
}

function normIncidents(input: unknown): IncidentRow[] {
  const items = getItems(input);
  return items.map((x, i) => ({
    id: toText(x.id, `i-${i}`),
    code: toText(x.code, x.ticket_no, `INC-${i + 1}`),
    title: toText(x.title, x.subject, x.description, "-"),
    priority: toText(x.priority, "medium"),
  }));
}

function normStaff(input: unknown): StaffRow[] {
  const items = getItems(input);
  return items.map((x, i) => ({
    id: toText(x.id, `s-${i}`),
    name: toText(x.name, x.full_name, x.username, "-"),
    role: toText(x.role, x.job_title, "-"),
    branch: toText(x.branch, x.branch_id, x.branch_name, "-"),
    status: toText(x.status, "active"),
  }));
}

function badge(status: string) {
  const s = status.toLowerCase();
  if (["active", "approved", "on_shift"].includes(s)) return "bg-emerald-100 text-emerald-700";
  if (["pending", "medium"].includes(s)) return "bg-amber-100 text-amber-700";
  if (["urgent", "high", "offline", "rejected"].includes(s)) return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

export default function SupervisorControlHubPage() {
  const [approvals, setApprovals] = useState<ApprovalRow[]>(demoApprovals);
  const [incidents, setIncidents] = useState<IncidentRow[]>(demoIncidents);
  const [staff, setStaff] = useState<StaffRow[]>(demoStaff);
  const [usingDemo, setUsingDemo] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [a, i, s] = await Promise.allSettled([
      tryGet<unknown>(SUPERVISOR_ENDPOINTS.approvals),
      tryGet<unknown>(SUPERVISOR_ENDPOINTS.incidents),
      tryGet<unknown>(SUPERVISOR_ENDPOINTS.staff),
    ]);

    let live = false;

    if (a.status === "fulfilled") {
      const rows = normApprovals(a.value);
      if (rows.length) {
        setApprovals(rows);
        live = true;
      }
    }
    if (i.status === "fulfilled") {
      const rows = normIncidents(i.value);
      if (rows.length) {
        setIncidents(rows);
        live = true;
      }
    }
    if (s.status === "fulfilled") {
      const rows = normStaff(s.value);
      if (rows.length) {
        setStaff(rows);
        live = true;
      }
    }

    setUsingDemo(!live);
  }

  const stats = useMemo(() => ({
    team: staff.length || 16,
    approvals: approvals.filter((x) => x.status.toLowerCase() === "pending").length || 7,
    attendance: 92,
    escalations: incidents.length || 4,
    routing: 3,
    target: 81,
  }), [staff, approvals, incidents]);

  return (
    <div className="min-h-screen bg-[#f7f9fc] p-8">
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Leadership</p>
        <h1 className="text-4xl font-black uppercase tracking-tight text-[#0d2c54]">
          Supervisor Control Hub <span className="font-normal">/ ကြီးကြပ်ရေးထိန်းချုပ်မှု</span>
        </h1>
        <p className="text-slate-500">
          Team oversight, approvals, shift visibility, escalation handling, and performance monitoring. /
          အဖွဲ့စီမံခန့်ခွဲမှု၊ အတည်ပြုချက်များ၊ အလုပ်ချိန်ကြည့်ရှုမှု၊ ပြဿနာတင်ပြမှုနှင့် စွမ်းဆောင်ရည်စောင့်ကြည့်မှု
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
        <div><strong>APPROVALS:</strong> {SUPERVISOR_ENDPOINTS.approvals.join(" , ")}</div>
        <div className="mt-1"><strong>INCIDENTS:</strong> {SUPERVISOR_ENDPOINTS.incidents.join(" , ")}</div>
        <div className="mt-1"><strong>STAFF:</strong> {SUPERVISOR_ENDPOINTS.staff.join(" , ")}</div>
        {usingDemo && <div className="mt-2 font-bold text-amber-700">DEMO MODE / နမူနာမုဒ်</div>}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={Users} title="Team Performance Board" mm="အဖွဲ့စွမ်းဆောင်ရည်ဘုတ်" value={`${stats.team}`} />
        <StatCard icon={ClipboardCheck} title="Pending Approvals" mm="အတည်ပြုရန်စောင့်ဆိုင်း" value={`${stats.approvals}`} />
        <StatCard icon={CalendarDays} title="Shift & Attendance" mm="အလုပ်ချိန်နှင့်တက်ရောက်မှု" value={`${stats.attendance}%`} />
        <StatCard icon={ShieldAlert} title="Escalation Queue" mm="အရေးပေါ်တင်ပြစာရင်း" value={`${stats.escalations}`} />
        <StatCard icon={Route} title="Route Balancing" mm="လမ်းကြောင်းညှိနှိုင်းမှု" value={`${stats.routing}`} />
        <StatCard icon={Target} title="Daily Target" mm="နေ့စဉ်ရည်မှန်းချက်" value={`${stats.target}%`} />
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-3">
        <Panel title="Pending Approvals / အတည်ပြုချက်များ" icon={<ClipboardCheck size={18} className="text-blue-500" />}>
          <div className="space-y-3">
            {approvals.map((row) => (
              <div key={row.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-[#0d2c54]">{row.type}</p>
                    <p className="text-sm text-slate-500">{row.subject} · {row.owner}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${badge(row.status)}`}>
                    {row.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Incident Reporting / ပြဿနာအစီရင်ခံခြင်း" icon={<FileWarning size={18} className="text-rose-500" />}>
          <div className="space-y-3">
            {incidents.map((row) => (
              <div key={row.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-[#0d2c54]">{row.code}</p>
                    <p className="text-sm text-slate-500">{row.title}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${badge(row.priority)}`}>
                    {row.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Staff Activity Monitor / ဝန်ထမ်းလှုပ်ရှားမှု" icon={<Activity size={18} className="text-emerald-500" />}>
          <div className="space-y-3">
            {staff.map((row) => (
              <div key={row.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-[#0d2c54]">{row.name}</p>
                    <p className="text-sm text-slate-500">{row.role} · {row.branch}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${badge(row.status)}`}>
                    {row.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        <Panel title="Supervisor Notes / ကြီးကြပ်ရေးမှတ်ချက်" icon={<BellRing size={18} className="text-amber-500" />}>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl bg-slate-50 p-4">Morning route balancing completed. / မနက်ပိုင်း လမ်းကြောင်းညှိနှိုင်းမှုပြီးပါပြီ</div>
            <div className="rounded-2xl bg-slate-50 p-4">2 attendance exceptions need review. / တက်ရောက်မှုချွင်းချက် ၂ ခုစစ်ဆေးရန်လိုသည်</div>
            <div className="rounded-2xl bg-slate-50 p-4">Warehouse delay escalation received. / ဂိုဒေါင်နှောင့်နှေးမှုတင်ပြချက်ရရှိထားသည်</div>
          </div>
        </Panel>

        <Panel title="Announcements / အသိပေးချက်များ" icon={<Megaphone size={18} className="text-violet-500" />}>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl bg-slate-50 p-4">Review pending route approvals before noon. / နေ့လယ်မတိုင်မီ လမ်းကြောင်းအတည်ပြုချက်များစစ်ဆေးပါ</div>
            <div className="rounded-2xl bg-slate-50 p-4">CS escalation workflow updated. / ဖောက်သည်ဝန်ဆောင်မှုတင်ပြမှုလုပ်ငန်းစဉ်အသစ်ပြောင်းလဲထားသည်</div>
            <button onClick={fetchData} className="inline-flex items-center gap-2 rounded-2xl bg-[#0d2c54] px-4 py-3 text-xs font-black uppercase tracking-wider text-white hover:opacity-95">
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, mm, value }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; mm: string; value: string }) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-sm border border-slate-200">
      <Icon size={26} className="text-[#0d2c54]" />
      <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className="mt-1 text-[11px] font-bold text-slate-500" style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>{mm}</p>
      <p className="mt-4 text-4xl font-black text-[#0d2c54]">{value}</p>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        {icon}
        <h2 className="text-lg font-black text-[#0d2c54]">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
