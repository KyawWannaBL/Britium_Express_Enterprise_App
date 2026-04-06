"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Building2, DollarSign, HeartHandshake,
  RefreshCw, Search, TrendingDown, TrendingUp,
  AlertTriangle, Globe2, FileSpreadsheet, FileText, Download
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type UiLanguage = "en" | "my" | "both";
type ReportTab = "cashBookSummary" | "incomeStatement" | "balanceSheet" | "profitAndLoss";

const MOCK_INCOME = [
  { id: "is1", codeNo: "4001", description: "Delivery Income", category: "income", amount: 4500000 },
  { id: "is2", codeNo: "5001", description: "Fuel Expense", category: "expense", amount: 800000 },
  { id: "is3", codeNo: "5002", description: "Salary Expense", category: "expense", amount: 1200000 },
];

export default function FinancialReportsPage() {
  const langContext = (() => { try { return useLanguage()?.lang as UiLanguage | undefined; } catch { return undefined; } })();
  const [language, setLanguage] = useState<UiLanguage>(langContext === "en" ? "en" : langContext === "my" ? "my" : "both");
  const [activeTab, setActiveTab] = useState<ReportTab>("incomeStatement");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const bi = (en: string, my: string) => language === "en" ? en : language === "my" ? my : `${en} / ${my}`;

  const fetchAll = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };
  const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 font-sans pb-24">
      <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-7xl mx-auto space-y-8">
        
        <motion.div variants={fadeUp} className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between mb-2">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 mb-4 border border-emerald-100">
              <BarChart3 size={14} className="stroke-[2.5]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Finance & Accounting</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-[#0d2c54]">
              Financial Reports <span className="text-2xl font-semibold text-slate-400 block mt-1">/ ငွေကြေးအစီရင်ခံစာများ</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200/60">
              <Globe2 size={16} className="text-slate-400 ml-2" />
              {(["en", "my", "both"] as UiLanguage[]).map((l) => (
                <button key={l} onClick={() => setLanguage(l)} className={`px-4 py-2 text-xs font-black uppercase rounded-xl transition-all ${language === l ? "bg-[#0d2c54] text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}>
                  {l === "both" ? "EN+MM" : l}
                </button>
              ))}
            </div>
            <button onClick={fetchAll} disabled={loading} className="bg-[#0d2c54] text-white px-5 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:bg-blue-900 transition-colors shadow-md disabled:opacity-50">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> {bi("Refresh", "ပြန်လည်ရယူ")}
            </button>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { titleEn: "Total Income", titleMy: "စုစုပေါင်းဝင်ငွေ", val: "4,500,000", icon: TrendingUp, color: "text-emerald-500" },
            { titleEn: "Total Expenses", titleMy: "ကုန်ကျစရိတ်", val: "2,000,000", icon: TrendingDown, color: "text-rose-500" },
            { titleEn: "Net Profit", titleMy: "အသားတင်အမြတ်", val: "2,500,000", icon: DollarSign, color: "text-[#0d2c54]" },
            { titleEn: "Cash Position", titleMy: "ငွေသားလက်ကျန်", val: "4,300,000", icon: HeartHandshake, color: "text-blue-500" },
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col justify-between group hover:border-blue-300 transition-all">
              <s.icon size={28} className={`${s.color} mb-4 group-hover:scale-110 transition-transform`} />
              <span className={`text-3xl font-black ${s.color} tracking-tighter`}>{s.val}</span>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">{bi(s.titleEn, s.titleMy)}</p>
            </div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
          {[
            { id: "cashBookSummary", labelEn: "Cash Book", labelMy: "ငွေစာရင်း" },
            { id: "incomeStatement", labelEn: "Income Statement", labelMy: "ဝင်ငွေစာရင်း" },
            { id: "balanceSheet", labelEn: "Balance Sheet", labelMy: "လက်ကျန်ရှင်းတမ်း" },
            { id: "profitAndLoss", labelEn: "Profit & Loss", labelMy: "အမြတ်နှင့်အရှုံး" },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as ReportTab)} className={`px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${activeTab === t.id ? 'bg-[#0d2c54] text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
              {bi(t.labelEn, t.labelMy)}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial="hidden" animate="visible" exit="hidden" variants={fadeUp} className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-2xl font-black text-[#0d2c54] capitalize">{activeTab.replace(/([A-Z])/g, ' $1').trim()}</h2>
                <p className="text-sm font-semibold text-slate-500 mt-1">{bi("Financial reporting view", "ငွေကြေးအစီရင်ခံစာ")}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative shadow-sm rounded-2xl">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records..." className="w-full md:w-64 pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                </div>
                <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 shadow-sm hover:shadow transition"><Download size={18}/></button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/80 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">
                  <tr><th className="p-5 pl-6">Code</th><th className="p-5">Description</th><th className="p-5">Category</th><th className="p-5 text-right pr-6">Amount (Ks)</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {MOCK_INCOME.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors font-medium text-slate-600">
                      <td className="p-5 pl-6 font-mono font-bold text-blue-600">{row.codeNo}</td>
                      <td className="p-5 font-bold text-[#0d2c54]">{row.description}</td>
                      <td className="p-5"><span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase tracking-wider">{row.category}</span></td>
                      <td className="p-5 text-right pr-6 font-black text-slate-800">{row.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
