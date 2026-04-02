"use client";
import { useState } from "react";
import { Map, BarChart3, TrendingUp, Users, ArrowUpRight } from "lucide-react";

export default function BranchReports() {
  const [branch, setBranch] = useState("Yangon HQ");

  return (
    <div className="p-8 space-y-8" style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-[#0d2c54] uppercase tracking-tighter italic">
            Branch <span className="text-blue-500 not-italic font-light">Performance</span>
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em] mt-1">
            Territory Analytics / နယ်မြေအလိုက် စွမ်းဆောင်ရည်
          </p>
        </div>
        <select 
          className="bg-white border-2 border-[#0d2c54] p-3 rounded-2xl font-black text-xs uppercase tracking-widest text-[#0d2c54]"
          onChange={(e) => setBranch(e.target.value)}
        >
          <option>Yangon HQ (YGN-HQ)</option>
          <option>Mandalay Hub (MDY-01)</option>
          <option>Naypyitaw Node (NPT-01)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#0d2c54] p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-20"><TrendingUp size={64}/></div>
          <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-2">Branch Revenue</p>
          <h2 className="text-4xl font-black text-[#ffd700]">2.4M <span className="text-sm">MMK</span></h2>
          <div className="mt-4 flex items-center gap-2 text-emerald-400 text-[10px] font-black">
            <ArrowUpRight size={14}/> +15% FROM LAST MONTH
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border shadow-sm">
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-2">Active Riders</p>
          <h2 className="text-4xl font-black text-[#0d2c54]">48</h2>
          <div className="w-full bg-slate-100 h-2 mt-4 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-[80%]"></div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border shadow-sm">
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-2">Delivery Success Rate</p>
          <h2 className="text-4xl font-black text-emerald-600">94.2%</h2>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">Target: 95.0%</p>
        </div>
      </div>

      <div className="bg-white rounded-[50px] p-12 border shadow-sm text-center">
         <Map className="mx-auto text-blue-100 mb-4" size={64} />
         <h3 className="text-[#0d2c54] font-black text-xl">Branch Heatmap Loading...</h3>
         <p className="text-slate-400 text-xs font-bold uppercase mt-2">Visualizing: {branch}</p>
      </div>
    </div>
  );
}
