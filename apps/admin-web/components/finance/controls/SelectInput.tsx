import React from "react";

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-[#0d2c54] outline-none ${props.className || ""}`}
    />
  );
}
