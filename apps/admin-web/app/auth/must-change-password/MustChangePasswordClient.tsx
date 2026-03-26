"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

function getEnv(name: string, fallback?: string) {
  const value =
    (typeof process !== "undefined" ? process.env[name] : undefined) ||
    (fallback && typeof process !== "undefined" ? process.env[fallback] : undefined);

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

const supabase = createClient(
  getEnv("NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL"),
  getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY")
);

export default function MustChangePasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPath = useMemo(() => {
    return searchParams.get("next") || "/create-delivery";
  }, [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      if (!password || password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      const response = await fetch("/api/auth/complete-password-change", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.error || "Failed to complete password change.");
        return;
      }

      setInfo("Password changed successfully.");
      router.replace(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.badge}>Britium Express Delivery</div>
          <h1 style={styles.title}>Change Your Password</h1>
          <p style={styles.subtitle}>
            You must set a new password before continuing to the operations console.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            <span>New Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              style={styles.input}
              required
            />
          </label>

          <label style={styles.label}>
            <span>Confirm Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              style={styles.input}
              required
            />
          </label>

          {error ? <div style={styles.error}>{error}</div> : null}
          {info ? <div style={styles.info}>{info}</div> : null}

          <button type="submit" style={styles.primaryButton} disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "24px",
    background:
      "linear-gradient(135deg, rgba(14,26,45,1) 0%, rgba(11,66,122,1) 45%, rgba(222,167,55,0.22) 100%)"
  },
  card: {
    width: "100%",
    maxWidth: "460px",
    background: "#ffffff",
    borderRadius: "24px",
    padding: "28px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.18)"
  },
  header: {
    marginBottom: "20px"
  },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#0b427a12",
    color: "#0b427a",
    fontSize: "12px",
    fontWeight: 700,
    marginBottom: "12px"
  },
  title: {
    margin: 0,
    fontSize: "28px",
    lineHeight: 1.2,
    color: "#0f172a"
  },
  subtitle: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#475569"
  },
  form: {
    display: "grid",
    gap: "14px"
  },
  label: {
    display: "grid",
    gap: "8px",
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: 600
  },
  input: {
    height: "46px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    padding: "0 14px",
    fontSize: "14px",
    outline: "none"
  },
  primaryButton: {
    height: "46px",
    borderRadius: "12px",
    border: "none",
    background: "#0b427a",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer"
  },
  error: {
    borderRadius: "12px",
    padding: "12px",
    background: "#fef2f2",
    color: "#b91c1c",
    fontSize: "14px"
  },
  info: {
    borderRadius: "12px",
    padding: "12px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: "14px"
  }
};
