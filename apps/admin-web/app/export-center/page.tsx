"use client";
import { Download, FileSpreadsheet, Archive } from "lucide-react";

export default function ExportCenter() {
  return (
    <div className="p-8 space-y-8" style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>
      <h1 className="text-4xl font-black text-[#0d2c54] uppercase tracking-tighter italic">Data <span className="text-blue-500 not-italic font-light">Export</span></h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-white p-8 rounded-[40px] border shadow-sm group hover:border-[#0d2c54] transition-colors">
            <FileSpreadsheet size={48} className="text-emerald-500 mb-6" />
            <h3 className="font-black text-[#0d2c54] uppercase text-sm mb-2">Master Ledger Export</h3>
            <p className="text-xs text-slate-500 font-bold mb-6">Generates a CSV of all COD reconciliations and shipping fees.</p>
            <button className="w-full bg-slate-50 group-hover:bg-[#0d2c54] group-hover:text-[#ffd700] py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-colors flex items-center justify-center gap-2">
               <Download size={14}/> Request CSV
            </button>
         </div>

         <div className="bg-white p-8 rounded-[40px] border shadow-sm group hover:border-[#0d2c54] transition-colors">
            <Archive size={48} className="text-blue-500 mb-6" />
            <h3 className="font-black text-[#0d2c54] uppercase text-sm mb-2">Operational Manifest</h3>
            <p className="text-xs text-slate-500 font-bold mb-6">Export all waybills created within a specific date range.</p>
            <button className="w-full bg-slate-50 group-hover:bg-[#0d2c54] group-hover:text-[#ffd700] py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-colors flex items-center justify-center gap-2">
               <Download size={14}/> Request CSV
            </button>
         </div>
      </div>
    </div>
  );
}
