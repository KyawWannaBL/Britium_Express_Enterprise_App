"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Building2,
  ChevronDown,
  ClipboardList,
  FileSearch,
  Headphones,
  LayoutDashboard,
  LogOut,
  Megaphone,
  PackageSearch,
  PenTool,
  Printer,
  Route,
  Search,
  Settings2,
  ShieldCheck,
  Store,
  Truck,
  UserCog,
  Users,
  Warehouse,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AppRole =
  | "SYS"
  | "SUPER_ADMIN"
  | "ADMIN"
  | "SUP"
  | "MD"
  | "MKT"
  | "CS"
  | "OPS"
  | "WH"
  | "FIN"
  | "HR"
  | "BRM"
  | "RID"
  | "DE"
  | "MERCHANT"
  | "CUSTOMER"
  | "GUEST";

type AccountStatus = "ACTIVE" | "PENDING" | "SUSPENDED" | "REJECTED" | "ARCHIVED" | "GUEST";

type NavItem = {
  href: string;
  label: string;
  mm: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

type NavGroup = {
  key: string;
  title: string;
  mmTitle: string;
  roles: AppRole[];
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    key: "leadership",
    title: "Leadership",
    mmTitle: "ခေါင်းဆောင်မှု",
    roles: ["SYS", "SUPER_ADMIN", "ADMIN", "SUP", "MD", "BRM"],
    items: [
      {
        href: "/dashboard",
        label: "Command Center",
        mm: "ဗဟိုထိန်းချုပ်မှု",
        icon: LayoutDashboard,
      },
      {
        href: "/supervisor-control-hub",
        label: "Supervisor Control Hub",
        mm: "ကြီးကြပ်ရေးထိန်းချုပ်မှု",
        icon: UserCog,
      },
    ],
  },
  {
    key: "logistics",
    title: "Logistics",
    mmTitle: "ပို့ဆောင်ရေးလုပ်ငန်းစဉ်",
    roles: ["SYS", "SUPER_ADMIN", "ADMIN", "SUP", "OPS", "WH", "BRM", "RID", "DE"],
    items: [
      {
        href: "/create-delivery",
        label: "Intake Console",
        mm: "ကုန်စည်လက်ခံရန်",
        icon: PenTool,
      },
      {
        href: "/way-management",
        label: "Way Management",
        mm: "ကုန်စည်စီမံခန့်ခွဲမှု",
        icon: Route,
      },
      {
        href: "/warehouse/portal",
        label: "Warehouse Hub",
        mm: "ဂိုဒေါင်စီမံခန့်ခွဲမှု",
        icon: Warehouse,
      },
      {
        href: "/rider/portal",
        label: "Rider Portal",
        mm: "ပို့ဆောင်ရေး Rider",
        icon: Truck,
      },
      {
        href: "/data-entry-turbo",
        label: "Data Entry Turbo",
        mm: "ဒေတာထည့်သွင်းမှု",
        icon: ClipboardList,
      },
      {
        href: "/waybill-print-studio",
        label: "Waybill Print Studio",
        mm: "ဝေးဘေလ်ပရင့်ထုတ်ခန်း",
        icon: Printer,
      },
    ],
  },
  {
    key: "admin",
    title: "Administration",
    mmTitle: "စီမံခန့်ခွဲရေး",
    roles: ["SYS", "SUPER_ADMIN", "ADMIN", "SUP", "FIN", "HR", "BRM", "MD"],
    items: [
      {
        href: "/operator-management",
        label: "Operator Management",
        mm: "ဝန်ထမ်းစီမံခန့်ခွဲမှု",
        icon: Users,
      },
      {
        href: "/financial-reports",
        label: "Financial Reports",
        mm: "ငွေကြေးအစီရင်ခံစာများ",
        icon: BarChart3,
      },
      {
        href: "/branch-office-portal",
        label: "Branch Office Portal",
        mm: "ဌာနခွဲရုံးပေါ်တယ်",
        icon: Building2,
      },
    ],
  },
  {
    key: "support-growth",
    title: "Growth & Support",
    mmTitle: "ဖွံ့ဖြိုးတိုးတက်မှုနှင့်ပံ့ပိုးမှု",
    roles: ["SYS", "SUPER_ADMIN", "ADMIN", "SUP", "MD", "MKT", "CS"],
    items: [
      {
        href: "/marketing/portal",
        label: "Marketing Hub",
        mm: "စျေးကွက်ရှာဖွေရေးဗဟို",
        icon: Megaphone,
      },
      {
        href: "/cs/portal",
        label: "Customer Service",
        mm: "ဖောက်သည်ဝန်ဆောင်မှု",
        icon: Headphones,
      },
    ],
  },
  {
    key: "external",
    title: "External Portals",
    mmTitle: "ပြင်ပအသုံးပြုသူပေါ်တယ်များ",
    roles: ["SYS", "SUPER_ADMIN", "ADMIN", "SUP", "MD", "BRM", "MKT", "CS"],
    items: [
      {
        href: "/merchant/portal",
        label: "Merchant Portal",
        mm: "ကုန်သည်ပေါ်တယ်",
        icon: Store,
      },
      {
        href: "/customer/portal",
        label: "Customer Portal",
        mm: "ဖောက်သည်ပေါ်တယ်",
        icon: Search,
      },
    ],
  },
  {
    key: "platform",
    title: "Cross Platform",
    mmTitle: "စနစ်တစ်လျှောက်",
    roles: ["SYS", "SUPER_ADMIN", "ADMIN", "SUP", "FIN", "HR", "MKT", "CS", "OPS", "WH", "BRM", "MD"],
    items: [
      {
        href: "/settings/portal",
        label: "Settings / Master Data",
        mm: "စနစ်ချိန်ညှိမှု / မူလဒေတာ",
        icon: Settings2,
      },
      {
        href: "/audit-log",
        label: "Audit Log",
        mm: "စစ်ဆေးမှတ်တမ်း",
        icon: FileSearch,
      },
      {
        href: "/reports-export",
        label: "Reports Export Center",
        mm: "အစီရင်ခံစာထုတ်ယူရန်",
        icon: PackageSearch,
      },
    ],
  },
];

function normalizeRole(input: unknown): AppRole {
  const value = String(input ?? "").trim().toUpperCase();
  if (!value) return "GUEST";
  return value as AppRole;
}

function normalizeStatus(input: unknown): AccountStatus {
  const value = String(input ?? "").trim().toUpperCase();
  if (!value) return "GUEST";
  return value as AccountStatus;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [role, setRole] = useState<AppRole>("GUEST");
  const [status, setStatus] = useState<AccountStatus>("GUEST");
  const [loading, setLoading] = useState(true);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    leadership: true,
    logistics: true,
    admin: true,
    "support-growth": true,
    external: true,
    platform: true,
  });

  useEffect(() => {
    let mounted = true;

    async function loadSidebarAccess() {
      setLoading(true);

      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (!mounted) return;

      if (authError || !authData.user) {
        setRole("GUEST");
        setStatus("GUEST");
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (!mounted) return;

      if (profileError || !profile) {
        setRole(normalizeRole(authData.user.user_metadata?.role));
        setStatus(normalizeStatus(authData.user.user_metadata?.status || "ACTIVE"));
        setLoading(false);
        return;
      }

      setRole(normalizeRole(profile.role ?? authData.user.user_metadata?.role));
      setStatus(normalizeStatus(profile.status ?? "ACTIVE"));
      setLoading(false);
    }

    void loadSidebarAccess();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const visibleGroups = useMemo(() => {
    if (status !== "ACTIVE" && role !== "SYS" && role !== "SUPER_ADMIN") return [];
    return navGroups.filter((group) => group.roles.includes(role) || role === "SYS" || role === "SUPER_ADMIN");
  }, [role, status]);

  const accountPillTone =
    role === "SYS" || role === "SUPER_ADMIN"
      ? "badge badge-success"
      : status === "ACTIVE"
        ? "badge badge-default"
        : "badge badge-warning";

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/auth/sign-in");
  }

  return (
    <aside className="custom-scrollbar flex h-screen w-[340px] shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-[#0d2c54] text-white shadow-2xl">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-[#0d2c54]/95 px-6 pb-5 pt-6 backdrop-blur">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/10">
            <ShieldCheck size={22} className="text-[#ffd700]" />
          </div>
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.26em] text-white/50">
              Britium Express
            </div>
            <div className="text-xl font-black italic tracking-tight">
              Enterprise Console
            </div>
          </div>
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="badge bg-[#ffd700] text-[#0d2c54]">
            Role / အဆင့်: {role}
          </span>
          <span className={accountPillTone}>{status}</span>
        </div>

        {status !== "ACTIVE" && role !== "SYS" && role !== "SUPER_ADMIN" ? (
          <div className="mt-4 notice notice-warning">
            Your account is not ACTIVE yet. Sidebar items are hidden until access is approved.
          </div>
        ) : null}

        {loading ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
            Loading navigation...
          </div>
        ) : null}
      </div>

      <nav className="flex-1 px-4 py-5">
        {visibleGroups.length === 0 && !loading ? (
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-bold text-white">
              Please sign in to view portals.
            </div>
            <div className="mt-2 text-sm leading-6 text-white/70">
              Portal များကို အသုံးပြုရန် sign in ဝင်ပါ။
            </div>
          </div>
        ) : null}

        <div className="space-y-4">
          {visibleGroups.map((group) => {
            const isOpen = openGroups[group.key] ?? true;
            return (
              <section
                key={group.key}
                className="overflow-hidden rounded-[24px] border border-white/8 bg-white/[0.04]"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenGroups((prev) => ({
                      ...prev,
                      [group.key]: !isOpen,
                    }))
                  }
                  className="flex w-full items-center justify-between px-4 py-4 text-left"
                >
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-[0.26em] text-white/50">
                      {group.title}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-white/75">
                      {group.mmTitle}
                    </div>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${isOpen ? "rotate-0" : "-rotate-90"}`}
                  />
                </button>

                {isOpen ? (
                  <div className="space-y-1 px-2 pb-3">
                    {group.items.map((item) => {
                      const isActive =
                        pathname === item.href || pathname.startsWith(`${item.href}/`);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={[
                            "group flex items-start gap-3 rounded-2xl px-3 py-3 transition-all",
                            isActive
                              ? "bg-[#ffd700] text-[#0d2c54] shadow-lg"
                              : "text-white/75 hover:bg-white/8 hover:text-white",
                          ].join(" ")}
                        >
                          <div
                            className={[
                              "mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl transition",
                              isActive
                                ? "bg-[#0d2c54]/10"
                                : "bg-white/8 group-hover:bg-white/10",
                            ].join(" ")}
                          >
                            <item.icon size={18} />
                          </div>

                          <div className="min-w-0">
                            <div className="truncate text-[13px] font-black uppercase tracking-[0.08em]">
                              {item.label}
                            </div>
                            <div
                              className={[
                                "mt-1 line-clamp-2 text-[11px] leading-5",
                                isActive ? "text-[#0d2c54]/80" : "text-white/60",
                              ].join(" ")}
                            >
                              {item.mm}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      </nav>

      <div className="sticky bottom-0 border-t border-white/10 bg-[#0d2c54]/96 p-5 backdrop-blur">
        <button
          type="button"
          onClick={handleLogout}
          className="btn w-full justify-center rounded-[18px] border border-rose-400/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500 hover:text-white"
        >
          <LogOut size={16} />
          <span>Terminate Session / ထွက်မည်</span>
        </button>
      </div>
    </aside>
  );
}