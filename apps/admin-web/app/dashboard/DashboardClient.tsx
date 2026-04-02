"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Languages, TrendingUp, Package, Clock, CheckCircle2, 
  MapPin, Activity, AlertCircle, Users 
} from "lucide-react";

export default function DashboardClient() {
  const supabase = createClient();
  const [lang, setLang] = useState<"en" | "mm">("en");
  const [loading, setLoading] = useState(true);
  
  const [metrics, setMetrics] = useState({
    totalWays: 0,
    delivered: 0,
    inTransit: 0,
    totalRevenue: 0,
    staffCount: 0,
    recentActivity: [] as any[]
  });

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      const { data: shipments } = await supabase.from("shipments").select("*").order("created_at", { ascending: false });
      const { count: staff } = await supabase.from("profiles").select('*', { count: 'exact', head: true });

      if (shipments) {
        let delivered = 0; let transit = 0; let revenue = 0;
        shipments.forEach(s => {
          if (s.status === 'delivered') delivered++;
          else transit++;
          revenue += (Number(s.delivery_fee_mmks) || 0);
        });

        setMetrics({
          totalWays: shipments.length,
          delivered,
          inTransit: transit,
          totalRevenue: revenue,
          staffCount: staff || 0,
          recentActivity: shipments.slice(0, 5)
        });
      }
      setLoading(false);
    }
    fetchDashboardData();
  }, []);

  const t = {
    en: { title: "Command Center", total: "Active Shipments", staff: "Operational Staff", revenue: "Daily Revenue" },
    mm: { title: "ကွပ်ကဲမှုဗဟိုဌာန", total: "လက်ရှိပို့ဆောင်မှု", staff: "ဝန်ထမ်းအင်အား", revenue: "နေ့စဉ်ဝင်ငွေ" }
  }[lang];

  return (
    <div className="p-8 space-y-10" style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-black text-[#0d2c54] tracking-tighter italic uppercase flex items-center gap-4">
            {t.title} <span className="text-blue-500 not-italic font-light">Operations</span>
          </h1>
          <p className="text-slate-500 font-bold tracking-[0.3em] uppercase text-xs mt-2">Britium Express Global Telemetry</p>
        </div>
        <button onClick={() => setLang(lang === 'en' ? 'mm' : 'en')} className="bg-[#0d2c54] text-[#ffd700] px-4 py-2 rounded-xl font-black text-xs shadow-lg">
          {lang === 'en' ? 'မြန်မာဘာသာ' : 'ENGLISH'}
        </button>
      </div>

      {/* KPI GRID - DARKER FONTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Total Shipments */}
        <div className="bg-white p-8 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between h-64 transition-transform hover:scale-[1.02]">
           <div className="flex justify-between items-start">
              <div className="p-4 bg-blue-50 rounded-2xl text-blue-600"><Package size={32}/></div>
              <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">+12% ACTIVE</span>
           </div>
           <div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-[11px] mb-1">{t.total}</p>
              <h2 className="text-6xl font-black text-[#0d2c54]">{loading ? "..." : metrics.totalWays}</h2>
           </div>
        </div>

        {/* Staff */}
        <div className="bg-white p-8 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between h-64 transition-transform hover:scale-[1.02]">
           <div className="flex justify-between items-start">
              <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600"><Users size={32}/></div>
              <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-3 py-1 rounded-full">ONLINE</span>
           </div>
           <div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-[11px] mb-1">{t.staff}</p>
              <h2 className="text-6xl font-black text-[#0d2c54]">{loading ? "..." : metrics.staffCount}</h2>
           </div>
        </div>

        {/* Revenue */}
        <div className="bg-white p-8 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between h-64 transition-transform hover:scale-[1.02]">
           <div className="flex justify-between items-start">
              <div className="p-4 bg-amber-50 rounded-2xl text-amber-600"><TrendingUp size={32}/></div>
              <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">+8% GROWTH</span>
           </div>
           <div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-[11px] mb-1">{t.revenue}</p>
              <h2 className="text-5xl font-black text-[#0d2c54] whitespace-nowrap">
                {loading ? "..." : (metrics.totalRevenue / 1000000).toFixed(1) + "M"} <span className="text-xl text-slate-300">MMK</span>
              </h2>
           </div>
        </div>

      </div>

      {/* Main Telemetry Box */}
      <div className="bg-[#0d2c54] rounded-[50px] p-12 min-h-[400px] flex items-center justify-center relative overflow-hidden shadow-2xl">
         <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffd700_1px,transparent_1px)] [background-size:20px_20px]" />
         <div className="text-center z-10">
            <Activity className="text-[#ffd700] mx-auto mb-6 animate-pulse" size={48} />
            <h3 className="text-[#ffd700] font-black uppercase tracking-[0.5em] text-sm">System Status: Nominal</h3>
            <p className="text-blue-200/50 mt-2 text-xs font-mono">ENCRYPTED SATELLITE UPLINK ACTIVE // BRITI-CORE v3.0</p>
         </div>
      </div>

    </div>
  );
}
