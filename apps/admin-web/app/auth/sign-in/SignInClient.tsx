"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ShieldCheck, Zap, ChevronRight, Fingerprint } from "lucide-react";

export default function SignInClient() {
  const router = useRouter();
  const supabase = createClient();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const email = id.includes("@") ? id : `${id.toLowerCase()}@britiumexpress.com`;
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) { setLoading(false); } else { router.push("/dashboard"); }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 bg-black">
      {/* 🎥 Background Atmospheric Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#1e1b4b_0%,#000000_100%)] z-0" />
      
      <div className="relative z-10 w-full max-w-lg">
        {/* Floating Acrylic Logo Section */}
        <div className="mb-12 text-center animate-bounce-slow">
          <div className="inline-flex p-1 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 shadow-[0_0_40px_rgba(99,102,241,0.4)]">
            <div className="bg-black rounded-full p-6">
              <ShieldCheck className="h-12 w-12 text-white" strokeWidth={1} />
            </div>
          </div>
          <h1 className="mt-8 text-5xl font-black tracking-tighter italic uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
            Britium <span className="font-light text-indigo-400">Express</span>
          </h1>
        </div>

        {/* 💎 3D Acrylic Command Panel */}
        <div className="acrylic-3d rounded-[3rem] p-10 relative overflow-hidden group">
          {/* Edge Spectrum Lining */}
          <div className="absolute inset-0 border-2 border-transparent group-hover:spectrum-border opacity-30 transition-opacity" />

          <form onSubmit={handleSignIn} className="space-y-8 relative z-10">
            <div className="space-y-6">
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-2xl blur opacity-10 group-focus-within:opacity-40 transition" />
                <input 
                  type="text" placeholder="OPERATOR IDENTITY" 
                  className="relative w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold tracking-widest uppercase outline-none focus:border-indigo-500 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]"
                  value={id} onChange={e => setId(e.target.value)}
                />
              </div>

              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-2xl blur opacity-10 group-focus-within:opacity-40 transition" />
                <input 
                  type="password" placeholder="ENCRYPTION KEY" 
                  className="relative w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold tracking-widest uppercase outline-none focus:border-emerald-500 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]"
                  value={pw} onChange={e => setPw(e.target.value)}
                />
              </div>
            </div>

            {/* 🌊 The Jelly/Water 3D Command Button */}
            <button 
              className="jelly-button relative w-full group overflow-hidden rounded-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-emerald-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 shadow-[inset_0_4px_4px_rgba(255,255,255,0.3),inset_0_-4px_4px_rgba(0,0,0,0.3)]" />
              <div className="relative py-5 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.4em]">
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    <Fingerprint size={18} className="animate-pulse" />
                    <span>Initialize Authorization</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </div>
            </button>
          </form>
        </div>

        {/* Console Metadata */}
        <div className="mt-12 flex justify-between px-10 items-center opacity-40 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Protocol v4.0-Secure</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Yangon Hub Node</span>
        </div>
      </div>
    </div>
  );
}
