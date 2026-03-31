"use client"
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Package, Map, 
  BarChart3, Users, LogOut, ShieldCheck 
} from "lucide-react";

const NavItem = ({ href, icon: Icon, label }: any) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className="group block">
      <div className={`
        jelly-button flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500
        ${isActive 
          ? 'acrylic-3d border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
          : 'hover:bg-white/5 border border-transparent'}
      `}>
        <Icon className={`
          transition-colors duration-500
          ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-white'}
        `} size={20} />
        <span className={`
          text-[11px] font-black uppercase tracking-[0.2em] transition-colors
          ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}
        `}>
          {label}
        </span>
        {isActive && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
        )}
      </div>
    </Link>
  );
};

export default function Sidebar() {
  return (
    <aside className="w-80 h-screen flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-3xl sticky top-0">
      {/* Brand Header */}
      <div className="p-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <ShieldCheck className="text-indigo-400" size={20} />
          </div>
          <h1 className="text-xl font-black tracking-tighter italic uppercase text-white">
            Britium <span className="font-light text-indigo-400">Express</span>
          </h1>
        </div>
        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.4em] ml-12">
          Enterprise Console
        </p>
      </div>

      {/* Navigation Nodes */}
      <nav className="flex-1 px-6 space-y-2 mt-4">
        <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <NavItem href="/create-delivery" icon={Package} label="Create Delivery" />
        <NavItem href="/way-management" icon={Map} label="Way Management" />
        <NavItem href="/financial-reports" icon={BarChart3} label="Financial Reports" />
        <NavItem href="/operator-management" icon={Users} label="Operator Management" />
      </nav>

      {/* Footer Node */}
      <div className="p-8 border-t border-white/5">
        <button className="jelly-button w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 transition-all group">
          <LogOut className="text-rose-500/50 group-hover:text-rose-500" size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-500/50 group-hover:text-rose-500">
            Terminate Session
          </span>
        </button>
      </div>
    </aside>
  );
}
