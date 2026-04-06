import React from "react";

export function ActionButton({
  children,
  tone = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary" | "danger";
}) {
  const styles =
    tone === "secondary"
      ? "border border-slate-200 bg-white text-slate-700"
      : tone === "danger"
      ? "bg-rose-600 text-white"
      : "bg-[#0d2c54] text-white";

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.16em] disabled:opacity-50 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
