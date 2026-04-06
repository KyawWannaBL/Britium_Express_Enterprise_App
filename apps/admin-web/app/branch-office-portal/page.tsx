"use client";

import React, { useState } from "react";
import { Inter, Noto_Sans_Myanmar } from "next/font/google";
import { Building2, Package, Truck, CheckCircle2, Coins, Search, MapPin, Map, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-en" });
const myanmar = Noto_Sans_Myanmar({ weight: ["400", "500", "600", "700", "800"], display: "swap", variable: "--font-my" });

export default function BranchOfficePortalPage() {
  const [tab, setTab] = useState("accounting");

  return (
    <div className={`${inter.variable} ${myanmar.variable} min-h-screen bg-[#f8fafc] p-6 md:p-10 font-sans pb-24`}>
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 mb-4 border border-blue-100">
            <Building2 size={14} className="stroke-[2.5]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Administration</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-[#0d2c54]">
            Branch Office <span className="text-2xl font-semibold text-slate-400 block mt-1">/ ဌာနခွဲရုံးပေါ်တယ်</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-sm">
          <Package className="text-[#0d2c54] mb-3" size={24}/>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Local Queue</p>
          <p className="text-3xl font-black text-[#0d2c54] mt-1">1,204</p>
        </div>
        <div className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-sm">
          <Truck className="text-blue-500 mb-3" size={24}/>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">In Transit</p>
          <p className="text-3xl font-black text-blue-600 mt-1">342</p>
        </div>
        <div className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-sm">
          <CheckCircle2 className="text-emerald-500 mb-3" size={24}/>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Delivered</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">890</p>
        </div>
        <div className="p-6 rounded-[2rem] bg-[#0d2c54] border border-blue-900 shadow-xl text-white">
          <Coins className="text-[#ffd700] mb-3" size={24}/>
          <p className="text-[10px] font-black uppercase text-blue-200 tracking-widest">Cash & COD</p>
          <p className="text-3xl font-black text-[#ffd700] mt-1">4.2M Ks</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto custom-scrollbar mb-8 pb-2">
        {[
          { id: "accounting", label: "Financial Center" },
          { id: "branches", label: "Branches" },
          { id: "coverage", label: "Zone & Auto Assign" },
          { id: "stationNetwork", label: "Station Network" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${tab === t.id ? 'bg-[#0d2c54] text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-6">
          <h2 className="text-2xl font-black text-[#0d2c54] capitalize">{tab.replace(/([A-Z])/g, ' $1').trim()}</h2>
          <button className="bg-[#0d2c54] text-[#ffd700] px-5 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition shadow-lg flex items-center gap-2">
            <RefreshCw size={14}/> Sync
          </button>
        </div>
        <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
          <Building2 size={48} className="mx-auto mb-4 text-slate-300"/>
          <h3 className="text-xl font-black text-slate-700">Module Activated</h3>
          <p className="text-sm font-semibold text-slate-500 mt-2">Data syncing with main administration databases.</p>
        </div>
      </div>
    </div>
  );
}
