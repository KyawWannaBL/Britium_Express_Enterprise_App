"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, Lock, Mail, AlertCircle } from "lucide-react";

export default function LoginPortal() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid credentials or unauthorized access.");
      setLoading(false);
      return;
    }

    // Fetch user role to determine routing
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const role = profile?.role || "GUEST";
    localStorage.setItem("britium_authority", role); // Cache for frontend UI checks

    // Route based on role
    if (role === "RID") router.push("/rider/portal");
    else if (role === "WH") router.push("/warehouse/portal");
    else if (role === "MER") router.push("/merchant/portal");
    else router.push("/dashboard"); // Default for SYS, SUP, MD, etc.
  };

  return (
    <div className="min-h-screen bg-[#0d2c54] flex items-center justify-center p-4 relative overflow-hidden" style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>
      {/* Background styling */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffd700_1px,transparent_1px)] [background-size:20px_20px]" />
      
      <div className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl z-10">
        <div className="text-center mb-10">
          <div className="mx-auto w-16 h-16 bg-[#0d2c54] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <ShieldCheck className="text-[#ffd700]" size={32} />
          </div>
          <h1 className="text-3xl font-black text-[#0d2c54] uppercase tracking-tighter italic">
            Britium <span className="text-blue-500 not-italic font-light">Express</span>
          </h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">
            Authorized Personnel Only
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 font-bold text-xs uppercase">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Network ID (Email)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-400" size={20} />
              <input 
                type="email"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none font-bold text-[#0d2c54] outline-none focus:ring-2 focus:ring-[#ffd700]"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Passcode</label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
              <input 
                type="password"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none font-bold text-[#0d2c54] outline-none focus:ring-2 focus:ring-[#ffd700]"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#0d2c54] text-[#ffd700] py-5 rounded-2xl font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(13,44,84,0.3)] hover:bg-blue-950 transition-colors mt-4"
          >
            {loading ? "Authenticating..." : "Initialize Session"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
           <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">System IP Logged & Monitored</p>
        </div>
      </div>
    </div>
  );
}
