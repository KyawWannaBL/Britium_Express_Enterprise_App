"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Package, MapPin, Calendar, CheckCircle2 } from "lucide-react";

export default function CustomerPortal() {
  const supabase = createClient();
  const [trackingId, setTrackingId] = useState("");
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    setLoading(true);
    const { data } = await supabase.from('shipments').select('*').eq('tracking_number', trackingId).single();
    setShipment(data);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8" style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-[#0d2c54] uppercase italic">Track Your <span className="text-blue-500 not-italic">Parcel</span></h1>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Britium Express Real-Time Network / ပါဆယ်ခြေရာခံရန်</p>
      </div>

      <div className="relative group">
        <input 
          placeholder="Enter Tracking Number (e.g. BEX-LIVE-001)" 
          className="w-full p-6 rounded-[30px] border-4 border-[#0d2c54] text-xl font-black placeholder:text-slate-200 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
          onChange={(e) => setTrackingId(e.target.value)}
        />
        <button 
          onClick={handleTrack}
          className="absolute right-3 top-3 bg-[#0d2c54] text-[#ffd700] px-8 py-4 rounded-[20px] font-black uppercase tracking-widest hover:bg-blue-900 transition-colors"
        >
          {loading ? "Searching..." : "Track Now"}
        </button>
      </div>

      {shipment && (
        <div className="bg-white rounded-[40px] border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-[#0d2c54] p-8 text-white flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Current Status / အခြေအနေ</p>
              <h2 className="text-3xl font-black text-[#ffd700] uppercase italic">{shipment.status.replace('_', ' ')}</h2>
            </div>
            <Package size={48} className="opacity-20" />
          </div>
          
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><MapPin size={24}/></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Last Location / နောက်ဆုံးတည်နေရာ</p>
                  <p className="font-black text-[#0d2c54]">{shipment.address || 'Processing Center'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Calendar size={24}/></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Estimated Arrival / ခန့်မှန်းခြေရောက်ရှိချိန်</p>
                  <p className="font-black text-[#0d2c54]">April 05, 2026</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-[30px] border border-dashed border-slate-200">
               <h3 className="text-[10px] font-black text-[#0d2c54] uppercase tracking-widest mb-4">Milestone Tracker</h3>
               <div className="space-y-4">
                  <div className="flex items-center gap-3 text-emerald-600 font-bold text-xs">
                    <CheckCircle2 size={16}/> Picked up from Merchant
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 font-bold text-xs">
                    <div className="w-4 h-4 rounded-full border-2 border-slate-200"></div> Arrived at Hub
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 font-bold text-xs">
                    <div className="w-4 h-4 rounded-full border-2 border-slate-200"></div> Out for Delivery
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
