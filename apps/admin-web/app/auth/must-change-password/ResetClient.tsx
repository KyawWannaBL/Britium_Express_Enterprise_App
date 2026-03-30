"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, Lock, CheckCircle2, Loader2, ArrowLeft, Globe } from "lucide-react";

export default function ResetClient() {
  const router = useRouter();
  const supabase = createClient();
  const [lang, setLang] = useState("en");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const t = (en: string, my: string) => (lang === "en" ? en : my);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setError(t("Passwords do not match", "စကားဝှက်များ မကိုက်ညီပါ။"));
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/auth/sign-in"), 2000);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#05080F] text-white p-4">
      <div className="relative z-20 w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
        <div className="text-center mb-8">
          <ShieldCheck className="mx-auto text-emerald-500 h-12 w-12 mb-4" />
          <h1 className="text-2xl font-black uppercase tracking-widest">{t("Security Update", "လုံခြုံရေး")}</h1>
        </div>
        {success ? (
          <div className="text-center py-4">
            <CheckCircle2 className="mx-auto text-emerald-500 h-12 w-12 mb-2" />
            <p>{t("Success! Redirecting...", "အောင်မြင်ပါသည်။")}</p>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            <input type="password" placeholder="NEW PASSWORD" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-4" required />
            <input type="password" placeholder="CONFIRM PASSWORD" value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-4" required />
            {error && <p className="text-rose-500 text-xs text-center">{error}</p>}
            <button className="w-full bg-emerald-600 py-4 rounded-xl font-bold uppercase tracking-widest">{loading ? <Loader2 className="animate-spin mx-auto" /> : "Update Password"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
