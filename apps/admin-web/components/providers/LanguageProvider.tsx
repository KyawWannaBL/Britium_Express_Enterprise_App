"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AppLanguage = "en" | "mm";

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  toggleLanguage: () => void;
  t: (en: string, mm: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("app-language");
    if (saved === "en" || saved === "mm") setLanguageState(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("app-language", language);
    document.documentElement.lang = language === "mm" ? "my" : "en";
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: setLanguageState,
      toggleLanguage: () => setLanguageState((prev) => (prev === "en" ? "mm" : "en")),
      t: (en: string, mm: string) => (language === "mm" ? mm : en),
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
