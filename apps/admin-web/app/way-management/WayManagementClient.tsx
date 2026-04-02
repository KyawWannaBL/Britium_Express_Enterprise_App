"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, XCircle, RefreshCcw, Truck, Search } from "lucide-react";

export default function WayManagementClient() {
  const supabase = createClient();
  const [shipments, setShipments] = useState<any[]>([]);
  const [tab, setTab] = useState<"all" | "success" | "failed" | "returned">("all");

  useEffect(() => {
    async function getData() {
      const { data } = await supabase.from('shipments').select('*').order('created_at', { ascending: false });
      if (data) setShipments(data);
    }
    getData();
  }, []);

  const filtered = shipments.filter(s => {
    if (tab === 'all') return true;
    return s.status === tab;
  });

  const stats = {
    total: shipments.length,
    success: shipments.filter(s => s.status === 'success').length,
    failed: shipments.filter(s => s.status === 'failed').length,
    returned: shipments.filter(s => s.status === 'returned').length,
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>
      
      {/* SEPARATED SCREENS (TABS) */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { id: 'all', label: 'All Ways', count: stats.total, icon: Truck, color: 'bg-slate-800' },
          { id: 'success', label: 'Success', count: stats.success, icon: CheckCircle, color: 'bg-emerald-600' },
          { id: 'failed', label: 'Failures', count: stats.failed, icon: XCircle, color: 'bg-rose-600' },
          { id: 'returned', label: 'Returns', count: stats.returned, icon: RefreshCcw, color: 'bg-amber-600' },
        ].map((item) => (
          <button key={item.id} onClick={() => setTab(item.id as any)} 
            className={`p-6 rounded-3xl text-white transition-all ${tab === item.id ? item.color + ' ring-4 ring-offset-2' : 'bg-slate-400 opacity-60 hover:opacity-100'}`}>
            <item.icon size={24} className="mb-2" />
            <p className="text-[10px] font-black uppercase opacity-80">{item.label}</p>
            <p className="text-3xl font-black">{item.count}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
            <tr>
              <th className="p-4">Tracking</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total Collectable</th>
              <th className="p-4">Rider Remarks</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filtered.map(s => (
              <tr key={s.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="p-4 font-mono font-bold text-[#0d2c54]">{s.tracking_number}</td>
                <td className="p-4 font-bold">{s.recipient_name}</td>
                <td className="p-4 font-black text-emerald-600">{Number(s.total_collectable_amount).toLocaleString()} MMK</td>
                <td className="p-4 text-slate-400 italic">{s.rider_remark || "No comments..."}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
