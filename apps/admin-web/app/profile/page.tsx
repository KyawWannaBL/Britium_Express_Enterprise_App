"use client";

import React from "react";
import { motion } from "framer-motion";
import { User, Shield, Languages, Key, LogOut } from "lucide-react";

export default function Profile() {
  const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 font-sans pb-24 flex items-center justify-center">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="max-w-4xl w-full space-y-8">
        
        <motion.div variants={fadeUp} className="text-center mb-10">
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-[#0d2c54]">
            User <span className="font-light italic text-blue-500">Preferences</span>
          </h1>
          <p className="text-slate-500 mt-3 font-medium">Manage your account identity, security, and localization.</p>
        </motion.div>
        
        <motion.div variants={fadeUp} className="bg-white/80 backdrop-blur-xl border border-slate-200/60 p-8 rounded-[3rem] shadow-sm flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
           <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2rem] flex items-center justify-center text-blue-500 border border-blue-100 shadow-inner shrink-0 rotate-3 hover:rotate-0 transition-transform duration-300">
             <User size={56} className="stroke-[1.5]" />
           </div>
           <div className="flex-1">
              <h2 className="text-3xl font-black text-[#0d2c54] tracking-tight">System Administrator</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">admin@britium.com</p>
              <div className="mt-5 inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase ring-1 ring-emerald-200 shadow-sm">
                 <Shield size={14}/> SUPER_ADMIN_LEVEL_5
              </div>
           </div>
           <div>
             <button className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-6 py-3 rounded-2xl font-black uppercase tracking-wider text-xs transition-colors flex items-center gap-2">
               <LogOut size={16}/> Sign Out
             </button>
           </div>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] border border-slate-200/60 shadow-sm space-y-6 hover:shadow-lg transition-shadow">
              <h3 className="font-black text-[#0d2c54] text-xs uppercase tracking-widest border-b border-slate-100 pb-4 flex items-center gap-3">
                <Key size={18} className="text-amber-500"/> Security Settings
              </h3>
              <button className="w-full text-left p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm text-slate-700 hover:border-blue-300 hover:bg-blue-50 transition-all">Change Password</button>
              <div className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
                 <span className="font-bold text-sm text-slate-700">Two-Factor Auth (2FA)</span>
                 <span className="bg-emerald-500 text-white px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-wider shadow-sm">Enabled</span>
              </div>
           </div>

           <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] border border-slate-200/60 shadow-sm space-y-6 hover:shadow-lg transition-shadow">
              <h3 className="font-black text-[#0d2c54] text-xs uppercase tracking-widest border-b border-slate-100 pb-4 flex items-center gap-3">
                <Languages size={18} className="text-blue-500"/> Localization
              </h3>
              <div className="relative">
                <select className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer">
                   <option>Language: English (Default)</option>
                   <option>Language: မြန်မာ (Myanmar)</option>
                </select>
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-4 leading-relaxed">
                Changes language preferences across all Britium Express internal operational portals.
              </p>
           </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
