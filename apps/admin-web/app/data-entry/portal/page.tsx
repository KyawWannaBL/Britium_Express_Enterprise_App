"use client";
import { useState } from "react";
import { Keyboard, Zap, Save, List } from "lucide-react";

export default function DataEntryPortal() {
  return (
    <div className="p-8 space-y-6" style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>
      <div className="flex justify-between items-center border-b pb-6 border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-[#0d2c54] uppercase tracking-tighter italic">Data Entry <span className="text-blue-500 not-italic font-light">Turbo</span></h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">High-Velocity Manual Intake / အချက်အလက်သွင်းခြင်း</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black border border-emerald-100 flex items-center gap-2">
              <Zap size={14}/> KEYBOARD MODE ACTIVE
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entry Form */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-xl border-2 border-[#0d2c54] space-y-6">
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase">Sender Phone (Hotkey: Alt+S)</label>
                 <input className="w-full p-4 bg-slate-50 rounded-2xl border-none text-lg font-black focus:ring-2 focus:ring-[#ffd700]" placeholder="09..." />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase">Recipient Phone (Hotkey: Alt+R)</label>
                 <input className="w-full p-4 bg-slate-50 rounded-2xl border-none text-lg font-black focus:ring-2 focus:ring-[#ffd700]" placeholder="09..." />
              </div>
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase">Delivery Address / လိပ်စာ</label>
              <textarea className="w-full p-4 bg-slate-50 rounded-2xl border-none text-lg font-black focus:ring-2 focus:ring-[#ffd700]" rows={2} />
           </div>
           <div className="grid grid-cols-3 gap-6">
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase">COD Amount</label>
                 <input className="w-full p-4 bg-amber-50 rounded-2xl border-none text-xl font-black text-amber-700" placeholder="0" />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase">Weight (KG)</label>
                 <input className="w-full p-4 bg-slate-50 rounded-2xl border-none text-xl font-black" placeholder="1.0" />
              </div>
              <div className="flex items-end">
                 <button className="w-full bg-[#0d2c54] text-[#ffd700] p-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
                    <Save size={20}/> Save (Enter)
                 </button>
              </div>
           </div>
        </div>

        {/* Live Session Counter */}
        <div className="bg-[#0d2c54] rounded-[40px] p-8 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10"><Keyboard size={80}/></div>
           <div>
              <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-2">Session Entries</p>
              <h2 className="text-6xl font-black text-[#ffd700]">128</h2>
           </div>
           <div className="space-y-4">
              <div className="p-4 bg-white/10 rounded-2xl flex justify-between items-center">
                 <span className="text-[10px] font-black uppercase">Avg Speed</span>
                 <span className="font-bold text-emerald-400">42s / way</span>
              </div>
              <button className="w-full py-4 text-[10px] font-black uppercase tracking-widest border border-white/20 rounded-2xl hover:bg-white/5 transition-colors">
                 View Recent Batch
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
