"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import LanguageToggle from "./LanguageToggle";
import { useAppLanguage } from "@/lib/i18n";
import { LayoutDashboard, Truck, Map, BarChart3, Users, LogOut } from "lucide-react";

export function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang } = useAppLanguage();

  const handleLogout = async () => {
    await fetch("/api/auth/sign-out", { method: "POST" });
    router.push("/auth/sign-in");
    router.refresh();
  };

  const navItem = (href: string, label: string, Icon: any) => {
    const active = pathname === href;
    return (
      <Link href={href} style={{
        display: "flex", alignItems: "center", padding: "12px 16px", borderRadius: 8,
        textDecoration: "none", color: active ? "#fff" : "#94a3b8",
        background: active ? "rgba(56, 189, 248, 0.1)" : "transparent", marginBottom: 4
      }}>
        <Icon size={20} />
        <span style={{ marginLeft: 12 }}>{label}</span>
      </Link>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0f172a" }}>
      <aside style={{ width: 280, borderRight: "1px solid #1e293b", padding: 24, display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#f8fafc", margin: 0 }}>Britium Express</h2>
          <span style={{ fontSize: 12, color: "#64748b" }}>ENTERPRISE CONSOLE</span>
        </div>
        <div style={{ marginBottom: 24 }}>
          <LanguageToggle value={lang as any} onChange={setLang} />
        </div>
        <nav style={{ flex: 1 }}>
          {navItem("/", "Dashboard", LayoutDashboard)}
          {navItem("/create-delivery", "Create Delivery", Truck)}
          {navItem("/way-management", "Way Management", Map)}
          {navItem("/financial-reports", "Financial Reports", BarChart3)}
          {navItem("/operator-management", "Operator Management", Users)}
        </nav>
        <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#94a3b8", display: "flex", alignItems: "center", cursor: "pointer", padding: "12px 16px", marginTop: "auto" }}>
          <LogOut size={20} />
          <span style={{ marginLeft: 12 }}>Log Out</span>
        </button>
      </aside>
      <main style={{ flex: 1, padding: 32, overflowY: "auto" }}>{children}</main>
    </div>
  );
}