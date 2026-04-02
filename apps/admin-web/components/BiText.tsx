"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

export default function BiText({
  en,
  mm,
  className = "",
}: {
  en: string;
  mm: string;
  className?: string;
}) {
  const { t } = useLanguage();

  return (
    <span className={className} style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>
      {t(en, mm)}
    </span>
  );
}
