import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../api/supabase';

const DownloadSection = () => {
  const { t } = useTranslation();
  const [downloading, setDownloading] = useState(false);

  const handleSecureDownload = async () => {
    setDownloading(true);
    
    // 1. Check for active session in auth.sessions 
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      alert(t('auth_required', 'Please login to download the enterprise app.'));
      setDownloading(false);
      return;
    }

    // 2. Redirect to the signed URL or private storage bucket
    const apkPath = 'builds/britium-enterprise-v1.apk';
    const { data, error } = await supabase.storage
      .from('enterprise-assets')
      .createSignedUrl(apkPath, 60); // Link expires in 60 seconds

    if (error) {
      console.error('Download error:', error);
    } else {
      window.location.href = data.signedUrl;
    }
    setDownloading(false);
  };

  return (
    <div className="download-card">
      <h3>{t('download_title', 'Enterprise Mobile App')}</h3>
      <p>{t('download_desc', 'Get the latest version for Android.')}</p>
      <button 
        onClick={handleSecureDownload} 
        disabled={downloading}
        className="btn-primary"
      >
        {downloading ? t('processing', 'Processing...') : t('download_apk', 'Download APK')}
      </button>
    </div>
  );
};

export default DownloadSection;