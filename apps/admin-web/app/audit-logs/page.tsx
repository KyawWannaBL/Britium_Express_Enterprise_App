"use client";
import { Activity, Search, Filter } from "lucide-react";

export default function AuditLogs() {
  return (
    <div className="p-8 space-y-8" style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>
      <div className="flex justify-between items-end border-b pb-6 border-slate-200">
        <div>
          <h1 className="text-4xl font-black text-[#0d2c54] uppercase tracking-tighter italic">Audit <span className="text-emerald-500 not-italic font-light">Trail</span></h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-1">Immutable System Logs / စနစ်မှတ်တမ်း</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border shadow-sm overflow-hidden">
         <div className="p-4 bg-slate-50 border-b flex gap-4">
            <div className="relative flex-1">
               <Search className="absolute left-4 top-3 text-slate-300" size={18} />
               <input placeholder="Search by User ID, Action, or Record..." className="w-full pl-12 py-2 bg-white rounded-xl border text-sm font-bold outline-none" />
            </div>
            <button className="bg-white border px-4 py-2 rounded-xl text-xs font-black uppercase text-[#0d2c54] flex items-center gap-2"><Filter size={16}/> Filter</button>
         </div>
         <table className="w-full text-left">
            <thead className="bg-white border-b text-[10px] font-black uppercase text-slate-400 tracking-widest">
               <tr>
                  <th className="p-6">Timestamp</th>
                  <th className="p-6">Actor (User)</th>
                  <th className="p-6">Action Executed</th>
                  <th className="p-6">Target Record</th>
                  <th className="p-6">IP Address</th>
               </tr>
            </thead>
            <tbody className="text-xs font-bold text-[#0d2c54] divide-y divide-slate-50">
               <tr className="hover:bg-slate-50">
                  <td className="p-6 text-slate-400 font-mono">2026-04-02 10:04:12</td>
                  <td className="p-6"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded uppercase font-black text-[9px]">FIN_01</span> Kyaw</td>
                  <td className="p-6 text-emerald-600 uppercase font-black">finance.approve_settlement</td>
                  <td className="p-6 font-mono">SETTLE-8891 (1.2M MMK)</td>
                  <td className="p-6 font-mono text-slate-400">192.168.1.104</td>
               </tr>
               <tr className="hover:bg-slate-50">
                  <td className="p-6 text-slate-400 font-mono">2026-04-02 09:45:00</td>
                  <td className="p-6"><span className="bg-amber-50 text-amber-600 px-2 py-1 rounded uppercase font-black text-[9px]">SUP_MDY</span> Aung</td>
                  <td className="p-6 text-amber-600 uppercase font-black">shipment.override_status</td>
                  <td className="p-6 font-mono">BEX-99201</td>
                  <td className="p-6 font-mono text-slate-400">10.0.4.22</td>
               </tr>
            </tbody>
         </table>
      </div>
    </div>
  );
}
