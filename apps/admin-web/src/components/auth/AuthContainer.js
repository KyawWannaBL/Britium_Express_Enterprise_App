import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../api/supabase';

const AuthContainer = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Toggle Language: Updates UI and persists to Supabase Metadata
  const toggleLanguage = async (lang) => {
    i18n.changeLanguage(lang);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.auth.updateUser({
        data: { preferred_language: lang }
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Authenticate using Supabase auth.users schema
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      // Logic for "Must-Change-Password" flow [cite: 126]
      if (data.user.user_metadata?.must_change_password) {
        window.location.href = '/reset-password';
      } else {
        window.location.href = '/dashboard';
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="lang-toggle">
        <button onClick={() => toggleLanguage('en')}>English</button>
        <button onClick={() => toggleLanguage('mm')}>မြန်မာ</button>
      </div>

      <form onSubmit={handleLogin}>
        <h1>{t('login')}</h1>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit" disabled={loading}>
          {loading ? '...' : t('login')}
        </button>
      </form>
      
      <a href="/forgot-password">{t('forgot_password')}</a>
    </div>
  );
};

export default AuthContainer;