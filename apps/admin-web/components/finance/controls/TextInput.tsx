import React from "react";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-[#0d2c54] outline-none ${props.className || ""}`}
    />
  );
}
