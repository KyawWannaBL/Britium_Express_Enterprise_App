"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AppLang = "en" | "my";

type Ctx = {
  lang: AppLang;
  setLang: (lang: AppLang) => void;
  t: (en: string, my?: string) => string;
};

const LanguageContext = createContext<Ctx | null>(null);

function readInitialLang(): AppLang {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem("britium_lang");
  if (stored === "my") return "my";
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<AppLang>("en");

  useEffect(() => {
    setLangState(readInitialLang());
  }, []);

  const setLang = (next: AppLang) => {
    setLangState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("britium_lang", next);
      document.cookie = `britium_lang=${next}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = next === "my" ? "my" : "en";
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.lang = lang === "my" ? "my" : "en";
    }
  }, [lang]);

  const value = useMemo<Ctx>(() => ({
    lang,
    setLang,
    t: (en: string, my?: string) => (lang === "my" ? (my || en) : en)
  }), [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useAppLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useAppLanguage must be used inside LanguageProvider");
  }
  return ctx;
}
