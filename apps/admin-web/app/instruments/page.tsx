"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import LanguageToggle from "@/app/_components/LanguageToggle";
import { resolveHomeByRole } from "@/lib/auth-redirect";
import { useAppLanguage } from "@/lib/i18n";
import { assertPublicEnv } from "@/lib/public-env";

type AuthStateResponse = {
  authenticated?: boolean;
  appRole?: string | null;
  role?: string | null;
  mustChangePassword?: boolean;
  fullName?: string | null;
  error?: string;
};

const supabase = createClient(
  assertPublicEnv("NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL"),
  assertPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY")
);

const dict = {
  en: {
    brand: "Britium Express Delivery",
    title: "Operator Sign In",
    subtitle: "Sign in to continue to the operations console.",
    email: "Email",
    password: "Password",
    role: "Role",
    signIn: "Sign In",
    signingIn: "Signing in...",
    forgot: "Send reset email",
    emailPlaceholder: "admin@britiumexpress.com",
    passwordPlaceholder: "Enter your password",
    rolePlaceholder: "Select role",
    resetSent: "Password reset email sent.",
    roleMismatch: "Role mismatch detected.",
    roles: {
      SUPER_ADMIN: "Super Admin",
      APP_OWNER: "App Owner",
      OPERATIONS_ADMIN: "Operations Admin",
      FINANCE_USER: "Finance User",
      FINANCE_STAFF: "Finance Staff",
      CUSTOMER_SERVICE: "Customer Service",
      SUPERVISOR: "Supervisor",
      WAREHOUSE_MANAGER: "Warehouse Manager",
      SUBSTATION_MANAGER: "Substation Manager",
      STAFF: "Staff",
      DATA_ENTRY: "Data Entry"
    }
  },
  my: {
    brand: "Britium Express Delivery",
    title: "ဝန်ထမ်းဝင်ရောက်ရန်",
    subtitle: "လုပ်ငန်းစနစ်ကို ဆက်လက်အသုံးပြုရန် ဝင်ရောက်ပါ။",
    email: "အီးမေးလ်",
    password: "စကားဝှက်",
    role: "တာဝန်အမျိုးအစား",
    signIn: "ဝင်ရောက်မည်",
    signingIn: "ဝင်ရောက်နေသည်...",
    forgot: "စကားဝှက်ပြန်လည်သတ်မှတ်ရန် အီးမေးလ်ပို့မည်",
    emailPlaceholder: "admin@britiumexpress.com",
    passwordPlaceholder: "စကားဝှက်ထည့်ပါ",
    rolePlaceholder: "တာဝန်အမျိုးအစား ရွေးပါ",
    resetSent: "အီးမေးလ်ပို့ပြီးပါပြီ။",
    roleMismatch: "ရွေးထားသော role နှင့် သင့်အမှန်တကယ် role မကိုက်ညီပါ။",
    roles: {
      SUPER_ADMIN: "အထွေထွေအုပ်ချုပ်သူ",
      APP_OWNER: "စနစ်ပိုင်ရှင်",
      OPERATIONS_ADMIN: "အော်ပရေးရှင်းအုပ်ချုပ်သူ",
      FINANCE_USER: "ငွေစာရင်းအသုံးပြုသူ",
      FINANCE_STAFF: "ငွေစာရင်းဝန်ထမ်း",
      CUSTOMER_SERVICE: "ဖောက်သည်ဝန်ဆောင်မှု",
      SUPERVISOR: "ကြီးကြပ်ရေးမှူး",
      WAREHOUSE_MANAGER: "ဂိုဒေါင်မန်နေဂျာ",
      SUBSTATION_MANAGER: "ဌာနခွဲမန်နေဂျာ",
      STAFF: "ဝန်ထမ်း",
      DATA_ENTRY: "ဒေတာထည့်သွင်းသူ"
    }
  }
};

const roleOptions = [
  "SUPER_ADMIN", "APP_OWNER", "OPERATIONS_ADMIN", "FINANCE_USER",
  "FINANCE_STAFF", "CUSTOMER_SERVICE", "SUPERVISOR", "WAREHOUSE_MANAGER",
  "SUBSTATION_MANAGER", "STAFF", "DATA_ENTRY"
] as const;

export default function SignInClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useAppLanguage();
  
  // FIXED: Explicit type casting for TypeScript build
  const t = dict[lang as keyof typeof dict];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const nextPath = useMemo(() => {
    return searchParams.get("next") || "/create-delivery";
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const stateRes = await fetch("/api/auth/state", { credentials: "include" });
      const state = (await stateRes.json().catch(() => ({}))) as AuthStateResponse;

      if (!stateRes.ok || !state.authenticated) {
        setError(state.error || "Unable to resolve account role.");
        return;
      }

      if (state.mustChangePassword) {
        router.replace(`/auth/must-change-password?next=${encodeURIComponent(nextPath)}`);
        return;
      }

      const actualRole = String(state.appRole || state.role || "").toUpperCase();
      if (selectedRole && actualRole !== selectedRole) {
        setError(t.roleMismatch);
        return;
      }

      router.replace(searchParams.get("next") || resolveHomeByRole(actualRole));
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  // UI markup remains same as your previous working structure...
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.topRow}>
          <div>
            <div style={styles.badge}>{t.brand}</div>
            <h1 style={styles.title}>{t.title}</h1>
            <p style={styles.subtitle}>{t.subtitle}</p>
          </div>
          <LanguageToggle />
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            <span>{t.email}</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.emailPlaceholder} style={styles.input} required />
          </label>
          <label style={styles.label}>
            <span>{t.password}</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.passwordPlaceholder} style={styles.input} required />
          </label>
          <label style={styles.label}>
            <span>{t.role}</span>
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} style={styles.input} required>
              <option value="">{t.rolePlaceholder}</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>{t.roles[role as keyof typeof t.roles]}</option>
              ))}
            </select>
          </label>

          {error && <div style={styles.error}>{error}</div>}
          {info && <div style={styles.info}>{info}</div>}

          <button type="submit" style={styles.primaryButton} disabled={loading}>
            {loading ? t.signingIn : t.signIn}
          </button>
        </form>
      </div>
    </div>
  );
}

// Styles object as previously provided...
const styles: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px", background: "linear-gradient(135deg, #0e1a2d 0%, #0b427a 45%, rgba(222,167,55,0.2) 100%)" },
    card: { width: "100%", maxWidth: "520px", background: "#fff", borderRadius: "24px", padding: "28px", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" },
    topRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" },
    badge: { display: "inline-block", padding: "6px 10px", borderRadius: "999px", background: "#0b427a12", color: "#0b427a", fontSize: "12px", fontWeight: 700, marginBottom: "12px" },
    title: { margin: 0, fontSize: "28px", color: "#0f172a" },
    subtitle: { marginTop: "8px", color: "#475569" },
    form: { display: "grid", gap: "14px" },
    label: { display: "grid", gap: "8px", color: "#0f172a", fontSize: "14px", fontWeight: 600 },
    input: { height: "46px", borderRadius: "12px", border: "1px solid #cbd5e1", padding: "0 14px", fontSize: "14px" },
    primaryButton: { height: "46px", borderRadius: "12px", border: "none", background: "#0b427a", color: "#fff", fontWeight: 700, cursor: "pointer" },
    error: { borderRadius: "12px", padding: "12px", background: "#fef2f2", color: "#b91c1c", fontSize: "14px" },
    info: { borderRadius: "12px", padding: "12px", background: "#eff6ff", color: "#1d4ed8", fontSize: "14px" }
};