import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi) // ပြင်ပ JSON ဖိုင်များမှ ဘာသာပြန်ချက်များကို load လုပ်ရန်
  .use(LanguageDetector) // Browser language သို့မဟုတ် LocalStorage ကို စစ်ဆေးရန်
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'mm'],
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
// Client-side provider ကို export လုပ်ပေးရန်လိုအပ်သည်
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
  });
export default i18n;