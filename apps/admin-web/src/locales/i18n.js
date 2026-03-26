import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './en/translation.json';
import mmTranslation from './mm/translation.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslation },
    mm: { translation: mmTranslation }
  },
  lng: 'mm', // Defaulting to Myanmar as per project focus
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;