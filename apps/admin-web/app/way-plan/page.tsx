"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, Loader2, Play, Route, Users, 
  Map as MapIcon, Settings, Save, MapPinned, 
  ChevronRight, ArrowRight 
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

type UiLanguage = "en" | "my" | "both";
type TabView = "MAP_VIEW" | "COVERAGE_SETTINGS" | "MANIFEST_RESULTS";

type Parcel = { id: string; trackingNo: string; recipientName: string; township: string; codAmount: number; weight: number; };
type CoverageZone = { id: string; driverName: string; townships: string[]; vehicleType: string; };

export default function CreateWayPlanPage() {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();
  const langContext = useLanguage();
  const [language, setLanguage] = useState<UiLanguage>("both");

  const [view, setView] = useState<TabView>("MAP_VIEW");
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [coverages, setCoverages] = useState<CoverageZone[]>([]);
  const [manifests, setManifests] = useState<Record<string, Parcel[]>>({});
  
  const [loading, setLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [toast, setToast] = useState<{ tone: "ok" | "err"; msg: string } | null>(null);

  const bi = (en: string, my: string) => language === "en" ? en : language === "my" ? my : `${en} / ${my}`;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: ways }, { data: zones }] = await Promise.all([
        supabase.from("way_records").select("*").in("status", ["CREATED", "TO_ASSIGN"]),
        supabase.from("coverage_zones").select("*").eq("is_active", true)
      ]);

      if (ways) setParcels(ways.map(s => ({
        id: s.id, trackingNo: s.way_id, recipientName: s.customer_name || s.merchant_name || "Unknown",
        township: s.township || "Unknown", codAmount: Number(s.cod_amount || 0), weight: Number(s.weight_kg || 0)
      })));

      if (zones) setCoverages(zones.map(z => ({ 
        id: z.id, driverName: z.driver_name, townships: z.townships || [], vehicleType: z.vehicle_type 
      })));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { loadData(); }, [loadData]);

  const runOptimizer = async () => {
    if (!coverages.length) {
      setToast({ tone: "err", msg: "Configure coverage zones first." });
      return;
    }
    setIsOptimizing(true);
    await new Promise(r => setTimeout(r, 1800));

    const generated: Record<string, Parcel[]> = {};
    coverages.forEach(c => generated[c.driverName] = []);
    generated["UNASSIGNED"] = [];

    parcels.forEach(p => {
      const target = p.township.toLowerCase().replace(/\s+/g, '');
      const match = coverages.find(z => z.townships.some(t => t.toLowerCase().replace(/\s+/g, '') === target));
      match ? generated[match.driverName].push(p) : generated["UNASSIGNED"].push(p);
    });

    setManifests(generated);
    setIsOptimizing(false);
    setView("MANIFEST_RESULTS");
    setToast({ tone: "ok", msg: bi("Optimization complete", "လမ်းကြောင်းစီစဉ်မှု ပြီးစီးပါပြီ") });
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10 pb-32">
      {/* Header */}
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between mb-12">
        <header>
          <div className="chip bg-blue-50 text-blue-600 mb-4 px-4 py-1.5 border border-blue-100">
            {bi("Fleet Control", "ယာဉ်အုပ်စု ထိန်းချုပ်မှု")}
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-primary">
            Auto Way Plan <span className="font-light italic text-muted-foreground opacity-50">/ AI Engine</span>
          </h1>
        </header>

        <div className="flex flex-wrap items-center gap-4">
          <div className="segment flex p-1 bg-white rounded-2xl border border-slate-200 shadow-sm">
            {(["en", "my", "both"] as const).map(l => (
              <button key={l} onClick={() => setLanguage(l)} 
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-tighter rounded-xl transition-all
                ${language === l ? "bg-primary text-white shadow-md" : "text-muted hover:text-primary"}`}>
                {l}
              </button>
            ))}
          </div>

          <motion.button 
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={runOptimizer} disabled={isOptimizing || loading}
            className="btn btn-primary px-8 py-4 shadow-elevated"
          >
            {isOptimizing ? <Loader2 className="animate-spin" size={18} /> : <Play fill="currentColor" size={16} />}
            {bi("Initialize Optimizer", "လမ်းကြောင်းတွက်ချက်မည်")}
          </motion.button>
        </div>
      </div>

      {/* View Tabs */}
      <nav className="flex gap-3 mb-10 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: "MAP_VIEW", icon: MapIcon, label: "Map Distribution" },
          { id: "COVERAGE_SETTINGS", icon: Settings, label: "Coverage Logic" },
          { id: "MANIFEST_RESULTS", icon: Route, label: "Way Manifests" },
        ].map((t) => (
          <button key={t.id} onClick={() => setView(t.id as TabView)}
            className={`btn btn-secondary !py-3 !px-5 flex-shrink-0 ${view === t.id ? "bg-primary text-white ring-4 ring-primary/10" : ""}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </nav>

      <main className="relative min-h-[500px]">
        <AnimatePresence mode="wait">
          {view === "MAP_VIEW" && (
            <motion.div key="map" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="surface p-1">
              <div className="relative h-[600px] w-full rounded-[1.8rem] overflow-hidden bg-slate-200">
                <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/96.19,16.86,11/1200x600?access_token=pk.eyJ1IjoibW9ja3Rva2VuIiwiYSI6Im1vY2sifQ.mock')] bg-cover opacity-60 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
                  <div className="surface bg-white/95 p-10 shadow-elevated border-none">
                    <MapPinned size={48} className="mx-auto text-primary mb-4 opacity-20" />
                    <h2 className="text-6xl font-black text-primary tracking-tighter">{parcels.length}</h2>
                    <p className="text-xs font-black uppercase tracking-widest text-muted mt-2">{bi("Parcels Pending Allocation", "ချထားပေးရန် စောင့်ဆိုင်းနေသော အထုပ်များ")}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === "MANIFEST_RESULTS" && (
            <motion.div key="manifests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {Object.entries(manifests).map(([driver, list], idx) => list.length > 0 && (
                <motion.div key={driver} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="surface overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary border border-slate-100">
                        <Users size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-primary uppercase italic">{driver}</h3>
                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{list.length} {bi("Stops", "မှတ်တိုင်")}</p>
                      </div>
                    </div>
                    <button className="btn btn-primary !py-2 !px-4 !text-[10px]">
                      {bi("Dispatch", "လွှဲအပ်မည်")} <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-[10px] font-black uppercase text-muted tracking-widest border-b border-slate-50">
                        <tr><th className="p-4">Way ID</th><th className="p-4">Customer</th><th className="p-4">Area</th><th className="p-4 text-right">COD</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {list.map(p => (
                          <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-black text-primary">{p.trackingNo}</td>
                            <td className="p-4 font-semibold text-slate-600">{p.recipientName}</td>
                            <td className="p-4 font-medium text-slate-400">{p.township}</td>
                            <td className="p-4 text-right font-black text-primary">{p.codAmount.toLocaleString()} Ks</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Syncing Loader */}
      {loading && (
        <div className="fixed bottom-10 right-10 flex items-center gap-3 bg-primary text-white px-6 py-3 rounded-full shadow-elevated z-50">
          <Loader2 className="animate-spin" size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Synchronizing Hub...</span>
        </div>
      )}
    </div>
  );
}