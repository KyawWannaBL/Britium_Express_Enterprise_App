"use client";
import { Search, ShieldAlert, Headphones, FileText, Clock, CheckCircle } from "lucide-react";

export default function CustomerServicePortal() {
  return (
    <div className="p-8 space-y-8" style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-[#0d2c54] uppercase tracking-tighter italic">
            Resolution <span className="text-blue-500 not-italic font-light">Center</span>
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em] mt-1">
            Customer Service & Claims / ဖောက်သည်ဝန်ဆောင်မှု
          </p>
        </div>
        <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-[10px] font-black border border-rose-100 flex items-center gap-2 animate-pulse">
           <ShieldAlert size={14}/> 3 SLA BREACHES DETECTED
        </div>
      </div>

      {/* SUPER SEARCH */}
      <div className="bg-[#0d2c54] p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-10"><Search size={100}/></div>
         <p className="text-[#ffd700] font-black text-[10px] uppercase tracking-[0.2em] mb-4">Omni-Search Engine</p>
         <div className="relative max-w-2xl">
            <input 
               placeholder="Enter Tracking Number, Phone, or Customer Name..." 
               className="w-full p-6 pl-14 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 font-bold outline-none focus:bg-white/20 transition-all"
            />
            <Search className="absolute left-5 top-6 text-[#ffd700]" size={24} />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* TICKET DASHBOARD */}
        <div className="md:col-span-2 bg-white rounded-[40px] border shadow-sm overflow-hidden">
           <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-black text-[#0d2c54] text-[10px] uppercase tracking-widest flex items-center gap-2">
                 <Headphones size={16} className="text-blue-500" /> Active Tickets / လက်ရှိတိုင်ကြားစာများ
              </h3>
           </div>
           <div className="p-4 space-y-4">
              <div className="p-4 rounded-3xl border border-rose-100 bg-rose-50/30 flex justify-between items-center group cursor-pointer hover:bg-rose-50 transition-colors">
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                       <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[9px] font-black uppercase">Delayed</span>
                       <span className="text-[10px] font-black text-slate-400">BEX-99201</span>
                    </div>
                    <p className="font-bold text-[#0d2c54] text-sm">Customer claims parcel has been stuck at MDY Hub for 4 days.</p>
                 </div>
                 <button className="bg-white border shadow-sm px-4 py-2 rounded-xl text-[10px] font-black text-[#0d2c54] uppercase tracking-widest">Resolve</button>
              </div>
              <div className="p-4 rounded-3xl border border-slate-100 flex justify-between items-center group cursor-pointer hover:bg-slate-50 transition-colors">
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                       <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-black uppercase">Address Issue</span>
                       <span className="text-[10px] font-black text-slate-400">BEX-88342</span>
                    </div>
                    <p className="font-bold text-[#0d2c54] text-sm">Rider cannot find location. Need alternative phone number.</p>
                 </div>
                 <button className="bg-white border shadow-sm px-4 py-2 rounded-xl text-[10px] font-black text-[#0d2c54] uppercase tracking-widest">Resolve</button>
              </div>
           </div>
        </div>

        {/* TEAM PERFORMANCE */}
        <div className="bg-white p-8 rounded-[40px] border shadow-sm space-y-6">
           <h3 className="font-black text-[#0d2c54] text-[10px] uppercase tracking-widest border-b pb-4">Agent Metrics</h3>
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3 text-slate-500 text-xs font-bold"><Clock size={16}/> Avg Response Time</div>
                 <p className="font-black text-[#0d2c54]">12m</p>
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3 text-slate-500 text-xs font-bold"><CheckCircle size={16}/> Resolution Rate</div>
                 <p className="font-black text-emerald-600">94.5%</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
