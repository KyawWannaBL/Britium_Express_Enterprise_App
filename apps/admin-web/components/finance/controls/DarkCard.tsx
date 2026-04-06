import React from "react";

export function DarkCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[28px] border border-slate-800 bg-slate-900 p-5 text-white shadow-lg ${className}`}>
      {children}
    </section>
  );
}
