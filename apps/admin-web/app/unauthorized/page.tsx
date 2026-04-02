"use client";
import { Ban, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>
      <div className="max-w-lg w-full text-center space-y-6">
        <Ban size={100} className="mx-auto text-rose-500" />
        <h1 className="text-5xl font-black text-[#0d2c54] uppercase tracking-tighter italic">Access <span className="text-rose-500 not-italic font-light">Denied</span></h1>
        <div className="bg-white p-6 rounded-3xl border shadow-sm text-left inline-block">
           <p className="font-mono text-sm text-slate-500">ERROR_CODE: <span className="font-black text-rose-600">403_FORBIDDEN</span></p>
           <p className="font-mono text-sm text-slate-500">REASON: <span className="font-bold">Clearance level insufficient for requested sector.</span></p>
        </div>
        <br/>
        <Link href="/dashboard" className="inline-flex items-center gap-3 bg-[#0d2c54] text-[#ffd700] px-8 py-4 rounded-2xl font-black uppercase tracking-widest mt-4">
           <ShieldCheck size={20}/> Return to Safety
        </Link>
      </div>
    </div>
  );
}
