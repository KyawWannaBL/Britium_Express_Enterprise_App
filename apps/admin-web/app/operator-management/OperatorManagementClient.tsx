"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserPlus, Shield, MapPin, Search, Trash2, Languages } from "lucide-react";

export default function OperatorManagementClient() {
  const supabase = createClient();
  const [lang, setLang] = useState<"en" | "mm">("mm");
  const [operators, setOperators] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStaff() {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (data) setOperators(data);
    }
    fetchStaff();
  }, []);

  const t = {
    en: { add: "Add Operator", table: ["NAME", "ROLE", "BRANCH", "STATUS"], search: "Search staff..." },
    mm: { add: "ဝန်ထမ်းအသစ်ထည့်ရန်", table: ["အမည်", "ရာထူး", "ဌာနခွဲ", "အခြေအနေ"], search: "ဝန်ထမ်းရှာဖွေရန်..." }
  }[lang];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-[30px] border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3 text-slate-300" size={20} />
          <input placeholder={t.search} className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setLang(lang === 'en' ? 'mm' : 'en')} className="px-4 py-3 bg-slate-100 rounded-2xl font-black text-xs text-[#0d2c54] flex items-center gap-2">
            <Languages size={16}/> {lang === 'en' ? 'မြန်မာ' : 'EN'}
          </button>
          <button className="bg-[#0d2c54] text-[#ffd700] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg">
            <UserPlus size={18}/> {t.add}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <th className="p-6">{t.table[0]}</th>
              <th className="p-6">{t.table[1]}</th>
              <th className="p-6">{t.table[2]}</th>
              <th className="p-6">{t.table[3]}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {operators.map((op) => (
              <tr key={op.id} className="hover:bg-slate-50 transition-colors group">
                <td className="p-6 font-black text-[#0d2c54]">{op.full_name || op.email}</td>
                <td className="p-6">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase ring-1 ring-blue-200">
                    {op.role}
                  </span>
                </td>
                <td className="p-6 text-slate-500 text-sm font-bold flex items-center gap-2">
                   <MapPin size={14} className="text-slate-300"/> {op.branch_code || 'Unassigned'}
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase">Active</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
