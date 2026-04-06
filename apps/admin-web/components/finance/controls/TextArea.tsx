import React from "react";

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-[#0d2c54] outline-none ${props.className || ""}`}
    />
  );
}
