"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  User, MapPin, Package, Banknote, 
  ClipboardList, CheckCircle2, Phone, Scale
} from "lucide-react";

export default function CreateDeliveryClient() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    sender_name: "", sender_phone: "", sender_address: "",
    recipient_name: "", recipient_phone: "", recipient_address: "",
    product_name: "", product_weight: 0, product_qty: 1,
    payment_term: "COD", delivery_fee_mmks: 0, 
    extra_weight_charges: 0, cod_amount_mmks: 0,
    rider_remark: ""
  });

  const totalToCollect = (form.payment_term === 'COD' ? Number(form.cod_amount_mmks) : 0) + 
                         Number(form.delivery_fee_mmks) + 
                         Number(form.extra_weight_charges);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const trackingNo = `BEX-${Date.now().toString().slice(-8)}`;

    const { error } = await supabase.from('shipments').insert([{
      tracking_number: trackingNo,
      ...form,
      total_collectable_amount: totalToCollect,
      status: 'pending_pickup'
    }]);

    if (!error) {
      setSuccessMsg(`SUCCESS: ${trackingNo} CREATED`);
      window.scrollTo(0,0);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8" style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>
      
      {successMsg && (
        <div className="p-6 bg-emerald-600 text-white rounded-[30px] font-black flex items-center gap-3 shadow-xl animate-bounce">
          <CheckCircle2 size={32} /> {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMN 1: PARTIES */}
        <div className="bg-white p-8 rounded-[40px] border shadow-sm space-y-6">
          <h3 className="text-[#0d2c54] font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 border-b pb-4">
            <User size={18} className="text-blue-500" /> Parties / လူပုဂ္ဂိုလ်များ
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sender / ပေးပို့သူ</label>
               <input placeholder="Name" className="w-full bg-transparent font-bold text-[#0d2c54] outline-none" onChange={e => setForm({...form, sender_name: e.target.value})} />
               <input placeholder="Phone" className="w-full bg-transparent font-bold text-[#0d2c54] mt-2 pt-2 border-t border-slate-200 outline-none" onChange={e => setForm({...form, sender_phone: e.target.value})} />
               <input placeholder="Pick-up Address" className="w-full bg-transparent font-bold text-[#0d2c54] mt-2 pt-2 border-t border-slate-200 outline-none" onChange={e => setForm({...form, sender_address: e.target.value})} />
            </div>

            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
               <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Recipient / လက်ခံသူ</label>
               <input placeholder="Name" className="w-full bg-transparent font-bold text-[#0d2c54] outline-none" onChange={e => setForm({...form, recipient_name: e.target.value})} />
               <input placeholder="Phone" className="w-full bg-transparent font-bold text-[#0d2c54] mt-2 pt-2 border-t border-blue-100 outline-none" onChange={e => setForm({...form, recipient_phone: e.target.value})} />
               <textarea placeholder="Delivery Address" className="w-full bg-transparent font-bold text-[#0d2c54] mt-2 pt-2 border-t border-blue-100 outline-none" rows={2} onChange={e => setForm({...form, recipient_address: e.target.value})} />
            </div>
          </div>
        </div>

        {/* COLUMN 2: SPECS & RIDER REMARKS */}
        <div className="bg-white p-8 rounded-[40px] border shadow-sm space-y-6">
          <h3 className="text-[#0d2c54] font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 border-b pb-4">
            <Package size={18} className="text-amber-500" /> Specs / ကုန်ပစ္စည်း
          </h3>
          
          <div className="space-y-4">
             <input placeholder="Product Name" className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-[#0d2c54] border-none" onChange={e => setForm({...form, product_name: e.target.value})} />
             
             <div className="flex gap-4">
                <div className="flex-1 p-4 bg-slate-50 rounded-2xl">
                   <label className="text-[10px] font-black text-slate-400">WEIGHT (KG)</label>
                   <input type="number" className="w-full bg-transparent font-black text-[#0d2c54] outline-none" onChange={e => setForm({...form, product_weight: Number(e.target.value)})} />
                </div>
                <div className="flex-1 p-4 bg-slate-50 rounded-2xl">
                   <label className="text-[10px] font-black text-slate-400">QTY</label>
                   <input type="number" className="w-full bg-transparent font-black text-[#0d2c54] outline-none" onChange={e => setForm({...form, product_qty: Number(e.target.value)})} />
                </div>
             </div>

             <div className="pt-4">
               <h3 className="text-[#0d2c54] font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 border-b pb-4">
                 <ClipboardList size={18} className="text-slate-400" /> Rider Remark / မှတ်ချက်
               </h3>
               <textarea 
                 placeholder="Instructions for picking process..." 
                 className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-600 mt-2 outline-none border-none" 
                 rows={4}
                 onChange={e => setForm({...form, rider_remark: e.target.value})}
               />
             </div>
          </div>
        </div>

        {/* COLUMN 3: BILLING */}
        <div className="bg-[#0d2c54] p-8 rounded-[40px] shadow-2xl text-white space-y-6">
          <h3 className="text-[#ffd700] font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 border-b border-white/10 pb-4">
            <Banknote size={18} /> Billing / ငွေတောင်းခံလွှာ
          </h3>

          <div className="space-y-6">
             <select className="w-full p-4 bg-white/10 rounded-2xl font-black text-xs uppercase text-[#ffd700] outline-none border border-white/10" onChange={e => setForm({...form, payment_term: e.target.value})}>
                <option value="COD">Cash On Delivery (COD)</option>
                <option value="PREPAID">Prepaid (Merchant Paid)</option>
             </select>

             <div className="space-y-1">
                <label className="text-[10px] font-black text-white/40 uppercase">Delivery Fee</label>
                <input type="number" className="w-full bg-transparent border-b border-white/20 pb-2 font-black text-2xl text-[#ffd700] outline-none" onChange={e => setForm({...form, delivery_fee_mmks: Number(e.target.value)})} />
             </div>

             <div className="space-y-1">
                <label className="text-[10px] font-black text-white/40 uppercase">Extra Weight Surcharge</label>
                <input type="number" className="w-full bg-transparent border-b border-white/20 pb-2 font-black text-2xl text-white outline-none" onChange={e => setForm({...form, extra_weight_charges: Number(e.target.value)})} />
             </div>

             <div className="pt-8 border-t border-white/10">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total to Collect</p>
                <p className="text-5xl font-black text-[#ffd700]">{totalToCollect.toLocaleString()} <span className="text-sm font-normal text-white">MMK</span></p>
             </div>
          </div>
        </div>

      </div>

      <button disabled={loading} className="w-full bg-[#ffd700] text-[#0d2c54] py-6 rounded-[30px] font-black uppercase tracking-[0.3em] text-lg shadow-[0_20px_50px_rgba(255,215,0,0.3)] hover:scale-[1.01] transition-transform active:scale-95">
        {loading ? "Initializing..." : "Create Enterprise Waybill"}
      </button>
    </form>
  );
}
