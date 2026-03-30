"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Loader2, ShieldCheck, ChevronRight, Fingerprint, 
  Download, UserPlus, KeyRound, Globe, Smartphone
} from "lucide-react";

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
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 bg-black overflow-hidden">
      {/* 🌌 Deep Space Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#1e1b4b_0%,#000000_100%)] z-0" />
      
      <div className="relative z-10 w-full max-w-lg">
        {/* Brand Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex p-1 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 shadow-[0_0_50px_rgba(99,102,241,0.3)]">
            <div className="bg-black rounded-full p-5">
              <ShieldCheck className="h-10 w-10 text-white" strokeWidth={1} />
            </div>
          </div>
          <h1 className="mt-8 text-5xl font-black tracking-tighter italic uppercase text-white">
            Britium <span className="font-light text-indigo-400">Express</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-slate-500 mt-2">Enterprise Console</p>
        </div>

        {/* 💎 Main Acrylic Panel */}
        <div className="acrylic-3d rounded-[3rem] p-10 relative overflow-hidden border border-white/10">
          <form onSubmit={handleSignIn} className="space-y-8 relative z-10">
            <div className="space-y-5">
              <input 
                type="text" placeholder="IDENTITY EMAIL OR SMART ID" 
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 text-sm font-bold tracking-widest uppercase outline-none focus:border-indigo-500 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]"
                value={id} onChange={e => setId(e.target.value)}
              />
              <input 
                type="password" placeholder="ACCESS KEY" 
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 text-sm font-bold tracking-widest uppercase outline-none focus:border-emerald-500 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]"
                value={pw} onChange={e => setPw(e.target.value)}
              />
            </div>

            {/* 🌊 Primary Authorization Button */}
            <button className="jelly-button relative w-full group overflow-hidden rounded-2xl bg-indigo-600 shadow-[0_10px_30px_rgba(79,70,229,0.4)]">
              <div className="relative py-5 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.4em]">
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    <Fingerprint size={18} className="text-emerald-400" />
                    <span>Initialize Authorization</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </div>
            </button>

            {/* 🛠 Utility Command Row: Sign Up & Recovery */}
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <button type="button" onClick={() => router.push('/auth/sign-up')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                <UserPlus size={14} /> Registration Node
              </button>
              <button type="button" onClick={() => router.push('/auth/recovery')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-400 transition-colors">
                <KeyRound size={14} /> Recovery Protocol
              </button>
            </div>
          </form>
        </div>

        {/* 📱 Mobile Terminal Download (3D Shape) */}
        <div className="mt-8">
          <button 
            onClick={() => window.open('/downloads/britium-express.apk')}
            className="jelly-button w-full acrylic-3d rounded-2xl py-4 flex items-center justify-center gap-3 group border border-emerald-500/20 hover:border-emerald-500/50 transition-all"
          >
            <Smartphone size={18} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 group-hover:text-emerald-300">
              Download Mobile Core (APK)
            </span>
            <Download size={14} className="text-emerald-500 animate-bounce" />
          </button>
        </div>

        {/* Footer Metadata */}
        <div className="mt-12 flex justify-between px-10 items-center opacity-30">
          <div className="flex items-center gap-2">
            <Globe size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Global Network</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest italic">Yangon Node 01</span>
        </div>
      </div>
    </div>
  );
}
