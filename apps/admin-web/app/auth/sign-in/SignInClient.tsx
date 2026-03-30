"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, Lock, ChevronRight, KeyRound, Globe, ShieldCheck } from "lucide-react";

export default function SignInClient() {
  const router = useRouter();
  const supabase = createClient();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const email = id.includes("@") ? id : `${id.toLowerCase()}@britiumexpress.com`;
    const { error: err } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (err) { setError("Access Denied"); setLoading(false); }
    else { router.push("/dashboard"); router.refresh(); }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_20%,#1e293b_0%,#020617_100%)] z-0" />
      <div className="relative z-20 w-full max-w-md">
        <div className="mb-12 text-center">
          <div className="inline-block mb-6 rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-white/20"><ShieldCheck className="text-indigo-600 h-10 w-10" /></div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Britium <span className="text-indigo-400 italic font-light">Express</span></h1>
        </div>
        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-3xl ring-1 ring-white/5 relative overflow-hidden">
          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-4">
              <div className="relative"><Mail size={18} className="absolute left-4 top-4 text-slate-500" /><input type="text" placeholder="IDENTITY EMAIL OR SMART ID" className="w-full rounded-2xl border border-white/5 bg-black/40 pl-12 pr-4 py-4 text-sm font-semibold outline-none focus:border-indigo-500/40" value={id} onChange={e => setId(e.target.value)} /></div>
              <div className="relative"><Lock size={18} className="absolute left-4 top-4 text-slate-500" /><input type="password" placeholder="ACCESS KEY" className="w-full rounded-2xl border border-white/5 bg-black/40 pl-12 pr-4 py-4 text-sm font-semibold outline-none focus:border-indigo-500/40" value={pw} onChange={e => setPw(e.target.value)} /></div>
            </div>
            {error && <p className="text-rose-400 text-[10px] font-black text-center uppercase">{error}</p>}
            <button className="w-full bg-indigo-600 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-500 transition-all">{loading ? <Loader2 className="animate-spin mx-auto" /> : "Authorize Entry"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
