"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Loader2, Mail, Lock, ChevronRight, KeyRound, Globe 
} from "lucide-react";

export default function SignInClient() {
  const router = useRouter();
  const supabase = createClient();
  
  const [identifier, setIdentifier] = useState(""); // Handles Email OR Smart ID
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // LOGIC: Map Smart ID (e.g., H-SADM-0001) to the registered email domain
    const loginEmail = identifier.includes("@") 
      ? identifier 
      : `${identifier.toLowerCase()}@britiumexpress.com`;

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (authError) {
      setError(authError.message || "Unauthorized access.");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleResetRequest = async () => {
    if (!identifier.includes("@")) {
      setError("Please enter your corporate email to initiate recovery.");
      return;
    }
    setLoading(true);
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(identifier, {
      redirectTo: "https://www.britiumexpress.app/auth/callback?next=/auth/must-change-password",
    });

    if (resetErr) {
      setError(resetErr.message);
    } else {
      setMessage("Recovery protocol active. Check your terminal inbox.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-card">
      <h1>BRITIUM <span className="text-indigo-400">EXPRESS</span></h1>
      <p className="subtitle text-[10px] uppercase tracking-widest text-slate-500">Security Gateway</p>
      
      <form onSubmit={handleSignIn} className="mt-8 space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="IDENTITY EMAIL OR SMART ID"
            className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="password"
            placeholder="ACCESS KEY"
            className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-rose-500 text-xs font-bold text-center">{error}</p>}
        {message && <p className="text-emerald-500 text-xs font-bold text-center">{message}</p>}

        <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <>Authorize <ChevronRight size={16} /></>}
        </button>

        <button type="button" onClick={handleResetRequest} className="w-full text-amber-500/60 hover:text-amber-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 mt-4">
          <KeyRound size={14} /> Recovery Protocol
        </button>
      </form>
    </div>
  );
}
