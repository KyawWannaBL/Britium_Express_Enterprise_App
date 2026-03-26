"use client";

import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';
import { useState, useEffect } from 'react';

// Supported Language Types
export type SupportedLanguages = 'en' | 'mm';

if (!i18n.isInitialized) {
  i18n
    .use(HttpApi)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      supportedLngs: ['en', 'mm'],
      debug: process.env.NODE_ENV === 'development',
      interpolation: { escapeValue: false },
      detection: {
        order: ['querystring', 'cookie', 'localStorage', 'navigator'],
        caches: ['localStorage', 'cookie'],
      },
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
    });
}

/**
 * Custom Hook for UI Components
 * TypeScript Error 't' does not exist ကို ဖြေရှင်းရန် t ကိုပါ return ပြန်ပေးသည်
 */
export function useAppLanguage() {
  const { t } = useTranslation();
  const [lang, setLangState] = useState<SupportedLanguages>(
    (i18n.language as SupportedLanguages) || 'en'
  );

  const setLang = (newLang: SupportedLanguages) => {
    i18n.changeLanguage(newLang);
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('i18nextLng', newLang);
    }
  };

  return { lang, setLang, t };
}

/**
 * Provider with Hydration Guard
 * Server နဲ့ Client ကြား UI မကိုက်ညီမှု (Mismatch) ကို တားဆီးပေးသည်
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ visibility: 'hidden' }}>{children}</div>;

  return <>{children}</>;
}

export default i18n;