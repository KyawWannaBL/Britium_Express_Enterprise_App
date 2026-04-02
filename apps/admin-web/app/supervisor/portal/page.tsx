"use client";
import { useState } from "react";
import { ShieldAlert, CheckCircle, XCircle, Wallet, FileText, ChevronRight } from "lucide-react";

export default function SupervisorPortal() {
  const [lang, setLang] = useState<"en" | "mm">("mm");

  return (
    <div className="p-8 space-y-8" style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-[#0d2c54] uppercase tracking-tighter italic">
            Supervisor <span className="text-blue-500 not-italic font-light">Control</span>
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em] mt-1">
            Approvals & Risk Management / စီမံခန့်ခွဲမှုနှင့် အတည်ပြုချက်များ
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* PENDING APPROVALS */}
        <div className="bg-white rounded-[40px] border shadow-xl overflow-hidden">
          <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
            <h3 className="font-black text-[#0d2c54] text-[10px] uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert size={16} className="text-amber-500" /> Pending Approvals / အတည်ပြုရန် စောင့်ဆိုင်းနေသည်
            </h3>
            <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-[10px] font-black">3 NEW</span>
          </div>
          
          <div className="p-4 space-y-4">
             {/* Sample Approval Card */}
             <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex justify-between items-center group hover:bg-blue-50 transition-colors">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm font-black text-blue-600">KM</div>
                   <div>
                      <p className="text-xs font-black text-[#0d2c54]">Kyaw Min (Rider)</p>
                      <p className="text-[10px] text-slate-400 font-bold">Fuel Expense: 15,000 MMK</p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <button className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"><CheckCircle size={18}/></button>
                   <button className="p-2 bg-rose-100 text-rose-500 rounded-xl hover:scale-110 transition-transform"><XCircle size={18}/></button>
                </div>
             </div>
          </div>
        </div>

        {/* CASH RECONCILIATION */}
        <div className="bg-[#0d2c54] rounded-[40px] p-10 text-white shadow-2xl space-y-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10"><Wallet size={80}/></div>
           <div className="space-y-1">
              <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em]">Total On-Hand Cash / လက်ဝယ်ရှိငွေစုစုပေါင်း</p>
              <h2 className="text-5xl font-black text-[#ffd700]">4.8M <span className="text-sm">MMK</span></h2>
           </div>
           <div className="pt-6 border-t border-white/10 flex justify-between items-center">
              <div>
                 <p className="text-[9px] font-black opacity-50 uppercase">Expected Remittance</p>
                 <p className="font-bold text-emerald-400">4.82M MMK</p>
              </div>
              <button className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-colors">
                 <ChevronRight size={20}/>
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}
