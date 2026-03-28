"use client";

import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

// 1. We moved the main logic into a sub-component so we can wrap it in Suspense
function PasswordForm() {
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => searchParams.get("next") || "/create-delivery", [searchParams]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRules, setShowRules] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  function validatePassword(value: string) {
    if (value.length < 10) return "Password must be at least 10 characters.";
    if (!/[A-Z]/.test(value)) return "Password must include an uppercase letter.";
    if (!/[a-z]/.test(value)) return "Password must include a lowercase letter.";
    if (!/[0-9]/.test(value)) return "Password must include a number.";
    if (!/[^A-Za-z0-9]/.test(value)) return "Password must include a special character.";
    return "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    const ruleError = validatePassword(password);
    if (ruleError) {
      setError(ruleError);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("New password and confirm password do not match.");
      setLoading(false);
      return;
    }

    if (currentPassword && currentPassword === password) {
      setError("New password must be different from the current password.");
      setLoading(false);
      return;
    }

    try {
      // 2. Direct initialization of the new SSR client
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      const response = await fetch("/api/auth/complete-password-change", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Unable to complete password-change flow.");
      }

      setInfo("Password changed successfully. Redirecting to operations console...");
      
      // 3. Hard-navigation to completely clear the cache so the Middleware 
      // recognizes your account is unlocked!
      window.location.href = nextPath;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update password.");
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <section className="card" style={{ width: "min(860px, 100%)", padding: 32 }}>
        <div className="kicker">Britium Security Gate / စကားဝှက် ပြောင်းရန် လိုအပ်သည်</div>
        <h1 className="hero-title" style={{ fontSize: 34 }}>Must Change Password</h1>
        <p className="hero-copy" style={{ maxWidth: "none" }}>
          Your operator account is flagged to change the initial password before using Create Delivery, Way Management, and financial operations.
        </p>

        <div className="grid" style={{ gap: 16, gridTemplateColumns: "1.2fr 0.8fr", marginTop: 24 }}>
          <form className="stack" onSubmit={handleSubmit}>
            <label className="field">
              <span className="field-label">Current Password / လက်ရှိ စကားဝှက်</span>
              <input className="input" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
            </label>

            <label className="field">
              <span className="field-label">New Password / စကားဝှက်အသစ်</span>
              <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </label>

            <label className="field">
              <span className="field-label">Confirm Password / စကားဝှက်အတည်ပြု</span>
              <input className="input" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
            </label>

            {error ? <p style={{ color: "#fca5a5", margin: 0 }}>{error}</p> : null}
            {info ? <p style={{ color: "#86efac", margin: 0 }}>{info}</p> : null}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 10 }}>
              <button className="button button-primary" type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Password / ပြောင်းမည်"}
              </button>
              <button
                className="button"
                type="button"
                onClick={() => setShowRules((value) => !value)}
              >
                {showRules ? "Hide Rules" : "Show Rules"}
              </button>
            </div>
          </form>

          <aside className="card" style={{ padding: 20, background: "rgba(10, 18, 34, 0.95)" }}>
            <div className="kicker">Password Policy / မူဝါဒ</div>
            {showRules ? (
              <ul style={{ paddingLeft: 18, lineHeight: 1.8, color: "#cbd5e1" }}>
                <li>Minimum 10 characters</li>
                <li>Include uppercase and lowercase letters</li>
                <li>Include at least one number</li>
                <li>Include at least one special character</li>
                <li>Do not reuse the starter password</li>
              </ul>
            ) : (
              <p style={{ color: "#94a3b8" }}>Rules hidden.</p>
            )}

            <div className="card" style={{ marginTop: 16, padding: 16, background: "rgba(15, 23, 42, 0.9)" }}>
              <strong style={{ display: "block", marginBottom: 8 }}>Next step</strong>
              <span style={{ color: "#cbd5e1" }}>
                After password update, the system clears the must-change-password flag and sends you back to the operational screen.
              </span>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

// 4. This acts as the safety net for useSearchParams
export default function MustChangePasswordPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>Loading...</main>}>
      <PasswordForm />
    </Suspense>
  );
}