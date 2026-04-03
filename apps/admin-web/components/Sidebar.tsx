"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart3,
  BellRing,
  Building2,
  ClipboardList,
  FileSearch,
  Headphones,
  LayoutDashboard,
  Loader2,
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
  Warehouse,
} from "lucide-react";

type Language = "en" | "my" | "both";
type PermissionEffect = "ALLOW" | "DENY";
type AccountStatus = "ACTIVE" | "PENDING" | "SUSPENDED" | "REJECTED" | "ARCHIVED" | string;
type PortalSection =
  | "LEADERSHIP"
  | "LOGISTICS"
  | "OPERATIONS"
  | "SUPPORT"
  | "ADMINISTRATION"
  | "SYSTEM";

type PortalPermission =
  | "dashboard.read"
  | "supervisor_hub.read"
  | "branch.read"
  | "intake.read"
  | "ways.read"
  | "warehouse.read"
  | "rider.read"
  | "data_entry.read"
  | "waybill.read"
  | "financial_reports.read"
  | "customer_service.read"
  | "marketing.read"
  | "settings.read"
  | "authorization.read"
  | "audit.read"
  | "reports_export.read"
  | "customer_tracking.read"
  | "merchant_portal.read";

type PortalRoute = {
  key: string;
  href: string;
  label: string;
  mm: string;
  description: string;
  mmDescription: string;
  section: PortalSection;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  allowedRoles?: string[];
  requiredPermissions?: PortalPermission[];
  showInSidebar: boolean;
  showInCommandCenter: boolean;
  enabled?: boolean;
};

type ProfileRow = {
  id: string;
  email?: string | null;
  role?: string | null;
  status?: AccountStatus | null;
  display_name?: string | null;
};

type RoleDefaultPermissionRow = {
  role: string;
  permission_code: PortalPermission;
};

type UserPermissionGrantRow = {
  permission_code: PortalPermission;
  effect: PermissionEffect;
  expires_at?: string | null;
};

type SidebarAccessContext = {
  ready: boolean;
  authenticated: boolean;
  profile: ProfileRow | null;
  effectivePermissions: Set<PortalPermission>;
  deniedPermissions: Set<PortalPermission>;
  error: string | null;
};

const ROLE_FALLBACK_PERMISSIONS: Record<string, PortalPermission[]> = {
  SYS: [
    "dashboard.read",
    "supervisor_hub.read",
    "branch.read",
    "intake.read",
    "ways.read",
    "warehouse.read",
    "rider.read",
    "data_entry.read",
    "waybill.read",
    "financial_reports.read",
    "customer_service.read",
    "marketing.read",
    "settings.read",
    "authorization.read",
    "audit.read",
    "reports_export.read",
    "customer_tracking.read",
    "merchant_portal.read",
  ],
  SUPER_ADMIN: [
    "dashboard.read",
    "supervisor_hub.read",
    "branch.read",
    "intake.read",
    "ways.read",
    "warehouse.read",
    "rider.read",
    "data_entry.read",
    "waybill.read",
    "financial_reports.read",
    "customer_service.read",
    "marketing.read",
    "settings.read",
    "authorization.read",
    "audit.read",
    "reports_export.read",
    "customer_tracking.read",
    "merchant_portal.read",
  ],
  ADMIN: [
    "dashboard.read",
    "branch.read",
    "intake.read",
    "ways.read",
    "warehouse.read",
    "data_entry.read",
    "waybill.read",
    "financial_reports.read",
    "customer_service.read",
    "marketing.read",
    "settings.read",
    "authorization.read",
    "audit.read",
    "reports_export.read",
    "customer_tracking.read",
  ],
  SUPERVISOR: [
    "dashboard.read",
    "supervisor_hub.read",
    "branch.read",
    "intake.read",
    "ways.read",
    "warehouse.read",
    "rider.read",
    "data_entry.read",
    "waybill.read",
    "customer_service.read",
    "marketing.read",
    "reports_export.read",
    "customer_tracking.read",
  ],
  BRANCH_MANAGER: ["dashboard.read", "branch.read", "ways.read", "warehouse.read", "reports_export.read"],
  WAREHOUSE_CONTROLLER: ["warehouse.read", "ways.read", "data_entry.read", "customer_service.read", "reports_export.read"],
  CUSTOMER_SERVICE: ["customer_service.read", "reports_export.read", "customer_tracking.read"],
  MARKETING: ["marketing.read", "customer_tracking.read"],
  MARKETING_MANAGER: ["marketing.read", "reports_export.read", "dashboard.read"],
  DATA_ENTRY: ["data_entry.read", "intake.read", "ways.read"],
  RIDER: ["rider.read", "ways.read"],
  FINANCE: ["financial_reports.read", "reports_export.read", "dashboard.read"],
};

export const portalRegistry: PortalRoute[] = [
  {
    key: "command-center",
    href: "/dashboard",
    label: "Command Center",
    mm: "ဗဟိုထိန်းချုပ်မှု",
    description: "Cross-module operational dashboard",
    mmDescription: "လုပ်ငန်းခွဲအားလုံးကို ကြည့်ရှုနိုင်သော dashboard",
    section: "LEADERSHIP",
    icon: LayoutDashboard,
    requiredPermissions: ["dashboard.read"],
    showInSidebar: true,
    showInCommandCenter: false,
    enabled: true,
  },
  {
    key: "supervisor-control-hub",
    href: "/supervisor-control-hub",
    label: "Supervisor Control Hub",
    mm: "ကြီးကြပ်ရေးထိန်းချုပ်မှု",
    description: "Oversight, queue balancing, and issue control",
    mmDescription: "ကြီးကြပ်မှု၊ queue ချိန်ညှိမှုနှင့် issue ထိန်းချုပ်မှု",
    section: "LEADERSHIP",
    icon: UserCog,
    requiredPermissions: ["supervisor_hub.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "branch-office-portal",
    href: "/branch-office-portal",
    label: "Branch Office Portal",
    mm: "ဌာနခွဲရုံးပေါ်တယ်",
    description: "Branch queue, COD, and branch operations",
    mmDescription: "ဌာနခွဲ queue၊ COD နှင့် branch လုပ်ငန်းများ",
    section: "LEADERSHIP",
    icon: Building2,
    requiredPermissions: ["branch.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "create-delivery",
    href: "/create-delivery",
    label: "Intake Console",
    mm: "ကုန်စည်လက်ခံရန်",
    description: "Create intake and shipment booking",
    mmDescription: "Shipment intake နှင့် booking ဖန်တီးရန်",
    section: "LOGISTICS",
    icon: PenTool,
    requiredPermissions: ["intake.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "way-management",
    href: "/way-management",
    label: "Way Management",
    mm: "ကုန်စည်စီမံခန့်ခွဲမှု",
    description: "Status flow, route control, and dispatch",
    mmDescription: "Status flow၊ route control နှင့် dispatch",
    section: "LOGISTICS",
    icon: Route,
    requiredPermissions: ["ways.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "warehouse-hub",
    href: "/warehouse/portal",
    label: "Warehouse Hub",
    mm: "ဂိုဒေါင်စီမံခန့်ခွဲမှု",
    description: "Receiving, staging, storage, and shipping",
    mmDescription: "Receiving၊ staging၊ storage နှင့် shipping",
    section: "LOGISTICS",
    icon: Warehouse,
    requiredPermissions: ["warehouse.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "rider-portal",
    href: "/rider/portal",
    label: "Rider Portal",
    mm: "ပို့ဆောင်ရေး (Rider)",
    description: "Delivery execution and POD workflow",
    mmDescription: "Delivery execution နှင့် POD workflow",
    section: "LOGISTICS",
    icon: Truck,
    requiredPermissions: ["rider.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "data-entry-turbo",
    href: "/data-entry-turbo",
    label: "Data Entry Turbo",
    mm: "ဒေတာထည့်သွင်းမှုမြန်နှုန်း",
    description: "Pre/post pickup entry and image review",
    mmDescription: "Pickup မတိုင်မီ/ပြီးနောက် data entry နှင့် image review",
    section: "OPERATIONS",
    icon: ClipboardList,
    requiredPermissions: ["data_entry.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "waybill-print-studio",
    href: "/waybill-print-studio",
    label: "Waybill Print Studio",
    mm: "ဝေးဘေလ်ပရင့်ထုတ်ခန်း",
    description: "Batch and single waybill printing",
    mmDescription: "Batch နှင့် single waybill printing",
    section: "OPERATIONS",
    icon: Printer,
    requiredPermissions: ["waybill.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "financial-reports",
    href: "/financial-reports",
    label: "Financial Reports",
    mm: "ငွေကြေးအစီရင်ခံစာများ",
    description: "Billing, settlements, refunds, and COD",
    mmDescription: "Billing၊ settlements၊ refunds နှင့် COD",
    section: "ADMINISTRATION",
    icon: BarChart3,
    requiredPermissions: ["financial_reports.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "customer-service-portal",
    href: "/cs/portal",
    label: "Customer Service",
    mm: "ဖောက်သည်ဝန်ဆောင်မှု",
    description: "Cases, alerts, parcel messages, and support",
    mmDescription: "Cases၊ alerts၊ parcel messages နှင့် support",
    section: "SUPPORT",
    icon: Headphones,
    requiredPermissions: ["customer_service.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "marketing-portal",
    href: "/marketing/portal",
    label: "Marketing Portal",
    mm: "စျေးကွက်ဖွံ့ဖြိုးရေး ပေါ်တယ်",
    description: "Merchant growth, KPIs, plans, and reports",
    mmDescription: "Merchant growth၊ KPI၊ plan နှင့် report များ",
    section: "SUPPORT",
    icon: Megaphone,
    requiredPermissions: ["marketing.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "settings-portal",
    href: "/settings/portal",
    label: "Settings & Authorization",
    mm: "စနစ်ချိန်ညှိမှုနှင့် ခွင့်ပြုချက်",
    description: "Master data, settings, and authorization",
    mmDescription: "Master data၊ settings နှင့် authorization",
    section: "SYSTEM",
    icon: Settings2,
    requiredPermissions: ["settings.read", "authorization.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "audit-log",
    href: "/audit-log",
    label: "Audit Log",
    mm: "စစ်ဆေးမှတ်တမ်း",
    description: "Security and operational audit trail",
    mmDescription: "Security နှင့် operational audit trail",
    section: "SYSTEM",
    icon: FileSearch,
    requiredPermissions: ["audit.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "reports-export-center",
    href: "/reports-export",
    label: "Reports Export Center",
    mm: "အစီရင်ခံစာထုတ်ယူရန်",
    description: "Operational exports and scheduled files",
    mmDescription: "Operational exports နှင့် scheduled files",
    section: "SYSTEM",
    icon: PackageSearch,
    requiredPermissions: ["reports_export.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "merchant-portal",
    href: "/merchant/portal",
    label: "Merchant VIP Portal",
    mm: "ကုန်သည်အထူးပေါ်တယ်",
    description: "Merchant-facing visibility and controls",
    mmDescription: "Merchant မျက်နှာချင်းဆိုင်မြင်ကွင်းနှင့် controls",
    section: "SUPPORT",
    icon: Store,
    requiredPermissions: ["merchant_portal.read"],
    showInSidebar: true,
    showInCommandCenter: false,
    enabled: true,
  },
  {
    key: "customer-tracking",
    href: "/customer-tracking",
    label: "Customer Tracking",
    mm: "ဖောက်သည်ခြေရာခံစနစ်",
    description: "Public or assisted parcel tracking",
    mmDescription: "Public သို့မဟုတ် assisted parcel tracking",
    section: "SUPPORT",
    icon: Search,
    requiredPermissions: ["customer_tracking.read"],
    showInSidebar: true,
    showInCommandCenter: false,
    enabled: true,
  },
];

const sectionMeta: Record<PortalSection, { en: string; my: string }> = {
  LEADERSHIP: { en: "Leadership", my: "ခေါင်းဆောင်မှု" },
  LOGISTICS: { en: "Logistics", my: "ပို့ဆောင်ရေးလုပ်ငန်းစဉ်" },
  OPERATIONS: { en: "Operations", my: "လုပ်ငန်းဆောင်ရွက်မှု" },
  SUPPORT: { en: "Growth & Support", my: "ဖွံ့ဖြိုးတိုးတက်မှုနှင့်ပံ့ပိုးမှု" },
  ADMINISTRATION: { en: "Administration", my: "စီမံခန့်ခွဲရေး" },
  SYSTEM: { en: "System", my: "စနစ်တစ်လျှောက်" },
};

function bi(language: Language, en: string, my: string) {
  if (language === "en") return en;
  if (language === "my") return my;
  return `${en} / ${my}`;
}

function normalizeRole(role?: string | null) {
  return String(role || "GUEST").trim().toUpperCase();
}

function isGrantActive(expiresAt?: string | null) {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() > Date.now();
}

function buildEffectivePermissionSet(
  role: string,
  roleDefaults: RoleDefaultPermissionRow[],
  userGrants: UserPermissionGrantRow[],
) {
  const allowSet = new Set<PortalPermission>();
  const denySet = new Set<PortalPermission>();

  const fromTable = roleDefaults
    .filter((item) => normalizeRole(item.role) === role)
    .map((item) => item.permission_code);

  const base = fromTable.length > 0 ? fromTable : ROLE_FALLBACK_PERMISSIONS[role] || [];
  for (const permission of base) allowSet.add(permission);

  for (const grant of userGrants.filter((item) => isGrantActive(item.expires_at))) {
    if (grant.effect === "DENY") {
      denySet.add(grant.permission_code);
      allowSet.delete(grant.permission_code);
    } else if (!denySet.has(grant.permission_code)) {
      allowSet.add(grant.permission_code);
    }
  }

  return { allowSet, denySet };
}

function canSeeRoute(route: PortalRoute, role: string, permissions: Set<PortalPermission>) {
  if (route.enabled === false) return false;
  if (route.allowedRoles && route.allowedRoles.length > 0 && !route.allowedRoles.includes(role)) return false;
  if (!route.requiredPermissions || route.requiredPermissions.length === 0) return true;
  return route.requiredPermissions.every((permission) => permissions.has(permission));
}

function groupRoutesForSidebar(routes: PortalRoute[]) {
  return Object.entries(
    routes.reduce<Record<PortalSection, PortalRoute[]>>((acc, route) => {
      if (!acc[route.section]) acc[route.section] = [];
      acc[route.section].push(route);
      return acc;
    }, {} as Record<PortalSection, PortalRoute[]>),
  ) as Array<[PortalSection, PortalRoute[]]>;
}

function useSidebarAccessContext(): SidebarAccessContext {
  const supabase = createClient();
  const [state, setState] = useState<SidebarAccessContext>({
    ready: false,
    authenticated: false,
    profile: null,
    effectivePermissions: new Set<PortalPermission>(),
    deniedPermissions: new Set<PortalPermission>(),
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        const authUser = authData.user;
        if (!authUser) {
          if (!cancelled) {
            setState({
              ready: true,
              authenticated: false,
              profile: null,
              effectivePermissions: new Set<PortalPermission>(),
              deniedPermissions: new Set<PortalPermission>(),
              error: null,
            });
          }
          return;
        }

        const [{ data: profile, error: profileError }, { data: roleDefaults }, { data: userGrants }] = await Promise.all([
          supabase
            .from(\"profiles\")
            .select(\"id,email,role,status,display_name\")
            .eq(\"id\", authUser.id)
            .single<ProfileRow>(),
          supabase
            .from(\"role_default_permissions\")
            .select(\"role,permission_code\")
            .returns<RoleDefaultPermissionRow[]>(),
          supabase
            .from(\"user_permission_grants\")
            .select(\"permission_code,effect,expires_at\")
            .eq(\"user_id\", authUser.id)
            .returns<UserPermissionGrantRow[]>(),
        ]);

        if (profileError) throw profileError;

        const role = normalizeRole(profile?.role);
        const { allowSet, denySet } = buildEffectivePermissionSet(role, roleDefaults || [], userGrants || []);

        if (!cancelled) {
          setState({
            ready: true,
            authenticated: true,
            profile: profile || null,
            effectivePermissions: allowSet,
            deniedPermissions: denySet,
            error: null,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            ready: true,
            authenticated: false,
            profile: null,
            effectivePermissions: new Set<PortalPermission>(),
            deniedPermissions: new Set<PortalPermission>(),
            error: error instanceof Error ? error.message : \"Unable to resolve sidebar access.\",
          });
        }
      }
    }

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return state;
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const language: Language = \"both\";
  const access = useSidebarAccessContext();
  const role = normalizeRole(access.profile?.role);
  const status = String(access.profile?.status || \"GUEST\").toUpperCase();

  const visibleRoutes = useMemo(() => {
    if (!access.authenticated || status !== \"ACTIVE\") return [] as PortalRoute[];
    return portalRegistry.filter((route) => route.showInSidebar && canSeeRoute(route, role, access.effectivePermissions));
  }, [access.authenticated, access.effectivePermissions, role, status]);

  const grouped = useMemo(() => groupRoutesForSidebar(visibleRoutes), [visibleRoutes]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace(\"/auth/sign-in\");
  };

  return (
    <aside className=\"flex h-screen w-80 flex-col border-r border-white/5 bg-[#0d2c54] text-white shadow-2xl\">
      <div className=\"border-b border-white/5 p-8\">
        <div className=\"flex items-center gap-3\">
          <ShieldCheck className=\"text-[#ffd700]\" size={24} />
          <h1 className=\"text-xl font-black uppercase tracking-tighter italic\">
            Britium <span className=\"font-light text-[#ffd700]\">Express</span>
          </h1>
        </div>

        <div className=\"mt-4 flex flex-wrap items-center gap-2\">
          <span className=\"inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#ffd700]\">
            {bi(language, `Role: ${role}`, `အဆင့်: ${role}`)}
          </span>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
              status === \"ACTIVE\"
                ? \"bg-emerald-500/15 text-emerald-300\"
                : status === \"PENDING\"
                  ? \"bg-amber-500/15 text-amber-300\"
                  : \"bg-rose-500/15 text-rose-300\"
            }`}
          >
            {status}
          </span>
        </div>

        {access.profile?.display_name ? (
          <p className=\"mt-3 text-xs text-slate-300\">{access.profile.display_name}</p>
        ) : null}

        {!access.ready ? (
          <div className=\"mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs text-slate-200\">
            <Loader2 size={14} className=\"animate-spin\" />
            {bi(language, \"Loading access...\", \"ခွင့်ပြုချက်ရယူနေသည်...\")}
          </div>
        ) : null}

        {access.error ? (
          <div className=\"mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-200\">
            {access.error}
          </div>
        ) : null}
      </div>

      <nav className=\"custom-scrollbar flex-1 space-y-8 overflow-y-auto px-4 py-6\">
        {!access.ready ? null : !access.authenticated ? (
          <div className=\"rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300\">
            {bi(language, \"Please sign in to view portals.\", \"Portal များကြည့်ရန် sign in ဝင်ပါ။\")}
          </div>
        ) : status !== \"ACTIVE\" ? (
          <div className=\"rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100\">
            {bi(
              language,
              \"Your account is not ACTIVE yet. Sidebar items are hidden until access is approved.\",
              \"သင့် account သည် ACTIVE မဖြစ်သေးပါ။ ခွင့်ပြုချက်ရပြီးမှသာ sidebar items များကို ပြသပါမည်။\",
            )}
          </div>
        ) : grouped.length === 0 ? (
          <div className=\"rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300\">
            {bi(language, \"No portal access assigned yet.\", \"Portal access မပေးရသေးပါ။\")}
          </div>
        ) : (
          grouped.map(([section, routes]) => (
            <div key={section}>
              <div className=\"mb-4 px-4\">
                <p className=\"text-[10px] font-black uppercase tracking-[0.3em] text-slate-500\">{sectionMeta[section].en}</p>
                <p className=\"mt-1 text-[10px] font-bold text-slate-400\">{sectionMeta[section].my}</p>
              </div>

              <div className=\"space-y-1\">
                {routes.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      prefetch
                      className={`flex items-start gap-4 rounded-xl px-4 py-3 transition-all ${
                        isActive ? \"bg-[#ffd700] text-[#0d2c54]\" : \"text-slate-300 hover:bg-white/5\"
                      }`}
                    >
                      <Icon size={18} className=\"mt-0.5 shrink-0\" />
                      <div className=\"min-w-0\">
                        <div className=\"text-xs font-black uppercase tracking-wider\">{bi(language, item.label, item.mm)}</div>
                        <div className={`mt-1 text-[10px] ${isActive ? \"text-[#0d2c54]/80\" : \"text-slate-400\"}`}>
                          {bi(language, item.description, item.mmDescription)}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </nav>

      <div className=\"border-t border-white/5 p-6\">
        <button
          onClick={handleSignOut}
          className=\"flex w-full items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-rose-300 transition-all hover:bg-rose-500 hover:text-white\"
        >
          <LogOut size={16} />
          <span>{bi(language, \"Terminate Session\", \"ထွက်မည်\")}</span>
        </button>
      </div>
    </aside>
  );
}