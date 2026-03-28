"use client";

type Props = {
  value: "en" | "my";
  onChange: (lang: "en" | "my") => void;
};

export default function LanguageToggle({ value, onChange }: Props) {
  return (
    <div style={wrap}>
      <button
        type="button"
        onClick={() => onChange("en")}
        style={{
          ...btn,
          ...(value === "en" ? active : {})
        }}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => onChange("my")}
        style={{
          ...btn,
          ...(value === "my" ? active : {})
        }}
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
  background: "rgba(11,66,122,0.08)",
  border: "1px solid rgba(11,66,122,0.12)"
};

const btn: React.CSSProperties = {
  border: "none",
  borderRadius: 999,
  padding: "8px 12px",
  fontSize: 13,
  fontWeight: 700,
  background: "transparent",
  color: "#0f172a",
  cursor: "pointer"
};

const active: React.CSSProperties = {
  background: "#0b427a",
  color: "#ffffff"
};
