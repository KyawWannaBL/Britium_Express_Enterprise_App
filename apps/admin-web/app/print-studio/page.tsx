"use client";
import { Printer, FileBox, QrCode, Search, Copy } from "lucide-react";

export default function PrintStudio() {
  return (
    <div className="p-8 space-y-8" style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>
      <div className="flex justify-between items-center border-b pb-6 border-slate-200">
        <div>
          <h1 className="text-4xl font-black text-[#0d2c54] uppercase tracking-tighter italic">
            Print <span className="text-blue-500 not-italic font-light">Studio</span>
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em] mt-1">
            Label & Manifest Generation / ???????????
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* PRINT CONTROLS */}
        <div className="bg-white p-8 rounded-[40px] border shadow-sm space-y-6">
           <h3 className="font-black text-[#0d2c54] text-[10px] uppercase tracking-widest border-b pb-4">Job Configuration</h3>
           
           <div className="space-y-4">
              <div className="relative">
                 <Search className="absolute left-4 top-3 text-slate-300" size={20} />
                 <input placeholder="Scan or Enter Tracking ID..." className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <select className="w-full p-4 bg-slate-50 rounded-2xl font-black text-xs uppercase text-[#0d2c54] outline-none">
                 <option>Format: Standard A6 Thermal</option>
                 <option>Format: A4 Batch Print (4 per page)</option>
                 <option>Format: Hub Dispatch Manifest</option>
              </select>

              <button className="w-full bg-[#0d2c54] text-[#ffd700] py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform">
                 <Printer size={20}/> Execute Print Job
              </button>
           </div>
        </div>

        {/* LABEL PREVIEW */}
        <div className="md:col-span-2 bg-slate-100 p-8 rounded-[40px] border-4 border-dashed border-slate-200 flex items-center justify-center">
           {/* Mockup of an A6 Thermal Label */}
           <div className="w-[350px] bg-white shadow-2xl p-6 border-2 border-slate-900 space-y-4 transform rotate-1">
              <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4">
                 <h2 className="text-2xl font-black italic tracking-tighter">BEX</h2>
                 <div className="px-3 py-1 bg-slate-900 text-white font-black text-xs uppercase">Standard</div>
              </div>
              <div className="flex justify-center py-4">
                 <QrCode size={100} className="text-slate-900" />
              </div>
              <div className="text-center">
                 <p className="font-mono font-black text-xl tracking-widest text-slate-900">BEX-99201-YGN</p>
              </div>
              <div className="border-t-2 border-slate-900 pt-4 grid grid-cols-2 gap-4">
                 <div>
                    <p className="text-[8px] font-black uppercase text-slate-500">To:</p>
                    <p className="font-bold text-xs text-slate-900 leading-tight">U Hlaing Min<br/>Yangon, Myanmar</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[8px] font-black uppercase text-slate-500">COD Amount:</p>
                    <p className="font-black text-lg text-slate-900">25,000</p>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
