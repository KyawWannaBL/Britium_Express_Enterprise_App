import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';
import { useState, useEffect } from 'react';

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

// UI components များအတွက် လိုအပ်သော hook
export function useAppLanguage() {
  const [lang, setLangState] = useState(i18n.language || 'en');

  const setLang = (newLang: string) => {
    i18n.changeLanguage(newLang);
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('i18nextLng', newLang);
    }
  };

  return { lang, setLang };
}

// Client-side provider export
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default i18n;