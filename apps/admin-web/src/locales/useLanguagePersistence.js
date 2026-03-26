import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../api/supabase';

export const useLanguagePersistence = () => {
  const { i18n } = useTranslation();

  // 1. Initial sync: Fetch preferred language on mount
  useEffect(() => {
    const syncLanguage = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // Accessing raw_user_meta_data from the auth.users schema 
      const savedLang = user?.user_metadata?.preferred_language;
      
      if (savedLang && savedLang !== i18n.language) {
        i18n.changeLanguage(savedLang);
      }
    };
    syncLanguage();
  }, [i18n]);

  // 2. Persist function: Update i18n state and Supabase metadata
  const changeAndPersistLanguage = async (newLang) => {
    i18n.changeLanguage(newLang);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Updates the user metadata to ensure persistence across all pages 
      await supabase.auth.updateUser({
        data: { preferred_language: newLang }
      });
    }
  };

  return { currentLang: i18n.language, changeAndPersistLanguage };
};