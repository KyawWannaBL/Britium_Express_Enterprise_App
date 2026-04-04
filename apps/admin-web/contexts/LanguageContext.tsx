"use client";

import React, { createContext, useContext, useState } from "react";

type LanguageContextType = {
  lang: "en" | "mm" | "both";
  setLang: (lang: "en" | "mm" | "both") => void;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "both",
  setLang: () => {},
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<"en" | "mm" | "both">("both");

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);