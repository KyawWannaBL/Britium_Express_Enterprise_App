"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Globe2,
  Loader2,
  Map,
  MapPinned,
  Play,
  Route,
  Save,
  Settings,
  Truck,
  Users,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

type UiLanguage = "en" | "my" | "both";
type TabView = "MAP_VIEW" | "COVERAGE_SETTINGS" | "MANIFEST_RESULTS";

// --- MOCK DATA (Unassigned Parcels) ---
type Parcel = {
  id: string;
  trackingNo: string;
  recipientName: string;
  phone: string;
  township: string;
  address: string;
  weight: number;
  codAmount: number;
  deliveryFee: number;
};

const MOCK_PARCELS: Parcel[] = [
  { id: "p1", trackingNo: "BEX-001", recipientName: "U Aung", phone: "09111", township: "Lanmadaw", address: "1st Street", weight: 1.5, codAmount: 15000, deliveryFee: 3000 },
  { id: "p2", trackingNo: "BEX-002", recipientName: "Ma Su", phone: "09222", township: "Ahlone", address: "Thiri Street", weight: 2.0, codAmount: 0, deliveryFee: 3000 },
  { id: "p3", trackingNo: "BEX-003", recipientName: "Ko Kyaw", phone: "09333", township: "Kamayut", address: "Hledan", weight: 0.5, codAmount: 45000, deliveryFee: 2500 },
  { id: "p4", trackingNo: "BEX-004", recipientName: "Daw Mya", phone: "09444", township: "Bahan", address: "Sayar San", weight: 1.0, codAmount: 20000, deliveryFee: 3000 },
  { id: "p5", trackingNo: "BEX-005", recipientName: "Mg Mg", phone: "09555", township: "Insein", address: "Ywama", weight: 5.0, codAmount: 0, deliveryFee: 4500 },
  { id: "p6", trackingNo: "BEX-006", recipientName: "Su Su", phone: "09666", township: "Thingangyun", address: "Lay Daung Kan", weight: 1.2, codAmount: 30000, deliveryFee: 3000 },
  { id: "p7", trackingNo: "BEX-007", recipientName: "Zaw Zaw", phone: "09777", township: "South Dagon", address: "Zone 1", weight: 3.0, codAmount: 12000, deliveryFee: 3500 },
];

// --- INITIAL COVERAGE SETTINGS (From Python Dict) ---
type CoverageZone = {
  id: string;
  driverName: string;
  vehicleType: "VAN" | "BICYCLE";
  townships: string[];
};

const INITIAL_COVERAGE: CoverageZone[] = [
  { id: "v1", driverName: "Van 1 (Central-East)", vehicleType: "VAN", townships: ["Dagon", "Kamayut", "Bahan", "Mingala Taungnyunt", "Tamwe"] },
  { id: "v2", driverName: "Van 2 (North-West)", vehicleType: "VAN", townships: ["Hlaing", "Mayangone", "Insein", "Mingaladon", "Shwepyitha", "Hlaingtharyar"] },
  { id: "v3", driverName: "Van 3 (East Suburbs)", vehicleType: "VAN", townships: ["Dawbon", "Thaketa", "Yankin", "North Okkalapa", "South Dagon", "Dagon Seikkan"] },
  { id: "b1", driverName: "Ahlone Branch Riders", vehicleType: "BICYCLE", townships: ["Lanmadaw", "Latha", "Pabedan", "Kyauktada", "Botahtaung", "Pazundaung", "Ahlone", "Kyimyindaing", "Sanchaung"] },
  { id: "b2", driverName: "HQ Rider Pool", vehicleType: "BICYCLE", townships: ["North Dagon", "East Dagon", "Thingangyun", "South Okkalapa"] },
];

function bi(language: UiLanguage, en: string, my: string) {
  if (language === "en") return en;
  if (language === "my") return my;
  return `${en} / ${my}`;
}

export default function CreateWayPlanPage() {
  const { user } = useAuth();
  const langContext = useLanguage();
  const [language, setLanguage] = useState<UiLanguage>(langContext?.lang === "en" ? "en" : langContext?.lang === "mm" ? "my" : "both");
  
  const [view, setView] = useState<TabView>("MAP_VIEW");
  const [parcels] = useState<Parcel[]>(MOCK_PARCELS);
  const [coverages, setCoverages] = useState<CoverageZone[]>(INITIAL_COVERAGE);
  const [manifests, setManifests] = useState<Record<string, Parcel[]>>({});
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [toast, setToast] = useState<{ tone: "ok" | "err"; msg: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // --- OPTIMIZER ENGINE (JS Translation of Python script) ---
  const runOptimizer = () => {
    setIsOptimizing(true);
    
    setTimeout(() => {
      const generated: Record<string, Parcel[]> = {};
      
      // Initialize empty arrays for all drivers
      coverages.forEach(c => { generated[c.driverName] = []; });
      generated["OUT_OF_SERVICE"] = [];

      parcels.forEach((parcel) => {
        let assigned = false;
        const targetTownship = parcel.township.toLowerCase().replace(/\s+/g, '');

        for (const zone of coverages) {
          const match = zone.townships.some(t => t.toLowerCase().replace(/\s+/g, '') === targetTownship);
          if (match) {
            generated[zone.driverName].push(parcel);
            assigned = true;
            break;
          }
        }

        if (!assigned) {
          generated["OUT_OF_SERVICE"].push(parcel);
        }
      });

      setManifests(generated);
      setIsOptimizing(false);
      setView("MANIFEST_RESULTS");
      setToast({ tone: "ok", msg: bi(language, "Auto-routing completed successfully.", "အလိုအလျောက်လမ်းကြောင်းဆွဲခြင်း အောင်မြင်ပါသည်။") });
    }, 1500); // Simulate processing time
  };

  const handleSaveManifests = () => {
    setToast({ tone: "ok", msg: bi(language, "Way plans saved and dispatched to rider portals.", "လမ်းကြောင်းများကို သိမ်းဆည်းပြီး Rider များထံ ပို့ဆောင်ပြီးပါပြီ။") });
  };

  if (!user || !["SYS", "SUPER_ADMIN", "ADMIN", "SUPERVISOR", "WAREHOUSE_CONTROLLER"].includes(user.role)) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f7f9fc]">
        <div className="text-xl font-black text-rose-600">Access Restricted</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] p-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Logistics Control</p>
          <h1 className="text-4xl font-black uppercase tracking-tight text-[#0d2c54]">
            Auto Way Plan <span className="font-normal text-blue-500">/ လမ်းကြောင်းအစီအစဉ်ဖန်တီးရန်</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {bi(
              language,
              "Allocate addresses using Mapbox zones and auto-generate delivery manifests for riders.",
              "Mapbox နယ်မြေခွဲဝေမှုများကို အသုံးပြု၍ Rider များအတွက် လမ်းကြောင်းစာရင်းကို အလိုအလျောက်ဖန်တီးပေးသည်။"
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <button onClick={() => setLanguage("en")} className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${language === "en" ? "bg-[#0d2c54] text-white" : "text-slate-600 hover:bg-slate-100"}`}>EN</button>
            <button onClick={() => setLanguage("my")} className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${language === "my" ? "bg-[#0d2c54] text-white" : "text-slate-600 hover:bg-slate-100"}`}>MM</button>
            <button onClick={() => setLanguage("both")} className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${language === "both" ? "bg-[#0d2c54] text-white" : "text-slate-600 hover:bg-slate-100"}`}>EN+MM</button>
          </div>
          
          <button
            onClick={runOptimizer}
            disabled={isOptimizing}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#ffd700] px-6 py-3 font-black uppercase tracking-widest text-[#0d2c54] shadow-lg transition hover:scale-[1.02] disabled:opacity-50"
          >
            {isOptimizing ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
            {bi(language, "Run Auto-Route", "အလိုအလျောက်လမ်းကြောင်းဆွဲမည်")}
          </button>
        </div>
      </div>

      {toast && (
        <div className={`mt-6 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold ${toast.tone === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          {toast.tone === "ok" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          {toast.msg}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={() => setView("MAP_VIEW")} className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-wider transition ${view === "MAP_VIEW" ? "bg-[#0d2c54] text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
          <Map size={16} /> {bi(language, "Map View", "မြေပုံမြင်ကွင်း")}
        </button>
        <button onClick={() => setView("COVERAGE_SETTINGS")} className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-wider transition ${view === "COVERAGE_SETTINGS" ? "bg-[#0d2c54] text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
          <Settings size={16} /> {bi(language, "Coverage Settings", "နယ်မြေသတ်မှတ်ချက်များ")}
        </button>
        <button onClick={() => setView("MANIFEST_RESULTS")} className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-wider transition ${view === "MANIFEST_RESULTS" ? "bg-[#0d2c54] text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
          <Route size={16} /> {bi(language, "Generated Manifests", "ဖန်တီးထားသောလမ်းကြောင်းစာရင်း")}
        </button>
      </div>

      <div className="mt-6">
        {/* --- MAP VIEW --- */}
        {view === "MAP_VIEW" && (
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-[#0d2c54]">{bi(language, "Live Parcel Distribution Map", "လက်ရှိပါဆယ်ဖြန့်ဝေမှုမြေပုံ")}</h2>
            <p className="mt-1 text-sm text-slate-500">{bi(language, "Unassigned parcels pending routing optimization.", "လမ်းကြောင်းမချရသေးသော ပါဆယ်အထုပ်များ။")}</p>
            
            <div className="mt-6 flex h-[500px] items-center justify-center rounded-2xl border-4 border-dashed border-slate-200 bg-slate-50 relative overflow-hidden">
              {/* Mapbox Placeholder */}
              <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/96.1951,16.8661,11/1200x600?access_token=pk.eyJ1IjoibW9ja3Rva2VuIiwiYSI6Im1vY2sifQ.mock')] bg-cover bg-center opacity-40"></div>
              
              <div className="relative z-10 text-center">
                <MapPinned size={64} className="mx-auto mb-4 text-[#0d2c54]" />
                <div className="rounded-2xl bg-white/90 px-6 py-4 shadow-xl backdrop-blur-sm">
                  <h3 className="text-2xl font-black text-[#0d2c54]">{parcels.length}</h3>
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-500">{bi(language, "Unassigned Parcels in Yangon", "ရန်ကုန်မြို့တွင်းရှိ အထုပ်များ")}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- COVERAGE SETTINGS --- */}
        {view === "COVERAGE_SETTINGS" && (
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-[#0d2c54]">{bi(language, "Rider/Driver Coverage Setup", "Driver နယ်မြေသတ်မှတ်ချက်များ")}</h2>
                <p className="mt-1 text-sm text-slate-500">{bi(language, "Define which townships are covered by which vehicle.", "ယာဉ်တစ်စီးချင်းစီအတွက် တာဝန်ယူရမည့်မြို့နယ်များကို သတ်မှတ်ပါ။")}</p>
              </div>
              <button className="rounded-xl bg-[#0d2c54] px-4 py-2 text-xs font-bold text-white flex items-center gap-2">
                <Users size={14} /> Add Driver
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {coverages.map((zone) => (
                <div key={zone.id} className="rounded-2xl border border-slate-200 p-5 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className={`p-2 rounded-lg ${zone.vehicleType === 'VAN' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {zone.vehicleType === 'VAN' ? <Truck size={20} /> : <Route size={20} />}
                    </span>
                    <div>
                      <h3 className="font-black text-[#0d2c54] text-lg">{zone.driverName}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{zone.vehicleType}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{bi(language, "Assigned Townships", "သတ်မှတ်ထားသောမြို့နယ်များ")}</p>
                    <div className="flex flex-wrap gap-2">
                      {zone.townships.map((t) => (
                        <span key={t} className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
                          {t}
                        </span>
                      ))}
                      <button className="rounded-full border border-dashed border-slate-300 bg-white px-3 py-1 text-xs font-bold text-slate-400 hover:text-[#0d2c54] hover:border-[#0d2c54]">
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- MANIFEST RESULTS --- */}
        {view === "MANIFEST_RESULTS" && (
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-[#0d2c54]">{bi(language, "Auto-Generated Way Plans", "အလိုအလျောက်ဖန်တီးထားသော လမ်းကြောင်းများ")}</h2>
                <p className="mt-1 text-sm text-slate-500">{bi(language, "Review the assigned routes before dispatching.", "မပို့ဆောင်မီ သတ်မှတ်ထားသော လမ်းကြောင်းများကို စစ်ဆေးပါ။")}</p>
              </div>
              <button 
                onClick={handleSaveManifests}
                disabled={Object.keys(manifests).length === 0}
                className="rounded-xl bg-emerald-600 px-5 py-3 text-xs font-black uppercase tracking-wider text-white flex items-center gap-2 hover:bg-emerald-500 disabled:opacity-50"
              >
                <Save size={16} /> {bi(language, "Dispatch to Riders", "Rider များထံပို့မည်")}
              </button>
            </div>

            {Object.keys(manifests).length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Route className="mx-auto mb-4 opacity-50" size={48} />
                <p className="text-lg font-semibold">{bi(language, "Click 'Run Auto-Route' to generate manifests.", "လမ်းကြောင်းဖန်တီးရန် 'အလိုအလျောက်လမ်းကြောင်းဆွဲမည်' ကိုနှိပ်ပါ။")}</p>
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                {Object.entries(manifests).map(([driver, assignedParcels]) => {
                  if (assignedParcels.length === 0) return null;

                  const totalWeight = assignedParcels.reduce((sum, p) => sum + p.weight, 0);
                  const totalCOD = assignedParcels.reduce((sum, p) => sum + p.codAmount, 0);
                  const totalDeli = assignedParcels.reduce((sum, p) => sum + p.deliveryFee, 0);

                  return (
                    <div key={driver} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <div className="bg-[#f7f9fc] p-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
                        <h3 className="font-black text-[#0d2c54] text-lg uppercase flex items-center gap-2">
                          <Users size={18} className="text-blue-500" /> {driver}
                        </h3>
                        <div className="flex gap-4 text-sm font-bold">
                          <span className="bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm text-slate-600">
                            {assignedParcels.length} {bi(language, "Parcels", "ထုပ်")}
                          </span>
                          <span className="bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm text-slate-600">
                            {totalWeight} KG
                          </span>
                          <span className="bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm text-rose-600">
                            COD: {totalCOD.toLocaleString()} Ks
                          </span>
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-wider">
                            <tr>
                              <th className="p-4">{bi(language, "Tracking", "Tracking")}</th>
                              <th className="p-4">{bi(language, "Recipient", "လက်ခံသူ")}</th>
                              <th className="p-4">{bi(language, "Township", "မြို့နယ်")}</th>
                              <th className="p-4">{bi(language, "Address", "လိပ်စာ")}</th>
                              <th className="p-4 text-right">COD (Ks)</th>
                              <th className="p-4 text-right">Deli (Ks)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {assignedParcels.map((p) => (
                              <tr key={p.id} className="hover:bg-slate-50">
                                <td className="p-4 font-bold text-[#0d2c54]">{p.trackingNo}</td>
                                <td className="p-4">{p.recipientName}<br/><span className="text-xs text-slate-400">{p.phone}</span></td>
                                <td className="p-4">{p.township}</td>
                                <td className="p-4 text-xs">{p.address}</td>
                                <td className="p-4 text-right font-bold text-rose-600">{p.codAmount > 0 ? p.codAmount.toLocaleString() : '-'}</td>
                                <td className="p-4 text-right">{p.deliveryFee.toLocaleString()}</td>
                              </tr>
                            ))}
                            <tr className="bg-[#fdfdfd] font-black text-[#0d2c54]">
                              <td colSpan={4} className="p-4 text-right uppercase text-[10px] tracking-widest text-slate-400">{bi(language, "Trip Totals", "စုစုပေါင်း")}</td>
                              <td className="p-4 text-right text-rose-600">{totalCOD.toLocaleString()}</td>
                              <td className="p-4 text-right">{totalDeli.toLocaleString()}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}