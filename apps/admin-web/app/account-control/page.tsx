'use client';

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, UserPlus, Search, Download, 
  Database, UserCog, History, ChevronRight, 
  Activity, Globe2, MoreHorizontal, Fingerprint 
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { staggerChildren: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

export default function AccountControlRedesign() {
  const [lang, setLang] = useState<"en" | "my">("en");
  const [search, setSearch] = useState("");

  // Mock Data
  const accounts = [
    { name: "Kyaw Wanna", email: "admin@britium.com", role: "SUPER_ADMIN", status: "ACTIVE", dept: "Executive" },
    { name: "Aye Aye Thu", email: "aye@britium.com", role: "OPERATIONS", status: "ACTIVE", dept: "Logistics" }
  ];

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      className="max-w-[1600px] mx-auto p-6 lg:p-12 space-y-10"
    >
      {/* HEADER SECTION */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <motion.div variants={itemVariants} className="flex items-center gap-3 text-sky-500 font-mono text-[10px] uppercase tracking-[0.4em]">
            <ShieldCheck size={14} /> Security Node Active
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-5xl font-black text-white italic tracking-tighter">
            Identity <span className="text-sky-500 font-normal">Governance</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-slate-500 text-sm max-w-md">
            Advanced identity lifecycle management for Britium Express enterprise operators.
          </motion.p>
        </div>

        <motion.div variants={itemVariants} className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-white/5">
          <div className="flex bg-black/40 p-1 rounded-xl">
            <button onClick={() => setLang("en")} className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${lang === 'en' ? 'bg-white/10 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>EN</button>
            <button onClick={() => setLang("my")} className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${lang === 'my' ? 'bg-white/10 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>မြန်မာ</button>
          </div>
          <Button className="btn-premium btn-primary h-12 px-8">
            <UserPlus size={16} /> {lang === 'en' ? 'Provision Identity' : 'အကောင့်အသစ်ဖွင့်မည်'}
          </Button>
        </motion.div>
      </header>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Nodes", val: "142", icon: Database, color: "text-emerald-400" },
          { label: "Pending Approvals", val: "08", icon: Activity, color: "text-amber-400" },
          { label: "Security Events", val: "None", icon: History, color: "text-sky-400" },
        ].map((m, i) => (
          <motion.div key={i} variants={itemVariants} className="glass-card p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{m.label}</p>
              <h3 className={`text-2xl font-black mt-1 ${m.color}`}>{m.val}</h3>
            </div>
            <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400">
              <m.icon size={20} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ACTION TOOLBAR */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="input-enterprise pl-12 h-14 rounded-2xl bg-slate-900/40 border-white/5" 
            placeholder="Filter identity pool..."
          />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="btn-premium btn-ghost h-12 px-6">
            <Download size={16} /> Audit Export
          </Button>
          <div className="w-px h-8 bg-white/5 mx-2 hidden md:block" />
          <p className="text-[10px] font-mono text-slate-600 uppercase">Page 01 // 12 Total</p>
        </div>
      </motion.div>

      {/* MAIN DATA TABLE */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/[0.02] border-b border-white/5">
            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              <th className="p-8">Personnel Information</th>
              <th className="p-8">Governance Role</th>
              <th className="p-8">System Status</th>
              <th className="p-8 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {accounts.map((acc, idx) => (
              <motion.tr 
                key={idx} 
                whileHover={{ backgroundColor: "rgba(255,255,255,0.01)" }}
                className="group transition-colors"
              >
                <td className="p-8">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center text-white font-black">
                      {acc.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-black uppercase italic tracking-tight">{acc.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{acc.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-8">
                  <span className={`status-pill ${acc.role === 'SUPER_ADMIN' ? 'bg-sky-500/10 text-sky-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {acc.role}
                  </span>
                  <div className="mt-2 text-[10px] text-slate-600 uppercase tracking-widest">{acc.dept} Domain</div>
                </td>
                <td className="p-8">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tighter italic">Secured // Active</span>
                  </div>
                </td>
                <td className="p-8 text-right">
                  <div className="flex justify-end items-center gap-2">
                    <Button variant="ghost" className="h-10 px-4 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 font-black uppercase text-[10px] tracking-widest">
                      <UserCog size={14} className="mr-2" /> Manage
                    </Button>
                    <button className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-600 hover:text-white hover:bg-white/5 transition-all">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* FOOTER ACTION BAR */}
      <motion.footer variants={itemVariants} className="flex justify-center pt-8">
        <Button variant="ghost" className="text-slate-600 hover:text-sky-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
          Network Protocol v4.2.1-Enterprise <ChevronRight size={12} />
        </Button>
      </motion.footer>
    </motion.div>
  );
}