"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Truck,
  Warehouse,
  PenTool,
  Users,
  BarChart3,
  Headphones,
  Megaphone,
  Map,
  Route,
  LogOut,
  ShieldCheck,
  UserCog,
  Printer,
  FileSearch,
  Building2,
  Store,
  Search,
  Settings2,
  ClipboardList,
  PackageSearch,
  AlertTriangle,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  mm: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

type NavGroup = {
  title: string;
  mmTitle: string;
  roles: string[];
  items: NavItem[];
};

type AccessState = {
  role: string;
  status: string;
  signedIn: boolean;
  sidebarAllowed: boolean;
  message: string | null;
};

function normalizeRole(value: unknown): string {
  const role = String(value ?? "GUEST").trim().toUpperCase();
  return role || "GUEST";
}

function normalizeStatus(value: unknown): string {
  const status = String(value ?? "").trim().toUpperCase();
  if (!status) return "ACTIVE";
  return status;
}

function isSafeSchemaError(error: any) {
  const msg = String(error?.message ?? "");
  const code = String(error?.code ?? "");
  return (
    code === "PGRST116" ||
    code === "PGRST205" ||
    code === "42P01" ||
    code === "42703" ||
    msg.includes("schema cache") ||
    msg.includes("does not exist") ||
    msg.includes("Could not find the table")
  );
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);

  const [access, setAccess] = useState<AccessState>({
    role: "GUEST",
    status: "INACTIVE",
    signedIn: false,
    sidebarAllowed: false,
    message: null,
  });

  useEffect(() => {
    let mounted = true;

    async function resolveAccess() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (userError || !user) {
          setAccess({
            role: "GUEST",
            status: "INACTIVE",
            signedIn: false,
            sidebarAllowed: false,
            message: "Please sign in to view portals.",
          });
          return;
        }

        const metadataRole = normalizeRole(
          user.user_metadata?.role ?? user.app_metadata?.role ?? "GUEST",
        );
        const metadataStatus = normalizeStatus(
          user.user_metadata?.status ?? user.app_metadata?.status ?? "ACTIVE",
        );

        let profileRole = metadataRole;
        let profileStatus = metadataStatus;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role,status,email")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError && !isSafeSchemaError(profileError)) {
          console.error("Sidebar profile resolve error:", profileError);
        }

        if (profile) {
          profileRole = normalizeRole(profile.role ?? metadataRole);
          profileStatus = normalizeStatus(profile.status ?? metadataStatus);
        }

        const privilegedRoles = new Set([
          "SYS",
          "SUPER_ADMIN",
          "ADMIN",
          "ADM",
          "MD",
        ]);

        const sidebarAllowed =
          profileStatus === "ACTIVE" || privilegedRoles.has(profileRole);

        setAccess({
          role: profileRole,
          status: profileStatus,
          signedIn: true,
          sidebarAllowed,
          message: sidebarAllowed
            ? null
            : "Your account is not ACTIVE yet. Sidebar items are hidden until access is approved.",
        });
      } catch (error) {
        console.error("Sidebar resolve access failed:", error);
        if (!mounted) return;
        setAccess({
          role: "GUEST",
          status: "INACTIVE",
          signedIn: false,
          sidebarAllowed: false,
          message: "Please sign in to view portals.",
        });
      }
    }

    void resolveAccess();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const navGroups: NavGroup[] = [
    {
      title: "Leadership",
      mmTitle: "ခေါင်းဆောင်မှု",
      roles: ["SYS", "MD", "SUP", "BRM", "ADMIN", "SUPER_ADMIN"],
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
      title: "Logistics",
      mmTitle: "ပို့ဆောင်ရေးလုပ်ငန်းစဉ်",
      roles: ["SYS", "OPS", "DE", "SUP", "BRM", "WH", "RID", "ADMIN", "SUPER_ADMIN"],
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
          mm: "ပို့ဆောင်ရေး (Rider)",
          icon: Truck,
        },
        {
          href: "/data-entry-turbo",
          label: "Data Entry Turbo",
          mm: "ဒေတာထည့်သွင်းမှုမြန်နှုန်း",
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
      title: "Administration",
      mmTitle: "စီမံခန့်ခွဲရေး",
      roles: ["SYS", "FIN", "HR", "MKT", "CS", "BRM", "MD", "ADMIN", "SUPER_ADMIN"],
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
      title: "External",
      mmTitle: "ပြင်ပအသုံးပြုမှု",
      roles: ["SYS", "MD", "SUP", "ADMIN", "SUPER_ADMIN"],
      items: [
        {
          href: "/merchant/portal",
          label: "Merchant VIP Portal",
          mm: "ကုန်သည်အထူးပေါ်တယ်",
          icon: Store,
        },
        {
          href: "/customer-tracking",
          label: "Customer Tracking",
          mm: "ဖောက်သည်ခြေရာခံစနစ်",
          icon: Search,
        },
      ],
    },
    {
      title: "Growth & Support",
      mmTitle: "ဖွံ့ဖြိုးတိုးတက်မှုနှင့်ပံ့ပိုးမှု",
      roles: ["SYS", "MKT", "CS", "MD", "ADMIN", "SUPER_ADMIN"],
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
      title: "Cross-Platform",
      mmTitle: "စနစ်တစ်လျှောက်",
      roles: ["SYS", "MD", "SUP", "FIN", "HR", "MKT", "CS", "OPS", "BRM", "ADMIN", "SUPER_ADMIN"],
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

  const visibleGroups = access.sidebarAllowed
    ? navGroups.filter((group) => group.roles.includes(access.role) || access.role === "SYS")
    : [];

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/sign-in");
  }

  return (
    <aside className="flex h-screen w-80 flex-col border-r border-white/5 bg-[#0d2c54] text-white shadow-2xl">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-[#ffd700]" size={24} />
          <h1 className="text-xl font-black uppercase tracking-tighter italic">
            Britium <span className="font-light text-[#ffd700]">Express</span>
          </h1>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="inline-block rounded-full bg-white/10 px-3 py-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#ffd700]">
              Role: {access.role} / အဆင့်: {access.role}
            </p>
          </div>
          <div className="rounded-full bg-fuchsia-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-fuchsia-200">
            {access.status}
          </div>
        </div>

        {access.message ? (
          <div className="mt-5 rounded-3xl border border-amber-400/20 bg-white/10 p-5 text-sm text-slate-100">
            {access.status !== "ACTIVE" && access.signedIn ? (
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-300" />
                <p>
                  Your account is not ACTIVE yet. Sidebar items are hidden until access is approved. /
                  သင့် account သည် ACTIVE မဖြစ်သေးပါ။ ခွင့်ပြုချက်မရမချင်း sidebar items များကို ဖျောက်ထားမည်။
                </p>
              </div>
            ) : (
              <p>Please sign in to view portals. / Portal များကြည့်ရန် sign in ဝင်ပါ။</p>
            )}
          </div>
        ) : null}
      </div>

      <nav className="custom-scrollbar flex-1 space-y-8 overflow-y-auto px-4">
        {visibleGroups.map((group) => (
          <div key={group.title}>
            <div className="mb-4 px-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                {group.title}
              </p>
              <p className="mt-1 text-[10px] font-bold text-slate-400">
                {group.mmTitle}
              </p>
            </div>

            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-all ${
                      isActive
                        ? "bg-[#ffd700] text-[#0d2c54]"
                        : "text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    <item.icon size={18} />
                    <div className="flex flex-col">
                      <span className="text-xs font-black uppercase tracking-wider">
                        {item.label}
                      </span>
                      <span className="text-[9px] font-bold opacity-70">{item.mm}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-6">
        <button
          onClick={handleLogout}
          className="w-full rounded-2xl border border-rose-500/20 bg-rose-500/10 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-rose-500 transition-all hover:bg-rose-500 hover:text-white"
        >
          <div className="flex items-center gap-3">
            <LogOut size={16} />
            <span>Terminate Session / ထွက်မည်</span>
          </div>
        </button>
      </div>
    </aside>
  );
}