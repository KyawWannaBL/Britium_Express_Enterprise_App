"use client";

import React, { useEffect, useState } from "react";
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
  Map, Route,
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

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [role, setRole] = useState<string>("GUEST");

  useEffect(() => {
    async function getRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRole("GUEST");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole(data?.role || "GUEST");
    }

    getRole();
  }, [supabase]);

  const navGroups: NavGroup[] = [
    {
      title: "Leadership",
      mmTitle: "ခေါင်းဆောင်မှု",
      roles: ["SYS", "MD", "SUP", "BRM"],
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
      roles: ["SYS", "OPS", "DE", "SUP", "BRM", "WH", "RID"],
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
          icon: Map, Route,
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
      roles: ["SYS", "FIN", "HR", "MKT", "CS", "BRM", "MD"],
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
      roles: ["SYS", "MD", "SUP"],
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
      roles: ["SYS", "MKT", "CS", "MD"],
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
      roles: ["SYS", "MD", "SUP", "FIN", "HR", "MKT", "CS", "OPS", "BRM"],
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

  const visibleGroups = navGroups.filter(
    (group) => group.roles.includes(role) || role === "SYS"
  );

  return (
    <aside className="w-80 h-screen flex flex-col bg-[#0d2c54] text-white border-r border-white/5 shadow-2xl">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-[#ffd700]" size={24} />
          <h1 className="text-xl font-black italic uppercase tracking-tighter">
            Britium <span className="font-light text-[#ffd700]">Express</span>
          </h1>
        </div>

        <div className="mt-4 px-3 py-1 bg-white/10 rounded-full inline-block">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#ffd700]">
            Role / အဆင့်: {role}
          </p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
        {visibleGroups.map((group, idx) => (
          <div key={idx}>
            <div className="px-4 mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                {group.title}
              </p>
              <p
                className="text-[10px] font-bold text-slate-400 mt-1"
                style={{ fontFamily: "'Pyidaungsu', sans-serif" }}
              >
                {group.mmTitle}
              </p>
            </div>

            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-[#ffd700] text-[#0d2c54]"
                        : "hover:bg-white/5 text-slate-400"
                    }`}
                  >
                    <item.icon size={18} />
                    <div className="flex flex-col">
                      <span className="text-xs font-black uppercase tracking-wider">
                        {item.label}
                      </span>
                      <span
                        className="text-[9px] font-bold opacity-70"
                        style={{ fontFamily: "'Pyidaungsu', sans-serif" }}
                      >
                        {item.mm}
                      </span>
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
          onClick={() => router.push("/auth/sign-in")}
          className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 transition-all hover:text-white font-black uppercase text-[10px] tracking-widest"
        >
          <LogOut size={16} />
          <span>Terminate Session / ထွက်မည်</span>
        </button>
      </div>
    </aside>
  );
}
