"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageToggle from "./LanguageToggle";
import { useAppLanguage } from "@/lib/i18n";

const nav = [
  { href: "/create-delivery", en: "Create Delivery", my: "ပစ္စည်းပို့ရန်ဖန်တီးခြင်း" },
  { href: "/way-management", en: "Way Management", my: "လမ်းကြောင်းစီမံခန့်ခွဲမှု" },
  { href: "/financial-reports", en: "Financial Reports", my: "ငွေကြေးအစီရင်ခံစာများ" },
  { href: "/operator-management", en: "Operator Management", my: "ဝန်ထမ်းစီမံခန့်ခွဲမှု" }
];

export default function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useAppLanguage();

  const isAuth = pathname.startsWith("/auth");
  if (isAuth) return <>{children}</>;

  return (
    <div style={page}>
      <aside style={sidebar}>
        <div style={brandBox}>
          <div style={brandTitle}>Britium Express</div>
          <div style={brandSub}>{t("Enterprise Console", "လုပ်ငန်းစနစ်")}</div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <LanguageToggle />
        </div>

        <nav style={navWrap}>
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  ...navItem,
                  ...(active ? navItemActive : {})
                }}
              >
                {t(item.en, item.my)}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div style={contentWrap}>
        <header style={topbar}>
          <div>
            <div style={topTitle}>{t("Britium Operations", "Britium လုပ်ငန်းဆောင်ရွက်မှု")}</div>
            <div style={topSub}>{t("Production-ready logistics control center", "အသုံးပြုရန်အဆင်သင့်သော လောဂျစ်တစ်စင်တာ")}</div>
          </div>
          <LanguageToggle />
        </header>

        <main style={main}>{children}</main>
      </div>
    </div>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  gridTemplateColumns: "280px 1fr",
  background: "linear-gradient(135deg, #081321 0%, #0b427a 42%, rgba(222,167,55,0.18) 100%)"
};

const sidebar: React.CSSProperties = {
  padding: 20,
  borderRight: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(5,12,22,0.55)",
  backdropFilter: "blur(16px)"
};

const brandBox: React.CSSProperties = {
  marginBottom: 20,
  padding: 16,
  borderRadius: 20,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)"
};

const brandTitle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: 22,
  fontWeight: 800
};

const brandSub: React.CSSProperties = {
  color: "rgba(255,255,255,0.72)",
  fontSize: 13,
  marginTop: 4
};

const navWrap: React.CSSProperties = {
  display: "grid",
  gap: 10
};

const navItem: React.CSSProperties = {
  display: "block",
  textDecoration: "none",
  color: "#ffffff",
  padding: "12px 14px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
  fontWeight: 600
};

const navItemActive: React.CSSProperties = {
  background: "#ffffff",
  color: "#0b427a"
};

const contentWrap: React.CSSProperties = {
  display: "grid",
  gridTemplateRows: "88px 1fr"
};

const topbar: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "18px 24px",
  borderBottom: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(5,12,22,0.35)",
  backdropFilter: "blur(14px)"
};

const topTitle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: 22,
  fontWeight: 800
};

const topSub: React.CSSProperties = {
  color: "rgba(255,255,255,0.72)",
  fontSize: 13,
  marginTop: 4
};

const main: React.CSSProperties = {
  padding: 24
};
