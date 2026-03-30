"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Loader2, Mail, Lock, ChevronRight, KeyRound, Globe, ShieldCheck 
} from "lucide-react";

export default function SignInClient() {
  const router = useRouter();
  const supabase = createClient();
  
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const loginEmail = identifier.includes("@") 
      ? identifier 
      : `${identifier.toLowerCase()}@britiumexpress.com`;

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (authError) {
      setError("Authorization Failed: Invalid Credentials");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 font-sans antialiased text-white">
      {/* 🎥 Background Layer: Deep Radial Glow */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_20%,#1e293b_0%,#020617_100%)] z-0" />
      <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-950/20 via-transparent to-emerald-950/20 backdrop-blur-[2px] z-10" />

      <div className="relative z-20 flex min-h-screen flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Brand Identity */}
          <div className="mb-12 flex flex-col items-center text-center">
            <div className="mb-6 rounded-[2.2rem] bg-white p-5 shadow-[0_0_60px_rgba(255,255,255,0.1)] ring-1 ring-white/20 transition-transform hover:scale-105 duration-500">
              <ShieldCheck className="text-indigo-600 h-12 w-12" strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase sm:text-5xl drop-shadow-2xl">
              Britium <span className="text-indigo-400 italic font-light">Express</span>
            </h1>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.6em] text-slate-500">
              Enterprise Security Gateway
            </p>
          </div>

          {/* Interaction Card (Glassmorphism) */}
          <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-[0_30px_100px_-15px_rgba(0,0,0,0.8)] backdrop-blur-3xl lg:p-10 ring-1 ring-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="text"
                    required
                    placeholder="IDENTITY EMAIL OR SMART ID"
                    className="w-full rounded-2xl border border-white/5 bg-black/40 pl-12 pr-5 py-4 text-sm font-semibold text-white outline-none transition-all placeholder:text-slate-700 focus:border-indigo-500/40 focus:bg-black/60"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="password"
                    required
                    placeholder="ACCESS KEY"
                    className="w-full rounded-2xl border border-white/5 bg-black/40 pl-12 pr-5 py-4 text-sm font-semibold text-white outline-none transition-all placeholder:text-slate-700 focus:border-indigo-500/40 focus:bg-black/60"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && <p className="text-rose-400 text-[10px] font-black text-center uppercase tracking-widest">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="group w-full flex items-center justify-center rounded-2xl bg-indigo-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-2xl shadow-indigo-900/40 transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    Authorize Entry
                    <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <button 
                type="button"
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors"
              >
                <KeyRound size={14} /> Recovery Protocol
              </button>
            </form>
          </div>

          {/* Footer Utilities */}
          <div className="mt-12 flex items-center justify-between px-6 opacity-30 hover:opacity-100 transition-opacity duration-500">
            <button className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.3em]">
              <Globe size={14} /> <span>Language</span>
            </button>
            <span className="text-[10px] font-bold uppercase tracking-widest">v2.4.4-PRO</span>
          </div>
        </div>
      </div>
    </div>
  );
}
