"use client";

import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';
import { useState, useEffect } from 'react';

// i18n Initialization
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
 * UI components များအတွက် လိုအပ်သော custom hook
 * AdminChrome.tsx ရှိ Type error ကို ဖြေရှင်းရန် 't' ကိုပါ return ပြန်ပေးထားသည်
 */
export function useAppLanguage() {
  const { t } = useTranslation(); // translation function ကို ခေါ်ယူခြင်း
  const [lang, setLangState] = useState(i18n.language || 'en');

  // ဘာသာစကား ပြောင်းလဲရန် function
  const setLang = (newLang: string) => {
    i18n.changeLanguage(newLang);
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('i18nextLng', newLang);
    }
  };

  // component များတွင် 't' ကို အသုံးပြုနိုင်ရန် return ပြန်ပေးရမည်
  return { lang, setLang, t };
}

// Client-side provider export
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Client-side hydration error မတက်စေရန်
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <>{children}</>;

  return <>{children}</>;
}

export default i18n;