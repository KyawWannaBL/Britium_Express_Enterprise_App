"use client";
import { useState } from "react";
import { Search, Bell, UserCircle, X } from "lucide-react";
import Link from "next/link";

export default function GlobalHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <>
      <header className="h-20 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-40">
        <div className="flex-1">
           <button onClick={() => setSearchOpen(true)} className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border hover:bg-slate-100 transition-colors text-slate-400 w-64">
              <Search size={16}/> <span className="text-xs font-bold uppercase">Search Network...</span>
              <span className="ml-auto text-[9px] font-black bg-white px-2 py-1 border rounded shadow-sm">⌘K</span>
           </button>
        </div>

        <div className="flex items-center gap-6">
           <button onClick={() => setNotifOpen(true)} className="relative text-slate-400 hover:text-[#0d2c54] transition-colors">
              <Bell size={24}/>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white"></span>
           </button>
           <div className="h-8 w-px bg-slate-200"></div>
           <Link href="/profile" className="flex items-center gap-3 group">
              <div className="text-right hidden md:block">
                 <p className="text-xs font-black text-[#0d2c54] uppercase">Kyaw Wanna</p>
                 <p className="text-[9px] font-bold text-emerald-500 uppercase">SYS_ADMIN</p>
              </div>
              <UserCircle size={36} className="text-slate-300 group-hover:text-[#0d2c54] transition-colors"/>
           </Link>
        </div>
      </header>

      {/* SEARCH MODAL OVERLAY */}
      {searchOpen && (
        <div className="fixed inset-0 bg-[#0d2c54]/80 backdrop-blur-sm z-50 flex items-start justify-center pt-32">
           <div className="bg-white w-full max-w-2xl rounded-[30px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center p-4 border-b">
                 <Search size={24} className="text-blue-500 mx-4"/>
                 <input autoFocus placeholder="Type Tracking ID, Name, or Phone..." className="flex-1 text-xl font-black text-[#0d2c54] outline-none" />
                 <button onClick={() => setSearchOpen(false)} className="p-2 bg-slate-100 rounded-xl text-slate-500"><X size={20}/></button>
              </div>
              <div className="p-8 text-center text-slate-400 font-bold text-sm uppercase tracking-widest">Start typing to search global index...</div>
           </div>
        </div>
      )}

      {/* NOTIFICATIONS PANEL */}
      {notifOpen && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l z-50 animate-in slide-in-from-right duration-200 flex flex-col">
           <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-[#0d2c54] uppercase tracking-widest text-xs flex items-center gap-2"><Bell size={16}/> Command Alerts</h3>
              <button onClick={() => setNotifOpen(false)}><X size={20} className="text-slate-400"/></button>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl cursor-pointer">
                 <p className="text-[10px] font-black text-amber-600 uppercase mb-1">New Escalation</p>
                 <p className="text-xs font-bold text-[#0d2c54]">Waybill BEX-992 is delayed by 48hrs in MDY Hub.</p>
                 <p className="text-[9px] font-bold text-slate-400 mt-2">10 mins ago</p>
              </div>
           </div>
        </div>
      )}
    </>
  );
}
