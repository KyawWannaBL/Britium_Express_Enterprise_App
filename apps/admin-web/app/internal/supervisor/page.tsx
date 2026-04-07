"use client";
import React from "react";
import { motion } from "framer-motion";
import { BarChart3, Users, Warehouse, AlertTriangle, ShieldCheck, Search, Filter, Sparkles, ArrowRight } from "lucide-react";

export default function SupervisorPortal() {
  return (
    <div className="app-shell space-y-8">
      <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="premium-hero">
        <div className="max-w-4xl">
          <div className="kicker"><Sparkles size={12}/> Control Tower</div>
          <h1 className="mt-4 text-4xl font-black text-slate-800 tracking-tighter uppercase italic">Supervisor Console</h1>
          <p className="panel-subtitle">Global oversight of fleet velocity, hub integrity, and escalation management.</p>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="section-surface border-blue-100">
           <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Service SLA</p>
                <h3 className="text-4xl font-black text-blue-600 mt-2">96.4%</h3>
              </div>
              <BarChart3 className="text-blue-200" size={32} />
           </div>
           <div className="mt-6 pt-4 border-t border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Above Target
           </div>
        </div>

        <div className="section-surface border-amber-100">
           <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Fleet</p>
                <h3 className="text-4xl font-black text-amber-600 mt-2">32 / 40</h3>
              </div>
              <Users className="text-amber-200" size={32} />
           </div>
           <div className="mt-6 pt-4 border-t border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">8 Units in Maintenance</div>
        </div>

        <div className="section-surface border-rose-100">
           <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Escalations</p>
                <h3 className="text-4xl font-black text-rose-600 mt-2">04</h3>
              </div>
              <AlertTriangle className="text-rose-200" size={32} />
           </div>
           <div className="mt-6 pt-4 border-t border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 text-rose-500">
              Requires Intervention
           </div>
        </div>
      </div>

      <div className="table-shell">
        <div className="table-head grid-cols-5">
           <div className="col-span-2">Task Description</div>
           <div>Owner</div>
           <div>Status</div>
           <div className="text-right">Action</div>
        </div>
        {[
          { task: "Failed Delivery Review", owner: "Ops Team A", status: "Critical", tone: "rose" },
          { task: "Hub Transfer Delay", owner: "Dispatch Lead", status: "Reviewing", tone: "amber" }
        ].map((row, i) => (
          <div key={i} className="table-row grid-cols-5 items-center">
             <div className="col-span-2 font-black text-slate-800">{row.task}</div>
             <div className="text-slate-500 text-xs font-bold uppercase">{row.owner}</div>
             <div>
                <span className={row.tone === 'rose' ? 'status-rose' : 'status-amber'}>
                  <span className={`status-dot ${row.tone === 'rose' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                  {row.status}
                </span>
             </div>
             <div className="text-right">
                <button className="h-8 w-8 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
                  <ArrowRight size={16}/>
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
