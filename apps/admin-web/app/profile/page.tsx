"use client";
import { User, Shield, Languages, Key } from "lucide-react";

export default function Profile() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8" style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>
      <h1 className="text-4xl font-black text-[#0d2c54] uppercase tracking-tighter italic">User <span className="text-blue-500 not-italic font-light">Preferences</span></h1>
      
      <div className="bg-white p-8 rounded-[40px] border shadow-sm flex items-center gap-8">
         <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 border-4 border-white shadow-lg"><User size={64}/></div>
         <div>
            <h2 className="text-3xl font-black text-[#0d2c54]">Kyaw Wanna</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">agent.kyaw@britium.com</p>
            <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase ring-1 ring-blue-200">
               <Shield size={14}/> SYS_ADMIN_LEVEL_5
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-white p-8 rounded-[40px] border shadow-sm space-y-6">
            <h3 className="font-black text-[#0d2c54] text-[10px] uppercase tracking-widest border-b pb-4 flex items-center gap-2"><Key size={16}/> Security Settings</h3>
            <button className="w-full text-left p-4 bg-slate-50 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-colors">Change Password</button>
            <button className="w-full text-left p-4 bg-slate-50 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-colors flex justify-between">
               Two-Factor Auth (2FA) <span className="text-emerald-500 font-black text-[10px] uppercase">Enabled</span>
            </button>
         </div>
         <div className="bg-white p-8 rounded-[40px] border shadow-sm space-y-6">
            <h3 className="font-black text-[#0d2c54] text-[10px] uppercase tracking-widest border-b pb-4 flex items-center gap-2"><Languages size={16}/> Localization</h3>
            <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-none">
               <option>Language: English (Default)</option>
               <option>Language: မြန်မာ (Myanmar)</option>
            </select>
         </div>
      </div>
    </div>
  );
}
