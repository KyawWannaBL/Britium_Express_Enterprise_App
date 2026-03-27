"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import LanguageToggle from "@/app/_components/LanguageToggle";
import { resolveHomeByRole } from "@/lib/auth-redirect";
import { useAppLanguage } from "@/lib/i18n";
import { assertPublicEnv } from "@/lib/public-env";

// --- Types ---
type AuthStateResponse = {
  authenticated?: boolean;
  appRole?: string | null;
  role?: string | null;
  mustChangePassword?: boolean;
  fullName?: string | null;
  error?: string;
};

// --- Dictionary for State-of-the-art Localization ---
const dict = {
  en: {
    brand: "Britium Express",
    title: "Operator Sign In",
    subtitle: "Bago Region Logistics Control Center",
    email: "Email",
    password: "Password",
    role: "Role",
    signIn: "Sign In",
    signingIn: "Processing...",
    forgot: "Reset Password",
    rolePlaceholder: "Select Assigned Role",
    roleMismatch: "Access Denied: Role mismatch detected.",
    roles: {
      SUPER_ADMIN: "Super Admin",
      OPERATIONS_ADMIN: "Operations Admin",
      FINANCE_USER: "Finance User",
      STAFF: "Field Staff",
      DATA_ENTRY: "Data Entry Clerk"
    }
  },
  my: {
    brand: "Britium Express",
    title: "ဝန်ထမ်းဝင်ရောက်ရန်",
    subtitle: "ပဲခူးတိုင်းဒေသကြီး လောဂျစ်တစ်ထိန်းချုပ်ရေးစင်တာ",
    email: "အီးမေးလ်",
    password: "စကားဝှက်",
    role: "တာဝန်အမျိုးအစား",
    signIn: "ဝင်ရောက်မည်",
    signingIn: "လုပ်ဆောင်နေသည်...",
    forgot: "စကားဝှက်ပြင်ဆင်ရန်",
    rolePlaceholder: "တာဝန်အမျိုးအစား ရွေးပါ",
    roleMismatch: "ဝင်ရောက်ခွင့်မရှိပါ- ရွေးချယ်ထားသော Role မှားယွင်းနေပါသည်။",
    roles: {
      SUPER_ADMIN: "အထွေထွေအုပ်ချုပ်သူ",
      OPERATIONS_ADMIN: "အော်ပရေးရှင်းအုပ်ချုပ်သူ",
      FINANCE_USER: "ငွေစာရင်းအသုံးပြုသူ",
      STAFF: "နယ်မြေဆင်းဝန်ထမ်း",
      DATA_ENTRY: "ဒေတာထည့်သွင်းသူ"
    }
  }
};

const supabase = createClient(
  assertPublicEnv("NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL"),
  assertPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY")
);

export default function SignInClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useAppLanguage();

  // CRITICAL FIX: Explicit indexing to bypass Vercel build error
  const currentLang = (lang === 'my' ? 'my' : 'en') as keyof typeof dict;
  const t = dict[currentLang];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) throw authErr;

      const stateRes = await fetch("/api/auth/state", { credentials: "include" });
      const state = (await stateRes.json()) as AuthStateResponse;

      if (!state.authenticated) throw new Error(state.error || "Auth Failed");

      const actualRole = String(state.appRole || state.role || "").toUpperCase();
      if (selectedRole && actualRole !== selectedRole) {
        setError(t.roleMismatch);
        return;
      }

      router.replace(resolveHomeByRole(actualRole));
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
           <div style={styles.badge}>{t.brand}</div>
           <LanguageToggle />
        </div>
        <h1 style={styles.title}>{t.title}</h1>
        <p style={styles.subtitle}>{t.subtitle}</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input type="email" placeholder={t.email} value={email} onChange={e => setEmail(e.target.value)} style={styles.input} required />
          <input type="password" placeholder={t.password} value={password} onChange={e => setPassword(e.target.value)} style={styles.input} required />
          
          <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} style={styles.input} required>
            <option value="">{t.rolePlaceholder}</option>
            {Object.keys(t.roles).map(roleKey => (
              <option key={roleKey} value={roleKey}>
                {(t.roles as any)[roleKey]}
              </option>
            ))}
          </select>

          {error && <div style={styles.error}>{error}</div>}
          
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? t.signingIn : t.signIn}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", display: "grid", placeItems: "center", background: "#0f172a", padding: "20px" },
  card: { width: "100%", maxWidth: "450px", background: "#fff", padding: "40px", borderRadius: "20px", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: "20px" },
  badge: { padding: "4px 12px", background: "#e2e8f0", borderRadius: "100px", fontSize: "12px", fontWeight: "bold", color: "#1e293b" },
  title: { fontSize: "24px", fontWeight: "bold", color: "#0f172a", margin: "0 0 8px 0" },
  subtitle: { fontSize: "14px", color: "#64748b", margin: "0 0 24px 0" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" },
  button: { padding: "12px", borderRadius: "8px", background: "#2563eb", color: "#fff", fontWeight: "bold", cursor: "pointer", border: "none" },
  error: { padding: "10px", background: "#fef2f2", color: "#dc2626", borderRadius: "8px", fontSize: "13px" }
};