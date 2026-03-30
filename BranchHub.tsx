"use client"

import React from "react";
import { 
  ArrowUpRight, ArrowDownLeft, Package, Users, 
  MapPin, Activity, Zap, Shield 
} from "lucide-react";

const HubCard = ({ title, location, shipments, staff, status, color }: any) => (
  <div className="group relative rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-3xl ring-1 ring-white/5 transition-all duration-500 hover:bg-white/10">
    {/* Status Glow Accent */}
    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 rounded-b-full bg-${color}-500/50 shadow-[0_0_20px_rgba(var(--${color}-500),0.5)]`} />
    
    <div className="flex justify-between items-start mb-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <MapPin size={14} className="text-slate-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{location}</span>
        </div>
        <h3 className="text-2xl font-black tracking-tighter uppercase">{title}</h3>
      </div>
      <div className={`rounded-xl bg-${color}-500/10 p-3 border border-${color}-500/20 text-${color}-400`}>
        <Activity size={20} />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-1">
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Shipments</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black">{shipments}</span>
          <ArrowUpRight size={14} className="text-emerald-500" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">On-Duty Staff</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black">{staff}</span>
          <Users size={14} className="text-indigo-400" />
        </div>
      </div>
    </div>

    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
      <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <Shield size={12} className="text-emerald-500" /> System: {status}
      </span>
      <button className="text-[10px] font-black text-indigo-400 hover:text-white uppercase tracking-widest transition-colors">
        Enter Terminal →
      </button>
    </div>
  </div>
);

export default function BranchHub() {
  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tighter uppercase">Network <span className="text-indigo-400">Overview</span></h2>
          <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">Live Hub Synchronization</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
            <Zap size={14} className="text-emerald-400" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">System Latency: 14ms</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <HubCard 
          title="Yangon Central" 
          location="Hantharwaddy Terminal" 
          shipments="842" 
          staff="74" 
          status="Secured"
          color="indigo"
        />
        <HubCard 
          title="Mandalay Hub" 
          location="Chan Mya Thar Zi" 
          shipments="529" 
          staff="61" 
          status="Active"
          color="emerald"
        />
      </div>

      {/* Global Traffic Indicator */}
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-3xl overflow-hidden relative">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <Package className="text-slate-500" />
            <p className="text-xs font-bold uppercase tracking-widest">Main Arterial Traffic (YGN ↔ MDY)</p>
          </div>
          <div className="h-2 w-64 bg-slate-900 rounded-full overflow-hidden border border-white/5">
            <div className="h-full w-2/3 bg-gradient-to-r from-indigo-500 to-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
