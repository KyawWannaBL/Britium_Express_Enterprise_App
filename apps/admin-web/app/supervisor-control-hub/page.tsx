"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardCheck, CalendarDays, ShieldAlert, Route, Target, 
  FileWarning, Activity, Users, Globe2, CheckCircle2, UserCog
} from "lucide-react";

const MOCK_APPROVALS = [
  { id: "1", type: "Shift Change", subject: "Yangon PM shift", owner: "Ko Min", status: "pending" },
  { id: "2", type: "Cash Adjustment", subject: "COD review", owner: "Htet Naing", status: "pending" },
];

export default function SupervisorControlHubPage() {
  const [tab, setTab] = useState("approvals");

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 font-sans pb-24">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 mb-4 border border-blue-100">
            <UserCog size={14} className="stroke-[2.5]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Leadership</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-[#0d2c54]">
            Supervisor Hub <span className="text-2xl font-semibold text-slate-400 block mt-1">/ ကြီးကြပ်ရေးထိန်းချုပ်မှု</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { icon: Users, t1: "Team", t2: "အဖွဲ့စွမ်းဆောင်ရည်", val: "16" },
          { icon: ClipboardCheck, t1: "Approvals", t2: "အတည်ပြုရန်", val: "7", active: true },
          { icon: CalendarDays, t1: "Attendance", t2: "တက်ရောက်မှု", val: "92%" },
          { icon: ShieldAlert, t1: "Escalations", t2: "အရေးပေါ်", val: "4", danger: true },
          { icon: Route, t1: "Routing", t2: "လမ်းကြောင်း", val: "3" },
          { icon: Target, t1: "Target", t2: "ရည်မှန်းချက်", val: "81%" },
        ].map((s, i) => (
          <div key={i} className={`p-5 rounded-[2rem] border shadow-sm ${s.active ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-white'}`}>
            <s.icon size={24} className={`mb-4 ${s.danger ? 'text-rose-500' : 'text-[#0d2c54]'}`} />
            <span className={`text-3xl font-black ${s.danger ? 'text-rose-600' : 'text-[#0d2c54]'}`}>{s.val}</span>
            <div className="mt-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{s.t1}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[2.5rem] shadow-sm p-8">
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-black text-[#0d2c54] flex items-center gap-3">
              <ClipboardCheck className="text-blue-500"/> Pending Approvals
            </h2>
          </div>
          <div className="space-y-4">
            {MOCK_APPROVALS.map(row => (
              <div key={row.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex justify-between items-center hover:border-blue-300 transition-colors">
                <div>
                  <h3 className="font-black text-lg text-[#0d2c54]">{row.type}</h3>
                  <p className="text-sm font-semibold text-slate-500 mt-1">{row.subject} • Req by: {row.owner}</p>
                </div>
                <div className="flex gap-2">
                  <button className="bg-white border border-rose-200 text-rose-600 px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-rose-50 transition">Reject</button>
                  <button className="bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-black uppercase shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition">Approve</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0d2c54] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
           <Activity className="absolute -right-4 -top-4 opacity-10 w-48 h-48" />
           <h2 className="text-xl font-black mb-6 relative z-10 flex items-center gap-3 text-[#ffd700]">
             <FileWarning size={20}/> Incident Queue
           </h2>
           <div className="space-y-4 relative z-10">
             <div className="bg-white/10 border border-white/20 p-4 rounded-2xl backdrop-blur-sm">
               <span className="bg-rose-500 text-white px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest mb-2 inline-block">High Priority</span>
               <h3 className="font-bold text-white">Warehouse delay escalation</h3>
               <p className="text-xs text-blue-200 mt-1">INC-001</p>
             </div>
             <div className="bg-white/10 border border-white/20 p-4 rounded-2xl backdrop-blur-sm">
               <span className="bg-amber-500 text-white px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest mb-2 inline-block">Medium</span>
               <h3 className="font-bold text-white">Route overload on South zone</h3>
               <p className="text-xs text-blue-200 mt-1">INC-003</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
