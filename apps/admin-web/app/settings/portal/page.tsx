"use client";
import { useState } from "react";
import { Settings, Map, Calculator, Network, PlusCircle, Save, CheckCircle, Store, Truck } from "lucide-react";

export default function SystemSettingsPortal() {
  const [activeTab, setActiveTab] = useState("tariff");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8 space-y-8" style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>
      {/* HEADER */}
      <div className="flex justify-between items-end border-b pb-6 border-slate-200">
        <div>
          <h1 className="text-4xl font-black text-[#0d2c54] uppercase tracking-tighter italic">
            Master <span className="text-blue-500 not-italic font-light">Config</span>
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em] mt-1">
            System Settings & Expansions / စနစ်ပိုင်းဆိုင်ရာ သတ်မှတ်ချက်များ
          </p>
        </div>
        <button onClick={handleSave} className="bg-[#ffd700] text-[#0d2c54] px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-transform flex items-center gap-2">
           {saved ? <CheckCircle size={20}/> : <Save size={20}/>}
           {saved ? "Configuration Saved" : "Commit Changes"}
        </button>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex gap-4">
         <button onClick={() => setActiveTab("tariff")} className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-colors ${activeTab === "tariff" ? "bg-[#0d2c54] text-white" : "bg-white text-slate-400 border hover:bg-slate-50"}`}>
            <Calculator size={16}/> Tariff Matrix
         </button>
         <button onClick={() => setActiveTab("network")} className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-colors ${activeTab === "network" ? "bg-[#0d2c54] text-white" : "bg-white text-slate-400 border hover:bg-slate-50"}`}>
            <Network size={16}/> Network Expansion
         </button>
         <button onClick={() => setActiveTab("geo")} className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-colors ${activeTab === "geo" ? "bg-[#0d2c54] text-white" : "bg-white text-slate-400 border hover:bg-slate-50"}`}>
            <Map size={16}/> Geography Master
         </button>
      </div>

      {/* TARIFF MATRIX TAB */}
      {activeTab === "tariff" && (
        <div className="bg-white p-8 rounded-[40px] border shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4">
           <h3 className="text-[#0d2c54] font-black uppercase tracking-[0.2em] border-b pb-4 flex items-center gap-2">
              <Calculator size={20} className="text-blue-500"/> Dynamic Pricing Engine / ဈေးနှုန်းသတ်မှတ်ချက်
           </h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Origin & Destination */}
              <div className="space-y-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origin / ပေးပို့မည့်နေရာ</label>
                    <div className="grid grid-cols-2 gap-2">
                       <select className="w-full p-4 bg-white rounded-xl border font-bold text-xs text-[#0d2c54] outline-none">
                          <option>Yangon Region</option>
                          <option>Mandalay Region</option>
                          <option>Shan State</option>
                       </select>
                       <select className="w-full p-4 bg-white rounded-xl border font-bold text-xs text-[#0d2c54] outline-none">
                          <option>All Townships</option>
                          <option>Kamayut Township</option>
                          <option>Bahan Township</option>
                       </select>
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination / လက်ခံမည့်နေရာ</label>
                    <div className="grid grid-cols-2 gap-2">
                       <select className="w-full p-4 bg-white rounded-xl border font-bold text-xs text-[#0d2c54] outline-none">
                          <option>Mandalay Region</option>
                          <option>Yangon Region</option>
                          <option>Shan State</option>
                       </select>
                       <select className="w-full p-4 bg-white rounded-xl border font-bold text-xs text-[#0d2c54] outline-none">
                          <option>All Townships</option>
                          <option>Chanmyathazi Township</option>
                       </select>
                    </div>
                 </div>
              </div>

              {/* Fee Configuration */}
              <div className="space-y-6 bg-[#0d2c54] p-6 rounded-3xl shadow-xl text-white">
                 <div>
                    <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Base Delivery Fee (0-1 KG)</label>
                    <div className="flex items-end gap-2 border-b border-white/20 pb-2 mt-2">
                       <input type="number" defaultValue={3500} className="w-full bg-transparent font-black text-4xl text-[#ffd700] outline-none" />
                       <span className="text-xs font-bold mb-2">MMK</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Extra KG Charge</label>
                       <input type="number" defaultValue={500} className="w-full bg-white/10 p-3 rounded-xl mt-2 font-bold text-white outline-none border border-white/10" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Insurance Rate (%)</label>
                       <input type="number" defaultValue={1.5} className="w-full bg-white/10 p-3 rounded-xl mt-2 font-bold text-white outline-none border border-white/10" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* NETWORK EXPANSION TAB */}
      {activeTab === "network" && (
        <div className="bg-white rounded-[40px] border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
           <div className="p-8 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-[#0d2c54] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                 <Network size={20} className="text-emerald-500"/> Network Nodes / ကွန်ရက်တိုးချဲ့မှု
              </h3>
              <button className="bg-[#0d2c54] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 <PlusCircle size={14}/> Add New Node
              </button>
           </div>
           
           <table className="w-full text-left">
              <thead className="bg-white border-b text-[10px] font-black uppercase text-slate-400 tracking-widest">
                 <tr>
                    <th className="p-6">Node Code</th>
                    <th className="p-6">Location</th>
                    <th className="p-6">Entity Type</th>
                    <th className="p-6">Revenue Share</th>
                    <th className="p-6">Status</th>
                 </tr>
              </thead>
              <tbody className="text-sm font-bold text-[#0d2c54]">
                 <tr className="border-b hover:bg-slate-50">
                    <td className="p-6 font-mono text-blue-600">BEX-YGN-HQ</td>
                    <td className="p-6">Yangon, Kamayut</td>
                    <td className="p-6"><span className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg w-fit text-[10px] uppercase"><Store size={14}/> Britium Branch</span></td>
                    <td className="p-6">100% (Owned)</td>
                    <td className="p-6"><div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div></td>
                 </tr>
                 <tr className="hover:bg-slate-50">
                    <td className="p-6 font-mono text-blue-600">3PL-TAUNGGYI-01</td>
                    <td className="p-6">Shan State, Taunggyi</td>
                    <td className="p-6"><span className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-lg w-fit text-[10px] uppercase"><Truck size={14}/> Partner (Royal Express)</span></td>
                    <td className="p-6">80% / 20% Split</td>
                    <td className="p-6"><div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div></td>
                 </tr>
              </tbody>
           </table>
        </div>
      )}

      {/* GEOGRAPHY MASTER TAB */}
      {activeTab === "geo" && (
         <div className="bg-slate-100 p-12 rounded-[40px] border-4 border-dashed border-slate-200 text-center animate-in fade-in slide-in-from-bottom-4">
            <Map size={64} className="mx-auto text-slate-300 mb-4" />
            <h3 className="font-black text-[#0d2c54] text-xl uppercase tracking-widest">Myanmar Geospatial Database</h3>
            <p className="text-slate-400 font-bold mt-2">14 States/Regions and 330 Townships Pre-Loaded.</p>
         </div>
      )}

    </div>
  );
}
