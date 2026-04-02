"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed right-4 top-4 z-[9999]">
      <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-2 py-2 shadow-2xl">
        <Languages size={16} className="text-slate-500" />

        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={`rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wider transition ${
            language === "en"
              ? "bg-[#0d2c54] text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          EN
        </button>

        <button
          type="button"
          onClick={() => setLanguage("mm")}
          className={`rounded-xl px-3 py-2 text-xs font-black transition ${
            language === "mm"
              ? "bg-[#ffd700] text-[#0d2c54]"
              : "text-slate-600 hover:bg-slate-100"
          }`}
          style={{ fontFamily: "'Pyidaungsu', sans-serif" }}
        >
          မြန်မာ
        </button>
      </div>
    </div>
  );
}
