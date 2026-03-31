"use client"
import React from "react";
import { Package, Users, TrendingUp, Map, Activity, Bell } from "lucide-react";

const Card = ({ title, value, icon: Icon, trend }: any) => (
  <div className="acrylic-3d rounded-[2rem] p-8 border border-white/5 hover:border-indigo-500/30 transition-all duration-500">
    <div className="flex justify-between items-start mb-6">
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10"><Icon className="text-indigo-400" size={24} /></div>
      <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest">{trend}</span>
    </div>
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">{title}</p>
    <h3 className="text-3xl font-black tracking-tighter uppercase">{value}</h3>
  </div>
);

export default function DashboardClient() {
  return (
    <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tighter uppercase italic">Command <span className="text-indigo-400 font-light">Center</span></h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] mt-2 text-white">Britium Express Global Operations</p>
        </div>
        <div className="acrylic-3d rounded-2xl px-6 py-3 flex items-center gap-3 border border-white/10">
          <Activity className="text-emerald-500 animate-pulse" size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest text-white">Network Live</span>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card title="Active Shipments" value="1,284" icon={Package} trend="+12% Active" />
        <Card title="Operational Staff" value="137" icon={Users} trend="Online" />
        <Card title="Daily Revenue" value="4.2M MMK" icon={TrendingUp} trend="+8% Growth" />
      </div>
      <div className="acrylic-3d rounded-[3rem] p-10 border border-white/5 h-64 flex items-center justify-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-600">Initializing Satellite Telemetry...</p>
      </div>
    </div>
  );
}
