"use client";

import { useAppLanguage } from "@/lib/i18n";

export default function LanguageToggle() {
  const { lang, setLang } = useAppLanguage();

  return (
    <div style={wrap}>
      <button
        type="button"
        onClick={() => setLang("en")}
        style={{ ...btn, ...(lang === "en" ? active : {}) }}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("my")}
        style={{ ...btn, ...(lang === "my" ? active : {}) }}
      >
        မြန်မာ
      </button>
    </div>
  );
}

const wrap: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: 4,
  borderRadius: 999,
  background: "rgba(255,255,255,0.10)",
  border: "1px solid rgba(255,255,255,0.14)",
  backdropFilter: "blur(8px)"
};

const btn: React.CSSProperties = {
  border: "none",
  borderRadius: 999,
  padding: "8px 12px",
  fontSize: 13,
  fontWeight: 700,
  background: "transparent",
  color: "#ffffff",
  cursor: "pointer"
};

const active: React.CSSProperties = {
  background: "#ffffff",
  color: "#0b427a"
};
