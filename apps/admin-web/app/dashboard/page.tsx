"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BarChart3,
  Building2,
  ClipboardList,
  Globe2,
  Headphones,
  TrendingUp,
  AlertCircle,
  Bike,
  Store,
  Megaphone,
  RefreshCw,
  Route,
  Truck,
  Warehouse,
  Users,
  Package,
} from "lucide-react";

type UiLanguage = "en" | "my" | "both";

export default function DashboardPage() {
  const [language, setLanguage] = useState<UiLanguage>("both");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const bi = (en: string, my: string) =>
    language === "en" ? en : language === "my" ? my : `${en} / ${my}`;

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 font-sans pb-24">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="max-w-7xl mx-auto space-y-10"
      >
        {/* Header Section */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 mb-4 border border-blue-100">
              <Building2 size={14} className="stroke-[2.5]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                Administration
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-[#0d2c54]">
              Command Center{" "}
              <span className="text-2xl font-semibold text-slate-400 block mt-1">
                / ဗဟိုထိန်းချုပ်မှု
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200/60">
              <div className="pl-3 pr-2 text-slate-400">
                <Globe2 size={16} />
              </div>
              {(["en", "my", "both"] as UiLanguage[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-4 py-2 text-xs font-black uppercase rounded-xl transition-all ${
                    language === l
                      ? "bg-[#0d2c54] text-white shadow-md"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {l === "both" ? "EN+MM" : l}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 800);
              }}
              className="bg-[#0d2c54] text-white px-5 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:bg-blue-900 transition-colors shadow-md"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />{" "}
              {bi("Refresh", "ပြန်လည်ရယူ")}
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { labelEn: "Branches", labelMy: "ဌာနခွဲများ", value: "12", icon: Building2 },
            { labelEn: "Merchants", labelMy: "ကုန်သည်များ", value: "3,402", icon: Store },
            { labelEn: "Riders", labelMy: "Rider များ", value: "245", icon: Bike },
            { labelEn: "Ways Today", labelMy: "ယနေ့ Ways", value: "1,890", icon: Package },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors"
            >
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                <s.icon size={120} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {bi(s.labelEn, s.labelMy)}
              </p>
              <p className="text-4xl font-black text-[#0d2c54] mt-2 tracking-tighter">
                {loading ? "..." : s.value}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Operational Portals Section */}
        <motion.div variants={fadeUp}>
          <h2 className="text-xl font-black text-[#0d2c54] mb-6">
            {bi("Operational Portals", "လုပ်ငန်းဆိုင်ရာ ပေါ်တယ်များ")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                href: "/create-delivery",
                icon: ClipboardList,
                color: "text-amber-500",
                bg: "bg-amber-50",
                titleEn: "Intake Console",
                titleMy: "ကုန်စည်လက်ခံရန်",
                desc: "Create and validate new delivery intake.",
              },
              {
                href: "/way-management",
                icon: Route,
                color: "text-blue-500",
                bg: "bg-blue-50",
                titleEn: "Way Management",
                titleMy: "ကုန်စည်စီမံခန့်ခွဲမှု",
                desc: "Manage way plans, status, and route flow.",
              },
              {
                href: "/warehouse/portal",
                icon: Warehouse,
                color: "text-indigo-500",
                bg: "bg-indigo-50",
                titleEn: "Warehouse Hub",
                titleMy: "ဂိုဒေါင်စီမံခန့်ခွဲမှု",
                desc: "Receiving, staging, storage, and dispatch.",
              },
              {
                href: "/rider/portal",
                icon: Truck,
                color: "text-emerald-500",
                bg: "bg-emerald-50",
                titleEn: "Rider Execution",
                titleMy: "Rider ပေါ်တယ်",
                desc: "Pickup, transit, and delivery execution.",
              },
              {
                href: "/cs/portal",
                icon: Headphones,
                color: "text-rose-500",
                bg: "bg-rose-50",
                titleEn: "Customer Service",
                titleMy: "ဖောက်သည်ဝန်ဆောင်မှု",
                desc: "Tickets, complaints, customer updates.",
              },
              {
                href: "/marketing/portal",
                icon: Megaphone,
                color: "text-violet-500",
                bg: "bg-violet-50",
                titleEn: "Marketing Hub",
                titleMy: "စျေးကွက်ရှာဖွေရေးဗဟို",
                desc: "Merchant growth, KPI, plans, and reports.",
              },
            ].map((p, i) => (
              <Link
                key={i}
                href={p.href}
                className="group bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-[0_20px_40px_rgba(13,44,84,0.08)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl ${p.bg} ${p.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
                  >
                    <p.icon size={24} className="stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="font-black text-[#0d2c54] text-lg leading-tight">
                      {bi(p.titleEn, p.titleMy)}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-2 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}