"use client";
import { Megaphone, Send, Users, MessageSquare, History } from "lucide-react";

export default function MarketingPortal() {
  return (
    <div className="p-8 space-y-8" style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-[#0d2c54] uppercase tracking-tighter italic">
            Marketing <span className="text-blue-500 not-italic font-light">Hub</span>
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em] mt-1">
            Bulk Outreach & Notifications / စျေးကွက်နှင့် ဆက်သွယ်ရေး
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ACTION: SEND CAMPAIGN */}
        <div className="bg-white p-8 rounded-[40px] border-4 border-[#0d2c54] shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Send size={24}/></div>
             <h3 className="font-black text-[#0d2c54] uppercase tracking-widest text-sm">New Campaign / ကန်ပိန်းအသစ်</h3>
          </div>
          <div className="space-y-4">
            <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-xs uppercase border-none focus:ring-2 focus:ring-blue-500">
               <option>Select Target: All Customers</option>
               <option>Target: Yangon Merchants Only</option>
               <option>Target: Delayed Shipments Only</option>
            </select>
            <textarea 
              placeholder="Write your message here... (Myanmar/English supported)" 
              className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
              rows={4}
            />
            <button className="w-full bg-[#ffd700] text-[#0d2c54] py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-transform">
              Launch Campaign Now
            </button>
          </div>
        </div>

        {/* STATS: ENGAGEMENT */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-[#0d2c54] p-8 rounded-[40px] text-white flex justify-between items-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-10"><MessageSquare size={64}/></div>
             <div>
                <p className="text-[10px] font-black uppercase opacity-60 mb-1">Messages Sent (Today)</p>
                <h2 className="text-5xl font-black text-[#ffd700]">12,402</h2>
             </div>
          </div>
          <div className="bg-emerald-600 p-8 rounded-[40px] text-white flex justify-between items-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-10"><Users size={64}/></div>
             <div>
                <p className="text-[10px] font-black uppercase opacity-60 mb-1">Open Rate / ဖတ်ရှုနှုန်း</p>
                <h2 className="text-5xl font-black">92%</h2>
             </div>
          </div>
        </div>
      </div>

      {/* HISTORY TABLE */}
      <div className="bg-white rounded-[40px] border shadow-sm overflow-hidden">
         <div className="p-6 bg-slate-50 border-b flex items-center gap-2">
            <History size={18} className="text-slate-400" />
            <h3 className="font-black text-[#0d2c54] text-[10px] uppercase tracking-widest">Recent Broadcast Logs</h3>
         </div>
         <div className="p-12 text-center">
            <p className="text-slate-300 font-black uppercase tracking-widest text-xs">No recent campaigns detected.</p>
         </div>
      </div>
    </div>
  );
}
