import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// ... i18n init logic ...

// Named export အား ထည့်သွင်းခြင်း
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default i18n;