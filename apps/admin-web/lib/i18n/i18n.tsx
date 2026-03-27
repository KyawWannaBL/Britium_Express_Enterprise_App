"use client";

import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';
import { useState, useEffect, ReactNode } from 'react';

// i18n Initialization
if (!i18n.isInitialized) {
  i18n
    .use(HttpApi)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      supportedLngs: ['en', 'mm'],
      ns: ['translation'],
      defaultNS: 'translation',
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      interpolation: { escapeValue: false },
      detection: {
        order: ['querystring', 'cookie', 'localStorage', 'navigator'],
        caches: ['localStorage', 'cookie'],
      }
    });
}

/**
 * FIXED: Exporting LanguageProvider for layout.tsx
 * This resolves the "Export LanguageProvider doesn't exist" build error.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Client-side hydration mismatch ကို ကာကွယ်ရန်
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return <>{children}</>;
}

/**
 * Custom hook for components
 */
export function useAppLanguage() {
  const { t, i18n: i18nInstance } = useTranslation();
  
  const setLang = (newLang: string) => {
    i18nInstance.changeLanguage(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('i18nextLng', newLang);
    }
  };

  return {
    lang: i18nInstance.language,
    setLang,
    t
  };
}

export default i18n;