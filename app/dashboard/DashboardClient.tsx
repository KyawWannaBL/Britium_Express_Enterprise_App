"use client"
import React from "react";
import { 
  Package, Users, TrendingUp, Map, 
  Activity, Bell, Settings, Search 
} from "lucide-react";

const StatCard = ({ title, value, icon: Icon, trend }: any) => (
  <div className="acrylic-3d rounded-[2rem] p-8 border border-white/5 group hover:border-indigo-500/30 transition-all duration-500">
    <div className="flex justify-between items-start mb-6">
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all">
        <Icon className="text-slate-400 group-hover:text-indigo-400" size={24} />
      </div>
      <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest">
        {trend}
      </span>
    </div>
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">{title}</p>
    <h3 className="text-3xl font-black tracking-tighter uppercase">{value}</h3>
  </div>
);

export default function DashboardClient() {
  return (
    <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tighter uppercase italic">
            Command <span className="text-indigo-400 font-light">Center</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] mt-2">
            Britium Express Global Operations
          </p>
        </div>
        <div className="flex gap-4">
          <div className="acrylic-3d rounded-2xl px-6 py-3 flex items-center gap-3 border border-white/10">
            <Activity className="text-emerald-500 animate-pulse" size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Network Live</span>
          </div>
        </div>
      </header>

      {/* Primary Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <StatCard title="Active Shipments" value="1,284" icon={Package} trend="+12% Active" />
        <StatCard title="Operational Staff" value="137" icon={Users} trend="Online" />
        <StatCard title="Daily Revenue" value="4.2M MMK" icon={TrendingUp} trend="+8% Growth" />
      </div>

      {/* Main Operations Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 acrylic-3d rounded-[3rem] p-10 border border-white/5 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Map size={20} className="text-indigo-400" /> Waybill Traffic
            </h3>
            <button className="jelly-button bg-white/5 border border-white/10 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
              View Map
            </button>
          </div>
          <div className="h-[300px] w-full rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e1b4b_0%,transparent_70%)] opacity-20" />
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-600">Initializing Satellite Telemetry...</p>
          </div>
        </div>

        {/* System Logs / Notifications */}
        <div className="acrylic-3d rounded-[3rem] p-10 border border-white/5">
          <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
            <Bell size={20} className="text-emerald-400" /> Intelligence
          </h3>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/20 transition-all group">
                <div className="h-2 w-2 rounded-full bg-indigo-500 mt-1 shadow-[0_0_10px_#6366f1]" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide">YGN-MDY Route Cleared</p>
                  <p className="text-[9px] text-slate-500 uppercase mt-1">2 mins ago • Hub Node 01</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
