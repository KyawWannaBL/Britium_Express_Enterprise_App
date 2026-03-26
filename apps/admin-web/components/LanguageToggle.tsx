'use client';

import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Production Hardening: ရွေးချယ်မှုကို သိမ်းဆည်းထားရန်
    localStorage.setItem('i18nextLng', lng);
  };

  return (
    <div className="flex gap-2 p-2">
      <button 
        onClick={() => changeLanguage('mm')}
        className={`px-3 py-1 rounded ${i18n.language === 'mm' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
      >
        မြန်မာ
      </button>
      <button 
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 rounded ${i18n.language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
      >
        EN
      </button>
    </div>
  );
}